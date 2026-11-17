import { useEffect, useState, useMemo } from "react";
import { Card, Col, ProgressBar, Row, Spinner } from "react-bootstrap";
import { getInfoFinancieraProyectoDB } from "../../querysDB/projects/getInfoFnanciera";
import { formatMoneda } from "../../utils/formatoMoneda";
import { getRetencionInfoProyectoDB } from "../../querysDB/projects/getRetencionInfo";
import { getInfoPagoWorkerProyectoDB } from "../../querysDB/projects/getInfoPagoWorker";

/**
 * Componente VistasResumenFinancieroProyecto
 * Muestra las métricas financieras clave de un proyecto con diseño ejecutivo
 * optimizado tanto para pantalla como para impresión A4/Carta.
 *
 * @param {Object} props
 * @param {number} props.presupuestoTotal - Monto total cotizado o presupuestado del proyecto.
 * @param {string|number} props.idProyecto - Identificador único del proyecto.
 * @param {number} props.totalGastos - Suma total de los costos/gastos operativos del proyecto.
 */
export function VistasResumenFinancieroProyecto({
  presupuestoTotal = 0,
  idProyecto,
  totalGastos = 0,
}) {
  const [ingresosData, setIngresosData] = useState([]);
  const [retencionData, setRetencionData] = useState([]);
  const [infoPagoWorkerData, setInfoPagoWorkerData] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idProyecto) return;

    let isMounted = true;

    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        const [infoFinanciera, retenciones, infoPagoWorkers] = await Promise.all([
          getInfoFinancieraProyectoDB(idProyecto),
          getRetencionInfoProyectoDB(idProyecto),
          getInfoPagoWorkerProyectoDB(idProyecto),
        ]);

        if (!isMounted) return;

        setIngresosData(infoFinanciera?.ingresos || []);
        setRetencionData(retenciones || []);
        setInfoPagoWorkerData(Number(infoPagoWorkers) || 0);
      } catch (error) {
        console.error("Error al obtener la información financiera del proyecto:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFinancialData();

    return () => {
      isMounted = false;
    };
  }, [idProyecto]);

  const montoFacturado = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      if (!item?.documentos_tributarios) return acc;

      const tipo = item.documentos_tributarios.estado_comprobante;
      const tipoDoc = item.documentos_tributarios.tipo_doc;
      const monto = Number(item.documentos_tributarios.monto) || 0;

      if (tipo === "anulado") return acc + monto;
      if (tipoDoc === "nc emitido") return acc - monto;

      return acc + monto;
    }, 0);
  }, [ingresosData]);

  const montoPagado = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      const estadoPago = item?.estado || "pagado";
      const monto = Number(item?.monto_total) || 0;
      const tipo = item?.tipo_ingreso;

      if (tipo === "devolucion" || estadoPago === "pendiente") return acc;
      if (tipo === "nc emitida") return acc - monto;

      return acc + monto;
    }, 0);
  }, [ingresosData]);

  const montoDetraccion = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      const detraccion = Number(item?.documentos_tributarios?.factura?.[0]?.monto_detraccion) || 0;
      return acc + detraccion;
    }, 0);
  }, [ingresosData]);

  const montoRetencion = useMemo(() => {
    return retencionData.reduce((acc, item) => {
      return acc + (Number(item?.monto) || 0);
    }, 0);
  }, [retencionData]);

  const costoRealTotal = useMemo(() => {
    return Number(totalGastos) + Number(infoPagoWorkerData);
  }, [totalGastos, infoPagoWorkerData]);

  const utilidadBruta = useMemo(() => {
    const ingresoNetoRecibido = montoRetencion !== 0 ? montoPagado - montoRetencion : montoPagado;
    return ingresoNetoRecibido - costoRealTotal;
  }, [montoPagado, montoRetencion, costoRealTotal]);

  const porcentajeEjecutado = useMemo(() => {
    if (!presupuestoTotal || presupuestoTotal <= 0) return 0;
    return (costoRealTotal / presupuestoTotal) * 100;
  }, [costoRealTotal, presupuestoTotal]);

  const montoPendientePago = useMemo(() => {
    return Number(presupuestoTotal) - (montoPagado + montoDetraccion);
  }, [presupuestoTotal, montoPagado, montoDetraccion]);

  const montoPagadoNeto = montoRetencion !== 0 ? montoPagado - montoRetencion : montoPagado;

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            /* Forzar ancho completo real en toda la jerarquía */
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
            /* Cuadrícula limpia de 4 columnas iguales a ancho completo */
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
            /* Diseño sobrio y ejecutivo de cada celda */
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
                  <h5 className="fw-bold mb-1 text-dark">Resumen Financiero del Proyecto</h5>
                  <p className="text-muted small mb-0">Indicadores clave de rendimiento y control económico</p>
                </div>
                {loading && <Spinner animation="border" size="sm" variant="primary" className="d-print-none" />}
              </div>

              {/* Barra de Progreso de Ejecución Presupuestal */}
              <div className="mb-4 bg-light p-3 rounded-3 border resumen-progress-box">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.75rem" }}>
                    EJECUCIÓN DEL PRESUPUESTO
                  </small>
                  <small className="fw-bold text-dark">
                    {porcentajeEjecutado.toFixed(1)}% Ejecutado
                  </small>
                </div>
                <ProgressBar
                  now={Math.min(porcentajeEjecutado, 100)}
                  variant={porcentajeEjecutado > 90 ? "danger" : porcentajeEjecutado > 75 ? "warning" : "primary"}
                  className="mt-1"
                  style={{ height: 10 }}
                />
                <div className="d-flex justify-content-between mt-2">
                  <small className="text-muted">Gastado: {formatMoneda(costoRealTotal)}</small>
                  <small className="text-muted">Presupuesto: {formatMoneda(presupuestoTotal)}</small>
                </div>
              </div>

              {/* Cuadrícula de Métricas Financieras */}
              <Row className="g-3 resumen-print-grid">
                
                {/* 1. Presupuesto Total */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">PRESUPUESTO TOTAL (PT)</span>
                    <h4 className="fw-bold text-primary mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(presupuestoTotal)}
                    </h4>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Monto asignado o cotizado</small>
                  </div>
                </Col>

                {/* 2. Costo Real Total */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">COSTO REAL TOTAL</span>
                    <h4 className="fw-bold text-danger mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(costoRealTotal)}
                    </h4>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Gastos + pago personal</small>
                  </div>
                </Col>

                {/* 3. Monto Facturado */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">MONTO FACTURADO</span>
                    <h4 className="fw-bold text-info mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoFacturado)}
                    </h4>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Total emitido en comprobantes</small>
                  </div>
                </Col>

                {/* 4. Monto Pagado */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">MONTO PAGADO (REAL)</span>
                    <h4 className="fw-bold text-success mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoPagadoNeto)}
                    </h4>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Dinero recibido en cuenta</small>
                  </div>
                </Col>

                {/* 5. Monto Pendiente de Pago */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">PENDIENTE DE PAGO</span>
                    <h4 className="fw-bold text-warning mb-1 mt-1 resumen-metric-value">
                      {formatMoneda(montoPendientePago)}
                    </h4>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Monto por cobrar</small>
                  </div>
                </Col>

                {/* 6. Monto Detracciones */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">MONTO DETRACCIONES</span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(montoDetraccion)}
                    </h5>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Retenciones fiscales de banco</small>
                  </div>
                </Col>

                {/* 7. Monto Retención */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">MONTO RETENCIÓN</span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(montoRetencion)}
                    </h5>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Retenciones de clientes</small>
                  </div>
                </Col>

                {/* 8. Monto Pago Personal */}
                <Col md={3} sm={6} className="resumen-print-col">
                  <div className="border rounded-3 p-3 h-100 bg-white shadow-xs resumen-metric-box">
                    <span className="text-muted d-block small fw-medium resumen-metric-label">MONTO PAGO PERSONAL</span>
                    <h5 className="fw-bold text-dark mb-1 mt-2 resumen-metric-value">
                      {formatMoneda(infoPagoWorkerData)}
                    </h5>
                    <small className="text-muted resumen-metric-sub" style={{ fontSize: "0.75rem" }}>Total pago a trabajadores</small>
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
                        <span className="text-uppercase fw-bold small text-secondary" style={{ letterSpacing: "0.5px" }}>
                          UTILIDAD BRUTA ESTIMADA (Ingresos Reales - Costos Reales)
                        </span>
                        <h3 className={`fw-bold mb-0 mt-1 ${utilidadBruta >= 0 ? "text-success" : "text-danger"}`}>
                          {formatMoneda(utilidadBruta)}
                        </h3>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${utilidadBruta >= 0 ? "bg-success" : "bg-danger"} fs-6 px-3 py-2`}>
                          {utilidadBruta >= 0 ? "Proyecto Rentable" : "Margen en Negativo"}
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