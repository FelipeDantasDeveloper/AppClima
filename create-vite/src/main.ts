import './ui/styles.css'
import { mountApp } from './ui/app'

const appRoot = document.querySelector<HTMLElement>('#app')

if (!appRoot) {
  throw new Error('Elemento raiz da aplicação não encontrado.')
}

mountApp(appRoot)
