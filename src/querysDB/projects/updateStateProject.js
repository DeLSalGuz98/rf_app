import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function updateStateProjectDB(dataUpdate, idProyecto) {
  const {error} = await supabase.from("proyectos").update(dataUpdate).eq("id", idProyecto)
  if(error){
    console.error(error)
    toast.warning("Hubo un error, no se pudo actualizar")
    return null
  }
  toast.success("Estado del proyecto actualizado")
}