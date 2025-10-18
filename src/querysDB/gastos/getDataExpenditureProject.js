import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getDataExpenditureProjectDB(idGasto) {
  const {data, error} = await supabase.from("gastos").select("*").eq("id", idGasto).single()
  if(error){
    toast.error("No se pudo obtener los datos")
    console.error(error)
    return null
  }
  return data
}