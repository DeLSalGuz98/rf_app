import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function saveExpenditure(dataExpenditure={}) {
  const res = await GetUserNameAndNameCompany()
  console.log(dataExpenditure)
  const {error} = await supabase.from("gastos").insert({
    ...dataExpenditure,
    id_usuario: res.idUser,
    id_empresa: res.idEmpresa
  })
  if(error){
    console.error(error)
    toast.warning("hubo un error, no se guardo la informacion")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`)
  }
  toast.success("informacion registrada exitosamente")
}

export async function saveBolckExpenditureDB(dataExpenditures = []) { 
  // 1. Cambiar nombre a plural y establecer array vacío como default
  
  // 1. Obtener datos de usuario y empresa solo una vez
  const res = await GetUserNameAndNameCompany()
  
  // 2. Usar 'map' para crear un nuevo array con las claves añadidas
  const expendituresToInsert = dataExpenditures.map(item => ({
    ...item,
    id_usuario: res.idUser,
    id_empresa: res.idEmpresa
  }))
  
  // 3. Imprimir el array a insertar para depuración (opcional)
  console.log(expendituresToInsert)

  // 4. Supabase acepta un array en 'insert()' para inserción múltiple
  const {error} = await supabase.from("gastos").insert(expendituresToInsert)
  
  // 5. Manejo de errores (funciona igual)
  if(error){
    console.error(error)
    toast.error("Hubo un error, no se pudo guardar la información.")
    throw new Error(`Fallo al guardar en DB: ${error.message || JSON.stringify(error)}`)
  }
  
  toast.success("Información registrada exitosamente")
}