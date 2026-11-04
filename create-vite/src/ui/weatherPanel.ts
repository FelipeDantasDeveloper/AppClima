import type {
  CurrentWeatherValues,
  DailyWeatherValues,
  Location,
  OpenMeteoForecastResponse,
} from '../domain/types'
import { getWeatherDescription } from '../domain/weather'

const COMPASS_DIRECTIONS = [
  'Norte',
  'Nordeste',
  'Leste',
  'Sudeste',
  'Sul',
  'Sudoeste',
  'Oeste',
  'Noroeste',
]
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const THUNDERSTORM_CODES = new Set([95, 96, 97, 99])

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
}

function appendMetric(
  list: HTMLDListElement,
  label: string,
  value: number | undefined,
  unit: string | undefined,
): void {
  if (value === undefined || !unit) {
    return
  }

  const term = document.createElement('dt')
  term.textContent = label
  const description = document.createElement('dd')
  description.textContent = `${formatNumber(value)} ${unit}`
  list.append(term, description)
}

function firstValue(values: number[] | undefined): number | undefined {
  const value = values?.[0]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function formatLocalDate(date: string | undefined): string | undefined {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return undefined
  }

  const parsedDate = new Date(`${date}T12:00:00Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return undefined
  }

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedDate)
}

function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (RAIN_CODES.has(code)) return '🌧️'
  if (SNOW_CODES.has(code)) return '❄️'
  if (THUNDERSTORM_CODES.has(code)) return '⛈️'
  return '🌡️'
}

function getCompassDirection(degrees: number): string {
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const index = Math.round(normalizedDegrees / 45) % COMPASS_DIRECTIONS.length
  return COMPASS_DIRECTIONS[index]
}

function appendWeatherCondition(
  summary: HTMLElement,
  current: CurrentWeatherValues,
): void {
  if (current.weather_code === undefined) {
    return
  }

  const condition = document.createElement('div')
  condition.className = 'weather-condition'
  const icon = document.createElement('span')
  icon.className = 'weather-condition__icon'
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = getWeatherIcon(current.weather_code)
  const description = document.createElement('p')
  description.textContent = getWeatherDescription(current.weather_code)
  condition.append(icon, description)
  summary.append(condition)
}

function appendWindDirection(
  list: HTMLDListElement,
  daily: DailyWeatherValues | undefined,
  unit: string | undefined,
): void {
  const degrees = firstValue(daily?.wind_direction_10m_dominant)
  if (degrees === undefined || !unit) {
    return
  }

  const term = document.createElement('dt')
  term.textContent = 'Direção do vento'
  const description = document.createElement('dd')
  description.textContent = `${formatNumber(degrees)} ${unit} (${getCompassDirection(degrees)})`
  list.append(term, description)
}

export function createWeatherPanel(
  location: Location,
  weather: OpenMeteoForecastResponse,
): HTMLElement {
  const current = weather.current
  const daily = weather.daily
  const currentUnits = weather.current_units
  const dailyUnits = weather.daily_units

  const panel = document.createElement('section')
  panel.id = 'weather-result'
  panel.className = 'weather-result'
  panel.setAttribute('aria-labelledby', 'weather-location')

  const heading = document.createElement('h2')
  heading.id = 'weather-location'
  heading.textContent = `${location.name}, ${location.countryCode}`
  panel.append(heading)

  const summary = document.createElement('div')
  summary.className = 'weather-summary'

  if (current?.temperature_2m !== undefined && currentUnits?.temperature_2m) {
    const temperature = document.createElement('p')
    temperature.className = 'weather-summary__temperature'
    temperature.textContent = `${formatNumber(current.temperature_2m)} ${currentUnits.temperature_2m}`
    summary.append(temperature)
  }

  const currentDate = current?.time?.slice(0, 10)
  const localDate = formatLocalDate(currentDate) ?? formatLocalDate(daily?.time?.[0])
  if (localDate) {
    const date = document.createElement('p')
    date.className = 'weather-summary__date'
    date.textContent = localDate
    summary.append(date)
  }

  if (current?.is_day === 0 || current?.is_day === 1) {
    const dayPeriod = document.createElement('p')
    dayPeriod.className = 'weather-summary__period'
    dayPeriod.textContent = current.is_day === 1 ? 'Dia' : 'Noite'
    summary.append(dayPeriod)
  }

  if (current) {
    appendWeatherCondition(summary, current)
  }
  panel.append(summary)

  const metrics = document.createElement('dl')
  metrics.className = 'weather-metrics'
  appendMetric(metrics, 'Sensação térmica', current?.apparent_temperature, currentUnits?.apparent_temperature)
  appendMetric(metrics, 'Umidade relativa', current?.relative_humidity_2m, currentUnits?.relative_humidity_2m)
  appendMetric(metrics, 'Temperatura mínima', firstValue(daily?.temperature_2m_min), dailyUnits?.temperature_2m_min)
  appendMetric(metrics, 'Temperatura máxima', firstValue(daily?.temperature_2m_max), dailyUnits?.temperature_2m_max)
  appendMetric(metrics, 'Velocidade máxima do vento', firstValue(daily?.wind_speed_10m_max), dailyUnits?.wind_speed_10m_max)
  appendWindDirection(metrics, daily, dailyUnits?.wind_direction_10m_dominant)
  appendMetric(
    metrics,
    'Probabilidade máxima de precipitação',
    firstValue(daily?.precipitation_probability_max),
    dailyUnits?.precipitation_probability_max,
  )

  if (metrics.childElementCount > 0) {
    panel.append(metrics)
  }

  return panel
}
