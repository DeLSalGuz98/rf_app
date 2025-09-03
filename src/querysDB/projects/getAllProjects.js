import { supabase } from "../../services/supabaseClient";

export async function GetAllListProjects(estado, idEmpresa) {
  const {data, error} = await supabase.from("proyectos").select(`
    id,
    nombre_proyecto,
    tipo,
    descripcion_proyecto,
    fecha_fin,
    fecha_inicio,
    monto_ofertado
    `).eq("estado",estado).eq("id_empresa", idEmpresa)
  if (error) {
    console.log(error)
    return null
  }
  return data
}