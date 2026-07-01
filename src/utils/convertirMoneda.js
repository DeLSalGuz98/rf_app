export const convertirMoneda = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    // Si no hay moneda o no hay monto, devolver igual
    if (!item.monto_total) return item;

    // Si ya está en soles, no tocar
    if (item.moneda === "PEN") {
      return item;
    }

    // Si está en otra moneda (ej: USD)
    const tipoCambio = Number(item.tipo_cambio) || 1;

    return {
      ...item,
      monto_total: Number(item.monto_total) * tipoCambio,
    };
  });
};