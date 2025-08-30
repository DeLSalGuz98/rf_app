import { supabase } from "./supabaseClient";

export async function EndSession() {
  const {error} = await supabase.auth.signOut()
  if(error){
    return {staus:"error", data:error}
  }else{
    return {staus:"success"}
  }
}