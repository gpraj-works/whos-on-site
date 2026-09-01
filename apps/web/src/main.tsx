import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/app.js'
import './app/i18n/config.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
