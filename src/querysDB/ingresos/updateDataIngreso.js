import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

/**
 * Actualiza la información de un ingreso y sincroniza el estado de su comprobante tributario asociado.
 * @param {Object} dataIngreso - Objeto con los campos a actualizar en la tabla 'ingresos'.
 * @param {string|number} idIngreso - ID del registro de ingreso a modificar.
 */
export async function updateDataIngresoProjectDB(dataIngreso, idIngreso) {
  try {
    // 1. Obtener los datos del usuario actual
    const res = await GetUserNameAndNameCompany();

    // 2. Actualizar el registro principal en la tabla 'ingresos'
    const { error: errorIngreso } = await supabase
      .from("ingresos")
      .update({
        ...dataIngreso,
        ...(res?.idUser && { id_usuario_update_data: res.idUser }),
      })
      .eq("id", idIngreso);

    if (errorIngreso) throw errorIngreso;

    // 3. Buscar si el ingreso tiene un comprobante tributario vinculado
    const { data: ingresoData, error: errorIngresoSearch } = await supabase
      .from("ingresos")
      .select("id_comprobante")
      .eq("id", idIngreso)
      .maybeSingle();

    if (errorIngresoSearch) throw errorIngresoSearch;

    // 4. Si el ingreso está vinculado a un comprobante y se modificó el estado, actualizar el comprobante
    if (ingresoData?.id_comprobante && dataIngreso.estado) {
      let nuevoEstadoComprobante = "archivado";

      if (dataIngreso.estado === "pendiente") {
        nuevoEstadoComprobante = "pendiente";
      } else if (dataIngreso.estado === "anulado") {
        nuevoEstadoComprobante = "anulado";
      }

      const { error: errorDoc } = await supabase
        .from("documentos_tributarios")
        .update({ estado_comprobante: nuevoEstadoComprobante })
        .eq("id", ingresoData.id_comprobante);

      if (errorDoc) throw errorDoc;
    }

    toast.success("Datos actualizados correctamente");
    return { status: "ok" };

  } catch (error) {
    console.error("Error al actualizar el ingreso del proyecto:", error);
    toast.error("No se pudo actualizar los datos");
    return null;
  }
}