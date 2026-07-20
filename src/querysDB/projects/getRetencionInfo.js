import { supabase } from "../../services/supabaseClient";

export async function getRetencionInfoProyectoDB(idProyecto) {
  const { data, error } = await supabase
    .from("documentos_tributarios")
    .select(`*`)
    .eq("id_proyecto", idProyecto)
    .eq("tipo_doc", "retencion recibido")

  if (error) {
    console.error(error)
    return null
  };
  return data
}