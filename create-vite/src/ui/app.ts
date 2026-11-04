import { searchWeather } from '../services/openMeteo'

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <main id="weather-app">
      <header class="search-header">
        <h1>App Clima</h1>
        <form id="city-search" role="search">
          <label for="city-name">Pesquise uma cidade</label>
          <div class="search-controls">
            <input
              id="city-name"
              name="city"
              type="search"
              placeholder="Ex.: São Paulo"
              autocomplete="off"
              required
              aria-describedby="search-guidance search-status"
            />
            <button type="submit">Buscar</button>
          </div>
        </form>
      </header>
      <section id="search-feedback" aria-atomic="true">
        <p id="search-guidance">Informe o nome de uma cidade para consultar o clima.</p>
        <p id="search-status" role="status" aria-live="polite"></p>
      </section>
    </main>
  `

  const form = root.querySelector<HTMLFormElement>('#city-search')
  const input = root.querySelector<HTMLInputElement>('#city-name')
  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]')
  const feedback = root.querySelector<HTMLElement>('#search-feedback')
  const guidance = root.querySelector<HTMLParagraphElement>('#search-guidance')
  const status = root.querySelector<HTMLParagraphElement>('#search-status')

  if (!form || !input || !button || !feedback || !guidance || !status) {
    throw new Error('Não foi possível inicializar a busca de cidades.')
  }

  let isSearching = false

  input.addEventListener('input', () => input.setCustomValidity(''))

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (isSearching) {
      return
    }

    const cityName = input.value.trim()
    if (!cityName) {
      input.setCustomValidity('Informe o nome de uma cidade.')
      input.reportValidity()
      return
    }

    isSearching = true
    input.disabled = true
    button.disabled = true
    button.textContent = 'Buscando...'
    feedback.setAttribute('aria-busy', 'true')
    guidance.textContent = ''
    status.className = 'search-message search-message--loading'
    status.setAttribute('role', 'status')
    status.setAttribute('aria-live', 'polite')
    status.textContent = 'Buscando a cidade e consultando o clima...'

    try {
      const result = await searchWeather(cityName)
      if (result.status === 'not-found') {
        status.className = 'search-message search-message--empty'
        status.textContent = `Não foi possível encontrar dados de clima para "${cityName}". Verifique o nome da cidade e tente novamente.`
        return
      }

      if (result.status === 'error') {
        status.className = 'search-message search-message--error'
        status.setAttribute('role', 'alert')
        status.setAttribute('aria-live', 'assertive')
        status.textContent = 'Ocorreu uma falha ao consultar o serviço de clima. Tente novamente em instantes.'
        return
      }

      status.className = 'search-message search-message--success'
      status.textContent = `Consulta concluída para ${result.location.name}, ${result.location.countryCode}.`
    } finally {
      isSearching = false
      input.disabled = false
      button.disabled = false
      button.textContent = 'Buscar'
      feedback.removeAttribute('aria-busy')
      input.focus()
    }
  })
}
