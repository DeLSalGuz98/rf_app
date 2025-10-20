import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveTaxDocumentDB(taxDocData = {}, idProject="") {
  const res = await GetUserNameAndNameCompany()
  const {error} = await supabase.from("documentos_tributarios").insert({
    ...taxDocData,
    id_empresa:res.idEmpresa,
    id_proyecto:idProject!==""?idProject:null,
    id_usuario:res.idUser,
    tipo_cambio:null
  })

  if(error){
    console.error(error)
    toast.error("Error. No se pudo guardar los datos")
    return null
  }
  toast.success("Datos guardados correctamente")
}