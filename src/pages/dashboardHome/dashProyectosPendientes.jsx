import { useEffect, useState, useMemo } from "react";
import { Table, Row, Col, Spinner, Badge, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

// Funciones
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

// Helper para formato de moneda (Soles Peruanos)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount || 0);
};

// Asignación de colores por estado
const getStatusBadgeBg = (estado, esActivo) => {
  if (!esActivo) return "light text-dark border";
  
  switch (estado) {
    case "pendiente": return "warning text-dark";
    case "paralizado": return "danger";
    case "entregado": return "info";
    case "pagado": return "success";
    case "finalizado": return "dark";
    default: return "primary";
  }
};

export function ProyectosPendientes() {
  const [allProjects, setAllProjects] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("pendiente");
  const [loading, setLoading] = useState(false);

  const estadosDisponibles = [
    "todos",
    "pendiente",
    "paralizado",
    "entregado",
    "pagado",
    "finalizado",
  ];

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const res = await GetAllListProjects();
      setAllProjects(res || []);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Calcula el conteo global por cada estado de forma reactiva
  const contadoresGlobales = useMemo(() => {
    const counts = { todos: allProjects.length };
    
    estadosDisponibles.forEach((estado) => {
      if (estado !== "todos") {
        counts[estado] = allProjects.filter(
          (p) => p.estado?.toLowerCase() === estado
        ).length;
      }
    });

    return counts;
  }, [allProjects]);

  // 2. Filtra la lista según el estado seleccionado
  const proyectosFiltrados = useMemo(() => {
    if (estadoSeleccionado === "todos") return allProjects;
    return allProjects.filter(
      (p) => p.estado?.toLowerCase() === estadoSeleccionado
    );
  }, [allProjects, estadoSeleccionado]);

  return (
    <div className="py-2">
      {/* Cabecera */}
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <h2 className="fs-4 fw-bold mb-0 text-capitalize text-dark">
            Proyectos: <span className="text-primary">{estadoSeleccionado}s</span>
          </h2>
        </Col>
      </Row>

      {/* Resumen Global de Estados (Filtros en Badges) */}
      <div className="d-flex flex-wrap align-items-center gap-2 p-3 mb-4 bg-white border rounded shadow-sm">
        <span className="fw-semibold text-secondary me-2 small">
          <i className="bi bi-funnel-fill me-1"></i> Filtrar por estado:
        </span>
        {estadosDisponibles.map((estado) => {
          const total = contadoresGlobales[estado] || 0;
          const esActivo = estadoSeleccionado === estado;

          return (
            <Badge
              key={estado}
              bg={getStatusBadgeBg(estado, esActivo)}
              className="px-3 py-2 fs-6 fw-normal cursor-pointer shadow-sm"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => setEstadoSeleccionado(estado)}
            >
              {SetCapitalLetter(estado)}: <strong>{total}</strong>
            </Badge>
          );
        })}
      </div>

      {/* Contenedor Principal de la Tabla */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light border-bottom">
                <tr>
                  <th className="text-secondary small fw-bold py-3 ps-3">Proyecto</th>
                  <th className="text-secondary small fw-bold py-3">Descripción</th>
                  <th className="text-secondary small fw-bold py-3 text-center text-nowrap">Fecha Inicio</th>
                  <th className="text-secondary small fw-bold py-3 text-center text-nowrap">Fecha Final</th>
                  <th className="text-secondary small fw-bold py-3 text-center">Tipo</th>
                  <th className="text-secondary small fw-bold py-3 text-end text-nowrap">Monto</th>
                  <th className="text-secondary small fw-bold py-3 text-center pe-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                      <span className="text-muted small">Cargando lista de proyectos...</span>
                    </td>
                  </tr>
                ) : proyectosFiltrados.length > 0 ? (
                  proyectosFiltrados.map((e) => (
                    <tr key={e.id}>
                      {/* Nombre Proyecto */}
                      <td className="ps-3 fw-semibold text-dark text-nowrap">
                        {e.nombre_proyecto}
                      </td>

                      {/* Descripción */}
                      <td style={{ maxWidth: "300px" }}>
                        <div className="text-muted small text-truncate" title={e.descripcion_proyecto}>
                          {SetCapitalLetter(e.descripcion_proyecto)}
                        </div>
                      </td>

                      {/* Fechas */}
                      <td className="text-center text-nowrap small text-secondary">
                        {e.fecha_inicio}
                      </td>
                      <td className="text-center text-nowrap small text-secondary">
                        {e.fecha_fin}
                      </td>

                      {/* Tipo */}
                      <td className="text-center text-nowrap">
                        <Badge bg="light" className="text-dark border fw-normal">
                          {SetCapitalLetter(e.tipo)}
                        </Badge>
                      </td>

                      {/* Monto */}
                      <td className="text-end text-nowrap fw-semibold text-dark">
                        {formatCurrency(e.monto_ofertado)}
                      </td>

                      {/* Botón Acción */}
                      <td className="text-center pe-3">
                        <Link
                          className="btn btn-sm btn-outline-primary"
                          to={`/rf/proyecto/${e.id}`}
                          title="Ver detalle del proyecto"
                        >
                          <i className="bi bi-eye-fill"></i>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-folder-x fs-2 d-block mb-2 text-secondary"></i>
                      <span>
                        No hay proyectos registrados con el estado "<strong>{estadoSeleccionado}</strong>".
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}