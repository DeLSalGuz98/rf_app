import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveTaxDocumentDB(taxDocData = {}) {
  const res = await GetUserNameAndNameCompany()
  const {error} = await supabase.from("documentos_tributarios").insert({
    ...taxDocData,
    id_empresa:res.idEmpresa,
    id_usuario:res.idUser
  })

  if(error){
    console.error(error)
    toast.error("Error. No se pudo guardar los datos")
    return null
  }
  toast.success("Datos guardados correctamente")
}