import { useEffect, useState, useMemo } from "react";
import { 
  Button, 
  Col, 
  Container, 
  Form, 
  InputGroup, 
  Row, 
  Spinner, 
  Table, 
  Badge, 
  Card,
  Modal 
} from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Funciones
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects";
import { deleteProjectDB } from "../../querysDB/projects/deleteProject";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

const HEAD_TABLE = ["Proyecto", "Tipo", "Descripción", "Fecha Final", "Días Restantes", "Monto Ofertado", "Acciones"];

function diasRestantes(fechaFin) {
  if (!fechaFin) return 0;
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diferencia = fin - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value ?? 0);
}

export function AllProjects() {
  const [listProjects, setListProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateProjectValue, setStateProjectValue] = useState("pendiente");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async (estado) => {
    try {
      setLoading(true);
      const { idEmpresa } = await GetUserNameAndNameCompany();
      const data = await GetAllListProjects(estado, idEmpresa);
      setListProjects(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al obtener proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(stateProjectValue);
  }, [stateProjectValue]);

  const updateStateProject = (e) => {
    setStateProjectValue(e.target.value);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedProjectId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!selectedProjectId) return;
    try {
      setDeleting(true);
      await deleteProjectDB(selectedProjectId);
      toast.success("Proyecto eliminado correctamente");
      setShowDeleteModal(false);
      fetchProjects(stateProjectValue);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el proyecto");
    } finally {
      setDeleting(false);
      setSelectedProjectId(null);
    }
  };

  // Filtro en tiempo real por término de búsqueda
  const filteredProjects = useMemo(() => {
    return listProjects.filter(
      (p) =>
        p.nombre_proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion_proyecto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [listProjects, searchTerm]);

  // Métricas rápidas
  const totalProjects = filteredProjects.length;
  const riskProjects = listProjects.filter(
    (p) => diasRestantes(p.fecha_fin) <= 3 && p.estado === "pendiente"
  ).length;

  return (
    <Container className="py-4">
      {/* Cabecera y Métricas */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col md={5}>
              <h4 className="mb-1 fw-bold text-dark">Proyectos</h4>
              <div className="d-flex gap-2 align-items-center">
                <Badge bg="primary" className="fw-normal">
                  Total: {totalProjects}
                </Badge>
                {stateProjectValue === "pendiente" && riskProjects > 0 && (
                  <Badge bg="danger" className="fw-normal">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    En riesgo: {riskProjects}
                  </Badge>
                )}
              </div>
            </Col>

            {/* Buscador y Filtro de Estado */}
            <Col md={4}>
              <Form.Control
                type="search"
                placeholder="🔍 Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <InputGroup>
                <InputGroup.Text className="bg-light text-secondary border-end-0">
                  <i className="bi bi-funnel"></i>
                </InputGroup.Text>
                <Form.Select
                  className="border-start-0"
                  onChange={updateStateProject}
                  value={stateProjectValue}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="entregado">Entregado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="pagado">Pagado</option>
                  <option value="paralizado">Paralizado</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla Principal */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                {HEAD_TABLE.map((e) => (
                  <th key={e} className="text-secondary small fw-bold py-3">
                    {e}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="d-flex flex-column align-items-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" />
                      <small className="text-muted mt-2">Cargando proyectos...</small>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
                      <p className="mb-0 fw-medium">No hay proyectos para mostrar</p>
                      <small>Intenta cambiar el estado seleccionado o ajusta la búsqueda.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((e) => {
                  const dias = diasRestantes(e.fecha_fin);

                  return (
                    <tr key={e.id}>
                      <td className="fw-semibold text-dark">{e.nombre_proyecto}</td>

                      <td>
                        <Badge bg="secondary" className="fw-normal">
                          {SetCapitalLetter(e.tipo)}
                        </Badge>
                      </td>

                      <td className="text-start text-muted small" style={{ maxWidth: "250px" }}>
                        <div className="text-truncate">
                          {SetCapitalLetter(e.descripcion_proyecto)}
                        </div>
                      </td>

                      <td className="text-nowrap small">{e.fecha_fin}</td>

                      {/* Lógica de estado dinámico para Badges de Fecha */}
                      <td>
                        {e.estado === "finalizado" ? (
                          <Badge bg="light" className="text-secondary border">
                            Completado
                          </Badge>
                        ) : e.estado === "paralizado" ? (
                          <Badge bg="secondary">Detenido ({dias} d)</Badge>
                        ) : (
                          <Badge
                            bg={
                              dias <= 3
                                ? "danger"
                                : dias <= 7
                                ? "warning"
                                : "success"
                            }
                            className={dias <= 7 && dias > 3 ? "text-dark" : ""}
                          >
                            {dias} días
                          </Badge>
                        )}
                      </td>

                      <td className="fw-semibold text-dark">
                        {formatCurrency(e.monto_ofertado)}
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            className="btn btn-sm btn-outline-primary"
                            to={`/rf/proyecto/${e.id}`}
                            title="Ver detalle del proyecto"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </Link>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(e.id)}
                            title="Eliminar proyecto"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Confirmación de Borrado */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-6 fw-bold">Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted small py-3">
          ¿Estás seguro de eliminar este proyecto definitivamente? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDeleteProject} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" /> : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}