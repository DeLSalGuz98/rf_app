import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function SaveNewProjectData(dataProject={}) {
  const {error} = await supabase.from("proyectos").insert(dataProject)
  if(error){
    console.log(error)
    toast.warning("Error al guardar los datos")
    return null
  }else{
    toast.success("Nuevo proyecto creado exitosamente")
  }
}