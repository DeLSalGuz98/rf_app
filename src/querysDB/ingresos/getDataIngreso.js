import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getDataIngresoProyectoDB(idIngreso) {
  const {data, error} = await supabase
  .from("ingresos")
  .select("*")
  .eq("id", idIngreso).single()

  if(error){
    console.error(error)
    toast.error("Error. No se pudo obtener la data del ingreso")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`);    
  }
  return data
}