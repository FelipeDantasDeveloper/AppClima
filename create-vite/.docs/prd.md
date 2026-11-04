# PRD — App Clima

## 1. Visão do produto

O App Clima permite consultar as condições meteorológicas atuais de uma cidade. A pessoa informa o nome da cidade e recebe, em uma única experiência de busca, a localização encontrada e os dados de clima correspondentes.

## 2. Objetivo e escopo

### Objetivos

- Encontrar uma cidade pelo nome informado.
- Consultar e apresentar as condições meteorológicas dessa localização.
- Exibir claramente o estado inicial, o carregamento, os resultados e a ausência de resultados.

### Dentro do escopo

- Busca de uma cidade por nome, usando geocodificação.
- Consulta do clima atual e dos dados diários definidos na integração.
- Apresentação dos dados atuais descritos neste documento.
- Estados de interface para busca e resposta.

### Fora do escopo nesta versão

- Seleção entre várias cidades com o mesmo nome.
- Favoritos, histórico de buscas, contas de usuário ou preferências persistidas.
- Uma seção visual de previsão diária. Os dados diários devem ser solicitados e tratados pela integração, mas sua apresentação visual fica para uma definição futura.

## 3. Usuário e necessidade

**Como pessoa que quer saber o clima de uma cidade**, quero pesquisar pelo nome dela e visualizar as condições atuais em um painel simples, para consultar rapidamente temperatura, condição do tempo e outras medidas relevantes.

## 4. Requisitos funcionais

### RF-01 — Buscar cidade

- A interface deve oferecer um campo para informar o nome da cidade, em uma área superior centralizada.
- A busca deve ser iniciada pelo envio do formulário (por exemplo, pressionando Enter ou acionando o botão de busca).
- A busca deve ser tratada como uma única ação, mesmo que internamente execute duas requisições: geocodificação e consulta meteorológica.
- Enquanto a busca estiver em andamento, a interface deve apresentar um indicador de carregamento e impedir que esse estado seja confundido com ausência de resultados.

### RF-02 — Resolver a localização

- A aplicação deve consultar a API de geocodificação Open-Meteo usando o nome informado.
- Para esta versão, deve usar o primeiro resultado (`count=1`) e obter nome, latitude, longitude, fuso horário e código do país.
- Se não houver um resultado de cidade utilizável, a busca deve terminar sem apresentar dados meteorológicos.

### RF-03 — Consultar o clima

- Após obter latitude, longitude e fuso horário válidos, a aplicação deve consultar a previsão Open-Meteo para essa localização.
- A tela de resultados só deve ser apresentada quando houver dados meteorológicos utilizáveis.
- Se a cidade for encontrada, mas a consulta do clima não retornar dados utilizáveis, a experiência deve ser tratada como busca sem resultado.

### RF-04 — Apresentar condições atuais

O painel de resultados deve apresentar:

- Temperatura atual.
- Nome da cidade e código do país.
- Data/dia atual da localização consultada.
- Indicador de dia ou noite, derivado de `is_day`.
- Descrição textual e representação visual da condição meteorológica, derivadas de `weather_code`.
- Direção e velocidade do vento.
- Temperaturas mínima e máxima.
- Sensação térmica.
- Umidade relativa.
- Probabilidade máxima de precipitação.

Os valores devem incluir as unidades fornecidas pela API. A direção do vento pode ser apresentada como direção cardinal derivada do ângulo, desde que preserve o valor de origem quando necessário.

### RF-05 — Dados diários da integração

A integração deve solicitar e tratar os seguintes dados diários: data (`time`), código do tempo (`weather_code`), temperatura máxima e mínima, nascer e pôr do sol, duração da luz do dia (`daylight_duration`), duração do brilho solar (`sunshine_duration`), velocidade máxima do vento, rajadas máximas, direção predominante do vento e probabilidade máxima de precipitação.

Esses dados são requisitos do contrato de integração, mas **não devem ser usados para presumir ou especificar uma seção visual de previsão diária nesta versão**.

### RF-06 — Estados de interface e mensagens

- **Inicial/empty state:** antes de uma busca, apresentar a área de busca e uma orientação para pesquisar uma cidade, sem dados meteorológicos fictícios.
- **Carregando:** indicar que a busca está em andamento durante as duas etapas da consulta.
- **Sem resultado:** informar de forma clara que não foi possível encontrar dados para a pesquisa. Aplicar este estado tanto quando não houver cidade correspondente quanto quando não houver dados de clima utilizáveis para a cidade.
- **Erro de serviço/conexão:** informar que ocorreu uma falha na consulta, sem apresentá-la como uma busca bem-sucedida ou como dados vazios retornados pela API.
- **Resultado:** apresentar os dados da localização somente depois de completar com sucesso a geocodificação e a consulta de clima.

## 5. Requisitos de integração e sistema

### Tecnologias

- Vite para desenvolvimento e build.
- TypeScript sem framework de interface (Vanilla TypeScript).
- Open-Meteo Geocoding API e Forecast API como fontes de dados.

### Fronteira de acesso à API

- As chamadas HTTP devem ficar encapsuladas em um módulo/arquivo de funções do Open-Meteo.
- Componentes e lógica de interface não devem fazer requisições diretamente às APIs.
- As funções da integração devem validar os parâmetros necessários antes de requisitar dados. Parâmetros ausentes ou inválidos não devem gerar chamadas HTTP; devem resultar em um retorno sem dados utilizáveis, tratado pelo fluxo como busca sem resultado.
- Falhas de rede ou respostas de erro da API devem ser propagadas de forma que a interface possa exibir o estado de erro, sem serem silenciosamente convertidas em sucesso ou dados vazios.

### Etapa 1 — Geocodificação

Endpoint:

```text
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json
```

Parâmetros:

- `name`: texto informado no campo de busca.
- `count=1`: solicitar um resultado.
- `language=pt`: solicitar nomes/localização em português quando disponíveis.
- `format=json`: resposta JSON.

Dados de localização necessários:

- `name`
- `latitude`
- `longitude`
- `timezone`
- `country_code`

### Etapa 2 — Consulta meteorológica

Endpoint-base:

```text
https://api.open-meteo.com/v1/forecast
```

Montar a consulta com os parâmetros corretos `latitude`, `longitude` e `timezone`, além das variáveis atuais e diárias abaixo. A URL de exemplo no brain dump contém um erro de escrita no parâmetro de longitude; a implementação deve usar `longitude={LONGITUDE}`.

Variáveis atuais a solicitar:

```text
temperature_2m,precipitation,apparent_temperature,relative_humidity_2m,is_day,rain,weather_code
```

Variáveis diárias a solicitar:

```text
weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,sunshine_duration,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,precipitation_probability_max
```

As unidades devem ser lidas dos objetos `current_units` e `daily_units`; os valores devem ser lidos, respectivamente, de `current` e `daily`. A implementação deve conferir a estrutura da resposta e não presumir que arrays diários tenham dados utilizáveis.

### Mapeamento de códigos meteorológicos WMO

O código `weather_code` deve ser convertido para uma descrição compreensível e manter uma associação visual coerente. Descrições em português para a interface:

| Código | Descrição |
|---:|---|
| 0 | Céu limpo |
| 1 | Predominantemente limpo |
| 2 | Parcialmente nublado |
| 3 | Encoberto |
| 45 | Nevoeiro |
| 48 | Nevoeiro com depósito de geada |
| 51 | Chuvisco fraco |
| 53 | Chuvisco moderado |
| 55 | Chuvisco intenso |
| 56 | Chuvisco congelante fraco |
| 57 | Chuvisco congelante intenso |
| 61 | Chuva fraca |
| 63 | Chuva moderada |
| 65 | Chuva forte |
| 66 | Chuva congelante fraca |
| 67 | Chuva congelante forte |
| 71 | Neve fraca |
| 73 | Neve moderada |
| 75 | Neve forte |
| 77 | Grãos de neve |
| 80 | Pancadas de chuva fracas |
| 81 | Pancadas de chuva moderadas |
| 82 | Pancadas de chuva violentas |
| 85 | Pancadas de neve fracas |
| 86 | Pancadas de neve fortes |
| 95 | Trovoada |
| 96 | Trovoada com granizo fraco |
| 97 | Trovoada forte |
| 99 | Trovoada com granizo forte |

Para códigos desconhecidos, a interface deve usar uma descrição genérica de condição indisponível, sem interromper a apresentação das demais medidas válidas.

## 6. Instruções visuais e UX

### Composição

- Usar fundo geral cinza-escuro.
- Manter a área superior sem fundo próprio, com o campo de busca centralizado.
- Abaixo da busca, exibir um contêiner principal branco, centralizado, com largura máxima de `800px` e bordas bem arredondadas.
- Dentro do contêiner, organizar o conteúdo em uma barra lateral à esquerda e uma área principal.
- A barra lateral deve agrupar os dados de identificação e resumo: temperatura, cidade/código do país, dia atual, dia/noite, condição meteorológica, vento, temperaturas mínima/máxima e sensação térmica.
- A área principal deve agrupar umidade relativa, temperatura aparente, probabilidade de precipitação e velocidade/direção do vento.
- O vento aparece nas duas áreas conforme definido no brain dump; evitar que essa repetição prejudique a hierarquia ou a leitura.
- Não incluir uma seção visual de previsão diária até que seu desenho e conteúdo sejam definidos.

### Estados e interação

- O empty state deve ser visível e útil, em vez de uma área de resultado vazia.
- O carregamento deve corresponder à operação completa, incluindo geocodificação e consulta meteorológica.
- Usar rótulos claros, unidades junto aos valores e contraste suficiente entre texto, fundo e estados.
- Em telas estreitas, reorganizar a barra lateral e a área principal para uma única coluna, mantendo a ordem de leitura e evitando rolagem horizontal.

## 7. Requisitos não funcionais

- **Acessibilidade:** campo de busca com rótulo acessível; controles operáveis por teclado; estado de carregamento e mensagens de resultado/erro anunciáveis por tecnologia assistiva; não depender apenas de cor ou ícone para comunicar a condição.
- **Responsividade:** preservar a hierarquia e legibilidade do painel em telas estreitas.
- **Confiabilidade:** não mostrar unidades ou valores para campos ausentes como se fossem reais; tolerar campos opcionais ausentes sem ocultar outros dados válidos.
- **Manutenibilidade:** manter a integração isolada da interface e tipar os dados e retornos usados pela aplicação.

## 8. Critérios de aceite

1. Ao pesquisar uma cidade válida, a aplicação mostra um único estado de carregamento enquanto executa geocodificação e consulta meteorológica.
2. A consulta meteorológica usa a latitude, longitude e timezone obtidos para a cidade, com parâmetros válidos para ambas as coordenadas.
3. Com respostas válidas nas duas etapas, o painel apresenta os dados atuais definidos em RF-04, com as unidades da resposta.
4. Sem resultado de geocodificação, não é feita uma consulta meteorológica e a interface mostra o estado sem resultado.
5. Se a geocodificação encontrar uma cidade, mas não houver clima utilizável, a interface mostra o estado sem resultado.
6. Se faltarem parâmetros necessários, as funções Open-Meteo não enviam requisições incompletas.
7. Uma falha de rede ou da API produz uma mensagem de erro, não um resultado meteorológico fictício.
8. A integração solicita e trata os campos diários enumerados em RF-05, sem exigir sua apresentação em uma seção visual.
9. A interface inclui o empty state inicial e respeita a composição visual e a largura máxima especificadas.
10. Em viewport estreita, as áreas lateral e principal são reorganizadas sem rolagem horizontal.
