import { useEffect, useState, useMemo } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Form, 
  Spinner, 
  Button, 
  InputGroup 
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getListPendingInvoiceDB } from "../../querysDB/taxDocument/getListPendingInvoice";

/* HELPER: CÁLCULO Y ESTADO DE DÍAS DE VENCIMIENTO */
const evaluarVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento) return { dias: 0, estado: "normal", label: "Sin fecha" };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const diasVencidos = Math.abs(diffDays);
    return {
      dias: diasVencidos,
      estado: "vencido",
      label: `Vencida hace ${diasVencidos} d`,
      badgeBg: "danger",
    };
  } else if (diffDays <= 3) {
    return {
      dias: diffDays,
      estado: "proximo",
      label: diffDays === 0 ? "Vence Hoy" : `Vence en ${diffDays} d`,
      badgeBg: "warning",
    };
  } else {
    return {
      dias: diffDays,
      estado: "normal",
      label: `Vence en ${diffDays} d`,
      badgeBg: "success",
    };
  }
};

/* HELPER: FORMATEO MONETARIO */
const formatMoneda = (monto, moneda = "PEN") => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda,
  }).format(monto ?? 0);
};

export function FacturasPendientes() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTaxDocuments = async () => {
    try {
      setLoading(true);
      const res = await getListPendingInvoiceDB();
      setInvoices(res || []);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      toast.error("No se pudieron cargar las facturas pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxDocuments();
  }, []);

  /* FILTRADO EN TIEMPO REAL */
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const pNombre = item.proyectos?.nombre_proyecto?.toLowerCase() || "";
      const pDesc = item.proyectos?.descripcion_proyecto?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return pNombre.includes(search) || pDesc.includes(search);
    });
  }, [invoices, searchTerm]);

  /* MÉTRICAS FINANCIERAS PARA TARJETAS DE RESUMEN */
  const resumenFinanciero = useMemo(() => {
    return invoices.reduce(
      (acc, curr) => {
        const monto = curr.monto || 0;
        const evalVenc = evaluarVencimiento(curr.fecha_vencimiento);

        acc.totalAcumulado += monto;
        if (evalVenc.estado === "vencido") {
          acc.totalVencido += monto;
          acc.cantVencidas += 1;
        }
        return acc;
      },
      { totalAcumulado: 0, totalVencido: 0, cantVencidas: 0 }
    );
  }, [invoices]);

  return (
    <Container className="py-4">
      {/* CABECERA Y KPI RESUMEN FINANCIERO */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h4 className="fw-bold mb-1 text-dark">Facturas Pendientes por Cobrar</h4>
          <p className="text-muted small mb-0">
            Control e historial de comprobantes pendientes de pago.
          </p>
        </Col>
        <Col md={6} className="text-md-end mt-3 mt-md-0">
          <Button variant="outline-primary" size="sm" onClick={fetchTaxDocuments}>
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
          </Button>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-primary text-white">
            <Card.Body className="p-3">
              <span className="text-white-50 small fw-medium">Por Cobrar Total</span>
              <h3 className="fw-bold my-1">
                {formatMoneda(resumenFinanciero.totalAcumulado, "PEN")}
              </h3>
              <small className="text-white-50">
                {invoices.length} {invoices.length === 1 ? "factura" : "facturas"} en total
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-danger text-white">
            <Card.Body className="p-3">
              <span className="text-white-50 small fw-medium">Monto en Mora</span>
              <h3 className="fw-bold my-1">
                {formatMoneda(resumenFinanciero.totalVencido, "PEN")}
              </h3>
              <small className="text-white-50">
                {resumenFinanciero.cantVencidas} comprobante(s) vencido(s)
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 bg-light border">
            <Card.Body className="p-3">
              <span className="text-muted small fw-medium">Filtro Rápido</span>
              <InputGroup size="sm" className="mt-2">
                <InputGroup.Text className="bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  className="border-start-0"
                  placeholder="Buscar por proyecto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TABLA PRINCIPAL DE FACTURAS */}
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-secondary small fw-bold py-3 ps-3">Proyecto</th>
                <th className="text-secondary small fw-bold py-3">Emisión</th>
                <th className="text-secondary small fw-bold py-3">Vencimiento</th>
                <th className="text-secondary small fw-bold py-3">Estado Plazo</th>
                <th className="text-secondary small fw-bold py-3 text-end">Monto</th>
                <th className="text-secondary small fw-bold py-3 text-center pe-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                    <span className="text-muted">Cargando facturas pendientes...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-file-earmark-check fs-1 d-block mb-2 text-secondary"></i>
                      <p className="mb-0 fw-medium">No hay facturas pendientes por cobrar</p>
                      <small>No se encontraron registros con los filtros actuales.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((item) => {
                  const evalVenc = evaluarVencimiento(item.fecha_vencimiento);

                  return (
                    <tr key={item.id}>
                      {/* PROYECTO & DETALLE */}
                      <td className="ps-3" style={{ maxWidth: "280px" }}>
                        <div className="fw-semibold text-dark text-truncate">
                          {item.proyectos?.nombre_proyecto || "Sin Proyecto"}
                        </div>
                        <small className="text-muted text-truncate d-block" title={item.proyectos?.descripcion_proyecto}>
                          {item.proyectos?.descripcion_proyecto || "-"}
                        </small>
                      </td>

                      {/* FECHA EMISIÓN */}
                      <td className="text-nowrap small text-secondary">
                        {item.fecha_emision}
                      </td>

                      {/* FECHA VENCIMIENTO */}
                      <td className="text-nowrap small text-secondary">
                        {item.fecha_vencimiento}
                      </td>

                      {/* BADGE VENCIMIENTO / ALERTA */}
                      <td>
                        <Badge
                          bg={evalVenc.badgeBg}
                          className={evalVenc.badgeBg === "warning" ? "text-dark" : ""}
                        >
                          {evalVenc.label}
                        </Badge>
                      </td>

                      {/* MONTO */}
                      <td className="text-end fw-bold text-dark">
                        {formatMoneda(item.monto, item.moneda)}
                      </td>

                      {/* ACCIONES */}
                      <td className="text-center pe-3">
                        <div className="d-flex justify-content-center gap-1">
                          <Link
                            to={`/rf/proyecto/${item.proyectos?.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Ver detalle del proyecto"
                            style={!item.proyectos?.id ? { pointerEvents: 'none', color: 'gray', cursor: 'default' } : {}}
                          >
                            <i className="bi bi-eye-fill"></i>
                          </Link>
                          <Link
                            to={`/rf/editar-documento/${item.id}`}
                            className="btn btn-sm btn-success"
                            title="Registrar cobro de factura"
                          >
                            <i className="bi bi-cash-coin me-1"></i> Cobrar
                          </Link>
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
    </Container>
  );
}