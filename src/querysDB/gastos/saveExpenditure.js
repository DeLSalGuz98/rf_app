import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveExpenditure(dataExpenditure={}) {
  const res = await GetUserNameAndNameCompany()
  const {error} = await supabase.from("gastos").insert({
    ...dataExpenditure,
    id_usuario: res.idUser,
    id_empresa: res.idEmpresa
  })
  if(error){
    console.error(error)
    alert("hubo un error, no se guardo la informacion")
    return null
  }
  alert("informacion registrada exitosamente")
}