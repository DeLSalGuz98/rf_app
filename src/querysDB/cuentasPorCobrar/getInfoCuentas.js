import { toast } from "react-toastify";
import { supabase } from "../../services/supabaseClient";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";

export async function getCuentasPorCobrarDataDB() {
  const res = await GetUserNameAndNameCompany();
  if (!res) return null;

  // 1. Consultar TODAS las facturas emitidas, incluyendo proyectos e ingresos vinculados
  const { data, error } = await supabase
    .from("documentos_tributarios")
    .select(`
      id,
      serie_comprobante,
      nro_comprobante,
      ruc,
      razon_social,
      monto,
      fecha_emision,
      fecha_vencimiento,
      estado_comprobante,
      proyectos (
        id,
        nombre_proyecto,
        monto_ofertado
      ),
      ingresos (
        id,
        monto_total,
        estado
      )
    `)
    .eq("tipo_doc", "factura emitida")
    .eq("estado_comprobante", "pendiente")

  if (error) {
    toast.error("Error al obtener las cuentas por cobrar");
    console.error(error);
    return null;
  }

  // Normalizar la fecha actual a inicio del día (00:00:00)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // 2. Mapear y procesar cada factura
  const resultado = data.map((doc) => {
    // Suma de ingresos cobrados para ESTA factura en particular
    const cobradoFactura = doc.ingresos
      ? doc.ingresos?.estado === "confirmado"?doc.ingresos.reduce((acc, ing) => acc + Number(ing.monto_total || 0), 0)
      :0 : 0;

    const montoOriginalFactura = Number(doc.monto || 0);
    const saldoFactura = Number(Math.max(0, montoOriginalFactura - cobradoFactura).toFixed(2));

    // Cálculo de días de atraso
    const [year, month, day] = doc.fecha_vencimiento.split("-");
    const fechaVenc = new Date(Number(year), Number(month) - 1, Number(day));
    const diffTime = hoy.getTime() - fechaVenc.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diasAtraso = diffDays > 0 ? diffDays : 0;

    // Estado dinámico de la factura
    let estadoFactura = "POR VENCER";
    if (saldoFactura <= 0) {
      estadoFactura = "PAGADO";
    } else if (diasAtraso > 0) {
      estadoFactura = "VENCIDO";
    }

    return {
      // Información de la factura
      idDocumentoTributario: doc.id,
      documento: `${doc.serie_comprobante}-${doc.nro_comprobante}`,
      cliente: doc.razon_social,
      ruc: doc.ruc,
      montoOriginal: montoOriginalFactura,
      cobrado: cobradoFactura,
      saldo: saldoFactura,
      fechaEmision: doc.fecha_emision,
      fechaVencimiento: doc.fecha_vencimiento,
      diasAtraso: diasAtraso,
      estadoComprobante: doc.estado_comprobante,
      estadoIngreso: doc.ingresos?.estado,
      estado: estadoFactura,

      // Información del Proyecto (si existe)
      idProyecto: doc.proyectos?.id || null,
      proyecto: doc.proyectos?.nombre_proyecto || "Sin Proyecto Asignado",
      montoTotalProyecto: doc.proyectos ? Number(doc.proyectos.monto_total_proyecto || 0) : null,
    };
  });

  const facturasAgrupadas = agruparPorProyecto(resultado)

  return facturasAgrupadas;
}

// Agrupar facturas por proyecto para vistas jerárquicas
function agruparPorProyecto(facturas) {
  if (!facturas) return [];

  const grupos = {};

  facturas.forEach((item) => {
    const key = item.idProyecto || "SIN_PROYECTO";

    if (!grupos[key]) {
      grupos[key] = {
        idProyecto: item.idProyecto,
        proyecto: item.proyecto,
        montoTotalProyecto: item.montoTotalProyecto,
        totalCobradoFacturas: 0,
        totalSaldoPendienteFacturas: 0,
        facturas: [],
      };
    }

    grupos[key].totalCobradoFacturas += item.cobrado;
    grupos[key].totalSaldoPendienteFacturas += item.saldo;
    grupos[key].facturas.push(item);
  });

  return Object.values(grupos);
}