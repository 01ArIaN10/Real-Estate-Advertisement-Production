import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './routes/Home.jsx'
import AllAds from './routes/AllAds.jsx'
import './theme.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<App />} />
        <Route path="/all" element={<AllAds />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)


