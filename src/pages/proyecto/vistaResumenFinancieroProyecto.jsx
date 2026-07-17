import { Card, Col, Row } from "react-bootstrap";

export function VistasResumenFinancieroProyecto({presupuestoTotal}){
  const montoAdelanto = "36,000.00";          // 30% del contrato
  //const porcentajeDetraccion = 12;            // %
  const montoDetraccion = "4,320.00";         // MA × 12%
  const montoRetencion = "3,600.00";          // 3% del PT
  const montoPendientePago = "80,400.00";     // PT - MA - MR
  const montoInvertido = "27,850.50";


  const FormatoMoneda = (valorMonto)=>{
    let formatoSoles = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    });
  
    return formatoSoles.format(valorMonto)
  }
  
  return <Row className="mb-4">
    <Col>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>

          <h5 className="fw-bold mb-4">
            Resumen Financiero del Proyecto
          </h5>

          <Row className="g-3">

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Presupuesto Total (PT)
                </small>

                <h4 className="fw-bold text-primary mb-0">
                  {FormatoMoneda(presupuestoTotal)}
                </h4>
              </div>
            </Col>

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Monto de Adelanto (MA)
                </small>

                <h4 className="fw-bold text-success mb-0">
                  S/. {montoAdelanto}
                </h4>
              </div>
            </Col>

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Monto Invertido (MI)
                </small>

                <h4 className="fw-bold text-danger mb-0">
                  S/. {montoInvertido}
                </h4>
              </div>
            </Col>

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Monto de Detracción (MD)
                </small>

                <h5 className="fw-bold mb-0">
                  S/. {montoDetraccion}
                </h5>

                <small className="text-muted">
                  MA × % Detracción
                </small>
              </div>
            </Col>

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Monto de Retención (MR)
                </small>

                <h5 className="fw-bold mb-0">
                  S/. {montoRetencion}
                </h5>

                <small className="text-muted">
                  3% del contrato
                </small>
              </div>
            </Col>

            <Col md={4}>
              <div className="border rounded-3 p-3 h-100">
                <small className="text-muted d-block">
                  Monto Pendiente de Pago (MPP)
                </small>

                <h4 className="fw-bold text-warning mb-0">
                  S/. {montoPendientePago}
                </h4>

                <small className="text-muted">
                  PT − MA − MR
                </small>
              </div>
            </Col>

          </Row>

        </Card.Body>
      </Card>
    </Col>
  </Row>
}