import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

/**
 * Guarda o asigna una lista de trabajadores a un proyecto en la base de datos.
 * @param {Array<Object>} arrayWorkers - Lista de objetos ({ id_empleado, id_proyecto, fecha, ... })
 */
export async function saveWorkerToProyectDB(arrayWorkers = []) {
  // 1. Validar que el arreglo no esté vacío
  if (!arrayWorkers || arrayWorkers.length === 0) {
    toast.warning("No hay trabajadores seleccionados para asignar.");
    return { success: false, error: "El arreglo está vacío" };
  }

  try {
    // 2. Obtener datos del usuario logueado
    const userRes = await GetUserNameAndNameCompany();
    const idUsuario = userRes?.idUser;

    if (!idUsuario) {
      toast.error("No se pudo obtener la sesión del usuario actual.");
      return { success: false, error: "Usuario no autenticado" };
    }

    // 3. Preparar todos los registros agregando el id_usuario
    const recordsToInsert = arrayWorkers.map((worker) => ({
      ...worker,
      id_usuario: idUsuario,
    }));

    // 4. Inserción masiva en una sola llamada a Supabase
    const { data, error } = await supabase
      .from("proyecto_empleado")
      .insert(recordsToInsert)
      .select();

    if (error) {
      console.error("Error al asignar personal al proyecto:", error);
      toast.error("Ocurrió un error al guardar las asignaciones.");
      return { success: false, error };
    }

    // 5. Notificación única de éxito
    const count = recordsToInsert.length;
    toast.success(
      count === 1
        ? "Personal asignado al proyecto exitosamente."
        : `${count} colaboradores asignados al proyecto exitosamente.`
    );

    return { success: true, data };
  } catch (err) {
    console.error("Error inesperado en saveWorkerToProyect:", err);
    toast.error("Error inesperado al procesar la solicitud.");
    return { success: false, error: err };
  }
}