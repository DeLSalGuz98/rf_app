import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  InputGroup,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { getListWorkersDB } from "../../querysDB/workers/getListWorkers";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";
import { saveWorkerToProyectDB } from "../../querysDB/projects/saveWorkerToProyect";

export function AddWorkerToProjectPage() {
  const { idProject } = useParams(); // Obtiene id_proyecto de la URL (si aplica)
  const navigate = useNavigate();

  const [listWorkers, setListWorkers] = useState([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Obtener la lista del personal activo
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const list = await getListWorkersDB();
        // Filtrar solo trabajadores activos
        const activos = (list || []).filter((w) => w.activo === true);
        setListWorkers(activos);
      } catch (error) {
        console.error("Error al obtener la lista de trabajadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Filtrado por buscador (Nombre o Documento)
  const filteredWorkers = useMemo(() => {
    return listWorkers.filter((worker) => {
      const fullName = `${worker.nombre || ""} ${worker.apellido_paterno || ""} ${
        worker.apellido_materno || ""
      }`.toLowerCase();
      const nroDoc = worker.nro_doc || "";
      const term = searchTerm.toLowerCase();

      return fullName.includes(term) || nroDoc.includes(term);
    });
  }, [listWorkers, searchTerm]);

  // Manejar checkbox individual
  const handleToggleWorker = (id) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Manejar Selección Global (Todos / Ninguno)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredWorkers.map((w) => w.id);
      setSelectedWorkerIds(Array.from(new Set([...selectedWorkerIds, ...allIds])));
    } else {
      const filteredIds = new Set(filteredWorkers.map((w) => w.id));
      setSelectedWorkerIds(selectedWorkerIds.filter((id) => !filteredIds.has(id)));
    }
  };

  // Lista de objetos de los trabajadores seleccionados (para mostrar en el resumen)
  const selectedWorkersList = useMemo(() => {
    return listWorkers.filter((w) => selectedWorkerIds.includes(w.id));
  }, [listWorkers, selectedWorkerIds]);

  // Guardar asignación y generar JSON para la BD
  const handleSaveAssignment = async () => {
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const payload = selectedWorkerIds.map((idEmpleado) => ({
      id_empleado: idEmpleado,
      id_proyecto: idProject || "ID_PROYECTO_EJEMPLO", // Toma idProject de los params
      fecha_registro: currentDate,
    }));

    await saveWorkerToProyectDB(payload)
    navigate(-1)
  };

  const isAllFilteredSelected =
    filteredWorkers.length > 0 &&
    filteredWorkers.every((w) => selectedWorkerIds.includes(w.id));

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Cabecera de la Página */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <Button
            variant="link"
            className="p-0 text-decoration-none text-muted mb-1 d-inline-flex align-items-center gap-1"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Volver al proyecto</span>
          </Button>
          <h2 className="fw-bold text-dark mb-0">Asignar Personal al Proyecto</h2>
          <p className="text-muted mb-0">
            Selecciona el personal activo que formará parte de este proyecto.
          </p>
        </div>

        {/* Botón de Guardar superior en responsive */}
        <Button
          variant="primary"
          size="lg"
          className="d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm"
          onClick={handleSaveAssignment}
          disabled={loading || selectedWorkerIds.length === 0}
        >
          <i className="bi bi-check-circle-fill"></i>
          <span>Guardar Asignación ({selectedWorkerIds.length})</span>
        </Button>
      </div>

      <Row className="g-4">
        {/* Columna Izquierda: Tabla de Selección de Personal */}
        <Col lg={7} xl={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {/* Buscador y herramientas */}
              <div className="p-3 border-bottom d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-sm-center">
                <InputGroup style={{ maxWidth: "360px" }}>
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

                <div className="text-muted small">
                  Mostrando <strong>{filteredWorkers.length}</strong> de{" "}
                  <strong>{listWorkers.length}</strong> activos
                </div>
              </div>

              {/* Estado de Carga */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-2 mb-0">Cargando personal activo...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="bg-light text-muted small text-uppercase">
                      <tr>
                        <th className="ps-4" style={{ width: "50px" }}>
                          <Form.Check
                            type="checkbox"
                            checked={isAllFilteredSelected}
                            onChange={handleSelectAll}
                            title="Seleccionar todos los visibles"
                          />
                        </th>
                        <th>Trabajador</th>
                        <th>Documento</th>
                        <th>Puesto / Cargo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.length > 0 ? (
                        filteredWorkers.map((worker) => {
                          const isSelected = selectedWorkerIds.includes(worker.id);
                          const firstName = worker.nombre?.trim().split(" ")[0] || "";
                          const fullName = `${SetCapitalLetter(
                            firstName
                          )} ${SetCapitalLetter(worker.apellido_paterno || "")}`;

                          return (
                            <tr
                              key={worker.id}
                              className={isSelected ? "table-primary-subtle" : ""}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleToggleWorker(worker.id)}
                            >
                              <td
                                className="ps-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Form.Check
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleWorker(worker.id)}
                                />
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center text-uppercase"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {worker.nombre?.charAt(0)}
                                    {worker.apellido_paterno?.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark">
                                      {fullName}
                                    </div>
                                    <small className="text-muted text-capitalize">
                                      {worker.tipo_contrata || "Sin contrata"}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="fw-medium text-dark">
                                  {worker.nro_doc}
                                </div>
                                <small className="text-muted text-uppercase">
                                  {worker.tipo_doc}
                                </small>
                              </td>
                              <td>
                                <span className="fw-medium text-dark text-capitalize">
                                  {worker.tipo_trabajo || "No asignado"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-5 text-muted">
                            <i className="bi bi-person-x fs-1 d-block mb-2 text-muted opacity-50"></i>
                            No se encontraron colaboradores activos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Panel de Personal Asignado */}
        <Col lg={5} xl={4}>
          <Card className="border-0 shadow-sm sticky-lg-top" style={{ top: "90px" }}>
            <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">Personal a Asignar</h5>
              <Badge bg="primary" pill className="px-3 py-2 fs-6">
                {selectedWorkerIds.length}
              </Badge>
            </Card.Header>

            <Card.Body className="p-0">
              {selectedWorkersList.length > 0 ? (
                <div
                  className="p-3 d-flex flex-column gap-2 overflow-auto"
                  style={{ maxHeight: "420px" }}
                >
                  {selectedWorkersList.map((worker) => {
                    const firstName = worker.nombre?.trim().split(" ")[0] || "";
                    const fullName = `${SetCapitalLetter(
                      firstName
                    )} ${SetCapitalLetter(worker.apellido_paterno || "")}`;

                    return (
                      <div
                        key={worker.id}
                        className="d-flex align-items-center justify-content-between p-2 rounded border bg-light"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center text-uppercase small"
                            style={{ width: "32px", height: "32px" }}
                          >
                            {worker.nombre?.charAt(0)}
                            {worker.apellido_paterno?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-medium text-dark small">
                              {fullName}
                            </div>
                            <small className="text-muted text-capitalize d-block" style={{ fontSize: "0.75rem" }}>
                              {worker.tipo_trabajo || "Sin cargo"}
                            </small>
                          </div>
                        </div>

                        <Button
                          variant="light"
                          size="sm"
                          className="text-danger border-0 rounded-circle p-1"
                          onClick={() => handleToggleWorker(worker.id)}
                          title="Quitar"
                        >
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 px-3 text-muted">
                  <i className="bi bi-person-plus fs-1 d-block mb-2 opacity-50"></i>
                  <p className="mb-0 small">
                    Marca las casillas de la tabla para agregar colaboradores a este proyecto.
                  </p>
                </div>
              )}
            </Card.Body>

            <Card.Footer className="bg-white border-top p-3">
              <Button
                variant="primary"
                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={handleSaveAssignment}
                disabled={loading || selectedWorkerIds.length === 0}
              >
                <i className="bi bi-save"></i>
                <span>Confirmar y Guardar</span>
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}