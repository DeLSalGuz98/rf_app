import './App.css'
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router} from 'react-router-dom'
import { Layout } from './layouts/LayoutRoutes'
import { ToastComponent } from './components/toastComponent';


function App() {
  return (
    <Router>
      <Layout/>
      <ToastComponent/>
    </Router>
  )
}

export default App
