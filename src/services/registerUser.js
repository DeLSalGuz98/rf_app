import { supabase } from "./supabaseClient";

export const registerUser = async (email, password)=>{
  const {data, error} = await supabase.auth.signUp({email, password})
  if(error){
    console.log(error)
    return null
  }
  console.log("usuario registrado correctamente")
  return data
}