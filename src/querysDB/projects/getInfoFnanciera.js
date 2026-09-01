import { supabase } from "../../services/supabaseClient";

export async function getInfoFinancieraProyectoDB(idProyecto) {
  try {
    // Ejecutamos ambas consultas simultáneamente
    const [ingresos, gastos] = await Promise.all([
      getProyectoIngresosDB(idProyecto),
      getProyectoGastosDB(idProyecto),
    ]);

    return { ingresos, gastos };
  } catch (error) {
    console.error("Error al obtener la información financiera:", error);
    throw error;
  }
}

async function getProyectoIngresosDB(idProyecto) {
  const { data, error } = await supabase
    .from("ingresos")
    .select(`
      *,
      documentos_tributarios(
        *,
        factura(*),
        nota_credito(*)
      )
    `)
    .eq("id_proyecto", idProyecto);

  if (error) {
    console.error("Error consultando ingresos:", error.message);
    throw error;
  }

  return data ?? [];
}

async function getProyectoGastosDB(idProyecto) {
  const { data, error } = await supabase
    .from("gastos")
    .select("*")
    .eq("id_proyecto", idProyecto);

  if (error) {
    console.error("Error consultando gastos:", error.message);
    throw error;
  }

  return data ?? [];
}