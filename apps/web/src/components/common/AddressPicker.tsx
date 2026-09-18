import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Group,
  Loader,
  Popover,
  Stack,
  Text,
  Textarea
} from '@mantine/core'
import L from 'leaflet'
import { Crosshair, MapPin } from 'lucide-react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { GeocodeResult, reverseGeocode, searchAddress } from '../../lib/geo'

const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.006]

const PIN_ICON = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:var(--mantine-color-blue-6);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
})

interface MapEventsProps {
  onPick: (latitude: number, longitude: number) => void
}

function MapEvents({ onPick }: MapEventsProps) {
  const map = useMap()

  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

interface AddressMapPickerProps {
  latitude: number | null
  longitude: number | null
  onPick: (latitude: number, longitude: number) => void
}

function AddressMapPicker({ latitude, longitude, onPick }: AddressMapPickerProps) {
  const center: [number, number] =
    latitude !== null && longitude !== null ? [latitude, longitude] : DEFAULT_MAP_CENTER

  return (
    <MapContainer
      center={center}
      zoom={latitude !== null ? 16 : 13}
      style={{ height: 220, width: '100%', borderRadius: 8, zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onPick={onPick} />
      {latitude !== null && longitude !== null && (
        <Marker position={[latitude, longitude]} icon={PIN_ICON} />
      )}
    </MapContainer>
  )
}

export interface AddressPickerProps {
  value: string
  onChange: (value: string) => void
  latitude?: number | null
  longitude?: number | null
  onCoordinatesChange?: (latitude: number | null, longitude: number | null) => void
  label?: string
  placeholder?: string
  error?: string
  withAsterisk?: boolean
  disabled?: boolean
  zIndex?: number
  minRows?: number
  maxRows?: number
  showMapPicker?: boolean
}

export const AddressPicker: React.FC<AddressPickerProps> = ({
  value,
  onChange,
  latitude = null,
  longitude = null,
  onCoordinatesChange,
  label = 'Address',
  placeholder = 'Start typing to search addresses, or pin a location on the map',
  error,
  withAsterisk = false,
  disabled = false,
  zIndex = 300,
  minRows = 2,
  maxRows = 5,
  showMapPicker = true
}) => {
  const [showMap, setShowMap] = useState(false)
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [isAddressSearching, setIsAddressSearching] = useState(false)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchSeqRef = useRef(0)

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  const runAddressSearch = (query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 5) {
      searchSeqRef.current += 1
      setSuggestions([])
      setIsAddressSearching(false)
      return
    }

    setSuggestions([])
    setIsAddressSearching(true)
    const seq = ++searchSeqRef.current
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(trimmed)
        if (seq === searchSeqRef.current) {
          setSuggestions(results)
        }
      } catch {
        if (seq === searchSeqRef.current) {
          setSuggestions([])
        }
      } finally {
        if (seq === searchSeqRef.current) {
          setIsAddressSearching(false)
        }
      }
    }, 400)
  }

  const handleTextChange = (newVal: string) => {
    onChange(newVal)
    if (onCoordinatesChange) {
      onCoordinatesChange(null, null)
    }
    runAddressSearch(newVal)
  }

  const handleSuggestionSelect = (item: GeocodeResult) => {
    onChange(item.displayName)
    if (onCoordinatesChange) {
      onCoordinatesChange(item.latitude, item.longitude)
    }
    setSuggestions([])
  }

  const handleMapPick = async (pickedLat: number, pickedLng: number) => {
    if (onCoordinatesChange) {
      onCoordinatesChange(pickedLat, pickedLng)
    }
    setIsReverseGeocoding(true)
    try {
      const result = await reverseGeocode(pickedLat, pickedLng)
      if (result) {
        onChange(result.displayName)
      }
    } catch {
      // Coordinates stay pinned even if reverse geocoding is unavailable
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  const locationPinned = latitude !== null && longitude !== null

  return (
    <Box>
      <Popover
        width="target"
        position="bottom"
        shadow="md"
        zIndex={zIndex}
        opened={isAddressSearching || suggestions.length > 0}
        onChange={(open) => {
          if (!open) {
            setSuggestions([])
            setIsAddressSearching(false)
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
          }
        }}
        styles={{ dropdown: { maxHeight: 260, overflowY: 'auto', padding: 4 } }}
      >
        <Popover.Target>
          <div>
            <Textarea
              label={label}
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleTextChange(e.target.value)}
              autosize
              minRows={minRows}
              maxRows={maxRows}
              withAsterisk={withAsterisk}
              disabled={disabled}
              error={error}
            />
          </div>
        </Popover.Target>

        <Popover.Dropdown>
          {isAddressSearching ? (
            <Group gap="xs" px={6} py={6}>
              <Loader size="xs" />
              <Text size="xs" c="dimmed">
                Searching addresses...
              </Text>
            </Group>
          ) : (
            <Stack gap={2}>
              {suggestions.map((item) => (
                <Button
                  key={`${item.latitude},${item.longitude}`}
                  variant="subtle"
                  size="xs"
                  justify="flex-start"
                  fw={400}
                  tt="none"
                  onClick={() => handleSuggestionSelect(item)}
                  leftSection={<MapPin size={14} />}
                  styles={{
                    root: {
                      height: 'auto',
                      minHeight: 28,
                      whiteSpace: 'normal',
                      textAlign: 'left'
                    },
                    inner: {
                      justifyContent: 'flex-start'
                    }
                  }}
                >
                  {item.displayName}
                </Button>
              ))}
            </Stack>
          )}
        </Popover.Dropdown>
      </Popover>

      {showMapPicker && (
        <>
          <Group justify="space-between" align="center" mt={6}>
            <Text size="xs" c={locationPinned ? 'teal' : 'dimmed'}>
              {locationPinned
                ? 'Location pinned'
                : 'Type to search or pick a location on the map'}
            </Text>
            <Button
              variant="light"
              size="compact-xs"
              leftSection={<Crosshair size={14} />}
              onClick={() => setShowMap((prev) => !prev)}
            >
              {showMap ? 'Hide map' : 'Pick on map'}
            </Button>
          </Group>

          {showMap && (
            <Box pos="relative" mt={6}>
              <AddressMapPicker
                latitude={latitude}
                longitude={longitude}
                onPick={handleMapPick}
              />
              {isReverseGeocoding && (
                <Loader
                  size="sm"
                  pos="absolute"
                  top="50%"
                  left="50%"
                  style={{ transform: 'translate(-50%, -50%)', zIndex: 10 }}
                />
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default AddressPicker
