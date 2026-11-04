# Projeto Clima

Este projeto vai pegar a cidade e baseado nisso, consultar o clima daquela região, exibindo as principais informações de clima, temperatura, humidade e tc.

### Aspector Técnicos

O projeto vai ser feito em vite + vanilla + TypeScript

Ele vai usar a API OpenMeteo, com os seguinte endpoints:

Para pegar a latitude, longitude e timezone, baseado no nome da cidade:
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json

{NOME_DA_CIDADE} = Nome da cidade que o usuário digitou

Exemplo de resposta: {
  "results": [
    {
      "id": 3457671,
      "name": "Maringá",
      "latitude": -23.42528,
      "longitude": -51.93861,
      "elevation": 556,
      "feature_code": "PPLA2",
      "country_code": "BR",
      "admin1_id": 3455077,
      "admin2_id": 6322863,
      "timezone": "America/Sao_Paulo",
      "population": 409657,
      "country_id": 3469034,
      "country": "Brasil",
      "admin1": "Paraná",
      "admin2": "Maringá"
    }
  ],
  "generationtime_ms": 0.23448467
}

Informações que precisamos :

-Name
-Longitude
-Latitude
-TimeZone
-Country_code


Para pegar as informações de clima:
https://api.open-meteo.com/v1/forecast?latitude={Latitude}&{Longitude}=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&current=precipitation,is_day,rain,temperature_2m,relative_humidity_2m,apparent_temperature&timezone={TIMEZONE}

{Latitude} = Latitude
{Longitude} = Longitude
{Timezone} = timezone

 Exemplo de resposta:
 {
  "latitude": 52.512604,
  "longitude": 13.419517,
  "generationtime_ms": 1.31654739379883,
  "utc_offset_seconds": 0,
  "timezone": "GMT",
  "timezone_abbreviation": "GMT",
  "elevation": 38,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "relative_humidity_2m": "%",
    "apparent_temperature": "°C",
    "is_day": "",
    "precipitation": "mm",
    "rain": "mm",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2026-11-03T19:45",
    "interval": 900,
    "relative_humidity_2m": 86,
    "apparent_temperature": 2.9,
    "is_day": 0,
    "precipitation": 0,
    "rain": 0,
    "weather_code": 0
  },
  "daily_units": {
    "time": "iso8601",
    "weather_code": "wmo code",
    "temperature_2m_max": "°C",
    "temperature_2m_min": "°C",
    "sunrise": "iso8601",
    "sunset": "iso8601",
    "daylight_duration": "s",
    "sunshine_duration": "s",
    "precipitation_probability_max": "%",
    "wind_speed_10m_max": "km/h",
    "wind_gusts_10m_max": "km/h",
    "wind_direction_10m_dominant": "°"
  },
  "daily": {
    "time": [
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09"
    ],
    "weather_code": [3, 3, 2, 3, 3, 3, 3],
    "temperature_2m_max": [9.7, 9.7, 9.2, 7.3, 6.8, 6.9, 7.5],
    "temperature_2m_min": [3.9, 4.8, 3.2, 2.5, 1.8, 1.5, 2.9],
    "sunrise": [
      "2026-11-03T06:06",
      "2026-11-04T06:07",
      "2026-11-05T06:09",
      "2026-11-06T06:11",
      "2026-11-07T06:13",
      "2026-11-08T06:15",
      "2026-11-09T06:17"
    ],
    "sunset": [
      "2026-11-03T15:33",
      "2026-11-04T15:31",
      "2026-11-05T15:29",
      "2026-11-06T15:27",
      "2026-11-07T15:25",
      "2026-11-08T15:24",
      "2026-11-09T15:22"
    ],
    "daylight_duration": [34010.79, 33790.32, 33571.04, 33353.2, 33137.04, 32922.8, 32710.75],
    "sunshine_duration": [30845.23, 26118.38, 29856.38, 1430.33, 20425.24, 818.09, 24020.15],
    "precipitation_probability_max": [3, 0, 0, 0, 3, 3, 7],
    "wind_speed_10m_max": [10.5, 10.7, 9.8, 11.3, 9.4, 5.7, 7.6],
    "wind_gusts_10m_max": [24.8, 26.3, 22.7, 27.4, 22.3, 13.7, 18.4],
    "wind_direction_10m_dominant": [36, 62, 80, 92, 103, 120, 105]
  }
}

 Informações que precisamos da resposta:

 Na resposta eu tenho dois itens:

 - Current_units tem as unidades de medias das propriedades
 - Current tem os valores das propriedades
 - Daily_Units tem as unidades de medidas das propriedades
 - Daily os valores das propriedades

 - Propriedades obrigatórias:
 - temperature_2m
 - precipitation
 - apparent_temperature
 - relative_humidity_2m
 - temperature_2m_max
 - temperature_2m_min
 - sunrise
 - sunset
 - time
 - is_day
 - daylight_duration
 - sunshine_duration
 - wind_speed_10m_max
 - wind_gusts_10m_max
 - wind_direction_10m_dominant
 - precipitation_probability_max
 - weather_code

#### Informação importante: 
Teremos um arquivo com as funções do OpenMeteo, para que o projeto não faça requisição direta a API mas sim use as funções desse atquivo.

Fluxo de pesquisa para receber nome da cidade e pegar as informações de clima:

- O usuáio digita o nome da cidade
- O projeto pega o nome e usa  o open Meteo para pegar a latitude, longitude e timezone dessa cidade.
- Ao pegar latitude e longitude e timezone, o projeto usa essas informações para fazer a requisição pegar as informações do clima dessa localização.
- Caso ache as informações da cidade mas não as de clima, se comportar como se não  tivesse achado nada.

A busca envolve as 2 requisições (buscar latitude/longitude/timezone + buscar clima), mas para o usuário é uma só, com loading.

As funções do OpenMeteo devem verificar se os parâmetros vierem, caso contrário, age como se não tivesse vindo.

### Aspectos visuais (design e ux)


tem que ter Empty state.

Teremos uma área superior centralizada e que tem o campo de busca da cidade

o projeto tera um side bar na esquerda com as seguintes informações:

- Temperatura
- Nome da cidade e código do país
- Dia atual
- Se é dia ou noite(baseado no is_day)
- Weather code
- direção do vento
- Velocidade do vento
- Temperatura minima e maxima
- Sensação termica
 



Informações de weather code:

0	Clear sky
1	Mainly clear
2	Partly cloudy
3	Overcast
45	Fog
48	Depositing rime fog
51	Light drizzle
53	Moderate drizzle
55	Dense drizzle
56	Light freezing drizzle
57	Dense freezing drizzle
61	Slight rain
63	Moderate rain
65	Heavy rain
66	Light freezing rain
67	Heavy freezing rain
71	Slight snowfall
73	Moderate snowfall
75	Heavy snowfall
77	Snow grains
80	Slight rain showers
81	Moderate rain showers
82	Violent rain showers
85	Slight snow showers
86	Heavy snow showers
95	Thunderstorm
96	Thunderstorm with slight hail *
97	Heavy thunderstorm
99	Thunderstorm with heavy hail *



Na área principal:

- Humidade relativa
- Temperatura aparente
- Probabilidade de precipitação
- Velocidade/Direção do vento




Design Geral:

- Projeto terá um fundo cinza escruto
- A parte superior não terá background, mas tanto sidebar quanto a área principal ficarão dentro de uma div com borda bem arredondada, fundo branco, centralizada e largura máxima de 800px