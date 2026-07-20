// Formateador reutilizable fuera del componente para mejor rendimiento
const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export const formatMoneda = (monto) => currencyFormatter.format(monto || 0);