import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PredictionsProvider } from './state/PredictionsProvider'
import { FavouritesProvider } from './state/FavouritesProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PredictionsProvider>
        <FavouritesProvider>
          <App />
        </FavouritesProvider>
      </PredictionsProvider>
    </BrowserRouter>
  </StrictMode>,
)