import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getListWorkersProjectDB(idProyecto) {
  const {data, error} = await supabase
  .from("proyecto_empleado")
  .select(`
    *,
    empleado(
      *
    )
    `)
  .eq("id_proyecto", idProyecto)

  if(error){
    console.error(error)
    toast.error("Error. No se pudo obtener la lista de ingresos")
    throw new Error(`Fallo al obtener la data de la DB: ${error.message || JSON.stringify(error)}`);    
  }
  return data
}