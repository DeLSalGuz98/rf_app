import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getListIngresosProyectoDB(idProyecto) {
  const {data, error} = await supabase.from("ingresos").select("*").eq("id_proyecto", idProyecto).order("fecha", { ascending: false })

  if(error){
    console.error(error)
    toast.error("Error. No se pudo obtener la lista de ingresos")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`);    
  }
  return data
}