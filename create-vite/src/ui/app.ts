export function mountApp(root: HTMLElement): void {
  const app = document.createElement('main')
  app.id = 'weather-app'
  root.replaceChildren(app)
}
