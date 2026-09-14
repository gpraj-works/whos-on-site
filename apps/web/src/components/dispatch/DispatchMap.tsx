import React, { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core'
import { JobDto, JobStatus, TechnicianDto, TechnicianStatus } from '@whosonsite/shared'
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

interface DispatchMapProps {
  jobs: JobDto[]
  technicians: TechnicianDto[]
  selectedJobId?: string | null
  selectedTechnicianId?: string | null
  onSelectJob?: (job: JobDto) => void
  onSelectTechnician?: (tech: TechnicianDto) => void
  onAssignJob?: (job: JobDto) => void
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006] // Default fallback center
const DEFAULT_ZOOM = 11

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JobStatus.UNASSIGNED]: '#fd7e14',
  [JobStatus.ASSIGNED]: '#228be6',
  [JobStatus.EN_ROUTE]: '#fab005',
  [JobStatus.ON_SITE]: '#12b886',
  [JobStatus.COMPLETE]: '#40c057',
  [JobStatus.CANCELLED]: '#fa5252'
}

const TECH_STATUS_COLORS: Record<TechnicianStatus, string> = {
  [TechnicianStatus.AVAILABLE]: '#40c057',
  [TechnicianStatus.BUSY]: '#fd7e14',
  [TechnicianStatus.OFFLINE]: '#868e96'
}

function createJobMarkerIcon(status: JobStatus, isSelected: boolean): L.DivIcon {
  const color = JOB_STATUS_COLORS[status] || '#228be6'
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

function createTechnicianMarkerIcon(status: TechnicianStatus, isSelected: boolean): L.DivIcon {
  const color = TECH_STATUS_COLORS[status] || '#868e96'
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
  jobs: JobDto[]
  technicians: TechnicianDto[]
  focusedCoords: [number, number] | null
}> = ({ jobs, technicians, focusedCoords }) => {
  const map = useMap()

  useEffect(() => {
    if (focusedCoords) {
      map.flyTo(focusedCoords, 15, { animate: true, duration: 1 })
      return
    }

    const points: [number, number][] = []

    jobs.forEach((j) => {
      if (j.location && typeof j.location.lat === 'number' && typeof j.location.lng === 'number') {
        points.push([j.location.lat, j.location.lng])
      }
    })

    technicians.forEach((t) => {
      if (t.location && typeof t.location.lat === 'number' && typeof t.location.lng === 'number') {
        points.push([t.location.lat, t.location.lng])
      }
    })

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true })
    }
  }, [map, jobs, technicians, focusedCoords])

  return null
}

export const DispatchMap: React.FC<DispatchMapProps> = ({
  jobs,
  technicians,
  selectedJobId,
  selectedTechnicianId,
  onSelectJob,
  onSelectTechnician,
  onAssignJob
}) => {
  const validJobs = jobs.filter(
    (j) => j.location && typeof j.location.lat === 'number' && typeof j.location.lng === 'number'
  )

  const validTechnicians = technicians.filter(
    (t) => t.location && typeof t.location.lat === 'number' && typeof t.location.lng === 'number'
  )

  // Determine focused coords if selected job or technician is specified
  let focusedCoords: [number, number] | null = null
  if (selectedJobId) {
    const job = validJobs.find((j) => j.id === selectedJobId)
    if (job?.location) {
      focusedCoords = [job.location.lat, job.location.lng]
    }
  } else if (selectedTechnicianId) {
    const tech = validTechnicians.find((t) => t.id === selectedTechnicianId)
    if (tech?.location) {
      focusedCoords = [tech.location.lat, tech.location.lng]
    }
  }

  return (
    <Paper radius="md" style={{ width: '100%', height: '100%', minHeight: '500px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoController jobs={validJobs} technicians={validTechnicians} focusedCoords={focusedCoords} />

        {/* Render Job Markers */}
        {validJobs.map((job) => {
          const lat = job.location!.lat
          const lng = job.location!.lng
          const isSelected = job.id === selectedJobId

          return (
            <Marker
              key={`job-${job.id}`}
              position={[lat, lng]}
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

                  {job.assignedTechnicianName ? (
                    <Text size="xs">
                      <strong>Assigned:</strong> {job.assignedTechnicianName}
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
                      Assign Technician
                    </Button>
                  )}
                </Stack>
              </Popup>
            </Marker>
          )
        })}

        {/* Render Technician Markers */}
        {validTechnicians.map((tech) => {
          const lat = tech.location!.lat
          const lng = tech.location!.lng
          const isSelected = tech.id === selectedTechnicianId

          return (
            <Marker
              key={`tech-${tech.id}`}
              position={[lat, lng]}
              icon={createTechnicianMarkerIcon(tech.status, isSelected)}
              eventHandlers={{
                click: () => onSelectTechnician?.(tech)
              }}
            >
              <Popup>
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Badge color={TECH_STATUS_COLORS[tech.status]} variant="filled" size="sm">
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
