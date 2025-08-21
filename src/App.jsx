import { useState } from 'react'
import './App.css'
import { supabase } from './services/supabaseClient'
import { useEffect } from 'react'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
function Home(params) {
  return <h2 className='text-center mt-5'>Bienvenido a la app</h2>
}
function About(params) {
  return <h2 className='text-center mt-5'>Acerca de</h2>
}
function Layout(params) {
  return<div>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">MiApp</Link>
        <div>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">Acerca</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div className="container mt-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  </div>
}
function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}

export default App
