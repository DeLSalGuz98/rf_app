export const convertirMoneda = (data) => {
  if (!Array.isArray(data)) return [];  
  
  return data.map((item) => {
    // Si no hay moneda o no hay monto, devolver igual
    if (!item.precio_unitario) return item;
    
    // Si ya está en soles, no tocar
    if (item.moneda === "PEN") {
      return item;
    }
    
    // Si está en otra moneda (ej: USD)
    const tipoCambio = Number(item.tipo_cambio);
    const nuevoPrecioUnitario = Number(item.precio_unitario) * tipoCambio
    const nuevoMontoTotal = nuevoPrecioUnitario * item.cantidad

    return {
      ...item,
      precio_unitario: nuevoPrecioUnitario,
      monto_total: nuevoMontoTotal
    };
  });
};