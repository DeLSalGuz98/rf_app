import { supabase } from "../../services/supabaseClient";

export async function getInfoFinancieraProyectoDB(idProyecto) {
  const { data, error } = await supabase
    .from("ingresos")
    .select(`
      *,
      documentos_tributarios(
        *,
        factura(*),
        nota_credito(*)
      )
      `)
    .eq("id_proyecto", idProyecto)

  if (error) {
    console.error(error)
    return null
  };
  return data
}