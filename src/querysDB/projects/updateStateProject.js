import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

export async function updateStateProjectDB(dataUpdate, idProyecto) {
  // 1. Validar usuario activo
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error de autenticación:", authError);
    toast.error("Debes iniciar sesión para realizar esta acción");
    return null;
  }

  // 2. Ejecutar actualización
  const { data, error } = await supabase
    .from("proyectos")
    .update(dataUpdate)
    .eq("id", idProyecto)
    .select();

  if (error) {
    console.error("Error al actualizar:", error);
    toast.warning("Hubo un error, no se pudo actualizar");
    return null;
  }

  if (!data || data.length === 0) {
    console.warn("No se actualizó la fila. Verifica que el id_usuario del proyecto coincida con user.id:", user.id);
    toast.warning("No tienes permiso para actualizar este proyecto");
    return null;
  }

  toast.success("Estado del proyecto actualizado");
  return data;
}