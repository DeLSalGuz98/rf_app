import { Row, Col, Card, Badge } from "react-bootstrap";

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-PE");
};

export function DataProyectComponent({ proyecto }) {
  if (!proyecto) return null;

  return (
    <div className="mb-4">

      <div className="mb-3">
        <h5 className="fw-bold mb-0">
          Información del Proyecto
        </h5>
        <small className="text-muted">
          Datos generales
        </small>
      </div>

      <Row className="g-4">

        {/* ================= CLIENTE ================= */}
        <Col lg={12}>
          <Card className="border rounded-4 h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3 text-primary">
                Información del Cliente
              </h6>
                  <div className="mb-3">
                    <small className="text-muted">Razón Social</small>
                    <div className="fw-semibold">
                      {proyecto.rs_cliente}
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">RUC</small>
                    <div className="fw-semibold">
                      {proyecto.ruc_cliente || "-"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Unidad Ejecutora</small>
                    <div className="fw-semibold">
                      {proyecto.unidad_ejecutora || "-"}
                    </div>
                  </div>

                  <div>
                    <small className="text-muted">Dirección</small>
                    <div className="fw-semibold">
                      {proyecto.direccion || "-"} <br />
                      {proyecto.distrito?.toUpperCase() || ""}{" "}
                      {proyecto.provincia?.toUpperCase() || ""} <br />
                      {proyecto.departamento?.toUpperCase() || ""}
                    </div>
                  </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= FECHAS ================= */}
        <Col lg={12}>
          <Card className="border rounded-4 h-100">
            <Card.Body>

              <h6 className="fw-bold mb-3 text-primary">
                Fechas del Proyecto
              </h6>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Fecha de Inicio</span>
                <span className="fw-semibold">
                  {formatDate(proyecto.fecha_inicio)}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Plazo (días)</span>
                <Badge bg="secondary">
                  {proyecto.plazo_dias || 0}
                </Badge>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Fecha de Finalización</span>
                <span className="fw-semibold">
                  {formatDate(proyecto.fecha_fin)}
                </span>
              </div>

            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
}