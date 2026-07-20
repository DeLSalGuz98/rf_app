import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveIngresoDB(incomeData = {}, idProject="") {
  const res = await GetUserNameAndNameCompany()

  console.log(incomeData)

  const {data, error} = await supabase.from("ingresos").insert({
    ...incomeData,
    id_empresa:res.idEmpresa,
    id_proyecto:idProject!==""?idProject:null,
    id_usuario:res.idUser,
    tipo_cambio:incomeData.tipo_cambio!==0?incomeData.tipo_cambio:null
  }).select("id").single()

  if(error){
    console.error(error)
    toast.error("Error. No se pudo guardar los datos")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`);    
  }
  toast.success("Datos guardados correctamente")
  return data
}