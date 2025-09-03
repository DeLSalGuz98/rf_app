import { supabase } from "../../services/supabaseClient";

export async function SaveNewProjectData(dataProject={}) {
  const {error} = await supabase.from("proyectos").insert(dataProject)
  if(error){
    console.log(error)
    alert("Error al guardar los datos")
    return null
  }else{
    alert("Proyecto creado exitosamente")
  }
}