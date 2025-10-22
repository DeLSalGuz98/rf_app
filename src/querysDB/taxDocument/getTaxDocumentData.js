import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function getTaxDocumentDataDB(idTaxDocument){
  const {data, error} = await supabase.from("documentos_tributarios").select("*").eq("id", idTaxDocument).single()
  if(error){
    toast.error("No se pudo obtener los datos del Documento")
    console.error(error)
    return
  }
  return data
}