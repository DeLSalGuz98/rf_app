import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getListTaxDocumentsDB(mesDeclarado) {
  const res = await GetUserNameAndNameCompany()
  const {data, error} = await supabase.from("documentos_tributarios")
  .select("*")
  .eq("id_empresa", res.idEmpresa)
  .eq("mes_declarado", mesDeclarado)
  .order("fecha_emision", {ascending:true})

  if(error){
    console.error(error)
    toast.error("No se pudo obtener los datos")
    return null
  }
  if(data.length === 0){
    toast.warning("La lista esta vacia, No se obtuvo ningun elemento")
  }
  return data
}
export async function getListTaxDocumentsByDateDB(desde, hasta) {
  const res = await GetUserNameAndNameCompany()
  const {data, error} = await supabase.from("documentos_tributarios")
  .select("*")
  .eq("id_empresa", res.idEmpresa)
  .gte("fecha_emision", desde)
  .lte("fecha_emision", hasta)
  .order("fecha_emision", {ascending:true})

  if(error){
    console.error(error)
    toast.error("No se pudo obtener los datos")
    return null
  }
  if(data.length === 0){
    toast.warning("La lista esta vacia, No se obtuvo ningun elemento")
  }
  return data
}

export async function getListTaxDocumentsProyectDB(idProject) {
  const {data, error} = await supabase.from("documentos_tributarios")
  .select(`
    id,
    serie_comprobante,
    nro_comprobante
    `)
  .eq("tipo_doc","factura recibida")
  .eq("id_proyecto", idProject)

  if(error){
    console.error(error)
    toast.error("No se pudo obtener los datos")
    return null
  }
  if(data.length === 0){
    toast.warning("La lista esta vacia, No se obtuvo ningun elemento")
  }
  return data
}