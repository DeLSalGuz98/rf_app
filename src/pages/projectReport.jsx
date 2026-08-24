import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Table, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { usePrintReport } from "../hooks/printReportHook";
import { getReportProjectDataDB } from "../querysDB/projects/getReportProjectData";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";
import { exportToExcel } from "../utils/exportToExcel";

// Helper: Convierte montos a PEN considerando tipo de cambio
const getMontoSoles = (monto = 0, moneda = "PEN", tipoCambio = 1) => {
  const numMonto = Number(monto) || 0;
  const numTC = Number(tipoCambio) || 1;
  return moneda !== "PEN" ? numMonto * numTC : numMonto;
};

// Helper: Formatea números como moneda peruana (S/.)
const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);

// Helper: Formatea serie + número de comprobante
const formatComprobante = (serie, nro) => {
  if (!serie && !nro) return "S/N";
  return `${(serie || "").toUpperCase()}-${nro || ""}`;
};

export function ProjectReport() {
  const { idProyecto } = useParams();
  const navigate = useNavigate();
  const [printRef, handlePrint] = usePrintReport();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataReportProject, setDataReportProject] = useState({});
  const [dataExpenditure, setDataExpenditure] = useState([]);
  const [dataTaxDoc, setDataTaxDoc] = useState([]);

  // Fetch de datos del proyecto
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getReportProjectDataDB(idProyecto);
        if (isMounted && res) {
          setDataReportProject(res);
          setDataExpenditure(res.gastos || []);
          setDataTaxDoc(res.documentos_tributarios || []);
        }
      } catch (err) {
        if (isMounted) setError("Error al cargar la información del reporte.");
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [idProyecto]);

  // Gastos facturados vs no facturados
  const gastosFacturadoYNo = useMemo(() => {
    return dataExpenditure.reduce(
      (acc, g) => {
        const monto = getMontoSoles(g.monto_total, g.moneda, g.tipo_cambio);
        if (g.serie_comprobante && g.nro_comprobante) {
          acc.facturado += monto;
        } else {
          acc.noFacturado += monto;
        }
        acc.total += monto;
        return acc;
      },
      { facturado: 0, noFacturado: 0, total: 0 }
    );
  }, [dataExpenditure]);

  // Agrupación por categoría
  const gastosPorCategoria = useMemo(() => {
    const agrupado = dataExpenditure.reduce((acc, g) => {
      const cat = g.categoria || "Sin Categoría";
      const monto = getMontoSoles(g.monto_total, g.moneda, g.tipo_cambio);
      acc[cat] = (acc[cat] || 0) + monto;
      return acc;
    }, {});

    return Object.entries(agrupado).map(([categoria, montoTotal]) => ({
      categoria,
      montoTotal,
    }));
  }, [dataExpenditure]);

  // Flujo de Caja
  const flujoCaja = useMemo(() => {
    const totalRetenido = dataTaxDoc
      .filter((d) => d.tipo_doc === "retencion recibido")
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0);

    const facturado = Number(dataReportProject.monto_ofertado) || 0;
    const gastosTotal = gastosFacturadoYNo.total;
    const totalRetenidoEstimado = facturado * 0.03;

    const retencionAplicada = totalRetenido <= 0 ? totalRetenidoEstimado : totalRetenido;
    const esEstimado = totalRetenido <= 0;

    const ingresoNeto = facturado - retencionAplicada;
    const utilidadNeta = ingresoNeto - gastosTotal;

    return {
      montoFacturado: facturado,
      totalGastos: gastosTotal,
      retencionSunat: retencionAplicada,
      esEstimado,
      ingresoNeto,
      utilidadNeta,
    };
  }, [dataTaxDoc, dataReportProject, gastosFacturadoYNo]);

  // Cálculos de Margen y Utilidad Bruta
  const utilidadNetaBruta = (Number(dataReportProject.monto_ofertado) || 0) - gastosFacturadoYNo.total;
  const margenBrutoPorc = useMemo(() => {
    const ofertado = Number(dataReportProject.monto_ofertado) || 0;
    if (!ofertado) return 0;
    return (utilidadNetaBruta / ofertado) * 100;
  }, [dataReportProject.monto_ofertado, utilidadNetaBruta]);

  // Filtrado de gastos por tipo (Directo/Indirecto)
  const gastosDirectos = useMemo(
    () => dataExpenditure.filter((g) => g.tipo === "directo"),
    [dataExpenditure]
  );
  const gastosIndirectos = useMemo(
    () => dataExpenditure.filter((g) => g.tipo === "indirecto"),
    [dataExpenditure]
  );

  // Exportar Excel Optimizado
  const handleExportarExcel = useCallback(() => {
    const dataToExport = [...gastosDirectos, ...gastosIndirectos].map((e) => ({
      Fecha: e.fecha,
      Cantidad: e.cantidad,
      "U. Medida": e.unidad_medida,
      Descripción: e.descripcion,
      "Monto Total (S/.)": getMontoSoles(e.monto_total, e.moneda, e.tipo_cambio),
      Comprobante: formatComprobante(e.serie_comprobante, e.nro_comprobante),
      Tipo: e.tipo ? SetCapitalLetter(e.tipo) : "-",
    }));

    const fileName = `Gastos - ${dataReportProject.nombre_proyecto || "Proyecto"}`;
    exportToExcel(dataToExport, fileName);
  }, [gastosDirectos, gastosIndirectos, dataReportProject.nombre_proyecto]);

  if (loading) {
    return (
      <Container className="text-center my-5 p-5">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Cargando reporte de proyecto...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Error de Carga</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Regresar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Barra Superior con Acciones (Oculta al imprimir) */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <Button variant="outline-secondary" onClick={() => navigate(-1)} className="d-flex align-items-center gap-2">
          <i className="bi bi-arrow-left"></i> Regresar
        </Button>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExportarExcel} className="d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-excel"></i> Exportar Excel
          </Button>
          <Button variant="primary" onClick={handlePrint} className="d-flex align-items-center gap-2">
            <i className="bi bi-printer"></i> Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* Tarjeta del Reporte General */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4" ref={printRef}>
          {/* Cabecera del Reporte */}
          <div className="border-bottom pb-3 mb-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="text-primary fw-bold mb-1">
                  {dataReportProject.nombre_proyecto || "Sin Nombre"}
                </h2>
                <p className="text-muted mb-0">
                  {SetCapitalLetter(dataReportProject.descripcion_proyecto || "")} —{" "}
                  <Badge bg="secondary">{SetCapitalLetter(dataReportProject.tipo || "Gasto")}</Badge>
                </p>
              </div>
              <Badge
                bg={dataReportProject.estado === "activo" ? "success" : "info"}
                className="fs-6 px-3 py-2 text-uppercase"
              >
                {dataReportProject.estado || "En proceso"}
              </Badge>
            </div>
          </div>

          {/* Tarjetas KPI de Resumen Visual */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={3}>
              <MetricCard
                title="Monto Contratado"
                value={formatCurrency(dataReportProject.monto_ofertado)}
                variant="primary"
                icon="bi-cash-stack"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Costo Real Total"
                value={formatCurrency(gastosFacturadoYNo.total)}
                variant="warning"
                icon="bi-receipt"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Utilidad Bruta"
                value={formatCurrency(utilidadNetaBruta)}
                variant={utilidadNetaBruta >= 0 ? "success" : "danger"}
                icon="bi-graph-up-arrow"
              />
            </Col>
            <Col sm={6} lg={3}>
              <MetricCard
                title="Margen Bruto"
                value={`${margenBrutoPorc.toFixed(2)}%`}
                variant={margenBrutoPorc >= 0 ? "success" : "danger"}
                icon="bi-pie-chart"
              />
            </Col>
          </Row>

          {/* 1️⃣ Información General */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              1. Información General
            </h5>
            <Card className="bg-light border-0">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <InfoItem
                      label="Cliente"
                      value={`${SetCapitalLetter(dataReportProject.rs_cliente || "")} (RUC: ${dataReportProject.ruc_cliente || "-"})`}
                    />
                    {dataReportProject.unidad_ejecutora && (
                      <>
                        <InfoItem label="Unidad Ejecutora" value={dataReportProject.unidad_ejecutora} />
                        <InfoItem label="Expediente SIAF" value={dataReportProject.exp_siaf} />
                      </>
                    )}
                    <InfoItem
                      label="Dirección"
                      value={[
                        dataReportProject.direccion,
                        dataReportProject.distrito,
                        dataReportProject.provincia,
                        dataReportProject.departamento,
                      ]
                        .filter(Boolean)
                        .map(SetCapitalLetter)
                        .join(", ")}
                    />
                  </Col>
                  <Col md={6}>
                    <InfoItem label="Fecha de Inicio" value={dataReportProject.fecha_inicio || "-"} />
                    <InfoItem label="Fecha de Finalización" value={dataReportProject.fecha_fin || "-"} />
                    <InfoItem label="Monto Contratado" value={formatCurrency(dataReportProject.monto_ofertado)} />
                    <InfoItem label="Estado del Proyecto" value={SetCapitalLetter(dataReportProject.estado || "-")} />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </section>

          {/* 2️⃣ Balance de Rentabilidad */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              2. Balance de Rentabilidad (Gerencial)
            </h5>
            <Table hover responsive className="align-middle border">
              <tbody>
                <tr>
                  <td>A. Ingresos Totales Facturados</td>
                  <td className="text-end fw-semibold">{formatCurrency(dataReportProject.monto_ofertado)}</td>
                </tr>
                <tr>
                  <td>B. Costo Real Total (CRT)</td>
                  <td className="text-end fw-semibold">{formatCurrency(gastosFacturadoYNo.total)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ B.1. Costos facturados</td>
                  <td className="text-end">{formatCurrency(gastosFacturadoYNo.facturado)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ B.2. Costos no facturados</td>
                  <td className="text-end">{formatCurrency(gastosFacturadoYNo.noFacturado)}</td>
                </tr>
                <tr className="table-light fw-bold">
                  <td>C. Utilidad Bruta (A - B)</td>
                  <td className="text-end">{formatCurrency(utilidadNetaBruta)}</td>
                </tr>
                <tr className="table-light fw-bold">
                  <td>Margen Bruto (%)</td>
                  <td className={`text-end ${margenBrutoPorc >= 0 ? "text-success" : "text-danger"}`}>
                    {margenBrutoPorc.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* 3️⃣ Control de Gastos por Categoría */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              3. Control de Gastos por Categoría (CGC)
            </h5>
            <Table hover responsive className="align-middle border">
              <thead className="table-light">
                <tr>
                  <th>Categoría</th>
                  <th className="text-end">Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {gastosPorCategoria.map((g, i) => (
                  <tr key={i}>
                    <td>{SetCapitalLetter(g.categoria)}</td>
                    <td className="text-end">{formatCurrency(g.montoTotal)}</td>
                  </tr>
                ))}
                <tr className="table-secondary fw-bold">
                  <td>Total Costo Real del Proyecto</td>
                  <td className="text-end">{formatCurrency(gastosFacturadoYNo.total)}</td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* 4️⃣ Flujo de Caja */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              4. Flujo de Caja (Liquidez)
            </h5>
            <Table hover responsive className="align-middle border">
              <tbody>
                <tr>
                  <td>Monto Facturado al Cliente</td>
                  <td className="text-end">{formatCurrency(flujoCaja.montoFacturado)}</td>
                </tr>
                <tr>
                  <td>
                    (-) Retención SUNAT{" "}
                    {flujoCaja.esEstimado && <span className="badge bg-warning text-dark">Estimado 3%</span>}
                  </td>
                  <td className="text-end text-danger">-{formatCurrency(flujoCaja.retencionSunat)}</td>
                </tr>
                <tr className="table-light fw-bold">
                  <td>Ingreso Neto Esperado</td>
                  <td className="text-end">{formatCurrency(flujoCaja.ingresoNeto)}</td>
                </tr>
                <tr>
                  <td>(-) Total Gastos Pagados (CRT)</td>
                  <td className="text-end text-danger">-{formatCurrency(flujoCaja.totalGastos)}</td>
                </tr>
                <tr className="table-primary fw-bold">
                  <td>Utilidad Neta Liquida</td>
                  <td className={`text-end ${flujoCaja.utilidadNeta >= 0 ? "text-success" : "text-danger"}`}>
                    {formatCurrency(flujoCaja.utilidadNeta)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* 5️⃣ Listado Detallado de Gastos */}
          <section className="mb-2">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              5. Lista Detallada de Gastos
            </h5>

            <h6 className="fw-bold text-secondary mt-3 mb-2">5.1 Gastos Directos</h6>
            <GastosTable items={gastosDirectos} />

            <h6 className="fw-bold text-secondary mt-4 mb-2">5.2 Gastos Indirectos</h6>
            <GastosTable items={gastosIndirectos} />
          </section>
        </Card.Body>
      </Card>
    </Container>
  );
}

// ----------------------------------------------------------------------
// Subcomponentes reutilizables para mantener el código principal limpio
// ----------------------------------------------------------------------

function MetricCard({ title, value, variant, icon }) {
  return (
    <Card className={`border-start border-4 border-${variant} shadow-sm h-100`}>
      <Card.Body className="d-flex align-items-center justify-content-between p-3">
        <div>
          <small className="text-muted fw-semibold text-uppercase">{title}</small>
          <h5 className="fw-bold mb-0 mt-1">{value}</h5>
        </div>
        <i className={`bi ${icon} fs-2 text-${variant} opacity-75`}></i>
      </Card.Body>
    </Card>
  );
}

function InfoItem({ label, value }) {
  return (
    <p className="mb-2 fs-6">
      <strong className="text-secondary">{label}:</strong> {value || "-"}
    </p>
  );
}

function GastosTable({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-muted italic small">No hay gastos registrados en esta categoría.</p>;
  }

  return (
    <Table bordered hover responsive size="sm" className="align-middle text-center">
      <thead className="table-light">
        <tr>
          <th>Fecha</th>
          <th>Cant.</th>
          <th>U.M.</th>
          <th className="text-start">Descripción</th>
          <th>P. Unitario</th>
          <th>Total</th>
          <th>Comprobante</th>
        </tr>
      </thead>
      <tbody>
        {items.map((g, idx) => {
          const precioUnit = getMontoSoles(g.precio_unitario, g.moneda, g.tipo_cambio);
          const total = (Number(g.cantidad) || 0) * precioUnit;

          return (
            <tr key={g.id || idx}>
              <td>{g.fecha}</td>
              <td>{g.cantidad}</td>
              <td>{g.unidad_medida}</td>
              <td className="text-start text-truncate" style={{ maxWidth: "250px" }}>
                {g.descripcion}
              </td>
              <td>{formatCurrency(precioUnit)}</td>
              <td className="fw-semibold">{formatCurrency(total)}</td>
              <td>
                <Badge bg="light" text="dark" className="border">
                  {formatComprobante(g.serie_comprobante, g.nro_comprobante)}
                </Badge>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}