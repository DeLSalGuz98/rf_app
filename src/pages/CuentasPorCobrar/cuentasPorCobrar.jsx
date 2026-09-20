import { useEffect, useState, useMemo } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Form, 
  Button, 
  Badge, 
  InputGroup,
  Spinner 
} from 'react-bootstrap';
import { getCuentasPorCobrarDataDB } from '../../querysDB/cuentasPorCobrar/getInfoCuentas';
import { Link } from 'react-router-dom';

export function CuentasPorCobrar() {
  const [proyectosData, setProyectosData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [proyectoFilter, setProyectoFilter] = useState('');

  useEffect(() => {
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      setLoading(true);
      const res = await getCuentasPorCobrarDataDB();

      if (Array.isArray(res)) {
        setProyectosData(res);
      } else if (res) {
        setProyectosData([res]);
      } else {
        setProyectosData([]);
      }
    } catch (error) {
      console.error("Error al obtener cuentas por cobrar:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Aplanar las facturas para iterar y calcular sobre los documentos tributarios individuales
  const todasLasFacturas = useMemo(() => {
    return proyectosData.flatMap((grupoProyecto) => {
      const facturas = grupoProyecto.facturas || [];
      return facturas.map((factura) => ({
        ...factura,
        // Asignamos datos de respaldo del grupo superior por si la factura no los incluye directamente
        idProyecto: factura.idProyecto || grupoProyecto.idProyecto,
        proyecto: factura.proyecto || grupoProyecto.proyecto || 'Sin Proyecto Asignado',
      }));
    });
  }, [proyectosData]);

  // 2. Obtener lista de proyectos únicos para el selector de filtro
  const proyectosUnicos = useMemo(() => {
    const map = new Map();
    proyectosData.forEach((item) => {
      const key = item.idProyecto || 'SIN_PROYECTO';
      const nombre = item.proyecto || 'Sin Proyecto Asignado';
      if (!map.has(key)) {
        map.set(key, { id: item.idProyecto, nombre });
      }
    });
    return Array.from(map.values());
  }, [proyectosData]);

  // 3. Filtrado dinámico sobre el total de facturas
  const facturasFiltradas = useMemo(() => {
    return todasLasFacturas.filter((item) => {
      const matchSearch =
        (item.cliente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.ruc?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.documento?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.proyecto?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchEstado = estadoFilter ? item.estado === estadoFilter : true;
      
      let matchProyecto = true;
      if (proyectoFilter) {
        if (proyectoFilter === 'null' || proyectoFilter === 'SIN_PROYECTO') {
          matchProyecto = item.idProyecto === null || item.idProyecto === undefined;
        } else {
          matchProyecto = item.idProyecto === proyectoFilter;
        }
      }

      return matchSearch && matchEstado && matchProyecto;
    });
  }, [todasLasFacturas, searchTerm, estadoFilter, proyectoFilter]);

  // 4. Cálculos de resumen rápidos (KPIs) sobre todas las facturas
  const kpis = useMemo(() => {
    return todasLasFacturas.reduce(
      (acc, item) => {
        const saldo = Number(item.saldo) || 0;
        const cobrado = Number(item.cobrado) || 0;
        const estado = item.estado || '';

        acc.totalPendiente += saldo;
        acc.totalCobrado += cobrado;

        if (estado === 'POR VENCER' || estado === 'POR_VENCER') {
          acc.porVencer += saldo;
          acc.cantPorVencer += 1;
        } else if (estado === 'VENCIDO') {
          acc.vencido += saldo;
          acc.cantVencido += 1;
        }

        return acc;
      },
      {
        totalPendiente: 0,
        porVencer: 0,
        cantPorVencer: 0,
        vencido: 0,
        cantVencido: 0,
        totalCobrado: 0,
      }
    );
  }, [todasLasFacturas]);

  // Formateador de moneda
  const formatCurrency = (amount) => {
    return `S/ ${(amount || 0).toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* Encabezado */}
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <h2 className="fw-bold text-dark mb-1">Cuentas por Cobrar</h2>
          <p className="text-muted mb-0 small">
            Gestión de saldos pendientes, vencimientos y registro de cobros.
          </p>
        </Col>
      </Row>

      {/* Cards de Resumen Rápido (KPIs Dinámicos) */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <span className="text-uppercase text-muted fw-semibold small">
                Total Pendiente
              </span>
              <h3 className="fw-bold text-dark mt-2 mb-1">
                {formatCurrency(kpis.totalPendiente)}
              </h3>
              <small className="text-muted">Saldo global por cobrar</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <span className="text-uppercase text-warning fw-semibold small">
                Por Vencer (&lt; 7 días)
              </span>
              <h3 className="fw-bold text-warning mt-2 mb-1">
                {formatCurrency(kpis.porVencer)}
              </h3>
              <small className="text-warning">
                {kpis.cantPorVencer} documento(s) próximo(s)
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <span className="text-uppercase text-danger fw-semibold small">
                Vencido
              </span>
              <h3 className="fw-bold text-danger mt-2 mb-1">
                {formatCurrency(kpis.vencido)}
              </h3>
              <small className="text-danger">
                {kpis.cantVencido} documento(s) con mora
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <span className="text-uppercase text-success fw-semibold small">
                Total Cobrado
              </span>
              <h3 className="fw-bold text-success mt-2 mb-1">
                {formatCurrency(kpis.totalCobrado)}
              </h3>
              <small className="text-success">Total recaudado acumulado</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y Búsqueda */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6} lg={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por cliente, RUC, documento o proyecto..."
                  className="border-start-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3} lg={3}>
              <Form.Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="POR VENCER">Por Vencer</option>
                <option value="VENCIDO">Vencido</option>
                <option value="PAGADO">Pagado</option>
              </Form.Select>
            </Col>
            <Col md={3} lg={3}>
              <Form.Select
                value={proyectoFilter}
                onChange={(e) => setProyectoFilter(e.target.value)}
              >
                <option value="">Todos los Proyectos</option>
                {proyectosUnicos.map((p) => (
                  <option key={p.id || 'SIN_PROYECTO'} value={p.id || 'SIN_PROYECTO'}>
                    {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla Principal */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <Table hover align="middle" className="mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-muted">
              <tr>
                <th>Proyecto</th>
                <th>Cliente / Entidad</th>
                <th>RUC</th>
                <th>Documento</th>
                <th className="text-end">Monto Factura</th>
                <th className="text-center">Emisión</th>
                <th className="text-center">Vencimiento</th>
                <th className="text-end">Cobrado</th>
                <th className="text-end">Saldo</th>
                <th className="text-center">Días Atraso</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center py-5">
                    <Spinner
                      animation="border"
                      variant="primary"
                      role="status"
                      className="me-2"
                    />
                    <span>Cargando cuentas por cobrar...</span>
                  </td>
                </tr>
              ) : facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-5 text-muted">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((item) => (
                  <tr key={item.idDocumentoTributario || item.documento}>
                    {/* Proyecto */}
                    <td
                      className="fw-semibold text-dark text-truncate"
                      style={{ maxWidth: '200px' }}
                    >
                      {item.proyecto}
                    </td>

                    {/* Cliente / Entidad */}
                    <td>{item.cliente || '-'}</td>

                    {/* RUC */}
                    <td className="font-monospace text-muted small">
                      {item.ruc || '-'}
                    </td>

                    {/* Documento */}
                    <td className="fw-bold text-primary">{item.documento}</td>

                    {/* Monto Original */}
                    <td className="text-end fw-medium">
                      {formatCurrency(item.montoOriginal)}
                    </td>

                    {/* Fecha Emisión */}
                    <td className="text-center text-muted small">
                      {item.fechaEmision}
                    </td>

                    {/* Fecha Vencimiento */}
                    <td className="text-center text-muted small">
                      {item.fechaVencimiento}
                    </td>

                    {/* Cobrado */}
                    <td className="text-end text-success fw-medium">
                      {formatCurrency(item.cobrado)}
                    </td>

                    {/* Saldo */}
                    <td className="text-end fw-bold text-dark">
                      {formatCurrency(item.saldo)}
                    </td>

                    {/* Días de Atraso */}
                    <td className="text-center">
                      {item.diasAtraso > 0 ? (
                        <Badge bg="danger" pill className="px-2 py-1">
                          <i className="bi bi-clock me-1"></i>
                          {item.diasAtraso} días
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="text-center">
                      {item.estado === 'VENCIDO' && (
                        <Badge
                          bg="danger"
                          className="bg-opacity-10 text-danger border border-danger px-2.5 py-1.5 rounded-pill"
                        >
                          <i className="bi bi-exclamation-circle me-1"></i>
                          Vencido
                        </Badge>
                      )}
                      {(item.estado === 'POR VENCER' ||
                        item.estado === 'POR_VENCER') && (
                        <Badge
                          bg="warning"
                          className="bg-opacity-10 text-warning border border-warning px-2.5 py-1.5 rounded-pill"
                        >
                          <i className="bi bi-clock-history me-1"></i>
                          Por Vencer
                        </Badge>
                      )}
                      {item.estado === 'PAGADO' && (
                        <Badge
                          bg="success"
                          className="bg-opacity-10 text-success border border-success px-2.5 py-1.5 rounded-pill"
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Pagado
                        </Badge>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td className="text-center pe-3">
                      <div className="d-flex justify-content-center gap-1">
                        <Link
                          to={`/rf/proyecto/${item.idProyecto}`}
                          className={`btn btn-sm ${
                            item.idProyecto
                              ? 'btn-outline-primary'
                              : 'btn-outline-secondary disabled'
                          }`}
                          title={
                            item.idProyecto
                              ? 'Ver detalle del proyecto'
                              : 'Sin proyecto asociado'
                          }
                          style={
                            !item.idProyecto
                              ? {
                                  pointerEvents: 'none',
                                  opacity: 0.5,
                                  cursor: 'default',
                                }
                              : {}
                          }
                        >
                          <i className="bi bi-eye-fill"></i>
                        </Link>
                        <Link
                          to={`/rf/editar-documento/${item.idDocumentoTributario}`}
                          className="btn btn-sm btn-success"
                          title="Registrar cobro de factura"
                        >
                          <i className="bi bi-cash-coin me-1"></i> Cobrar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Footer de Tabla */}
        <Card.Footer className="bg-white border-0 py-3 d-flex align-items-center justify-content-between text-muted small">
          <span>
            Mostrando {facturasFiltradas.length} de {todasLasFacturas.length} registros
          </span>
        </Card.Footer>
      </Card>
    </Container>
  );
}