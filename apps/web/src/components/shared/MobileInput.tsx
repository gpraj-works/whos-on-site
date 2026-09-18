import {
  ActionIcon,
  Flex,
  Menu,
  ScrollArea,
  Text,
  TextInput,
  UnstyledButton,
  type TextInputProps
} from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { useMemo, useRef, useState, type FC } from 'react'
import { Search, X } from 'lucide-react'
import { defaultCountries, FlagImage, parseCountry, usePhoneInput } from 'react-international-phone'

type MobileInputProps = Omit<TextInputProps, 'onChange' | 'value' | 'ref'> & {
  value?: string
  onChange: (value: string) => void
}

const MobileInput: FC<MobileInputProps> = (props) => {
  const [opened, setOpened] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const hookInputRef = useRef<HTMLInputElement | null>(null)
  const { ref: sizeRef, width: inputWidth } = useElementSize()

  const parsedCountries = useMemo(() => defaultCountries.map((rip) => parseCountry(rip)), [])

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return parsedCountries
    return parsedCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase().includes(q)
    )
  }, [parsedCountries, searchQuery])

  const { inputValue, handlePhoneValueChange, country, setCountry } = usePhoneInput({
    defaultCountry: 'in',
    countries: defaultCountries,
    value: props.value,
    inputRef: hookInputRef,
    onChange: ({ phone }) => {
      props.onChange(phone)
    },
  })

  const setRefs = (node: HTMLInputElement | null) => {
    hookInputRef.current = node
    sizeRef.current = node
  }

  return (
    <TextInput
      {...props}
      type="tel"
      ref={setRefs}
      value={inputValue}
      leftSection={
        <Menu
          opened={opened}
          onChange={setOpened}
          position="bottom-start"
          withinPortal
          shadow="lg"
          width={inputWidth}
        >
          <Menu.Target>
            <UnstyledButton
              aria-label={`Select country code, currently ${country.name} (+${country.dialCode})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <FlagImage iso2={country.iso2} width={25} />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown ml={-6} p="xs">
            <TextInput
              placeholder="Search country or code..."
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<Search size={12} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={10} />
                  </ActionIcon>
                ) : null
              }
              mb="xs"
              autoFocus
            />

            <ScrollArea h={150}>
              {filteredCountries.length === 0 ? (
                <Text size="xs" c="dimmed" ta="center" py="sm">
                  No countries found
                </Text>
              ) : (
                filteredCountries.map((country) => {
                  return (
                    <Menu.Item
                      key={country.iso2}
                      onClick={() => {
                        setCountry(country.iso2)
                        setSearchQuery('')
                      }}
                      leftSection={<FlagImage iso2={country.iso2} width={25} />}
                    >
                      <Flex gap={5}>
                        <Text fz="sm">+{country.dialCode}</Text>
                        <Text fz="sm">-</Text>
                        <Text fz="sm">{country.name}</Text>
                      </Flex>
                    </Menu.Item>
                  )
                })
              )}
            </ScrollArea>
          </Menu.Dropdown>
        </Menu>
      }
      onChange={handlePhoneValueChange}
    />
  )
}

export default MobileInput