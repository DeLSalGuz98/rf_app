import { supabase } from "../../services/supabaseClient";

export async function getListToGraphProjectDB(idProyecto) {
  const { data, error } = await supabase
    .from("gastos")
    .select(`
      fecha,
      monto_total,
      tipo_cambio,
      serie_comprobante
    `)
    .eq("id_proyecto", idProyecto);

  if (error) {
    console.error("Error al obtener los gastos:", error);
    return [];
  }

  // Agrupamos los datos
  const resumen = {};

  data.forEach((gasto) => {
    // Formatear fecha a "dd-mm-yy"
    const date = new Date(gasto.fecha);
    const name = `${String(date.getDate()+1).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear()).slice(-2)}`;

    // Inicializar si no existe la fecha
    if (!resumen[name]) {
      resumen[name] = {
        name,
        "Gastos con Factura": 0,
        "Gastos sin Factura": 0,
      };
    }

    // Sumar según tipo
    if (gasto.serie_comprobante) {
      resumen[name]["Gastos con Factura"] += Number(gasto.tipo_cambio?gasto.monto_total*gasto.tipo_cambio:gasto.monto_total || 0);
    } else {
      resumen[name]["Gastos sin Factura"] += Number(gasto.monto_total || 0);
    }
  });

  // Convertir el objeto en array
  return Object.values(resumen);
}