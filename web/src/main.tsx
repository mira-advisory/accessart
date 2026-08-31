import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Join from './pages/Join.tsx'
import Upload from './pages/Upload.tsx'
import Piece from './pages/Piece.tsx'
import Artist from './pages/Artist.tsx'
import { configureAuth } from './auth.ts'

configureAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/join" element={<Join />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/piece/:id" element={<Piece />} />
        {/* the artist catch-all stays last so it never shadows real routes */}
        <Route path="/:atHandle" element={<Artist />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
