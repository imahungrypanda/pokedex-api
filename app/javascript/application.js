import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './components/app'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.body.appendChild(document.createElement('div'))
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
})
