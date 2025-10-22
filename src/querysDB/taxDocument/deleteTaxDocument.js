import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function deleteTaxDocumentDB(idTaxDocument){
  const res = await GetUserNameAndNameCompany()
  if(res.permisosUser !== "admin"){
    return null
  }
  const {error} = await supabase.from("documentos_tributarios").delete().eq("id", idTaxDocument)
  if(error){
    toast.error("Error. No se elimino el item")
    console.log(error)
    return null
  }
  toast.success("El Documento se elimino correctamente")
}