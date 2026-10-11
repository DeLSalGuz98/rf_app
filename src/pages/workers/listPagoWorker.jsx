import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap";
import { deletePagoDataDB } from "../../querysDB/workers/deletePagoData";
import { getListPagoOneWorkerDB } from "../../querysDB/workers/getListPagoOneWorker";


export function TablaPagoOneWorker({ idWorker }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros de búsqueda y filtrado por periodo
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoPagoFilter, setTipoPagoFilter] = useState("todos");
  const [periodoFilter, setPeriodoFilter] = useState(""); // 👈 Nuevo estado para filtro por periodo (formato 'YYYY-MM')

  /**
   * Obtiene la lista actualizada de pagos desde la base de datos de forma segura.
   */
  const fetchPagos = useCallback(async () => {
    if (!idWorker) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getListPagoOneWorkerDB(idWorker);
      setPagos(res || []);
    } catch (err) {
      console.error("Error al cargar los pagos:", err);
      setError("No se pudieron cargar los datos de los pagos.");
    } finally {
      setLoading(false);
    }
  }, [idWorker]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  /**
   * Filtrado reactivo en memoria basado en el término de búsqueda, tipo de pago y período.
   */
  const filteredPagos = useMemo(() => {
    return pagos.filter((pago) => {
      // 1. Filtro por texto libre (Nombre, N° de documento)
      const matchSearch =
        pago.empleado_nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.empleado?.nro_doc?.includes(searchTerm);

      // 2. Filtro por tipo de pago
      const matchTipo =
        tipoPagoFilter === "todos" || pago.tipo_pago === tipoPagoFilter;

      // 3. Filtro por período (ej. coincidencia exacta con 'YYYY-MM' o conteniendo el string)
      const matchPeriodo =
        !periodoFilter || pago.periodo === periodoFilter || pago.fecha_registro?.startsWith(periodoFilter);

      return matchSearch && matchTipo && matchPeriodo;
    });
  }, [pagos, searchTerm, tipoPagoFilter, periodoFilter]);

  /**
   * Cálculo del total acumulado para los elementos filtrados actualmente.
   */
  const totalMonto = useMemo(() => {
    return filteredPagos.reduce((sum, pago) => sum + Number(pago.monto_pago || 0), 0);
  }, [filteredPagos]);

  /**
   * Formatea un valor numérico a la moneda local (Soles Peruanos - PEN).
   * 
   * @param {number} amount - Monto numérico.
   * @returns {string} Monto formateado en moneda.
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  /**
   * Maneja la eliminación lógica o física de un registro de pago y su comprobante asociado.
   * 
   * @param {string|number} idPago - ID del pago.
   * @param {string|number|null} idComprobante - ID del comprobante tributario (si tuviera).
   */
  const handleDeletePago = async (idPago, idComprobante) => {
    const isConfirmed = window.confirm("¿Está seguro de querer eliminar este registro de pago?");
    if (!isConfirmed) return;

    try {
      const success = await deletePagoDataDB(idPago, idComprobante);
      if (success) {
        fetchPagos();
      }
    } catch (err) {
      console.error("Error al eliminar el pago:", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4 text-secondary">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="small">Cargando pagos del personal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger py-2 px-3 small text-center" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="card shadow-sm border mb-4">
      <div className="card-body p-3">
        
        {/* Controles de Filtrado Optimizados */}
        <Row className="g-2 align-items-center mb-3">
          
          {/* Buscador por Texto */}
          <Col xs={12} md={4}>
            <Form.Control
              type="text"
              placeholder="Buscar por empleado o N° doc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
          </Col>

          {/* Selector por Tipo de Pago */}
          <Col xs={12} sm={6} md={3}>
            <Form.Select
              value={tipoPagoFilter}
              onChange={(e) => setTipoPagoFilter(e.target.value)}
              size="sm"
            >
              <option value="todos">Todos los tipos de pago</option>
              <option value="pago_semanal">Pago Semanal</option>
              <option value="fin_de_mes">Sueldo / Fin de Mes</option>
              <option value="adelanto">Adelanto</option>
              <option value="bono">Bono / Gratuidad</option>
              <option value="liquidacion">Liquidación / Final</option>
            </Form.Select>
          </Col>

          {/* 👈 NUEVO: Filtro por Periodo (Mes/Año) con opción de limpiar */}
          <Col xs={12} sm={6} md={3}>
            <div className="input-group input-group-sm">
              <Form.Control
                type="date"
                value={periodoFilter}
                onChange={(e) => setPeriodoFilter(e.target.value)}
                title="Filtrar por periodo"
              />
              {periodoFilter && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setPeriodoFilter("")}
                  title="Limpiar filtro de período"
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              )}
            </div>
          </Col>

          {/* Resumen del Total Filtrado */}
          <Col xs={12} md={2} className="text-md-end">
            <div className="bg-light border rounded px-2 py-1 d-inline-block text-start text-md-end w-100">
              <span className="text-muted small me-1">Total:</span>
              <span className="fw-bold text-dark small">{formatCurrency(totalMonto)}</span>
            </div>
          </Col>

        </Row>

        {/* Tabla de Resultados Responsive */}
        <div className="table-responsive rounded border">
          <table className="table table-hover align-middle mb-0 text-sm">
            <thead className="table-light text-uppercase text-secondary small" style={{ fontSize: "0.75rem" }}>
              <tr>
                <th scope="col">Empleado</th>
                <th scope="col">Documento</th>
                <th scope="col">Fecha / Período</th>
                <th scope="col">Tipo / Forma</th>
                <th scope="col">Comprobante</th>
                <th scope="col" className="text-end">Monto</th>
                <th scope="col" className="text-center" style={{ width: "100px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.length > 0 ? (
                filteredPagos.map((pago) => (
                  <tr key={pago.id}>
                    <td className="fw-medium text-dark text-capitalize">
                      {pago.empleado_nombre_completo}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border me-1 font-monospace text-uppercase">
                        {pago.empleado?.tipo_doc || "DOC"}
                      </span>
                      <span className="text-secondary small">{pago.empleado?.nro_doc}</span>
                    </td>
                    <td>
                      <div className="text-dark">{pago.fecha_registro}</div>
                      <div className="text-muted small">Período: {pago.periodo}</div>
                    </td>
                    <td>
                      <div className="text-capitalize text-dark">
                        {pago.tipo_pago?.replace("_", " ")}
                      </div>
                      <div className="text-muted small text-capitalize">{pago.forma_pago}</div>
                    </td>
                    <td>
                      {pago.documento_tributario ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {pago.documento_tributario.serie_comprobante}-{pago.documento_tributario.nro_comprobante}
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                          Sin comprobante
                        </span>
                      )}
                    </td>
                    <td className="text-end fw-bold text-dark">
                      {formatCurrency(pago.monto_pago)}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <Link
                          className="btn btn-primary btn-sm"
                          to={`/rf/editar-pago-empleado/${pago.id}`}
                          state={{ nameWorker: pago.empleado_nombre_completo }}
                          title="Editar pago"
                        >
                          <i className="bi bi-eye-fill"></i>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeletePago(pago.id, pago.id_comprobante)}
                          title="Eliminar pago"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No se encontraron pagos registrados para los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}