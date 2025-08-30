import { supabase } from "./supabaseClient"

export const handleLoging = async (email, password) =>{  
  const {data, error} = await supabase.auth.signInWithPassword({email, password})
  if (error){
    return {message:"error", error: error}
  }else{
    return {message:"success", data: data}
  }
}