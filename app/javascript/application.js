import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.body.appendChild(document.createElement('div'))
  createRoot(container).render(<App />)
})
