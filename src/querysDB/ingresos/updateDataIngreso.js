import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function updateDataIngresoProjectDB(dataIngreso, idIngreso) {
  const res = await GetUserNameAndNameCompany()
  const {error} = await supabase.from("ingresos").update({
    ...dataIngreso,
    id_usuario_update_data:res.idUser
  }).eq("id", idIngreso)
  if(error){
    toast.error("No se pudo actualizar los datos")
    console.error(error)
    return
  }
  toast.success("Datos actualizados correctamente")
  return {status:"ok"}
}