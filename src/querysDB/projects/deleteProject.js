import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function deleteProjectDB(idProject) {
  const res = await GetUserNameAndNameCompany()
    if(res.permisosUser !== "admin"){
      return null
    }
  const {error} = await supabase.from("proyectos").delete().eq("id", idProject)
  if(error){
    toast.error("Error. No se puedo eliminar el proyecto")
    console.error(error)
    return null
  }
}