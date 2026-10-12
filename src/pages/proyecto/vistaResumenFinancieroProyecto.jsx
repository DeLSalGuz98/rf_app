import { useEffect, useState, useMemo } from "react";
import { Card, Col, ProgressBar, Row, Spinner } from "react-bootstrap";
import { getInfoFinancieraProyectoDB } from "../../querysDB/projects/getInfoFnanciera";
import { formatMoneda } from "../../utils/formatoMoneda";
import { getRetencionInfoProyectoDB } from "../../querysDB/projects/getRetencionInfo";
import { getInfoPagoWorkerProyectoDB } from "../../querysDB/projects/getInfoPagoWorker";

/**
 * Componente VistasResumenFinancieroProyecto
 * Muestra las métricas financieras clave de un proyecto (Presupuesto, Costos, Facturación, 
 * Ingresos Reales, Cuentas Pendientes, Detracciones, Retenciones y Utilidad Bruta).
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
  // Estados para almacenar las métricas financieras obtenidas del backend
  const [ingresosData, setIngresosData] = useState([]);
  const [retencionData, setRetencionData] = useState([]);
  const [infoPagoWorkerData, setInfoPagoWorkerData] = useState(0)
  const [loading, setLoading] = useState(true);

  // Efecto para la carga asíncrona de la información financiera y de retenciones
  useEffect(() => {
    if (!idProyecto) return;

    let isMounted = true;

    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        // Peticiones paralelas para optimizar tiempos de carga
        const [infoFinanciera, retenciones, infoPagoWorkers] = await Promise.all([
          getInfoFinancieraProyectoDB(idProyecto),
          getRetencionInfoProyectoDB(idProyecto),
          getInfoPagoWorkerProyectoDB(idProyecto)
        ]);

        if (!isMounted) return;

        setIngresosData(infoFinanciera?.ingresos || []);
        setRetencionData(retenciones || []);
        setInfoPagoWorkerData(infoPagoWorkers || 0);
      } catch (error) {
        console.error("Error al obtener la información financiera del proyecto:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFinancialData();

    return () => {
      isMounted = false; // Prevención de fugas de memoria en desmontaje
    };
  }, [idProyecto]);

  /**
   * Cálculo del Monto Facturado Total (Suma de todas las facturas emitidas, excluyendo devoluciones/anulados)
   */
  const montoFacturado = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      if(!item.documentos_tributarios){
        return
      }
      const tipo = item?.documentos_tributarios?.estado_comprobante;
      const tipoDoc = item?.documentos_tributarios?.tipo_doc;
      const monto = item?.documentos_tributarios?.monto || 0;

      if (tipo === "anulado") return acc;
      if (tipoDoc === "nc emitido") return acc - monto; // Nota de crédito resta facturación

      return acc + monto;
    }, 0);
  }, [ingresosData]);

  /**
   * Cálculo del Monto Pagado Real (Dinero ingresado efectivamente a las cuentas de la empresa)
   */
  const montoPagado = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      const estadoPago = item?.estado || "pagado"; 
      const monto = item?.monto_total || 0;
      const tipo = item?.tipo_ingreso;

      if (tipo === "devolucion" || estadoPago === "pendiente") return acc;
      if (tipo === "nc emitida") return acc - monto;

      return acc + monto;
    }, 0);
  }, [ingresosData]);

  /**
   * Cálculo del Total de Detracciones acumuladas
   */
  const montoDetraccion = useMemo(() => {
    return ingresosData.reduce((acc, item) => {
      const detraccion = item?.documentos_tributarios?.factura?.[0]?.monto_detraccion || 0;
      return acc + detraccion;
    }, 0);
  }, [ingresosData]);

  /**
   * Cálculo del Total de Retenciones acumuladas
   */
  const montoRetencion = useMemo(() => {
    return retencionData.reduce((acc, item) => {
      return acc + (item?.monto || 0);
    }, 0);
  }, [retencionData]);

  /**
   * Utilidad Bruta: Ingreso real recibido (Monto Pagado) menos los costos reales totales
   */
  const utilidadBruta = useMemo(() => {
    return montoPagado - totalGastos;
  }, [montoPagado, totalGastos]);

  /**
   * Porcentaje de ejecución presupuestal basado en los costos reales frente al presupuesto total
   */
  const porcentajeEjecutado = useMemo(() => {
    if (!presupuestoTotal || presupuestoTotal <= 0) return 0;
    return (totalGastos / presupuestoTotal) * 100;
  }, [totalGastos, presupuestoTotal]);


  /**
   * Cálculo del Monto Pendiente de Pago (Facturado pero aún no depositado por el cliente)
   */
  const montoPendientePago = useMemo(() => {
    return presupuestoTotal - (montoPagado + montoDetraccion)
  }, [ingresosData]);
  return (
    <Row className="mb-4">
      <Col>
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            
            {/* Cabecera del Resumen */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1 text-dark">Resumen Financiero del Proyecto</h5>
                <p className="text-muted small mb-0">Indicadores clave de rendimiento y control económico</p>
              </div>
              {loading && <Spinner animation="border" size="sm" variant="primary" />}
            </div>

            {/* Barra de Progreso de Ejecución Presupuestal */}
            <div className="mb-4 bg-light p-3 rounded-3 border">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted fw-semibold uppercase" style={{ fontSize: "0.75rem" }}>
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
                <small className="text-muted">Gastado: {formatMoneda(totalGastos)}</small>
                <small className="text-muted">Presupuesto: {formatMoneda(presupuestoTotal)}</small>
              </div>
            </div>

            {/* Cuadrícula de Métricas Financieras (UI/UX Tarjetas Clean) */}
            <Row className="g-3">
              
              {/* 1. Presupuesto Total */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">PRESUPUESTO TOTAL (PT)</span>
                  <h4 className="fw-bold text-primary mb-1 mt-1">
                    {formatMoneda(presupuestoTotal)}
                  </h4>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Monto asignado o cotizado</small>
                </div>
              </Col>

              {/* 2. Costo Real Total */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">COSTO REAL TOTAL</span>
                  <h4 className="fw-bold text-danger mb-1 mt-1">
                    {formatMoneda(totalGastos+infoPagoWorkerData)}
                  </h4>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Suma de todos los gastos</small>
                </div>
              </Col>

              {/* 3. Monto Facturado */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">MONTO FACTURADO</span>
                  <h4 className="fw-bold text-info mb-1 mt-1">
                    {formatMoneda(montoFacturado)}
                  </h4>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Total emitido en comprobantes</small>
                </div>
              </Col>

              {/* 4. Monto Pagado */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">MONTO PAGADO (REAL)</span>
                  <h4 className="fw-bold text-success mb-1 mt-1">
                    {formatMoneda(montoPagado)}
                  </h4>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Dinero recibido en cuenta</small>
                </div>
              </Col>

              {/* 5. Monto Pendiente de Pago */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">PENDIENTE DE PAGO</span>
                  <h4 className="fw-bold text-warning mb-1 mt-1">
                    {formatMoneda(montoPendientePago)}
                  </h4>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Monto por cobrar</small>
                </div>
              </Col>

              {/* 6. Monto Detracciones */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">MONTO DETRACCIONES</span>
                  <h5 className="fw-bold text-dark mb-1 mt-2">
                    {formatMoneda(montoDetraccion)}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Retenciones fiscales de banco</small>
                </div>
              </Col>

              {/* 7. Monto Retención */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">MONTO RETENCIÓN</span>
                  <h5 className="fw-bold text-dark mb-1 mt-2">
                    {formatMoneda(montoRetencion)}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Retenciones de clientes</small>
                </div>
              </Col>

              {/* (). Monto Retención */}
              <Col md={3} sm={6}>
                <div className="border rounded-3 p-3 h-100 bg-white shadow-xs">
                  <span className="text-muted d-block small fw-medium">MONTO PAGO PERSONAL</span>
                  <h5 className="fw-bold text-dark mb-1 mt-2">
                    {formatMoneda(infoPagoWorkerData)}
                  </h5>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>Total del pago a los trabajadores</small>
                </div>
              </Col>

              {/* 8. Utilidad Bruta (Métrica Destacada a Ancho Completo) */}
              <Col xs={12}>
                <div className={`border rounded-3 p-3 h-100 ${utilidadBruta >= 0 ? "bg-success-subtle border-success-subtle" : "bg-danger-subtle border-danger-subtle"}`}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                      <span className="text-uppercase fw-bold small text-secondary" style={{ letterSpacing: "0.5px" }}>
                        UTILIDAD BRUTA ESTIMADA (Ingresos Reales - Costos Reales)
                      </span>
                      <h3 className={`fw-bold mb-0 mt-1 ${utilidadBruta >= 0 ? "text-success" : "text-danger"}`}>
                        {formatMoneda(utilidadBruta)}
                      </h3>
                    </div>
                    <div className="mt-2 mt-md-0 text-md-end">
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
  );
}