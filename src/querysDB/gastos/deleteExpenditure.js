import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function deleteExpenditureProjectDB(idExpenditure){
  const res = await GetUserNameAndNameCompany()
  if(res.permisosUser !== "admin"){
    return null
  }
  const {error} = await supabase.from("gastos").delete().eq("id", idExpenditure)
  if(error){
    toast.error("Error. No se elimino el item")
    console.log(error)
    return null
  }
  toast.success("El item se elimino correctamente")
}