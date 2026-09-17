export interface GeocodeResult {
  displayName: string
  latitude: number
  longitude: number
}

interface NominatimItem {
  display_name?: string
  lat?: string
  lon?: string
  [key: string]: unknown
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function fetchNominatim<T = unknown>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${NOMINATIM_BASE}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      Referer: window.location.origin
    }
  })

  if (!res.ok) {
    throw new Error('Address lookup service unavailable.')
  }

  return (await res.json()) as T
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []

  const data = await fetchNominatim<NominatimItem[]>('/search', {
    q: query.trim(),
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6'
  })

  if (!Array.isArray(data)) return []

  return data
    .filter((item) => typeof item?.lat === 'string' && typeof item?.lon === 'string')
    .map((item) => ({
      displayName: String(item.display_name ?? ''),
      latitude: Number(item.lat),
      longitude: Number(item.lon)
    }))
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  const data = await fetchNominatim<NominatimItem>('/reverse', {
    lat: String(latitude),
    lon: String(longitude),
    format: 'jsonv2',
    addressdetails: '1'
  })

  if (!data?.display_name || typeof data.lat !== 'string' || typeof data.lon !== 'string') {
    return null
  }

  return {
    displayName: data.display_name,
    latitude: Number(data.lat),
    longitude: Number(data.lon)
  }
}
