import { supabase } from "../../services/supabaseClient";

export async function getInfoProject(idProyecto) {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", idProyecto)
    .single();

  if (error) {
    console.error(error)
    return null
  };
  return data
}