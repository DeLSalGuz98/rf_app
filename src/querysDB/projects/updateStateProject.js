import { supabase } from "../../services/supabaseClient";

export async function updateStateProjectDB(dataUpdate, idProyecto) {
  const {error} = await supabase.from("proyectos").update(dataUpdate).eq("id", idProyecto)
  if(error){
    console.error(error)
    return null
  }
  alert("Estado del proyecto actualizado")
}