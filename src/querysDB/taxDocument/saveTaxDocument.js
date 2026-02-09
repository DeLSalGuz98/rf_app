import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveTaxDocumentDB(taxDocData = {}, idProject="") {
  const res = await GetUserNameAndNameCompany()
  console.log(await isDocDuplicated(taxDocData))

  if(await isDocDuplicated(taxDocData)){
    toast.warning("Este documnto ya exite, verifique los datos")
    throw new Error("El documento ya existe")
  }

  const {error} = await supabase.from("documentos_tributarios").insert({
    ...taxDocData,
    id_empresa:res.idEmpresa,
    id_proyecto:idProject!==""?idProject:null,
    id_usuario:res.idUser,
    tipo_cambio:taxDocData.tipo_cambio!==0?taxDocData.tipo_cambio:null
  })

  if(error){
    console.error(error)
    toast.error("Error. No se pudo guardar los datos")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`);    
  }
  toast.success("Datos guardados correctamente")
}

async function isDocDuplicated(dataDoc) {
  const {data, error} = await supabase.from("documentos_tributarios").select("*")
  .eq("fecha_emision", dataDoc.fecha_emision)
  .eq("serie_comprobante", dataDoc.serie_comprobante)
  .eq("nro_comprobante", dataDoc.nro_comprobante)
  .eq("ruc", dataDoc.ruc)

  if(data.length!==0){
    return true
  }
  if(error){
    console.error(error)
    toast.error("Error. No se pudo guardar los datos")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`);    
  }
  return false
}