import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

/**
 * Actualiza los datos de un documento tributario y sincroniza el estado de su ingreso asociado.
 * @param {Object} dataUpdate - Campos a actualizar.
 * @param {string|number} idTaxDocument - ID del documento tributario.
 */
export async function updateTaxDocDataDB(dataUpdate, idTaxDocument) {
  try {
    const res = await GetUserNameAndNameCompany()
    const userId = res.idUser
    // 1. Actualizar la tabla principal 'documentos_tributarios'
    const { error: errorDoc } = await supabase
      .from("documentos_tributarios")
      .update(dataUpdate)
      .eq("id", idTaxDocument);

    if (errorDoc) throw errorDoc;

    // 2. Si se actualizó el estado del comprobante, sincronizar con la tabla 'ingresos'
    if (dataUpdate.estado_comprobante) {
      // Buscar el ingreso vinculado al comprobante
      const { data: ingresoData, error: errorIngresoSearch } = await supabase
        .from("ingresos")
        .select("id")
        .eq("id_comprobante", idTaxDocument)
        .maybeSingle(); // maybeSingle evita que lance error si no existe el registro

      if (errorIngresoSearch) throw errorIngresoSearch;

      // Si existe un ingreso asociado, se actualiza según el estado
      if (ingresoData?.id) {
        let nuevoEstadoIngreso = null;

        if (["archivado", "pagado"].includes(dataUpdate.estado_comprobante)) {
          nuevoEstadoIngreso = "confirmado";
        } else if (dataUpdate.estado_comprobante === "anulado") {
          nuevoEstadoIngreso = "anulado";
        } else if (dataUpdate.estado_comprobante === "pendiente") {
          nuevoEstadoIngreso = "pendiente";
        }

        // Ejecutar actualización en 'ingresos' solo si mapeó a un nuevo estado
        if (nuevoEstadoIngreso) {
          const updatePayload = {
            estado: nuevoEstadoIngreso,
            ...(userId && { id_usuario_update_data: userId }),
          };

          const { error: errorIngresoUpdate } = await supabase
            .from("ingresos")
            .update(updatePayload)
            .eq("id", ingresoData.id);

          if (errorIngresoUpdate) throw errorIngresoUpdate;
        }
      }
    }

    toast.success("Datos del documento actualizados");
    return true;
  } catch (error) {
    console.error("Error al actualizar el documento tributario:", error);
    toast.warning("Hubo un error, no se pudo actualizar");
    return null;
  }
}