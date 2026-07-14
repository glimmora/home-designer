import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppWithBoundary } from './App.jsx'
import { LangProvider } from './lib/i18n.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AppWithBoundary />
    </LangProvider>
  </React.StrictMode>,
)
