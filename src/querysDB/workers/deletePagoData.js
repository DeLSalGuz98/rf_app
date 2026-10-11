import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { deleteTaxDocumentDB } from "../taxDocument/deleteTaxDocument";

export async function deletePagoDataDB(idPago, idComprobante){
  const res = await GetUserNameAndNameCompany()
  if(res.permisosUser !== "admin"){
    return null
  }
  if(idComprobante){
    const deleteTaxDoc = await deleteTaxDocumentDB(idComprobante)
    if(deleteTaxDoc){
      deletePago(idPago)
    }
  }
  deletePago(idPago)
}
async function deletePago(idPago) {
  const {error} = await supabase.from("pago_empleado").delete().eq("id", idPago)
  if(error){
    toast.error("Error. No se elimino el item")
    console.log(error)
    return null
  }
  toast.success("El Documento se elimino correctamente")
  return true
}