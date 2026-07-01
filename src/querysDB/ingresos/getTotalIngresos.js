import { supabase } from "../../services/supabaseClient";

export async function getTotalIncomesProject(idProyecto) {
  const {data, error} = await supabase.from("ingresos").select("monto_total","tipo_cambio","moneda").eq("id_proyecto",idProyecto)
  if(error){
    console.error(error)
    return null
  }
  let total = 0
  data.map(e=>{
    e.moneda!=="USD"?
    total = total + e.monto_total:
    total = total + (e.monto_total*e.tipo_cambio)
  })
  return (total)
}