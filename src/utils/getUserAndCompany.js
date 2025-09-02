import { supabase } from "../services/supabaseClient";

export async function GetUserNameAndNameCompany() {
  const {data: user, error} = await supabase.auth.getUser()
  if(error) {
    console.error(error) 
    return null
  }else{
    console.log(user.user.id)
    const { data, error } = await supabase
    .from("usuario")
    .select(`
      username,
      empleado (
        empresa (
          razon_social
        )
      )
    `)
    .eq("id", user.user.id)
    .single();

    if (error) {
      console.error("Error al obtener datos:", error);
      return null;
    }
    return {username:data.username, razonSocial:data.empleado.empresa.razon_social}
  }
}