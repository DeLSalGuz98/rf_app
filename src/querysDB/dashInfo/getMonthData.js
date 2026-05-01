import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getMonthDataDB(month) {
  const {data, error} = await supabase.from("documentos_tributarios")
  .select(`
    tipo_doc,
    mes_declarado,
    monto,
    tipo_cambio,
    moneda
    `)
  .eq("mes_declarado", month)
  if(error){
    toast.error("No se pudo obtener los datos")
    console.error(error)
    return null
  }
  return data
}