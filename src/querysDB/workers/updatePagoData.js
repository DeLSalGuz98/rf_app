import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { saveTaxDocumentDB } from "../taxDocument/saveTaxDocument";
import { updateTaxDocDataDB } from "../taxDocument/updateTaxDocumentData";

/**
 * Actualiza los datos de un pago de personal y gestiona de manera inteligente 
 * la creación o actualización de su documento/comprobante tributario asociado.
 * 
 * @param {Object} ids - Identificadores relacionales.
 * @param {string|number} ids.idPago - ID del pago a actualizar.
 * @param {string|number|null} ids.idComprobante - ID del comprobante tributario existente (si lo hubiera).
 * @param {string|number} ids.idProyecto - ID del proyecto asociado.
 * @param {Object} [dataPago={}] - Campos del pago que han sufrido modificaciones.
 * @param {Object} [dataComprobante={}] - Campos del comprobante tributario a guardar o actualizar.
 * @returns {Promise<boolean>} Retorna true si la operación fue exitosa, o false en caso de error.
 */
export async function updatePagoDataDB(ids = {}, dataPago = {}, dataComprobante = {}) {
  try {
    const pagoSeguro = dataPago || {};
    const comprobanteSeguro = dataComprobante || {};
    const hasComprobanteData = Object.keys(comprobanteSeguro).length > 0;

    let idComprobanteFinal = ids.idComprobante || null;

    // CASO 1: Hay datos de comprobante para procesar
    if (hasComprobanteData) {
      if (!idComprobanteFinal) {
        // Sub-caso A: No existía comprobante previo, se debe crear (INSERT)
        const userCompanyInfo = await GetUserNameAndNameCompany();
        
        const dataTaxDoc = {
          ...comprobanteSeguro,
          id_empresa: userCompanyInfo?.idEmpresa,
          id_usuario: userCompanyInfo?.idUser,
        };

        const resDataTaxDoc = await saveTaxDocumentDB(dataTaxDoc, ids.idProyecto);
        
        if (!resDataTaxDoc?.id) {
          toast.error("No se pudo generar el documento tributario");
          return false;
        }

        idComprobanteFinal = resDataTaxDoc.id;
        pagoSeguro.id_comprobante = idComprobanteFinal;
      } else {
        // Sub-caso B: Ya existía un comprobante previo, se actualiza (UPDATE)
        const updateTaxDocResult = await updateTaxDocDataDB(comprobanteSeguro, idComprobanteFinal);
        
        if (!updateTaxDocResult) {
          toast.error("No se pudo actualizar el documento tributario");
          return false;
        }
      }
    }

    // CASO 2: Actualizar la tabla principal de pagos (solo si hay cambios en el pago o se asignó comprobante)
    const payloadPago = {
      ...pagoSeguro,
      ...(idComprobanteFinal !== undefined && { id_comprobante: idComprobanteFinal })
    };

    if (Object.keys(payloadPago).length > 0) {
      const updateSuccess = await updatePagoInDatabase(payloadPago, ids.idPago);
      return updateSuccess;
    }

    toast.success("Información actualizada correctamente");
    return true;

  } catch (error) {
    console.error("Error crítico en updatePagoDataDB:", error);
    toast.error("Ocurrió un error inesperado al procesar la solicitud");
    return false;
  }
}

/**
 * Ejecuta la sentencia SQL de actualización directamente en la tabla de pagos en Supabase.
 * 
 * @private
 * @param {Object} [dataUpdate={}] - Objeto con los campos clave-valor a actualizar.
 * @param {string|number} idPago - Identificador único del registro de pago.
 * @returns {Promise<boolean>} Retorna true si la actualización fue exitosa, de lo contrario null/false.
 */
const updatePagoInDatabase = async (dataUpdate = {}, idPago) => {
  if (!idPago) {
    console.error("ID de pago inválido para actualización.");
    return false;
  }

  const { error } = await supabase
    .from("pago_empleado")
    .update(dataUpdate)
    .eq("id", idPago);

  if (error) {
    console.error("Error al actualizar pago en Supabase:", error);
    toast.warning("Hubo un error, no se pudieron actualizar los datos del pago");
    return false;
  }

  toast.success("Registro de pago actualizado exitosamente");
  return true;
};