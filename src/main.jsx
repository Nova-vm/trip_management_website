import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// HashRouter (not BrowserRouter) on purpose — GitHub Pages serves one fixed
// index.html with no server-side rewrites, so a path-based URL like
// /itinerary 404s on refresh or direct load. HashRouter keeps every route
// after a # (e.g. /#/itinerary), which GitHub Pages always resolves to the
// same index.html correctly. See Read_Me/GITHUB_DEPLOY_GUIDE.md.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
