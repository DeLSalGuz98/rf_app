import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getListPendingInvoiceDB(
  estadoComprobante = ["pendiente"], 
  tipoDoc = "factura emitida"
) {
  try {
    // 1. Obtener datos del usuario y empresa
    const resUser = await GetUserNameAndNameCompany();

    if (!resUser?.idEmpresa) {
      console.warn("getListPendingInvoiceDB: No se encontró el ID de la empresa.");
      return [];
    }

    // 2. Normalizar el parámetro estadoComprobante (asegurar que sea un Array para .in)
    const estados = Array.isArray(estadoComprobante) 
      ? estadoComprobante 
      : [estadoComprobante];

    // 3. Ejecutar la consulta en Supabase
    let query = supabase
      .from("documentos_tributarios")
      .select(`
        id,
        fecha_emision,
        fecha_vencimiento,
        moneda,
        monto,
        tipo_cambio,
        estado_comprobante,
        proyectos (
          id,
          nombre_proyecto,
          descripcion_proyecto,
          unidad_ejecutora,
          exp_siaf
        )
      `)
      .eq("id_empresa", resUser.idEmpresa)
      .eq("tipo_doc", tipoDoc);

    // Aplicar filtro de estados solo si el array contiene elementos
    if (estados.length > 0) {
      query = query.in("estado_comprobante", estados);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error al consultar comprobantes pendientes en Supabase:", error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error("Error inesperado en getListPendingInvoiceDB:", error);
    return [];
  }
}