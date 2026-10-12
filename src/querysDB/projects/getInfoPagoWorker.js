import { supabase } from "../../services/supabaseClient";

export async function getInfoPagoWorkerProyectoDB(idProyecto) {
  const { data, error } = await supabase
    .from("pago_empleado")
    .select(`monto_pago`)
    .eq("id_proyecto", idProyecto)

  if (error) {
    console.error(error)
    return null
  };
  const getSumMontoPago = data.reduce((acc, nroActual)=>{
    return acc + nroActual.monto_pago
  }, 0)
  return getSumMontoPago
}