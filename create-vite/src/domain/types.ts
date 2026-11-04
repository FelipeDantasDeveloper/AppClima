export interface Location {
  name: string
  latitude: number
  longitude: number
  timezone: string
  countryCode: string
}

export interface CurrentWeatherValues {
  time?: string
  interval?: number
  temperature_2m?: number
  precipitation?: number
  apparent_temperature?: number
  relative_humidity_2m?: number
  is_day?: number
  rain?: number
  weather_code?: number
  wind_speed_10m?: number
  wind_direction_10m?: number
}

export interface CurrentWeatherUnits {
  time?: string
  interval?: string
  temperature_2m?: string
  precipitation?: string
  apparent_temperature?: string
  relative_humidity_2m?: string
  is_day?: string
  rain?: string
  weather_code?: string
  wind_speed_10m?: string
  wind_direction_10m?: string
}

export interface DailyWeatherValues {
  time?: string[]
  weather_code?: number[]
  temperature_2m_max?: number[]
  temperature_2m_min?: number[]
  sunrise?: string[]
  sunset?: string[]
  daylight_duration?: number[]
  sunshine_duration?: number[]
  wind_speed_10m_max?: number[]
  wind_gusts_10m_max?: number[]
  wind_direction_10m_dominant?: number[]
  precipitation_probability_max?: number[]
}

export interface DailyWeatherUnits {
  time?: string
  weather_code?: string
  temperature_2m_max?: string
  temperature_2m_min?: string
  sunrise?: string
  sunset?: string
  daylight_duration?: string
  sunshine_duration?: string
  wind_speed_10m_max?: string
  wind_gusts_10m_max?: string
  wind_direction_10m_dominant?: string
  precipitation_probability_max?: string
}

export interface OpenMeteoForecastResponse {
  current?: CurrentWeatherValues
  current_units?: CurrentWeatherUnits
  daily?: DailyWeatherValues
  daily_units?: DailyWeatherUnits
}
