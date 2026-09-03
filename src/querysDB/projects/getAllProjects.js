import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function GetAllListProjects() {
  const resOne = await GetUserNameAndNameCompany()
  const {data, error} = await supabase.from("proyectos").select(`
    id,
    nombre_proyecto,
    tipo,
    descripcion_proyecto,
    fecha_fin,
    fecha_inicio,
    monto_ofertado,
    estado
    `).eq("id_empresa", resOne.idEmpresa)
  if (error) {
    console.log(error)
    toast.warning("No se pudo optener a data")
    return null
  }
  return data
}