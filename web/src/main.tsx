import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Join from './pages/Join.tsx'
import Upload from './pages/Upload.tsx'
import Piece from './pages/Piece.tsx'
import Artist from './pages/Artist.tsx'
import Space from './pages/Space.tsx'
import { configureAuth } from './auth.ts'
import { isSpaceHost } from './lib/host.ts'

configureAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* on space.accessart.net the root IS the space; elsewhere it is the landing */}
        <Route path="/" element={isSpaceHost() ? <Space /> : <App />} />
        <Route path="/space" element={<Space />} />
        <Route path="/join" element={<Join />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/piece/:id" element={<Piece />} />
        {/* the artist catch-all stays last so it never shadows real routes */}
        <Route path="/:atHandle" element={<Artist />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
