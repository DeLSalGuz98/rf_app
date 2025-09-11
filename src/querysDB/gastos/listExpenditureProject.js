import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getListExpenditureProject(idProyecto) {
  const {data, error} = await supabase.from("gastos").select("*").eq("id_proyecto", idProyecto)
  if(error){
    console.error(error)
    toast.error("Error al obtener los datos")
    return null
  }
  console.log(data)
  return data
}