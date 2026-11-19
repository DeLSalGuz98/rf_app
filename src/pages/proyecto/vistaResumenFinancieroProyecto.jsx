import { useMemo } from "react";
import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import { formatMoneda } from "../../utils/formatoMoneda";

/**
 * Componente VistasResumenFinancieroProyecto
 * Muestra las métricas financieras clave de un proyecto a partir de los datos
 * consolidados recibidos por props, con diseño ejecutivo optimizado para
 * pantalla e impresión A4/Carta.
 *
 * @param {Object} props
 * @param {Object} [props.infoFinancieraProyecto={}] - Datos financieros base del proyecto (`montoProyecto`, `baseImponible`, `igv`).
 * @param {Object} [props.ingresos={}] - Resumen de ingresos y cobros (`montoTotalPagado`, `montoDetracciones`, `montoPendientePago`).
 * @param {Object} [props.gastos={}] - Resumen de costos operativos y de personal (`montoTotalGastos`, `totalPagoTrabajadores`).
 * @param {Object} [props.documentosTributarios={}] - Resumen de comprobantes emitidos (`montoTotalFacturado`, `montoRetencion`).
 */
export function VistasResumenFinancieroProyecto({
  infoFinancieraProyecto = {},
  ingresos = {},
  gastos = {},
  documentosTributarios = {},
}) {
  // Extracción segura con valores numéricos por defecto para evitar NaN
  const presupuestoTotal = Number(infoFinancieraProyecto?.montoProyecto) || 0;
  const gastosOperativos = Number(gastos?.montoTotalGastos) || 0;
  const pagoPersonal = Number(gastos?.totalPagoTrabajadores) || 0;
  const montoFacturado = Number(documentosTributarios?.montoTotalFacturado) || 0;
  const montoPagado = Number(ingresos?.montoTotalPagado) || 0;
  const montoDetracciones = Number(ingresos?.montoDetracciones) || 0;
  const montoRetencion = Number(documentosTributarios?.montoRetencion) || 0;

  /**
   * Costo Real Total: Suma de gastos operativos más pagos al personal del proyecto.
   */
  const costoRealTotal = useMemo(() => {
    return gastosOperativos + pagoPersonal;
  }, [gastosOperativos, pagoPersonal]);

  /**
   * Saldo pendiente de cobro descontando lo pagado en cuenta y las detracciones.
   */
  const montoPendientePago = useMemo(() => {
    return presupuestoTotal - (montoPagado + montoDetracciones);
  }, [presupuestoTotal, montoPagado, montoDetracciones]);

  /**
   * Utilidad Bruta Estimada: Ingresos netos recibidos menos el costo real total.
   */
  const utilidadBruta = useMemo(() => {
    const ingresoNetoRecibido =
      montoRetencion > 0 ? montoPagado - montoRetencion : montoPagado;
    return ingresoNetoRecibido - costoRealTotal;
  }, [montoPagado, montoRetencion, costoRealTotal]);

  /**
   * Porcentaje de ejecución presupuestal respecto al costo real total.
   */
  const porcentajeEjecutado = useMemo(() => {
    if (presupuestoTotal <= 0) return 0;
    return (costoRealTotal / presupuestoTotal) * 100;
  }, [costoRealTotal, presupuestoTotal]);

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            .resumen-print-wrapper,
            .resumen-print-wrapper > .col,
            .resumen-print-card-outer,
            .resumen-print-body,
            .resumen-progress-box {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              flex: 0 0 100% !important;
              box-sizing: border-box !important;
            }
            .resumen-print-card-outer {
              border: none !important;
              box-shadow: none !important;
            }
            .resumen-print-body {
              padding: 0 !important;
            }
            .resumen-progress-box {
              padding: 10px 14px !important;
              margin-bottom: 12px !important;
              background-color: #f8f9fa !important;
              border: 1px solid #dee2e6 !important;
              border-radius: 6px !important;
            }
            .resumen-print-grid {
              display: grid !important;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 10px !important;
              width: 100% !important;
              margin: 0 !important;
            }
            .resumen-print-col {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .resumen-print-col-full {
              grid-column: 1 / -1 !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin-top: 2px !important;
            }
            .resumen-metric-box {
              padding: 10px 12px !important;
              border: 1px solid #d0d7de !important;
              border-radius: 6px !important;
              background-color: #ffffff !important;
              break-inside: avoid !important;
            }
            .resumen-metric-label {
              font-size: 0.65rem !important;
              font-weight: 700 !important;
              letter-spacing: 0.3px !important;
              color: #57606a !important;
              white-space: nowrap !important;
              display: block !important;
              margin-bottom: 3px !important;
            }
            .resumen-metric-value {
              font-size: 1.05rem !important;
              font-weight: 700 !important;
              white-space: nowrap !important;
              margin: 2px 0 !important;
              line-height: 1.2 !important;
            }
            .resumen-metric-sub {
              font-size: 0.65rem !important;
              color: #6e7781 !important;
              display: block !important;
              line-height: 1.2 !important;
            }
            .resumen-profit-box {
              padding: 10px 14px !important;
              border-radius: 6px !important;
              break-inside: avoid !important;
            }
            .resumen-profit-box h3 {
              font-size: 1.2rem !important;
              margin: 2px 0 0 0 !important;
              white-space: nowrap !important;
            }
            .progress, .progress-bar, .badge, .bg-success-subtle, .bg-danger-subtle, .resumen-progress-box {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <Row className="mb-4 resumen-print-wrapper">
        <Col className="w-100">
          <Card className="border-0 shadow-sm rounded-4 resumen-print-card-outer">
            <Card.Body className="p-4 resumen-print-body">
              {/* Cabecera del Resumen */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1 text-dark">
                    Resumen Financiero del Proyecto
                  </h5>
                  <p className="text-muted small mb-0">
                    Indicadores clave de rendimiento y control económico
                  </p>
                </div>
              </div>

              {/* Barra de Progreso de Ejecución Presupuestal */}
              <div className="mb-4 bg-light p-3 rounded-3 border resumen-progress-box">
                <div className="d-flex justify-content-between mb-1">
                  <small
                    className="text-muted fw-semibold text-uppercase"
                    style={{ fontSize: "0.75rem" }}
                  >
                    EJECUCIÓN DEL PRESUPUESTO
                  </small>
                  <small className="fw-bold text-dark">
                    {porcentajeEjecutado.toFixed(1)}% Ejecutado
                  </small>
                </div>
                <ProgressBar
                  now={Math.min(porcentajeEjecutado, 100)}
                  variant={
                    porcentajeEjecutado > 90
                      ? "danger"
                      : porcentajeEjecutado > 75
                      ? "warning"
                      : "primary"
                  }
                  className="mt-1"
                  style={{ height: 10 }}
                />
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">
                    Gastado: {formatMoneda(costoRealTotal)}
                  </small>
                  <small className="text-muted">
                    Presupuesto: {formatMoneda(presupuestoTotal)}
                  </small>
                </div>
              </div>

              {/* Cuadrícula de Métricas Financieras */}
              <Row className="g-3 resumen-print-grid">
                {/* 1. Presupuesto Total */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      PRESUPUESTO TOTAL (PT)
                    </span>
                    <h4 className="fw-bold text-primary mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(presupuestoTotal)}
                    </h4>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Monto asignado o cotizado
                    </small>
                  </div>
                </Col>

                {/* 2. Costo Real Total */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      COSTO REAL TOTAL
                    </span>
                    <h4 className="fw-bold text-danger mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(costoRealTotal)}
                    </h4>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Gastos + pago personal
                    </small>
                  </div>
                </Col>

                {/* 3. Monto Facturado */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      MONTO FACTURADO
                    </span>
                    <h4 className="fw-bold text-info mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoFacturado)}
                    </h4>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Total emitido en comprobantes
                    </small>
                  </div>
                </Col>

                {/* 4. Monto Pagado */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      MONTO PAGADO (REAL)
                    </span>
                    <h4 className="fw-bold text-success mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoPagado-montoRetencion)}
                    </h4>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Dinero recibido en cuenta
                    </small>
                  </div>
                </Col>

                {/* 5. Monto Pendiente de Pago */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      PENDIENTE DE PAGO
                    </span>
                    <h4 className="fw-bold text-warning mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoPendientePago)}
                    </h4>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Monto por cobrar
                    </small>
                  </div>
                </Col>

                {/* 6. Monto Detracciones */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      MONTO DETRACCIONES
                    </span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(montoDetracciones)}
                    </h5>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Retenciones fiscales de banco
                    </small>
                  </div>
                </Col>

                {/* 7. Monto Retención */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      MONTO RETENCIÓN
                    </span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(montoRetencion)}
                    </h5>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Retenciones de clientes
                    </small>
                  </div>
                </Col>

                {/* 8. Monto Pago Personal */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">
                      MONTO PAGO PERSONAL
                    </span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(pagoPersonal)}
                    </h5>
                    <small
                      className="text-muted resumen-metric-sub"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Total pago a trabajadores
                    </small>
                  </div>
                </Col>

                {/* 9. Utilidad Bruta (Ancho Completo) */}
                <Col xs={12} className="resumen-print-col-full">
                  <div
                    className={`border rounded-3 p-3 h-100 resumen-profit-box ${
                      utilidadBruta >= 0
                        ? "bg-success-subtle border-success-subtle"
                        : "bg-danger-subtle border-danger-subtle"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span
                          className="text-uppercase fw-bold small text-secondary"
                          style={{ letterSpacing: "0.5px" }}
                        >
                          UTILIDAD BRUTA ESTIMADA (Ingresos Reales - Costos Reales)
                        </span>
                        <h3
                          className={`fw-bold mb-0 mt-1 ${
                            utilidadBruta >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {formatMoneda(utilidadBruta)}
                        </h3>
                      </div>
                      <div className="text-end">
                        <span
                          className={`badge ${
                            utilidadBruta >= 0 ? "bg-success" : "bg-danger"
                          } fs-6 px-3 py-2`}
                        >
                          {utilidadBruta >= 0
                            ? "Proyecto Rentable"
                            : "Margen en Negativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}