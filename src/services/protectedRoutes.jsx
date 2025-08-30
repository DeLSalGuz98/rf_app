import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom"

export function ProtectedRoute({children}) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()
  
  useEffect(()=>{
    const getSession = async ()=>{
      const {data, error} = await supabase.auth.getSession()
      if(error || !data?.session){
        navigate("/")
      }else{
        setSession(data.session)
      }
      setLoading(false)
    }
    getSession()

  },[navigate])

  if (loading) return <p> Cargando ... </p>

  return children
}

export function RedirectRoutesUserLogged({children}) {
  const navigate = useNavigate()
  useEffect(()=>{
    const getSession = async ()=>{
      const {data, error} = await supabase.auth.getSession()
      if(error || !data?.session){
        navigate("/")
      }else{
        navigate("/dashboard")
      }
    }
    getSession()
  })
  return children
}