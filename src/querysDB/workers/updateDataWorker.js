import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function updateWorkerDataDB(dataUpdate, idEmpleado) {
  const {error} = await supabase.from("empleado").update(dataUpdate).eq("id", idEmpleado)
  if(error){
    console.error(error)
    toast.warning("Hubo un error, no se pudo actualizar los datos")
    return null
  }
  toast.success("Datos del trabajador actualizados exitosamente")
  return true
}