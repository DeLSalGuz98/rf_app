import { Button, Col, Container, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Funciones
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects";
import { deleteProjectDB } from "../../querysDB/projects/deleteProject";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

const headTable = ["Proyecto","Tipo","Descripción","Fecha Final","Días Restantes","Monto Ofertado","Acciones"];

function diasRestantes(fechaFin) {
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
  }).format(value);
}

export function AllProjects() {
  const [listProjects, setListProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateProjectValue, setStateProjectValue] = useState("pendiente");

  const fetchProjects = async (estado) => {
    try {
      setLoading(true);

      const { idEmpresa } = await GetUserNameAndNameCompany();
      const data = await GetAllListProjects(estado, idEmpresa);

      if (data.length === 0) {
        toast.warning("La lista está vacía");
      }

      setListProjects(data);

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

  const deleteProject = async (id) => {
    if (!window.confirm("Se eliminará el proyecto definitivamente")) return;

    try {
      await deleteProjectDB(id);
      toast.success("Proyecto eliminado");
      fetchProjects(stateProjectValue);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  const totalProjects = listProjects.length;
  const riskProjects = listProjects.filter(
    (p) => diasRestantes(p.fecha_fin) <= 3 && p.estado === "pendiente"
  ).length;

  return (
    <Container>

      {/* Cabecera */}
      <Row className="mb-3">
        <Col>
          <h4 className="mb-0">Proyectos</h4>
          <small className="text-muted">
            Total: {totalProjects} | En riesgo: {riskProjects}
          </small>
        </Col>
      </Row>

      {/* Filtro */}
      <Row className="mb-2">
        <Col md="3">
          <InputGroup className="mb-3">
            <InputGroup.Text>Estado</InputGroup.Text>
            <Form.Select onChange={updateStateProject} value={stateProjectValue}>
              <option value="pendiente">Pendiente</option>
              <option value="paralizado">Paralizado</option>
              <option value="finalizado">Finalizado</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Tabla nativa */}
      <Table striped bordered hover responsive>
        <thead className="table-ligth">
          <tr>
            {headTable.map((e) => <th key={e}>{e}</th>)}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>
                <div className="d-flex flex-column align-items-center py-3">
                  <Spinner />
                  <small className="text-muted mt-2">Cargando proyectos...</small>
                </div>
              </td>
            </tr>
          ) : listProjects.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                <div className="text-muted">
                  <i className="bi bi-folder-x" style={{ fontSize: "2rem" }}></i>
                  <p className="mt-2">No hay proyectos en este estado</p>
                </div>
              </td>
            </tr>
          ) : (
            listProjects.map((e) => {
              const dias = diasRestantes(e.fecha_fin);

              return (
                <tr key={e.id}>
                  <td>{e.nombre_proyecto}</td>

                  <td>
                    <span className="badge bg-secondary">
                      {SetCapitalLetter(e.tipo)}
                    </span>
                  </td>

                  <td className="text-start">
                    {SetCapitalLetter(e.descripcion_proyecto)}
                  </td>

                  <td className="text-nowrap">{e.fecha_fin}</td>

                  <td>
                    <span className={
                      dias <= 3 && e.estado === "pendiente"
                        ? "badge bg-danger"
                        : dias <= 7
                        ? "badge bg-warning text-dark"
                        : "badge bg-success"
                    }>
                      {dias} días
                    </span>
                  </td>

                  <td>{formatCurrency(e.monto_ofertado)}</td>

                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        className="btn btn-outline-primary btn-sm"
                        to={`/rf/proyecto/${e.id}`}
                      >
                        Ver
                      </Link>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteProject(e.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </Container>
  );
}