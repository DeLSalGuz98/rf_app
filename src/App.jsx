import './App.css'

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
