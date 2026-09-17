import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Group, Loader, Modal, Popover, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { createCustomerSchema, CustomerDto } from '@whosonsite/shared'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair, MapPin } from 'lucide-react'

import 'leaflet/dist/leaflet.css'

import { GeocodeResult, reverseGeocode, searchAddress } from '../../lib/geo'
import { ApiErrorAlert } from '../feedback/ApiErrorAlert'
import { useCreateCustomer } from './queries'

interface CreateCustomerModalProps {
  opened: boolean
  onClose: () => void
  onSuccess?: (customer: CustomerDto) => void
  zIndex?: number
}

const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.006]

const PIN_ICON = L.divIcon({
  className: '',
  html:
    '<div style="width:22px;height:22px;border-radius:50%;background:var(--mantine-color-blue-6);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);"></div>',
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

interface CustomerLocationPickerProps {
  latitude: number | null
  longitude: number | null
  onPick: (latitude: number, longitude: number) => void
}

function CustomerLocationPicker({ latitude, longitude, onPick }: CustomerLocationPickerProps) {
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

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  opened,
  onClose,
  onSuccess,
  zIndex
}) => {
  const { t } = useTranslation()
  const createCustomerMutation = useCreateCustomer()

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    mobile?: string
    address?: string
    email?: string
  }>({})

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

  const handleReset = () => {
    setName('')
    setMobile('')
    setAddress('')
    setEmail('')
    setLatitude(null)
    setLongitude(null)
    setFieldErrors({})
    setShowMap(false)
    setSuggestions([])
    setIsAddressSearching(false)
    setIsReverseGeocoding(false)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchSeqRef.current += 1
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    setLatitude(null)
    setLongitude(null)
    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }))
    runAddressSearch(value)
  }

  const handleSuggestionSelect = (item: GeocodeResult) => {
    setAddress(item.displayName)
    setLatitude(item.latitude)
    setLongitude(item.longitude)
    setSuggestions([])
    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }))
  }

  const handleMapPick = async (pickedLat: number, pickedLng: number) => {
    setLatitude(pickedLat)
    setLongitude(pickedLng)
    setIsReverseGeocoding(true)
    try {
      const result = await reverseGeocode(pickedLat, pickedLng)
      if (result) {
        setAddress(result.displayName)
        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }))
      }
    } catch {
      // Coordinates stay pinned even if reverse geocoding is unavailable
    } finally {
      setIsReverseGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const payload = {
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      email: email.trim() || undefined,
      latitude,
      longitude
    }

    const parseResult = createCustomerSchema.safeParse(payload)
    if (!parseResult.success) {
      const formatted: { name?: string; mobile?: string; address?: string; email?: string } = {}
      parseResult.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const field = err.path[0] as 'name' | 'mobile' | 'address' | 'email'
        if (field && !formatted[field]) {
          formatted[field] = err.message
        }
      })
      setFieldErrors(formatted)
      return
    }

    try {
      const created = await createCustomerMutation.mutateAsync(parseResult.data)
      handleClose()
      if (onSuccess) {
        onSuccess(created)
      }
    } catch {
      // Handled via createCustomerMutation.error
    }
  }

  const locationPinned = latitude !== null && longitude !== null

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('customers.createTitle', 'New Customer')}
      centered
      radius="md"
      zIndex={zIndex}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <ApiErrorAlert error={createCustomerMutation.error} />

          <TextInput
            label={t('customers.name', 'Customer Name')}
            placeholder="Acme Corp"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
            }}
            withAsterisk
            error={fieldErrors.name}
          />

          <TextInput
            label={t('customers.phone', 'Phone Number')}
            placeholder="+1 555-0192"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value)
              if (fieldErrors.mobile) setFieldErrors((prev) => ({ ...prev, mobile: undefined }))
            }}
            withAsterisk
            error={fieldErrors.mobile}
          />

          <Box>
            <Popover
              width="target"
              position="bottom"
              shadow="md"
              zIndex={zIndex ? zIndex + 1 : 300}
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
                    label={t('customers.address', 'Service Address')}
                    placeholder="Start typing to search addresses, or pin a location on the map"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    autosize
                    minRows={2}
                    maxRows={5}
                    withAsterisk
                    error={fieldErrors.address}
                  />
                </div>
              </Popover.Target>

              <Popover.Dropdown>
                {isAddressSearching ? (
                  <Group gap="xs" px={6} py={6}>
                    <Loader size="xs" />
                    <Text size="xs" c="dimmed">
                      {t('customers.searchAddress', 'Searching addresses...')}
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

            <Group justify="space-between" align="center" mt={6}>
              <Text size="xs" c={locationPinned ? 'teal' : 'dimmed'}>
                {locationPinned
                  ? t('customers.locationSet', 'Location pinned')
                  : t('customers.addressHint', 'Type to search or pick a location on the map')}
              </Text>
              <Button
                variant="light"
                size="compact-xs"
                leftSection={<Crosshair size={14} />}
                onClick={() => setShowMap((prev) => !prev)}
              >
                {showMap
                  ? t('customers.hideMap', 'Hide map')
                  : t('customers.pickOnMap', 'Pick on map')}
              </Button>
            </Group>

            {showMap && (
              <Box pos="relative" mt={6}>
                <CustomerLocationPicker
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
                    style={{ transform: 'translate(-50%, -50%)' }}
                  />
                )}
              </Box>
            )}
          </Box>

          <TextInput
            label={t('customers.email', 'Email Address (Optional)')}
            placeholder="contact@acme.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
            error={fieldErrors.email}
          />

          <Group justify="flex-end" gap="xs" mt="sm">
            <Button variant="default" onClick={handleClose}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" loading={createCustomerMutation.isPending}>
              {t('customers.saveSubmit', 'Add')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}