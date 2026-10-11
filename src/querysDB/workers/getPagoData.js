import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getPagoDataDB(idPago) {
  const {data, error} = await supabase.from("pago_empleado").select(`
    *,
    comprobante:documentos_tributarios(*)
    `).eq("id", idPago).single()
  if(error){
    toast.error("No se pudo obtener los datos")
    console.error(error)
    return null
  }
  return data
}