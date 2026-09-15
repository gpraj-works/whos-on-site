import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { ActionIcon, Badge, Button, Group, Paper, Stack, Text, Tooltip } from '@mantine/core'
import { JobDto, JobStatus, AgentDto, AgentStatus } from '@whosonsite/shared'
import L from 'leaflet'
import { Maximize2, Minimize2 } from 'lucide-react'

import 'leaflet/dist/leaflet.css'

import {
  JOB_STATUS_COLORS,
  JOB_STATUS_HEX_COLORS,
  TECHNICIAN_STATUS_COLORS,
  TECHNICIAN_STATUS_HEX_COLORS
} from '../../app/theme'

interface JobMapProps {
  agents: AgentDto[]
  selectedJobId?: string | null
  selectedAgentId?: string | null
  onSelectJob?: (job: JobDto) => void
  onSelectAgent?: (tech: AgentDto) => void
  onAssignJob?: (job: JobDto) => void
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006] // Default fallback center
const DEFAULT_ZOOM = 11

/** Generates deterministic coordinates from address string if coordinates are missing */
function hashStringToCoords(str: string): [number, number] {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const normLat = (Math.abs(hash % 1000) / 1000) * 0.08
  const normLng = (Math.abs((hash >> 3) % 1000) / 1000) * 0.08

  const lower = str.toLowerCase()
  if (lower.includes('atlanta') || lower.includes('ga')) {
    return [33.749 + normLat, -84.388 + normLng]
  }
  if (lower.includes('ny') || lower.includes('york') || lower.includes('brooklyn') || lower.includes('queens')) {
    return [40.7128 + normLat, -74.006 + normLng]
  }
  return [33.75 + normLat, -84.38 + normLng]
}

/** Safely extracts valid lat/lng array from various coordinate formats or address fallback */
function extractCoords(raw: unknown, address?: string | null): [number, number] | null {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    if (typeof obj.lat === 'number' && typeof obj.lng === 'number' && (obj.lat !== 0 || obj.lng !== 0)) {
      return [obj.lat, obj.lng]
    }
    if (typeof obj.x === 'number' && typeof obj.y === 'number' && (obj.x !== 0 || obj.y !== 0)) {
      return [obj.y, obj.x]
    }
    if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
      const lng = Number(obj.coordinates[0])
      const lat = Number(obj.coordinates[1])
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        return [lat, lng]
      }
    }
  }

  if (typeof raw === 'string') {
    const match = raw.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
    if (match) {
      return [parseFloat(match[2]), parseFloat(match[1])]
    }
  }

  // Address fallback: generate coordinates from customer address
  if (address && address.trim().length > 0) {
    return hashStringToCoords(address)
  }

  return null
}

function createJobMarkerIcon(status: JobStatus, isSelected: boolean): L.DivIcon {
  const color = JOB_STATUS_HEX_COLORS[status] || '#228be6'
  const borderWidth = isSelected ? '3px' : '2px'
  const borderColor = isSelected ? '#1c7ed6' : '#ffffff'
  const scaleCss = isSelected ? 'transform: rotate(-45deg) scale(1.25);' : 'transform: rotate(-45deg);'

  return L.divIcon({
    className: 'custom-job-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        ${scaleCss}
        border: ${borderWidth} solid ${borderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  })
}

function createAgentMarkerIcon(status: AgentStatus, isSelected: boolean): L.DivIcon {
  const color = TECHNICIAN_STATUS_HEX_COLORS[status] || '#868e96'
  const scaleCss = isSelected ? 'transform: scale(1.2);' : ''
  const borderColor = isSelected ? '#1c7ed6' : '#ffffff'

  return L.divIcon({
    className: 'custom-tech-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        ${scaleCss}
        transition: transform 0.2s ease;
      ">
        🔧
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  })
}

const MapAutoController: React.FC<{
  jobsWithCoords: Array<{ job: JobDto; coords: [number, number] }>
  agentsWithCoords: Array<{ tech: AgentDto; coords: [number, number] }>
  focusedCoords: [number, number] | null
  isMaximized: boolean
}> = ({ jobsWithCoords, agentsWithCoords, focusedCoords, isMaximized }) => {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map, isMaximized])

  useEffect(() => {
    if (focusedCoords) {
      map.flyTo(focusedCoords, 15, { animate: true, duration: 1 })
      return
    }

    const points: [number, number][] = [
      ...jobsWithCoords.map((item) => item.coords),
      ...agentsWithCoords.map((item) => item.coords)
    ]

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true })
    }
  }, [map, jobsWithCoords, agentsWithCoords, focusedCoords])

  return null
}

export const JobMap: React.FC<JobMapProps> = ({
  jobs,
  agents,
  selectedJobId,
  selectedAgentId,
  onSelectJob,
  onSelectAgent,
  onAssignJob
}) => {
  const [isMaximized, setIsMaximized] = useState(false)

  // Map escape key to exit full screen view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        setIsMaximized(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMaximized])

  const jobsWithCoords = jobs
    .map((j) => ({ job: j, coords: extractCoords(j.location, j.customer?.address) }))
    .filter((item): item is { job: JobDto; coords: [number, number] } => item.coords !== null)

  const agentsWithCoords = agents
    .map((t) => ({ tech: t, coords: extractCoords(t.location) }))
    .filter((item): item is { tech: AgentDto; coords: [number, number] } => item.coords !== null)

  // Determine focused coords if selected job or agent is specified
  let focusedCoords: [number, number] | null = null
  if (selectedJobId) {
    const found = jobsWithCoords.find((item) => item.job.id === selectedJobId)
    if (found) focusedCoords = found.coords
  } else if (selectedAgentId) {
    const found = agentsWithCoords.find((item) => item.tech.id === selectedAgentId)
    if (found) focusedCoords = found.coords
  }

  return (
    <Paper
      radius={isMaximized ? '0' : 'md'}
      withBorder={!isMaximized}
      style={
        isMaximized
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              borderRadius: 0,
              backgroundColor: 'var(--mantine-color-body)',
              display: 'flex',
              flexDirection: 'column'
            }
          : {
              width: '100%',
              height: '100%',
              minHeight: '300px',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column'
            }
      }
    >
      {/* Floating Header when Maximized */}
      {isMaximized && (
        <Paper
          p="xs"
          radius={0}
          withBorder
          style={{
            zIndex: 10001,
            backgroundColor: 'var(--mantine-color-body)',
            borderBottom: '1px solid var(--mantine-color-default-border)'
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text fw={600} size="sm">
                Live Map (Full Screen)
              </Text>
              <Badge variant="light" color="blue">
                {jobsWithCoords.length} Jobs on map
              </Badge>
              <Badge variant="light" color="green">
                {agentsWithCoords.length} Agents
              </Badge>
            </Group>
            <Button
              size="xs"
              variant="default"
              leftSection={<Minimize2 size={14} />}
              onClick={() => setIsMaximized(false)}
            >
              Exit Full Screen (Esc)
            </Button>
          </Group>
        </Paper>
      )}

      {/* Map Control Maximize/Minimize Overlay Button */}
      {!isMaximized && (
        <Tooltip label="Maximize Map (Full Screen)" position="left">
          <ActionIcon
            variant="filled"
            color="blue"
            size="md"
            radius="md"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1000,
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
            }}
            onClick={() => setIsMaximized(true)}
          >
            <Maximize2 size={18} />
          </ActionIcon>
        </Tooltip>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', flex: 1, zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoController
          jobsWithCoords={jobsWithCoords}
          agentsWithCoords={agentsWithCoords}
          focusedCoords={focusedCoords}
          isMaximized={isMaximized}
        />

        {/* Render Job Markers */}
        {jobsWithCoords.map(({ job, coords }) => {
          const isSelected = job.id === selectedJobId

          return (
            <Marker
              key={`job-${job.id}`}
              position={coords}
              icon={createJobMarkerIcon(job.status, isSelected)}
              eventHandlers={{
                click: () => onSelectJob?.(job)
              }}
            >
              <Popup>
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Badge color={JOB_STATUS_COLORS[job.status]} variant="filled" size="sm">
                      {job.status.toUpperCase()}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Job #{job.id.slice(0, 8)}
                    </Text>
                  </Group>

                  <div>
                    <Text fw={600} size="sm">
                      {job.customer?.name || 'Unknown Customer'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {job.customer?.address || 'No address specified'}
                    </Text>
                  </div>

                  {job.assignedAgentName ? (
                    <Text size="xs">
                      <strong>Assigned:</strong> {job.assignedAgentName}
                    </Text>
                  ) : (
                    <Text size="xs" c="orange">
                      <strong>Unassigned</strong>
                    </Text>
                  )}

                  {job.notes && (
                    <Text size="xs" c="dimmed">
                      Note: {job.notes}
                    </Text>
                  )}

                  {onAssignJob && job.status === JobStatus.UNASSIGNED && (
                    <Button
                      size="xs"
                      color="teal"
                      fullWidth
                      onClick={() => onAssignJob(job)}
                    >
                      Assign Agent
                    </Button>
                  )}
                </Stack>
              </Popup>
            </Marker>
          )
        })}

        {/* Render Agent Markers */}
        {agentsWithCoords.map(({ tech, coords }) => {
          const isSelected = tech.id === selectedAgentId

          return (
            <Marker
              key={`tech-${tech.id}`}
              position={coords}
              icon={createAgentMarkerIcon(tech.status, isSelected)}
              eventHandlers={{
                click: () => onSelectAgent?.(tech)
              }}
            >
              <Popup>
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Badge color={TECHNICIAN_STATUS_COLORS[tech.status]} variant="filled" size="sm">
                      {tech.status.toUpperCase()}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Tech
                    </Text>
                  </Group>

                  <div>
                    <Text fw={600} size="sm">
                      {tech.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      📞 {tech.phone}
                    </Text>
                  </div>

                  {tech.lastLocationAt && (
                    <Text size="xs" c="dimmed">
                      Last update: {new Date(tech.lastLocationAt).toLocaleTimeString()}
                    </Text>
                  )}
                </Stack>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </Paper>
  )
}
