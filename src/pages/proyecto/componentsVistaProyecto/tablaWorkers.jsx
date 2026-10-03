import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, InputGroup, Form, Spinner } from "react-bootstrap";
import { getListWorkersProjectDB } from "../../../querysDB/workers/getListWorkersProject";
import { SetCapitalLetter } from "../../../utils/setCapitalLetterString";

export function TableWorkersProject({ idProject }) {
  const navigate = useNavigate();

  const [workersProject, setWorkersProject] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idProject) {
      fetchWorkers();
    }
  }, [idProject]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await getListWorkersProjectDB(idProject);
      setWorkersProject(res || []);
    } catch (error) {
      console.error("Error al cargar trabajadores del proyecto:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {/* Estado de Carga o Tabla de Resultados */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted small mt-2 mb-0">Cargando trabajadores...</p>
        </div>
      ) : workersProject.length > 0 ? (
        <div className="table-responsive">
          <Table hover align="middle" className="mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Trabajador</th>
                <th>Documento</th>
                <th>Puesto / Cargo</th>
                <th>Tipo Contrata</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {workersProject.map((item) => {
                const emp = item.empleado;
                if (!emp) return null;

                const firstName = emp.nombre?.trim().split(" ")[0] || "";
                const fullName = `${SetCapitalLetter(firstName)} ${SetCapitalLetter(
                  emp.apellido_paterno || ""
                )} ${SetCapitalLetter(emp.apellido_materno || "")}`.trim();

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold text-dark">{fullName}</div>
                      <small className="text-muted d-block">{emp.email || emp.telf || "Sin contacto"}</small>
                    </td>
                    <td>
                      <div className="fw-medium text-uppercase">{emp.tipo_doc}: {emp.nro_doc}</div>
                    </td>
                    <td>
                      <span className="text-capitalize">{emp.tipo_trabajo || "Sin asignar"}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          emp.tipo_contrata === "permanente"
                            ? "bg-primary-subtle text-primary border border-primary-subtle"
                            : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                        } text-capitalize`}
                      >
                        {emp.tipo_contrata || "Parcial"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {/* Botón 1: Ver Perfil */}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => navigate(`/rf/vista-trabajador/${emp.id}`)}
                          title="Ver perfil completo"
                        >
                          <i className="bi bi-person"></i>
                          <span>Perfil</span>
                        </Button>

                        {/* TODO: Botón 2: Registrar Pago */}
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="d-flex align-items-center gap-1"
                          onClick={() => navigate(`/rf/registrar-gastos?empleadoId=${emp.id}&proyectoId=${idProject}`)}
                          title="Registrar pago a este trabajador"
                        >
                          <i className="bi bi-cash"></i>
                          <span>Pago</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
          <p className="mb-0">No se encontraron trabajadores asignados a este proyecto.</p>
        </div>
      )}
    </div>
  );
}