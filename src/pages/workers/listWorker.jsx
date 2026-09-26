import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getListWorkersDB } from "../../querysDB/workers/getListWorkers";

export function ListWorker() {
  const navigate = useNavigate();

  // Estados de datos y control
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Carga inicial de datos
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const list = await getListWorkersDB();
        setWorkers(list || []);
      } catch (error) {
        console.error("Error al obtener los trabajadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []); // Array de dependencias vacío para ejecutar solo al montar el componente

  // Cálculo de KPIs basado en el arreglo real de la BD
  const stats = useMemo(() => {
    const total = workers.length;
    const activos = workers.filter((w) => w.activo).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [workers]);

  // Filtrado dinámico considerando los campos en snake_case
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const fullName = `${worker.nombre || ""} ${worker.apellido_paterno || ""} ${
        worker.apellido_materno || ""
      }`.toLowerCase();

      const nroDoc = worker.nro_doc || "";
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        nroDoc.includes(searchTerm);

      if (filterStatus === "activos") return matchesSearch && worker.activo;
      if (filterStatus === "inactivos") return matchesSearch && !worker.activo;
      return matchesSearch;
    });
  }, [workers, searchTerm, filterStatus]);

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Cabecera Principal */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Personal de la Empresa</h2>
          <p className="text-muted mb-0">
            Gestión y visualización general de los colaboradores.
          </p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 shadow-sm"
          onClick={() => navigate("/trabajadores/nuevo")}
        >
          <i className="bi bi-person-plus-fill fs-5"></i>
          <span>Nuevo Trabajador</span>
        </Button>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="p-3 bg-primary bg-opacity-10 text-primary rounded-3 fs-3 d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium">Total de Personal</span>
                <h3 className="mb-0 fw-bold">{stats.total}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="p-3 bg-success bg-opacity-10 text-success rounded-3 fs-3 d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-person-check-fill"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium">Activos</span>
                <h3 className="mb-0 fw-bold text-success">{stats.activos}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div
                className="p-3 bg-secondary bg-opacity-10 text-secondary rounded-3 fs-3 d-flex align-items-center justify-content-center"
                style={{ width: "56px", height: "56px" }}
              >
                <i className="bi bi-person-x-fill"></i>
              </div>
              <div>
                <span className="text-muted small fw-medium">Inactivos</span>
                <h3 className="mb-0 fw-bold text-secondary">{stats.inactivos}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Contenedor Filtros y Tabla */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {/* Herramientas de Filtro y Búsqueda */}
          <div className="p-3 border-bottom d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
            <InputGroup style={{ maxWidth: "380px" }}>
              <InputGroup.Text className="bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por nombre o Nro. Documento..."
                className="border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-funnel text-muted fs-5"></i>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: "160px" }}
                className="form-select-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo Activos</option>
                <option value="inactivos">Solo Inactivos</option>
              </Form.Select>
            </div>
          </div>

          {/* Estado de Carga */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2 mb-0">Cargando personal...</p>
            </div>
          ) : (
            /* Tabla de Personal */
            <div className="table-responsive">
              <Table hover align="middle" className="mb-0">
                <thead className="bg-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4">Colaborador</th>
                    <th>Documento</th>
                    <th>Puesto / Trabajo</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.length > 0 ? (
                    filteredWorkers.map((worker) => (
                      <tr key={worker.id}>
                        {/* Colaborador con avatar e iniciales */}
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center text-uppercase"
                              style={{
                                width: "40px",
                                height: "40px",
                                fontSize: "0.9rem",
                              }}
                            >
                              {worker.nombre?.charAt(0)}
                              {worker.apellido_paterno?.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark text-capitalize">
                                {worker.nombre} {worker.apellido_paterno}{" "}
                                {worker.apellido_materno}
                              </div>
                              <small className="text-muted text-capitalize">
                                Contrata: {worker.tipo_contrata}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* Documento */}
                        <td>
                          <div className="fw-medium text-dark">{worker.nro_doc}</div>
                          <small className="text-muted text-uppercase">
                            {worker.tipo_doc}
                          </small>
                        </td>

                        {/* Puesto */}
                        <td>
                          <span className="fw-medium text-dark text-capitalize">
                            {worker.tipo_trabajo || "No asignado"}
                          </span>
                        </td>

                        {/* Contacto */}
                        <td>
                          <div className="d-flex flex-column gap-1 small text-muted">
                            {worker.email ? (
                              <span className="d-flex align-items-center gap-1">
                                <i className="bi bi-envelope"></i> {worker.email}
                              </span>
                            ) : (
                              <span className="text-muted fst-italic">Sin correo</span>
                            )}
                            {worker.telf && (
                              <span className="d-flex align-items-center gap-1">
                                <i className="bi bi-telephone"></i> {worker.telf}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td>
                          {worker.activo ? (
                            <Badge
                              bg="success-subtle"
                              className="text-success border border-success-subtle px-2 py-1 fw-medium"
                            >
                              <i
                                className="bi bi-circle-fill me-1"
                                style={{ fontSize: "6px", verticalAlign: "middle" }}
                              ></i>{" "}
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
                              ></i>{" "}
                              Inactivo
                            </Badge>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="text-end pe-4">
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="btn-icon border-0 bg-transparent text-muted p-1"
                            >
                              <i className="bi bi-three-dots-vertical fs-6"></i>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow-sm border-0">
                              <Dropdown.Item className="d-flex align-items-center gap-2">
                                <i className="bi bi-eye"></i> Ver Detalle
                              </Dropdown.Item>
                              <Dropdown.Item className="d-flex align-items-center gap-2">
                                <i className="bi bi-pencil"></i> Editar
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="d-flex align-items-center gap-2 text-danger">
                                <i className="bi bi-person-x"></i> Dar de baja
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        <i className="bi bi-people fs-1 d-block mb-2 text-muted opacity-50"></i>
                        <p className="mb-0">
                          No se encontraron trabajadores que coincidan con la búsqueda.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}