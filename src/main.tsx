import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource/anton/latin.css'
import App from './App.tsx'
import { applySkin, loadSkin } from './skins'

// Apply the saved look before the first paint, so the intro already wears it.
applySkin(loadSkin())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
