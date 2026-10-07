import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { saveTaxDocumentDB } from "../taxDocument/saveTaxDocument";

/**
 * Guarda el pago de un empleado y su comprobante tributario asociado (si existe).
 * @param {Object} incomeData - Datos del ingreso/pago
 * @returns {Promise<{status: string, response: Object}>}
 */
export async function savePagoDataDB(incomeData = {}) {
  try {
    // 1. Obtener contexto de sesión (usuario y empresa)
    const sessionContext = await GetUserNameAndNameCompany();
    if (!sessionContext?.idEmpresa || !sessionContext?.idUser) {
      throw new Error("No se pudo obtener la información de la empresa o del usuario actual.");
    }

    const { idEmpresa, idUser } = sessionContext;
    const { comprobante_tributario, id_proyecto = null } = incomeData;

    let idComprobante = null;

    // 2. Procesar Comprobante Tributario solo si viene presente en los datos
    if (comprobante_tributario) {
      const dataTaxDoc = {
        ...comprobante_tributario,
        id_empresa: idEmpresa,
        id_usuario: idUser
      };

      const resDataTaxDoc = await saveTaxDocumentDB(dataTaxDoc, id_proyecto);
      idComprobante = resDataTaxDoc?.id || null;
    }

    // 3. Estructurar payload del pago
    const dataPago = {
      fecha_registro: incomeData.fecha_registro,
      fecha_actualizacion: incomeData.fecha_registro,
      monto_pago: incomeData.monto_pago,
      periodo: incomeData.periodo,
      tipo_pago: incomeData.tipo_pago,
      forma_pago: incomeData.forma_pago,
      id_empleado: incomeData.id_empleado,
      id_proyecto,
      id_empresa: idEmpresa,
      id_comprobante: idComprobante,
      id_usuario: idUser
    };

    // 4. Inserción en tabla pago_empleado
    const { data, error } = await supabase
      .from("pago_empleado")
      .insert(dataPago)
      .select("id")
      .single();

    if (error) throw error;

    toast.success("Datos guardados correctamente");

    return {
      status: "ok",
      response: data
    };

  } catch (error) {
    console.error("Error en savePagoDataDB:", error);
    toast.error("Error: No se pudo guardar los datos del pago.");
    
    // Si hubo un fallo posterior a crear el comprobante, aquí se sugiere 
    // un rollback manual si no se implementa una función RPC en Supabase.
    throw new Error(`Fallo en savePagoDataDB: ${error.message || JSON.stringify(error)}`);
  }
}