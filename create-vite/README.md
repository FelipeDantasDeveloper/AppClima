# App Clima

Aplicação web para pesquisar uma cidade e consultar as condições meteorológicas atuais. A localização é obtida pela API de geocodificação do Open-Meteo e, em seguida, os dados meteorológicos são consultados pela Forecast API.

**Demo:** https://felipedantasdeveloper.github.io/AppClima/

## Tecnologias

- Vite
- TypeScript sem framework
- Open-Meteo Geocoding API e Forecast API

## Requisitos

- Node.js 22
- npm

## Desenvolvimento local

Na pasta do projeto, instale as dependências e inicie o servidor:

```bash
npm ci
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador.

## Build de produção

```bash
npm run build
```

Os arquivos prontos para publicação são gerados na pasta `dist/`. Para testar esse build localmente:

```bash
npm run preview
```

## Publicação no GitHub Pages

O workflow [Deploy to GitHub Pages](../.github/workflows/deploy.yml), localizado na raiz do repositório, constrói o projeto desta pasta e publica o site automaticamente quando há um push para a branch `main`. Também pode ser iniciado manualmente pela aba **Actions** do GitHub.

Para habilitar a publicação no repositório, configure:

1. Abra **Settings → Pages**.
2. Em **Build and deployment**, selecione **GitHub Actions** como fonte.
3. Envie alterações para `main` ou execute manualmente o workflow.

O workflow configura o caminho base do repositório durante o build e publica o conteúdo de `dist/`.

## Estrutura principal

```text
App Clima/
  .github/workflows/  Automação de build e deploy (raiz do repositório)
  create-vite/
    src/
      domain/         Tipos e utilitários meteorológicos
      services/       Integração com as APIs Open-Meteo
      ui/             Interface, estilos e painel de clima
```
