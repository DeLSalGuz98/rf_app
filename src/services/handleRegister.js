import { registerUser } from "./registerUser";
import { supabase } from "./supabaseClient";

export async function HandleRegister(dataCompany={}, dataUser={}, dataEmpl={}, password) {
  try {
    // 1. Crear usuario de autenticación
    const { user } = await registerUser(dataEmpl.email, password)
    if (!user) throw new Error("No se pudo crear el usuario de autenticación")

    // 2. Crear empresa
    const { data: empresaData, error: empresaError } = await supabase
      .from("empresa")
      .insert(dataCompany)
      .select()

    if (empresaError) throw empresaError
    if (!empresaData?.length) throw new Error("No se insertó la empresa")

    dataEmpl.empresa_id = empresaData[0].id

    // 3. Crear usuario en la tabla usuario
    dataUser.id = user.id
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuario")
      .insert(dataUser)
      .select()

    if (usuarioError) throw usuarioError
    if (!usuarioData?.length) throw new Error("No se insertó el usuario")

    dataEmpl.usuario_id = usuarioData[0].id

    // 4. Crear empleado
    const { error: empleadoError } = await supabase
      .from("empleado")
      .insert(dataEmpl)

    if (empleadoError) throw empleadoError

    alert("Datos registrados correctamente. Revise su correo para validar la cuenta.")
  } catch (err) {
    console.error("Error en HandleRegister:", err)
    return null
  }
}