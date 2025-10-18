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
    let gastoConFactura = 0
    let gastoSinFactura = 0
    const montoTotal = gasto.tipo_cambio?Number(gasto.monto_total*gasto.tipo_cambio):Number(gasto.monto_total)
    // Sumar según tipo
    if (gasto.serie_comprobante) {
      gastoConFactura += montoTotal || 0;
      resumen[name]["Gastos con Factura"] = gastoConFactura.toFixed(2)
    } else {
      gastoSinFactura += montoTotal || 0;
      resumen[name]["Gastos sin Factura"] = gastoSinFactura.toFixed(2)
    }
  });

  console.log(resumen)

  // Convertir el objeto en array
  return Object.values(resumen);
}