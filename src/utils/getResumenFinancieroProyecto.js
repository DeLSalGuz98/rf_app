import { getListExpenditureProjectDB } from "../querysDB/gastos/listExpenditureProject";
import { getListIngresosProyectoDB } from "../querysDB/ingresos/getListIngresosProyecto";
import { getInfoProjectDB } from "../querysDB/projects/getInfoProject";
import { getDocsTributariosProyectoDB } from "../querysDB/taxDocument/getListTaxDoc";
import { getListPagoEmpleadoProyectoDB } from "../querysDB/workers/getListPagoWorkers";
import { frmtFecha } from "./formatDate";

const IGV_RATE = 0.18;
const IGV_FACTOR = 1 + IGV_RATE;

/**
 * Obtiene y consolida toda la información general, financiera, operativa,
 * tributaria y de ingresos de un proyecto en paralelo.
 *
 * @param {string|number} idProyecto - Identificador único del proyecto.
 * @returns {Promise<Object|null>} Objeto consolidado del proyecto o null si no existe.
 */
export const getInfoProyectoFromDB = async (idProyecto) => {
  if (!idProyecto) return null;

  try {
    // Ejecución en paralelo para minimizar la latencia de red
    const [rawProyecto, rawGastos, rawTrabajadores, rawDocs, rawIngresos] =
      await Promise.all([
        getInfoProjectDB(idProyecto),
        getListExpenditureProjectDB(idProyecto),
        getListPagoEmpleadoProyectoDB(idProyecto),
        getDocsTributariosProyectoDB(idProyecto),
        getListIngresosProyectoDB(idProyecto),
      ]);

    const proyecto = infoProyecto(rawProyecto);
    const gastos = infoGastosProyecto(rawGastos || [], rawTrabajadores || []);
    const documentosTributarios = infoDocsTributariosProyecto(rawDocs || []);
    const ingresos = infoIngresosProyecto(rawIngresos || []);

    return { proyecto, gastos, documentosTributarios, ingresos };
  } catch (error) {
    console.error("Error al consolidar la información del proyecto:", error);
    return null;
  }
};

/**
 * Estructura los datos generales, de cliente, cronograma e importes base del proyecto.
 *
 * @param {Object|null} proyecto - Datos crudos del proyecto desde BD.
 * @returns {Object|null} Objeto estructurado por secciones.
 */
const infoProyecto = (proyecto) => {
  if (!proyecto) return null;

  const montoTotal = Number(proyecto.montoProyecto) || 0;
  const baseImponible = montoTotal / IGV_FACTOR;
  const igv = montoTotal - baseImponible;

  return {
    infoPrincipal: {
      id: proyecto.id,
      nombre_proyecto: proyecto.nombreProyecto,
      descripcion_proyecto: proyecto.descripcion,
      tipo: proyecto.tipo,
      exp_siaf: proyecto.expSiaf,
      estado: proyecto.estadoProyecto,
    },
    infoCliente: {
      id: proyecto.id,
      direccion: proyecto.direccion,
      distrito: proyecto.distrito,
      provincia: proyecto.provincia,
      departamento: proyecto.departamento,
      ruc_cliente: proyecto.rucCliente,
      rs_cliente: proyecto.razonSocial,
      unidad_ejecutora: proyecto.unidadEjecutora,
    },
    fechasProyecto: {
      id: proyecto.id,
      fecha_inicio: proyecto.fechaInicio,
      plazo_dias: proyecto.plazoEntrega,
      fecha_fin: proyecto.fechaEntrega,
    },
    infoFinanciera: {
      id: proyecto.id,
      montoProyecto: montoTotal,
      baseImponible,
      igv,
    },
  };
};

/**
 * Procesa los gastos operativos y los pagos realizados al personal del proyecto.
 * Convierte montos en USD a PEN, desglosa el IGV de gastos facturados y agrupa por categoría.
 *
 * @param {Array} [gastos=[]] - Lista de gastos operativos del proyecto.
 * @param {Array} [trabajadores=[]] - Lista de pagos al personal del proyecto.
 * @returns {Object} Resumen de costos, desglose por categoría y tabla formateada.
 */
const infoGastosProyecto = (gastos = [], trabajadores = []) => {
  const safeGastos = Array.isArray(gastos) ? gastos : [];
  const safeTrabajadores = Array.isArray(trabajadores) ? trabajadores : [];

  let montoTotalGastos = 0;
  let gastosFacturados = 0;
  let igvGastosFacturados = 0;
  let gastosNoFacturados = 0;
  const gastosCategoria = {};

  const infoTablaGastos = safeGastos.map((gasto) => {
    const tipoCambio = Number(gasto.tipoCambio) || 1;
    let precioUnitario = Number(gasto.precioUnitario) || 0;
    let total = Number(gasto.montoTotal ?? gasto.total) || 0;

    if (gasto.moneda === "USD") {
      precioUnitario *= tipoCambio;
      total *= tipoCambio;
    }

    montoTotalGastos += total;

    if (!gasto.serieComprobante) {
      gastosNoFacturados += total;
    } else {
      gastosFacturados += total;
      igvGastosFacturados += total - total / IGV_FACTOR;
    }

    const clave = gasto.categoria || "Sin Categoría";
    gastosCategoria[clave] = (gastosCategoria[clave] || 0) + total;

    const comprobante =
      gasto.serieComprobante && gasto.nroComprobante
        ? `${gasto.serieComprobante}-${gasto.nroComprobante}`
        : "S/N";

    return {
      idGasto: gasto.id,
      fecha: frmtFecha(gasto.fecha, "dd/MM/yy"),
      cantidad: gasto.cantidad,
      unidadMedida: gasto.unidadMedida,
      descripcion: gasto.descripcion,
      precioUnitario,
      total,
      comprobante,
    };
  });

  const totalPagoTrabajadores = safeTrabajadores.reduce(
    (acc, item) => acc + (Number(item?.monto_pago) || 0),
    0
  );

  return {
    montoTotalGastos,
    gastosFacturados,
    igvGastosFacturados,
    gastosNoFacturados,
    gastosCategoria,
    infoTablaGastos,
    totalPagoTrabajadores,
  };
};

/**
 * Resume los montos de comprobantes tributarios asociados directamente al proyecto.
 *
 * @param {Array} [docs=[]] - Documentos tributarios del proyecto.
 * @returns {Object} Totales netos facturados y notas de crédito emitidas/recibidas.
 */
const infoDocsTributariosProyecto = (docs = []) => {
  const safeDocs = Array.isArray(docs) ? docs : [];
  let montoFacturado = 0;
  let montoTotalNCE = 0;
  let montoTotalNCR = 0;
  let montoRetencion = 0;

  safeDocs.forEach((doc) => {
    const monto = Number(doc?.monto) || 0;
    if (doc?.tipo_doc === "factura emitida") {
      montoFacturado += monto;
    } else if (doc?.tipo_doc === "nc emitido") {
      montoTotalNCE += monto;
    } else if (doc?.tipo_doc === "nc recibido") {
      montoTotalNCR += monto;
    } else if (doc?.tipo_doc === "retencion recibido") {
      montoRetencion += monto;
    }
  });

  return {
    montoTotalFacturado: montoFacturado - montoTotalNCE,
    montoTotalNCE,
    montoTotalNCR,
    montoRetencion
  };
};

/**
 * Procesa el flujo de ingresos del proyecto, normalizando monedas a PEN y
 * desglosando facturación neta, base imponible, IGV, detracciones y saldos pendientes.
 *
 * @param {Array} [ingresos=[]] - Lista de registros de ingreso del proyecto.
 * @returns {Object} Métricas consolidadas de ingresos y cobros.
 */
const infoIngresosProyecto = (ingresos = []) => {
  const safeIngresos = Array.isArray(ingresos) ? ingresos : [];

  let montoFacturado = 0;
  let montoNCE = 0;
  let montoTotalPagado = 0;
  let montoDetracciones = 0;
  let montoPendientePago = 0;

  safeIngresos.forEach((ingreso) => {
    const tipoCambio = Number(ingreso?.tipo_cambio) || 1;
    const doc = ingreso?.documentos_tributarios;

    const rawMontoDoc = Number(doc?.monto) || 0;
    const montoDoc = doc?.moneda === "USD" ? rawMontoDoc * tipoCambio : rawMontoDoc;

    const rawMontoIngreso = Number(ingreso?.monto_total) || 0;
    const montoIngreso =
      ingreso?.moneda === "USD" ? rawMontoIngreso * tipoCambio : rawMontoIngreso;

    const esNotaCredito = ingreso?.tipo_ingreso === "nc emitida";

    if (!esNotaCredito) {
      montoFacturado += montoDoc;
    } else {
      montoNCE += montoDoc;
    }

    if (!esNotaCredito && ingreso?.estado === "confirmado") {
      montoTotalPagado += montoIngreso;
    }

    if (!esNotaCredito && ingreso?.estado !== "anulado" && montoDoc > 0) {
      montoDetracciones += montoDoc - montoIngreso;
    }

    if (!esNotaCredito && ingreso?.estado === "pendiente") {
      montoPendientePago += montoIngreso;
    }
  });

  const montoTotalFacturado = montoFacturado - montoNCE;
  const montoFacturadoBase = montoTotalFacturado / IGV_FACTOR;
  const montoFacturadoIGV = montoTotalFacturado - montoFacturadoBase;

  return {
    montoTotalFacturado,
    montoFacturadoBase,
    montoFacturadoIGV,
    montoNCE,
    montoTotalPagado,
    montoDetracciones,
    montoPendientePago,
  };
};