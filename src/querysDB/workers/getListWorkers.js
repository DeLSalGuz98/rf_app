import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getListWorkersDB() {
  const res = await GetUserNameAndNameCompany();
  const {data, error} = await supabase
  .from("empleado")
  .select("*")
  .eq("empresa_id", res.idEmpresa)
  if(error){
    console.error(error)
    toast.error("Error al obtener los datos")
    return null
  }
  return data
}