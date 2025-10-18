import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function updateDataExpenditureProjectDB(dataExpenditure, idGasto) {
  const {error} = await supabase.from("gastos").update(dataExpenditure).eq("id", idGasto)
  if(error){
    toast.error("No se pudo actualizar los datos")
    console.error(error)
    return
  }
  toast.success("DAtos actualizados correctamente")
}