import React, { useState } from 'react'
import { Button, Group, Popover, ScrollArea, Stack, TextInput } from '@mantine/core'
import { Clock } from 'lucide-react'

export interface TimeInputProps {
  label?: string
  error?: string
  hour: string
  minute: string
  ampm: string
  onHourChange: (v: string) => void
  onMinuteChange: (v: string) => void
  onAmpmChange: (v: string) => void
  zIndex?: number
}

const hoursList = Array.from({ length: 12 }).map((_, i) => (i + 1).toString().padStart(2, '0'))
const minutesList = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, '0'))
const ampmList = ['AM', 'PM']

const TimeColumn = ({
  data,
  value,
  onChange
}: {
  data: string[]
  value: string
  onChange: (v: string) => void
}) => (
  <ScrollArea h={180} type="never">
    <Stack gap={2}>
      {data.map((item) => (
        <Button
          key={item}
          variant={value === item ? 'filled' : 'subtle'}
          color={value === item ? undefined : 'gray'}
          onClick={() => onChange(item)}
          size="sm"
          px="sm"
        >
          {item}
        </Button>
      ))}
    </Stack>
  </ScrollArea>
)

export const TimeInput: React.FC<TimeInputProps> = ({
  label = 'Time',
  error,
  hour,
  minute,
  ampm,
  onHourChange,
  onMinuteChange,
  onAmpmChange,
  zIndex
}) => {
  const [opened, setOpened] = useState(false)

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withArrow
      shadow="md"
      zIndex={zIndex}
    >
      <Popover.Target>
        <TextInput
          label={label}
          placeholder="Select time"
          readOnly
          leftSection={<Clock size={16} />}
          value={`${hour}:${minute} ${ampm}`}
          onClick={() => setOpened((o) => !o)}
          styles={{ input: { cursor: 'pointer' } }}
          error={error}
        />
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <TimeColumn data={hoursList} value={hour} onChange={onHourChange} />
          <TimeColumn data={minutesList} value={minute} onChange={onMinuteChange} />
          <TimeColumn data={ampmList} value={ampm} onChange={onAmpmChange} />
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}
