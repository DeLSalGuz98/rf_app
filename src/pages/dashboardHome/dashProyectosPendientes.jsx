import { useEffect, useState, useMemo } from "react"
import { Table, Form, Row, Col, Spinner, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"

// Funciones
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany"
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects" // Ajustar para traer todos los proyectos o pasar estado = null / 'todos'
import { SetCapitalLetter } from "../../utils/setCapitalLetterString"

export function ProyectosPendientes() {
  const [allProjects, setAllProjects] = useState([])
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("pendiente")
  const [loading, setLoading] = useState(false)

  const estadosDisponibles = [
    "pendiente",
    "paralizado",
    "entregado",
    "pagado",
    "finalizado",
  ]

  useEffect(() => {
    fetchAllProjects()
  }, [])

  const fetchAllProjects = async () => {
    setLoading(true)
    try {
      const res = await GetAllListProjects()
      setAllProjects(res || [])
    } catch (error) {
      console.error("Error al obtener los proyectos:", error)
    } finally {
      setLoading(false)
    }
  }

  // 1. Calcula el conteo global por cada estado de forma reactiva
  const contadoresGlobales = useMemo(() => {
    return estadosDisponibles.reduce((acc, estado) => {
      acc[estado] = allProjects.filter((p) => p.estado?.toLowerCase() === estado).length
      return acc
    }, {})
  }, [allProjects])

  // 2. Filtra la lista según el estado seleccionado en el dropdown
  const proyectosFiltrados = useMemo(() => {
    if (estadoSeleccionado === "todos") return allProjects
    return allProjects.filter((p) => p.estado?.toLowerCase() === estadoSeleccionado)
  }, [allProjects, estadoSeleccionado])

  return (
    <>
      {/* Cabecera con selector de estados */}
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <p className="fs-4 fw-bold mb-0 text-capitalize">
            Proyectos: <span className="text-primary">{estadoSeleccionado}s</span>
          </p>
        </Col>
      </Row>
      {/* Resumen Global de Estados */}
      <div className="d-flex flex-wrap align-items-center gap-2 p-3 mb-4 bg-light border rounded shadow-sm">
        <span className="fw-bold text-secondary me-2">
          <i className="bi bi-bar-chart-fill me-1"></i> Resumen Global:
        </span>
        {estadosDisponibles.map((estado) => {
          const total = contadoresGlobales[estado] || 0
          const esActivo = estadoSeleccionado === estado

          return (
            <Badge
              key={estado}
              bg={esActivo ? "primary" : "secondary"}
              className="px-3 py-2 fs-6 fw-normal cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() => setEstadoSeleccionado(estado)}
            >
              {SetCapitalLetter(estado)}: <strong>{total}</strong>
            </Badge>
          )
        })}
      </div>

      {/* Tabla de Proyectos */}
      <Table hover className="align-middle text-center border position-relative">
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Descripción</th>
            <th className="text-nowrap">Fecha Inicio</th>
            <th className="text-nowrap">Fecha Final</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="py-5">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-2 mb-0 text-muted fw-semibold fs-6">
                  Cargando proyectos...
                </p>
              </td>
            </tr>
          ) : proyectosFiltrados.length > 0 ? (
            proyectosFiltrados.map((e) => (
              <tr key={e.id}>
                <td className="text-nowrap fw-semibold">{e.nombre_proyecto}</td>
                <td>{SetCapitalLetter(e.descripcion_proyecto)}</td>
                <td>{e.fecha_inicio}</td>
                <td>{e.fecha_fin}</td>
                <td className="text-nowrap">{e.tipo}</td>
                <td className="text-nowrap fw-bold">
                  S/. {Number(e.monto_ofertado || 0).toFixed(2)}
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    <Link
                      className="btn btn-primary fs-5"
                      to={`/rf/proyecto/${e.id}`}
                    >
                      <i className="bi bi-box-arrow-in-up-right"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-muted py-4">
                No hay proyectos registrados con el estado "
                <strong>{estadoSeleccionado}</strong>".
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  )
}