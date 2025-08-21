import { useState } from 'react'
import './App.css'
import { supabase } from './services/supabaseClient'
import { useEffect } from 'react'

function App() {
  const [message, setMessage] = useState("")
  useEffect(()=>{
    const checkonnection = async ()=>{
      const {data, error} = await supabase.from("test_table").select("*").limit(1)
      if(error){
        setMessage(error.message)
      }else{
        setMessage("conexion exitosa")
      }
    }
    checkonnection()
  })
  return (
    <h1>{message}</h1>
  )
}

export default App
