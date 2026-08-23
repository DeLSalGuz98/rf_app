import { supabase } from "../../services/supabaseClient";

export async function getTotalExpenditureProject(idProyecto) {
  const { data, error } = await supabase
    .from("gastos")
    .select("monto_total, tipo_cambio, moneda")
    .eq("id_proyecto", idProyecto)

  if (error) {
    console.error("Error al obtener los gastos del proyecto:", error)
    throw error
  }

  if (!data || data.length === 0) return 0

  return data.reduce((total, gasto) => {
    const { monto_total = 0, tipo_cambio = 1, moneda } = gasto

    // Si es USD se aplica el tipo de cambio, de lo contrario se suma el monto directo
    const montoCalculado = moneda === "USD" 
      ? monto_total * tipo_cambio 
      : monto_total

    return total + montoCalculado
  }, 0)
}