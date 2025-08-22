import { useState } from 'react'
import './App.css'
import { supabase } from './services/supabaseClient'
import { useEffect } from 'react'

import { BrowserRouter as Router} from 'react-router-dom'
import { Layout } from './layouts/LayoutRoutes'


function App() {
  return (
    <Router>
      <Layout/>
    </Router>
  )
}

export default App
