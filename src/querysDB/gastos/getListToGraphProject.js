
import { supabase } from "../../services/supabaseClient";
import { frmtFecha } from "../../utils/formatDate";

export async function getListToGraphProjectDB(idProyecto) {
  const { data, error } = await supabase
    .from("gastos")
    .select(`
      fecha,
      monto_total,
      tipo_cambio,
      serie_comprobante
    `)
    .eq("id_proyecto", idProyecto).order("fecha",{ascending:true});

  if (error) {
    console.error("Error al obtener los gastos:", error);
    return [];
  }

  const resumen = {};

  data.forEach((gasto) => {
    const name = frmtFecha(gasto.fecha, "dd/MM");

    if (!resumen[name]) {
      resumen[name] = {
        name,
        "Gastos con Factura": 0,
        "Gastos sin Factura": 0,
      };
    }

    const montoTotal = Number(gasto.monto_total || 0) * Number(gasto.tipo_cambio || 1);

    if (gasto.serie_comprobante) {
      resumen[name]["Gastos con Factura"] += montoTotal;
    } else {
      resumen[name]["Gastos sin Factura"] += montoTotal;
    }
  });

  Object.values(resumen).forEach(r => {
    r["Gastos con Factura"] = r["Gastos con Factura"].toFixed(2);
    r["Gastos sin Factura"] = r["Gastos sin Factura"].toFixed(2);
  });

  // Convertir el objeto en array
  return Object.values(resumen);
}