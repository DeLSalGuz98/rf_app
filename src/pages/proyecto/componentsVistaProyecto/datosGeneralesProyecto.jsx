import { Row, Col, Card, ProgressBar, Badge } from "react-bootstrap";

export function DataProyectComponent({ proyecto }) {

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);

  if (!proyecto) return null;

  const porcentajeUsado = 100 - proyecto.porcentaje;

  return (
    <>
      {/* 🔥 RESUMEN FINANCIERO (PROTAGONISTA) */}
      <Card className="mb-4 border">
        <Card.Body>

          <Row className="align-items-center">

            {/* IZQUIERDA */}
            <Col md={4}>
              <small className="text-muted">Presupuesto total</small>
              <h3 className="fw-bold">
                {formatCurrency(proyecto.monto_ofertado)}
              </h3>

              <div className="mt-3">
                <small className="text-muted">Uso del presupuesto</small>
                <ProgressBar
                  now={porcentajeUsado}
                  variant={porcentajeUsado > 90 ? "danger" : "primary"}
                />
                <small className="text-muted">
                  {porcentajeUsado.toFixed(2)}% utilizado
                </small>
              </div>
            </Col>

            {/* CENTRO */}
            <Col md={4} className="text-center">
              <small className="text-muted">Invertido</small>
              <h4 className="text-primary">
                {formatCurrency(proyecto.total_expenditure)}
              </h4>

              <small className="text-muted">Diferencia</small>
              <h5 className={proyecto.dif < 0 ? "text-danger" : "text-success"}>
                {formatCurrency(proyecto.dif)}
              </h5>
            </Col>

            {/* DERECHA */}
            <Col md={4} className="text-end">

              <div className="mb-2">
                <small className="text-muted">Facturado</small><br />
                <Badge bg="success" className="fs-6">
                  {formatCurrency(proyecto.facturado)}
                </Badge>
              </div>

              <div>
                <small className="text-muted">No facturado</small><br />
                <Badge bg="warning" text="dark" className="fs-6">
                  {formatCurrency(proyecto.noFacturado)}
                </Badge>
              </div>

            </Col>

          </Row>

        </Card.Body>
      </Card>

      {/* 🔽 INFORMACIÓN DETALLADA */}
      <Row className="g-3">

        {/* CLIENTE */}
        <Col md={6}>
          <Card className="h-100 border">
            <Card.Body>

              <h6 className="text-muted mb-3">Cliente</h6>

              <div className="mb-2">
                <small className="text-muted">Razón Social</small><br />
                <strong>{proyecto.rs_cliente}</strong>
              </div>

              {proyecto.ruc_cliente && (
                <div className="mb-2">
                  <small className="text-muted">RUC</small><br />
                  <strong>{proyecto.ruc_cliente}</strong>
                </div>
              )}

              {proyecto.unidad_ejecutora && (
                <div className="mb-2">
                  <small className="text-muted">Unidad Ejecutora</small><br />
                  <strong>{proyecto.unidad_ejecutora}</strong>
                </div>
              )}

              <div>
                <small className="text-muted">Dirección</small><br />
                <span>
                  {proyecto.direccion}<br />
                  {proyecto.distrito?.toUpperCase()}, {proyecto.provincia?.toUpperCase()}<br />
                  {proyecto.departamento?.toUpperCase()}
                </span>
              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* FECHAS */}
        <Col md={6}>
          <Card className="h-100 border">
            <Card.Body>

              <h6 className="text-muted mb-3">Fechas del Proyecto</h6>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Inicio</span>
                <strong>{proyecto.fecha_inicio}</strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Plazo</span>
                <Badge bg="secondary">{proyecto.plazo_dias} días</Badge>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Fin</span>
                <strong>{proyecto.fecha_fin}</strong>
              </div>

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </>
  );
}