import { useEffect, useState } from "react"
import { Table, Form, Row, Col, Spinner } from "react-bootstrap"
import { Link } from "react-router-dom"

// Funciones
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany"
import { GetAllListProjects } from "../../querysDB/projects/getAllProjects"
import { SetCapitalLetter } from "../../utils/setCapitalLetterString"

export function ProyectosPendientes() {
  const [listProjects, setListProjects] = useState([])
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("pendiente")
  // Estado para controlar la animación de carga
  const [loading, setLoading] = useState(false)

  const estadosDisponibles = [
    "pendiente",
    "paralizado",
    "entregado",
    "pagado",
    "finalizado",
  ]

  useEffect(() => {
    getAllProjects()
  }, [estadoSeleccionado])

  const getAllProjects = async () => {
    setLoading(true) // 1. Activa el spinner antes de llamar a la DB
    try {
      const resOne = await GetUserNameAndNameCompany()
      const resTwo = await GetAllListProjects(
        estadoSeleccionado,
        resOne.idEmpresa
      )
      setListProjects(resTwo || [])
    } catch (error) {
      console.error("Error al obtener los proyectos:", error)
    } finally {
      setLoading(false) // 2. Desactiva el spinner cuando termina de cargar
    }
  }

  return (
    <>
      {/* Cabecera con selector de estados */}
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <p className="fs-4 fw-bold mb-0 text-capitalize">
            Proyectos: <span className="text-primary">{estadoSeleccionado}s</span>
          </p>
        </Col>
        <Col md={6} className="d-flex justify-content-md-end mt-2 mt-md-0">
          <Form.Group className="d-flex align-items-center gap-2">
            <Form.Label className="mb-0 fw-semibold text-nowrap">
              Filtrar por estado:
            </Form.Label>
            <Form.Select
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              className="w-auto fw-semibold"
              disabled={loading} // Opcional: deshabilita el select mientras carga
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {SetCapitalLetter(estado)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

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
            /* Mostrar Spinner mientras carga */
            <tr>
              <td colSpan="7" className="py-5">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-2 mb-0 text-muted fw-semibold fs-6">
                  Cargando proyectos...
                </p>
              </td>
            </tr>
          ) : listProjects.length > 0 ? (
            /* Mostrar lista de proyectos */
            listProjects.map((e) => (
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
            /* Mensaje cuando no hay registros */
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