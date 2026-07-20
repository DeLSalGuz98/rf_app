import { useEffect, useState, useMemo } from "react";
import { Card, Col, ProgressBar, Row, Spinner } from "react-bootstrap";
import { getInfoFinancieraProyectoDB } from "../../querysDB/projects/getInfoFnanciera";
import { formatMoneda } from "../../utils/formatoMoneda";
import { getRetencionInfoProyectoDB } from "../../querysDB/projects/getRetencionInfo";


export function VistasResumenFinancieroProyecto({
  presupuestoTotal = 0,
  idProyecto,
  totalGastos = 0,
}) {
  const [montoAdelanto, setMontoAdelanto] = useState(0);
  const [montoIngresoDevoluciones, setMontoIngresoDevoluciones] = useState(0);
  const [montoDetraccion, setMontoDetraccion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [montoRetencion, setMontoRetencion] = useState(0);

  useEffect(() => {
    if (!idProyecto) return;

    let isMounted = true;

    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        const res = await getInfoFinancieraProyectoDB(idProyecto);
        const retencionData = await getRetencionInfoProyectoDB(idProyecto)

        if (!res || !isMounted) return;

        // Uso de .reduce() para sumar correctamente los adelantos
        const totalAdelanto = res.reduce((acc, item) => {
          if (item?.tipo_ingreso !== "devolucion") {
            return acc + (item?.documentos_tributarios?.monto || 0);
          }
          return acc;
        }, 0);

        const totalIngresoDevoluciones = res.reduce((acc, item) => {
          if (item?.tipo_ingreso === "devolucion") {
            return acc + (item?.documentos_tributarios?.monto || 0);
          }
          return acc;
        }, 0);

        // Uso de .reduce() con encadenamiento opcional (?.) para detraccciones
        const totalDetraccion = res.reduce((acc, item) => {
          const montoDetraccion = item?.documentos_tributarios?.factura?.[0]?.monto_detraccion || 0;
          return acc + montoDetraccion;
        }, 0);

        const totalRetencion = retencionData.reduce((acc, item) => {
          const montoRetencion = item?.monto || 0;
          return acc + montoRetencion;
        }, 0);

        setMontoAdelanto(totalAdelanto);
        setMontoDetraccion(totalDetraccion);
        setMontoRetencion(totalRetencion)
        setMontoIngresoDevoluciones(totalIngresoDevoluciones)
      } catch (error) {
        console.error("Error al obtener la información financiera:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFinancialData();

    return () => {
      isMounted = false; // Evita fugas de memoria si el componente se desmonta
    };
  }, [idProyecto]);

  const montoPendientePago = useMemo(() => {
    return (presupuestoTotal || 0) - montoAdelanto;
  }, [presupuestoTotal, montoAdelanto]);

  const porcentajeEjecutado = ((totalGastos - montoIngresoDevoluciones) *100 / presupuestoTotal)
  return (
    <Row className="mb-4">
      <Col>
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Resumen Financiero del Proyecto</h5>
              {loading && <Spinner animation="border" size="sm" variant="primary" />}
            </div>

            <div>
              <small className="text-muted">EJECUCIÓN PRESUPUESTAL</small>
              <ProgressBar now={100 - porcentajeEjecutado} className="mt-1" style={{ height: 12 }} />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">Disponible: {(100 - porcentajeEjecutado).toFixed(2)}%</small>
                <small className="text-muted">Gastado: {porcentajeEjecutado.toFixed(2)}%</small>
              </div>
            </div>

            <Row className="g-3">
              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Presupuesto Total (PT)</small>
                  <h4 className="fw-bold text-primary mb-0">
                    {formatMoneda(presupuestoTotal)}
                  </h4>
                </div>
              </Col>

              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Monto de Adelanto (MA)</small>
                  <h4 className="fw-bold text-success mb-0">
                    {formatMoneda(montoAdelanto)}
                  </h4>
                </div>
              </Col>

              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Monto Pendiente de Pago (MPP)</small>
                  <h4 className="fw-bold text-warning mb-0">
                    {formatMoneda(montoPendientePago)}
                  </h4>
                </div>
              </Col>

              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Total Gastos</small>
                  <h4 className="fw-bold text-danger mb-0">
                    {formatMoneda(totalGastos - montoIngresoDevoluciones)}
                  </h4>
                </div>
              </Col>

              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Monto de Detracción (MD)</small>
                  <h5 className="fw-bold mb-0">
                    {formatMoneda(montoDetraccion)}
                  </h5>
                </div>
              </Col>

              <Col md={4}>
                <div className="border rounded-3 p-3 h-100">
                  <small className="text-muted d-block">Monto de Retención (MR)</small>
                  <h5 className="fw-bold mb-0">
                    {formatMoneda(montoRetencion)}
                  </h5>
                </div>
              </Col>

            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}