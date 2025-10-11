import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getReportProjectDataDB(idProyecto){
  const {data, error} = await supabase.from("proyectos").select(`
    *,
    gastos(*),
    documentos_tributarios(*)
    `).eq("id", idProyecto).single()
  
  if(error){
    console.log(error)
    toast.error("Error, no se pudo obtener los datos del reporte")
    return null
  }
  return (data)
}