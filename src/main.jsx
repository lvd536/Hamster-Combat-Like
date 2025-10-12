import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './components/css/reset.css'
import './components/css/styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
