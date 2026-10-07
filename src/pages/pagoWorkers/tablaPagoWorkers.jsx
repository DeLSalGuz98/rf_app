import { useEffect, useState, useMemo } from "react";
import { getListPagoEmpleadoDB } from "../../querysDB/workers/getListPagoWorkers";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

export function TablaPagoWorkers({ idProject}) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoPagoFilter, setTipoPagoFilter] = useState("todos");

  useEffect(() => {
    if (!idProject) return;

    let isMounted = true;
    const fetchPagos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getListPagoEmpleadoDB(idProject);
        if (isMounted) {
          setPagos(res || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al cargar los pagos:", err);
          setError("No se pudieron cargar los datos de los pagos.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPagos();

    return () => {
      isMounted = false;
    };
  }, [idProject]);

  // Filtrado reactivo en memoria
  const filteredPagos = useMemo(() => {
    return pagos.filter((pago) => {
      const matchSearch =
        pago.empleado_nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.empleado?.nro_doc?.includes(searchTerm) ||
        pago.periodo?.includes(searchTerm);

      const matchTipo =
        tipoPagoFilter === "todos" || pago.tipo_pago === tipoPagoFilter;

      return matchSearch && matchTipo;
    });
  }, [pagos, searchTerm, tipoPagoFilter]);

  // Cálculo del total acumulado para los elementos filtrados
  const totalMonto = useMemo(() => {
    return filteredPagos.reduce((sum, pago) => sum + Number(pago.monto_pago || 0), 0);
  }, [filteredPagos]);

  // Formateador de moneda (Soles Peruanos)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4 text-secondary">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span className="small">Cargando pagos...</span>
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
        {/* Controles y Resumen Discreto */}
        <div className="row g-2 align-items-center mb-3">
          <div className="col-12 col-md-5">
            <input
              type="text"
              placeholder="Buscar por empleado, N° doc o período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <select
              value={tipoPagoFilter}
              onChange={(e) => setTipoPagoFilter(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="todos">Todos los tipos de pago</option>
              <option value="pago_semanal">Pago Semanal</option>
              <option value="fin_de_mes">Fin de Mes</option>
              <option value="adelanto">Adelanto</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-3 text-sm-end">
            <div className="bg-light border rounded px-2 py-1 d-inline-block text-start text-sm-end w-100">
              <span className="text-muted small me-2">Total:</span>
              <span className="fw-bold text-dark">{formatCurrency(totalMonto)}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
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
                      <span className="badge bg-light text-dark border me-1 font-monospace uppercase">
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
                          to={`/rf/proyecto/editar-pago-empleado/${pago.id}`}
                        >
                          <i className="bi bi-eye-fill"></i>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => alert(pago.id)}
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