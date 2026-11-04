import type {
  CurrentWeatherUnits,
  CurrentWeatherValues,
  DailyWeatherUnits,
  DailyWeatherValues,
  Location,
  OpenMeteoForecastResponse,
} from '../domain/types'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'
const CURRENT_VARIABLES =
  'temperature_2m,precipitation,apparent_temperature,relative_humidity_2m,is_day,rain,weather_code'
const DAILY_VARIABLES =
  'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_probability_max'

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

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readNonEmptyString(value: unknown): string | undefined {
  return nonEmptyString(value) ? value : undefined
}

function readNumberArray(value: unknown): number[] | undefined {
  return Array.isArray(value) && value.every(
    (item: unknown) => typeof item === 'number' && Number.isFinite(item),
  )
    ? value
    : undefined
}

function readStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string')
    ? value
    : undefined
}

function readCurrent(value: unknown): CurrentWeatherValues | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    time: readNonEmptyString(value.time),
    interval: readFiniteNumber(value.interval),
    temperature_2m: readFiniteNumber(value.temperature_2m),
    precipitation: readFiniteNumber(value.precipitation),
    apparent_temperature: readFiniteNumber(value.apparent_temperature),
    relative_humidity_2m: readFiniteNumber(value.relative_humidity_2m),
    is_day: readFiniteNumber(value.is_day),
    rain: readFiniteNumber(value.rain),
    weather_code: readFiniteNumber(value.weather_code),
    wind_speed_10m: readFiniteNumber(value.wind_speed_10m),
    wind_direction_10m: readFiniteNumber(value.wind_direction_10m),
  }
}

function readCurrentUnits(value: unknown): CurrentWeatherUnits | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    time: readNonEmptyString(value.time),
    interval: readNonEmptyString(value.interval),
    temperature_2m: readNonEmptyString(value.temperature_2m),
    precipitation: readNonEmptyString(value.precipitation),
    apparent_temperature: readNonEmptyString(value.apparent_temperature),
    relative_humidity_2m: readNonEmptyString(value.relative_humidity_2m),
    is_day: readNonEmptyString(value.is_day),
    rain: readNonEmptyString(value.rain),
    weather_code: readNonEmptyString(value.weather_code),
    wind_speed_10m: readNonEmptyString(value.wind_speed_10m),
    wind_direction_10m: readNonEmptyString(value.wind_direction_10m),
  }
}

function readDaily(value: unknown): DailyWeatherValues | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    time: readStringArray(value.time),
    weather_code: readNumberArray(value.weather_code),
    temperature_2m_max: readNumberArray(value.temperature_2m_max),
    temperature_2m_min: readNumberArray(value.temperature_2m_min),
    sunrise: readStringArray(value.sunrise),
    sunset: readStringArray(value.sunset),
    daylight_duration: readNumberArray(value.daylight_duration),
    sunshine_duration: readNumberArray(value.sunshine_duration),
    wind_speed_10m_max: readNumberArray(value.wind_speed_10m_max),
    wind_gusts_10m_max: readNumberArray(value.wind_gusts_10m_max),
    wind_direction_10m_dominant: readNumberArray(value.wind_direction_10m_dominant),
    precipitation_probability_max: readNumberArray(value.precipitation_probability_max),
  }
}

function readDailyUnits(value: unknown): DailyWeatherUnits | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    time: readNonEmptyString(value.time),
    weather_code: readNonEmptyString(value.weather_code),
    temperature_2m_max: readNonEmptyString(value.temperature_2m_max),
    temperature_2m_min: readNonEmptyString(value.temperature_2m_min),
    sunrise: readNonEmptyString(value.sunrise),
    sunset: readNonEmptyString(value.sunset),
    daylight_duration: readNonEmptyString(value.daylight_duration),
    sunshine_duration: readNonEmptyString(value.sunshine_duration),
    wind_speed_10m_max: readNonEmptyString(value.wind_speed_10m_max),
    wind_gusts_10m_max: readNonEmptyString(value.wind_gusts_10m_max),
    wind_direction_10m_dominant: readNonEmptyString(value.wind_direction_10m_dominant),
    precipitation_probability_max: readNonEmptyString(value.precipitation_probability_max),
  }
}

function hasUsableCurrentValues(current: CurrentWeatherValues): boolean {
  return [
    current.temperature_2m,
    current.precipitation,
    current.apparent_temperature,
    current.relative_humidity_2m,
    current.is_day,
    current.rain,
    current.weather_code,
  ].some((value) => value !== undefined)
}

export async function getWeather(
  location: Pick<Location, 'latitude' | 'longitude' | 'timezone'> | null | undefined,
): Promise<OpenMeteoForecastResponse | null> {
  if (
    !location ||
    !Number.isFinite(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    !Number.isFinite(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180 ||
    !nonEmptyString(location.timezone)
  ) {
    return null
  }

  const url = new URL(FORECAST_ENDPOINT)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone.trim(),
    current: CURRENT_VARIABLES,
    daily: DAILY_VARIABLES,
  }).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Falha na consulta meteorológica: HTTP ${response.status}`)
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload)) {
    return null
  }

  const current = readCurrent(payload.current)
  if (!current || !hasUsableCurrentValues(current)) {
    return null
  }

  return {
    current,
    current_units: readCurrentUnits(payload.current_units),
    daily: readDaily(payload.daily),
    daily_units: readDailyUnits(payload.daily_units),
  }
}
