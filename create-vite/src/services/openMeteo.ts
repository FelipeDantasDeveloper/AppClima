import type { Location } from '../domain/types'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function toLocation(value: unknown): Location | null {
  if (!isRecord(value)) {
    return null
  }

  const { name, latitude, longitude, timezone, country_code: countryCode } = value
  if (
    !nonEmptyString(name) ||
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !nonEmptyString(timezone) ||
    !nonEmptyString(countryCode)
  ) {
    return null
  }

  return {
    name: name.trim(),
    latitude,
    longitude,
    timezone: timezone.trim(),
    countryCode: countryCode.trim(),
  }
}

export async function searchLocation(cityName: string): Promise<Location | null> {
  if (typeof cityName !== 'string' || cityName.trim().length === 0) {
    return null
  }

  const url = new URL(GEOCODING_ENDPOINT)
  url.search = new URLSearchParams({
    name: cityName.trim(),
    count: '1',
    language: 'pt',
    format: 'json',
  }).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Falha na geocodificação: HTTP ${response.status}`)
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload) || !Array.isArray(payload.results) || payload.results.length === 0) {
    return null
  }

  return toLocation(payload.results[0])
}
