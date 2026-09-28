import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getWorkerDataDB(idWorker) {
  const {data, error} = await supabase.from("empleado").select("*").eq("id", idWorker).single()
  if(error){
    toast.error("No se pudo obtener los datos")
    console.error(error)
    return null
  }
  return data
}