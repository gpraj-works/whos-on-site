export interface GeocodeResult {
  displayName: string
  latitude: number
  longitude: number
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function fetchNominatim(endpoint: string, params: Record<string, string>): Promise<any> {
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

  return res.json()
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return []

  const data = await fetchNominatim('/search', {
    q: query.trim(),
    format: 'jsonv2',
    addressdetails: '1',
    limit: '6'
  })

  if (!Array.isArray(data)) return []

  return data
    .filter((item) => typeof item?.lat === 'string' && typeof item?.lon === 'string')
    .map((item) => ({
      displayName: item.display_name as string,
      latitude: Number(item.lat),
      longitude: Number(item.lon)
    }))
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  const data = await fetchNominatim('/reverse', {
    lat: String(latitude),
    lon: String(longitude),
    format: 'jsonv2',
    addressdetails: '1'
  })

  if (!data?.display_name || typeof data.lat !== 'string' || typeof data.lon !== 'string') {
    return null
  }

  return {
    displayName: data.display_name as string,
    latitude: Number(data.lat),
    longitude: Number(data.lon)
  }
}
