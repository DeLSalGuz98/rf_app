import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function updateTaxDocDataDB(dataUpdate, idTaxDocument) {
  const {error} = await supabase.from("documentos_tributarios").update(dataUpdate).eq("id", idTaxDocument)
  if(error){
    console.error(error)
    toast.warning("Hubo un error, no se pudo actualizar")
    return null
  }
  toast.success("Datos del documento actualizados")
}