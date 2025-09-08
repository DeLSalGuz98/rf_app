import { supabase } from "../../services/supabaseClient";

export async function getTotalExpenditureProject(idProyecto) {
  const {data, error} = await supabase.from("gastos").select("monto_total").eq("id_proyecto",idProyecto)
  if(error){
    console.error(error)
    return null
  }
  let total = 0
  data.map(e=>{
    total = total + e.monto_total
  })
  return (total)
}