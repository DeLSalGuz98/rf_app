import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Tabs,
  Tab,
  Spinner,
} from "react-bootstrap";
import { getWorkerDataDB } from "../../querysDB/workers/getWorkerData";
import { TablaPagoWorkers } from "../pagoWorkers/tablaPagoWorkers";
import { TablaPagoOneWorker } from "./listPagoWorker";

export function VistaWorker() {
  const { idWorker } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataWorker();
  }, [idWorker]);

  const getDataWorker = async () => {
    try {
      setLoading(true);
      const res = await getWorkerDataDB(idWorker);
      // Simulación con tus datos o asignación del objeto recibido
      setWorker(res || null);
    } catch (error) {
      console.error("Error al cargar datos del trabajador:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando perfil del trabajador...</p>
      </Container>
    );
  }

  if (!worker) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-person-x fs-1 text-muted"></i>
        <h4 className="mt-3">Trabajador no encontrado</h4>
        <Button
          variant="outline-primary"
          className="mt-2"
          onClick={() => navigate(-1)}
        >
          Volver a la lista
        </Button>
      </Container>
    );
  }

  // Iniciales para el Avatar
  const initials = `${worker.nombre?.charAt(0) || ""}${
    worker.apellido_paterno?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Botón Volver */}
      <div className="mb-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 text-muted d-inline-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
          <span>Volver al listado</span>
        </Button>
      </div>

      {/* Banner Principal del Perfil */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              {/* Avatar circular */}
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center text-uppercase fs-3"
                style={{ width: "72px", height: "72px", flexShrink: 0 }}
              >
                {initials}
              </div>

              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="fw-bold mb-0 text-dark text-capitalize">
                    {worker.nombre} {worker.apellido_paterno}{" "}
                    {worker.apellido_materno}
                  </h3>
                  {worker.activo ? (
                    <Badge
                      bg="success-subtle"
                      className="text-success border border-success-subtle px-2 py-1 fw-medium"
                    >
                      <i
                        className="bi bi-circle-fill me-1"
                        style={{ fontSize: "6px", verticalAlign: "middle" }}
                      ></i>
                      Activo
                    </Badge>
                  ) : (
                    <Badge
                      bg="secondary-subtle"
                      className="text-secondary border border-secondary-subtle px-2 py-1 fw-medium"
                    >
                      <i
                        className="bi bi-circle-fill me-1"
                        style={{ fontSize: "6px", verticalAlign: "middle" }}
                      ></i>
                      Inactivo
                    </Badge>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mt-1 text-muted small text-capitalize">
                  <span>
                    <i className="bi bi-briefcase me-1"></i>
                    {worker.tipo_trabajo || "Sin cargo asignado"}
                  </span>
                  <span>•</span>
                  <span>
                    <i className="bi bi-file-earmark-text me-1"></i>
                    Contrata: {worker.tipo_contrata || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción rápida */}
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-secondary"
                className="d-flex align-items-center gap-2 btn-sm px-3"
              >
                <i className="bi bi-pencil"></i>
                <span>Editar</span>
              </Button>
              <Button
                variant="outline-danger"
                className="d-flex align-items-center gap-2 btn-sm px-3"
              >
                <i className="bi bi-person-x"></i>
                <span>Dar de baja</span>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Contenido Principal */}
      <Row className="g-4">
        {/* Columna Izquierda: Información Rápida / Contacto */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0 text-dark">Información de Contacto</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-muted">
                    <i className="bi bi-envelope fs-5"></i>
                  </div>
                  <div>
                    <span className="d-block text-muted small">Correo Electrónico</span>
                    <span className="fw-medium text-dark">{worker.email || "No registrado"}</span>
                  </div>
                </li>

                <li className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-muted">
                    <i className="bi bi-telephone fs-5"></i>
                  </div>
                  <div>
                    <span className="d-block text-muted small">Teléfono</span>
                    <span className="fw-medium text-dark">{worker.telf || "No registrado"}</span>
                  </div>
                </li>

                <li className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-light rounded text-muted">
                    <i className="bi bi-card-heading fs-5"></i>
                  </div>
                  <div>
                    <span className="d-block text-muted small">
                      Documento ({worker.tipo_doc?.toUpperCase()})
                    </span>
                    <span className="fw-medium text-dark">{worker.nro_doc}</span>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Pestañas de Información Detallada */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Tabs
                defaultActiveKey="laboral"
                id="worker-detail-tabs"
                className="mb-4 border-bottom"
              >
                {/* Tab: Datos Laborales */}
                <Tab eventKey="laboral" title="Datos Laborales">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Puesto / Cargo</span>
                        <span className="fw-semibold text-dark text-capitalize">
                          {worker.tipo_trabajo}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Tipo de Contrato</span>
                        <span className="fw-semibold text-dark text-capitalize">
                          {worker.tipo_contrata}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">
                          <i className="bi bi-calendar-event me-1"></i>
                          Fecha de Inicio
                        </span>
                        <span className="fw-semibold text-dark">
                          {worker.fecha_inicio || "No especificado"}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">
                          <i className="bi bi-calendar-check me-1"></i>
                          Fecha Fin de Contrato
                        </span>
                        <span className="fw-semibold text-dark">
                          {worker.fecha_fin || "Indefinido"}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                {/* Tab: Datos Personales */}
                <Tab eventKey="personal" title="Datos Personales">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Nombres</span>
                        <span className="fw-semibold text-dark text-capitalize">
                          {worker.nombre}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Apellidos</span>
                        <span className="fw-semibold text-dark text-capitalize">
                          {worker.apellido_paterno} {worker.apellido_materno}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Fecha de Nacimiento</span>
                        <span className="fw-semibold text-dark">
                          {worker.fecha_nacimiento || "No registrada"}
                        </span>
                      </div>
                    </Col>

                    <Col sm={6}>
                      <div className="p-3 border rounded bg-light-subtle">
                        <span className="text-muted small d-block mb-1">Sexo</span>
                        <span className="fw-semibold text-dark text-capitalize">
                          {worker.sexo || "No especificado"}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                {/* Tab opcional para futuros módulos */}
                <Tab eventKey="documentos" title="Relacion de pagos">
                  <TablaPagoOneWorker idWorker={worker.id}/>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
