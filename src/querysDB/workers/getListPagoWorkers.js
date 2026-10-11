import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";

/**
 * Obtiene la lista de pagos a empleados vinculados a un proyecto específico.
 * @param {string|number} idProyecto - ID del proyecto a consultar.
 * @returns {Promise<Array|null>} Lista de pagos procesados o null en caso de error.
 */
export async function getListPagoEmpleadoDB(idProyecto) {
  // 1. Validación previa del parámetro de entrada
  if (!idProyecto) {
    console.warn("getListPagoEmpleadoDB: idProyecto no fue proporcionado.");
    return [];
  }

  try {
    // 2. Consulta en Supabase con relaciones anidadas
    const { data, error } = await supabase
      .from("pago_empleado")
      .select(`
        id,
        monto_pago,
        fecha_registro,
        periodo,
        tipo_pago,
        forma_pago,
        id_proyecto,
        id_comprobante,
        empleado:id_empleado (
          nombre,
          apellido_paterno,
          apellido_materno,
          tipo_doc,
          nro_doc
        ),
        documento_tributario:id_comprobante (
          serie_comprobante,
          nro_comprobante
        )
      `)
      .eq("id_proyecto", idProyecto)
      .order("fecha_registro", { ascending: false });

    if (error) throw error;

    // 3. Formateo de datos opcional (limpieza/normalización para la UI)
    const formattedData = data.map((pago) => ({
      ...pago,
      // Si documento_tributario es null, mantenemos null o estructuramos fallback
      documento_tributario: pago.documento_tributario || null,
      // Nombre completo compuesto útil para renderizar en tablas/listas
      empleado_nombre_completo: pago.empleado
        ? `${pago.empleado.nombre} ${pago.empleado.apellido_paterno} ${pago.empleado.apellido_materno || ""}`.trim()
        : "Sin registrar"
    }));

    return formattedData;

  } catch (error) {
    console.error("Error en getListPagoEmpleadoDB:", error.message || error);
    toast.error("Error al obtener la lista de pagos.");
    return null;
  }
}