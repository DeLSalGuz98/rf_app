import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Row, Col, Table, Card, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { usePrintReport } from "../../hooks/printReportHook";
import { getListIngresosProyectoDB } from "../../querysDB/ingresos/getListIngresosProyecto";
import { getInfoProyectoFromDB } from "../../utils/getResumenFinancieroProyecto";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";
import { exportToExcel } from "../../utils/exportToExcel";
import { convertirMoneda } from "../../utils/convertirMoneda";
import { formatMoneda } from "../../utils/formatoMoneda";

/**
 * Reporte integral, financiero y gerencial de un proyecto.
 * Consume los datos consolidados desde `location.state.data` con respaldo en BD
 * e incluye estilos de impresión encapsulados dentro del área de captura (`printRef`).
 */
export function ProjectReport() {
  const location = useLocation();
  const { idProyecto } = useParams();
  const navigate = useNavigate();
  const [printRef, handlePrint] = usePrintReport();

  const [reportData, setReportData] = useState(() => location.state?.data || null);
  const [loading, setLoading] = useState(!location.state?.data);

  useEffect(() => {
    if (reportData || !idProyecto) return;

    let isMounted = true;
    const loadFallbackData = async () => {
      try {
        setLoading(true);
        const data = await getInfoProyectoFromDB(idProyecto);
        if (isMounted && data) {
          setReportData(data);
        }
      } catch (error) {
        console.error("Error al recuperar datos del reporte:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFallbackData();
    return () => {
      isMounted = false;
    };
  }, [reportData, idProyecto]);

  const proyecto = reportData?.proyecto || {};
  const infoPrincipal = proyecto.infoPrincipal || {};
  const infoCliente = proyecto.infoCliente || {};
  const fechasProyecto = proyecto.fechasProyecto || {};
  const infoFinanciera = proyecto.infoFinanciera || {};

  const gastos = reportData?.gastos || {};
  const documentosTributarios = reportData?.documentosTributarios || {};
  const ingresos = reportData?.ingresos || {};

  // ------------------------------------------
  // CÁLCULOS GERENCIALES Y KPI CONSOLIDADOS
  // ------------------------------------------
  const metricas = useMemo(() => {
    const presupuesto = Number(infoFinanciera.montoProyecto) || 0;
    const operativos = Number(gastos.montoTotalGastos) || 0;
    const personal = Number(gastos.totalPagoTrabajadores) || 0;
    const costoTotal = operativos + personal;

    const facturado = Number(documentosTributarios.montoTotalFacturado) || 0;
    const retencion = Number(documentosTributarios.montoRetencion) || 0;
    const detraccion = Number(ingresos.montoDetracciones) || 0;
    const cobradoReal = Number(ingresos.montoTotalPagado) || 0;
    const pendienteCobro = presupuesto - (cobradoReal + detraccion);

    const utilidadGerencial = presupuesto - costoTotal;
    const margenBrutoPorc = presupuesto > 0 ? (utilidadGerencial / presupuesto) * 100 : 0;

    return {
      presupuesto,
      operativos,
      personal,
      costoTotal,
      facturado,
      retencion,
      detraccion,
      cobradoReal,
      pendienteCobro,
      utilidadGerencial,
      margenBrutoPorc,
    };
  }, [infoFinanciera.montoProyecto, gastos, documentosTributarios, ingresos]);

  const listaCategoriasGasto = useMemo(() => {
    const categoriasObj = gastos.gastosCategoria || {};
    return Object.entries(categoriasObj)
      .map(([categoria, montoTotal]) => ({
        categoria,
        montoTotal: Number(montoTotal) || 0,
      }))
      .sort((a, b) => b.montoTotal - a.montoTotal);
  }, [gastos.gastosCategoria]);

  const flujoCaja = useMemo(() => {
    const facturado = metricas.facturado || metricas.presupuesto;
    const ingresoNetoEsperado = facturado - metricas.retencion;
    const utilidadNetaLiquida = ingresoNetoEsperado - metricas.costoTotal;

    return {
      facturado,
      ingresoNetoEsperado,
      utilidadNetaLiquida,
    };
  }, [metricas]);

  const handleExportarExcel = useCallback(() => {
    const tabla = gastos.infoTablaGastos || [];
    const dataToExport = tabla.map((item) => ({
      Fecha: item.fecha,
      Cantidad: item.cantidad,
      "U. Medida": item.unidadMedida,
      Descripción: item.descripcion,
      "P. Unitario (S/.)": item.precioUnitario,
      "Total (S/.)": item.total,
      Comprobante: item.comprobante,
    }));

    const fileName = `Reporte_Gastos_${infoPrincipal.nombre_proyecto || "Proyecto"}`;
    exportToExcel(dataToExport, fileName);
  }, [gastos.infoTablaGastos, infoPrincipal.nombre_proyecto]);

  if (loading) {
    return (
      <Container className="text-center my-5 p-5">
        <p className="text-muted">Cargando reporte del proyecto...</p>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container className="text-center my-5 p-5">
        <p className="text-danger fw-semibold">No se encontró información para este proyecto.</p>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Regresar
        </Button>
      </Container>
    );
  }

  const kpiCards = [
    {
      titulo: "PRESUPUESTO TOTAL",
      valor: metricas.presupuesto,
      color: "text-primary",
      subtitulo: "Monto contratado (inc. IGV)",
    },
    {
      titulo: "COSTO REAL TOTAL",
      valor: metricas.costoTotal,
      color: "text-danger",
      subtitulo: "Gastos + pago personal",
    },
    {
      titulo: "MONTO FACTURADO",
      valor: metricas.facturado,
      color: "text-info",
      subtitulo: "Comprobantes emitidos netos",
    },
    {
      titulo: "MONTO COBRADO (REAL)",
      valor: metricas.cobradoReal,
      color: "text-success",
      subtitulo: "Ingresos confirmados",
    },
    {
      titulo: "PENDIENTE DE COBRO",
      valor: metricas.pendienteCobro,
      color: "text-warning",
      subtitulo: "Saldo por cobrar al cliente",
    },
    {
      titulo: "MONTO DETRACCIONES",
      valor: metricas.detraccion,
      color: "text-dark",
      subtitulo: "Cuenta Banco de la Nación",
    },
    {
      titulo: "MONTO RETENCIÓN",
      valor: metricas.retencion,
      color: "text-dark",
      subtitulo: "Retenciones SUNAT cliente",
    },
    {
      titulo: "PAGO A PERSONAL",
      valor: metricas.personal,
      color: "text-dark",
      subtitulo: "Mano de obra del proyecto",
    },
  ];

  return (
    <Container className="my-4">
      {/* Barra de Acciones (Oculta al imprimir) */}
      <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Regresar
        </Button>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleExportarExcel}>
            Exportar Excel
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Imprimir Reporte
          </Button>
        </div>
      </div>

      {/* Documento Principal Imprimible */}
      <Card className="shadow-sm border-0 rounded-3">
        {/* ✅ printRef envuelve ahora también al <style> para que react-to-print lo incluya */}
        <Card.Body className="p-4" ref={printRef}>
          <style>
            {`
              .kpi-grid-container {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                width: 100%;
              }

              @media screen and (max-width: 991px) {
                .kpi-grid-container {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }

              @media screen and (max-width: 575px) {
                .kpi-grid-container {
                  grid-template-columns: 1fr;
                }
              }

              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                .report-section {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }
                .print-wrap-text {
                  white-space: normal !important;
                  max-width: none !important;
                  overflow: visible !important;
                  text-overflow: clip !important;
                }
                .kpi-grid-container {
                  display: grid !important;
                  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                  gap: 6px !important;
                  width: 100% !important;
                }
                .kpi-print-box {
                  padding: 6px 8px !important;
                  border: 1px solid #ced4da !important;
                  border-radius: 5px !important;
                  background-color: #ffffff !important;
                  box-sizing: border-box !important;
                }
                .kpi-print-title {
                  font-size: 0.58rem !important;
                  letter-spacing: 0.2px !important;
                  white-space: nowrap !important;
                  margin-bottom: 1px !important;
                }
                .kpi-print-amount {
                  font-size: 0.92rem !important;
                  white-space: nowrap !important;
                  margin: 2px 0 !important;
                  line-height: 1.15 !important;
                }
                .kpi-print-sub {
                  font-size: 0.56rem !important;
                  line-height: 1.1 !important;
                }
                .badge, .bg-light, .table-light, .table-secondary, .table-primary {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}
          </style>

          {/* Cabecera del Proyecto */}
          <div className="border-bottom pb-3 mb-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="text-primary fw-bold mb-1">
                  {infoPrincipal.nombre_proyecto || "Sin Nombre"}
                </h2>
                <p className="text-muted mb-0">
                  {SetCapitalLetter(infoPrincipal.descripcion_proyecto || "")} —{" "}
                  <Badge bg="secondary">
                    {SetCapitalLetter(infoPrincipal.tipo || "Proyecto")}
                  </Badge>
                </p>
              </div>
              <Badge
                bg={infoPrincipal.estado === "finalizado" ? "info" : "success"}
                className="fs-6 px-3 py-2 text-uppercase"
              >
                {infoPrincipal.estado || "En proceso"}
              </Badge>
            </div>
          </div>

          {/* Sección Exclusiva: Resumen Ejecutivo */}
          <section className="mb-4 report-section">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              Resumen Ejecutivo del Proyecto
            </h5>

            <div className="kpi-grid-container mb-3">
              {kpiCards.map((kpi) => (
                <div key={kpi.titulo} className="border rounded-3 p-3 bg-white kpi-print-box">
                  <span className="text-muted d-block small fw-semibold kpi-print-title">
                    {kpi.titulo}
                  </span>
                  <h5 className={`fw-bold ${kpi.color} my-1 kpi-print-amount`}>
                    {formatMoneda(kpi.valor)}
                  </h5>
                  <small className="text-muted d-block kpi-print-sub" style={{ fontSize: "0.72rem" }}>
                    {kpi.subtitulo}
                  </small>
                </div>
              ))}
            </div>
          </section>

          {/* Sección 1: Información General */}
          <section className="mb-4 report-section">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              1. Información General
            </h5>
            <Card className="bg-light border-0">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Cliente:</strong>{" "}
                      {SetCapitalLetter(infoCliente.rs_cliente || "")} (RUC:{" "}
                      {infoCliente.ruc_cliente || "-"})
                    </p>
                    {infoCliente.unidad_ejecutora && (
                      <p className="mb-2 fs-6">
                        <strong className="text-secondary">Unidad Ejecutora:</strong>{" "}
                        {infoCliente.unidad_ejecutora}
                      </p>
                    )}
                    {infoPrincipal.exp_siaf && (
                      <p className="mb-2 fs-6">
                        <strong className="text-secondary">Expediente SIAF:</strong>{" "}
                        {infoPrincipal.exp_siaf}
                      </p>
                    )}
                    <p className="mb-0 fs-6">
                      <strong className="text-secondary">Dirección:</strong>{" "}
                      {[
                        infoCliente.direccion,
                        infoCliente.distrito,
                        infoCliente.provincia,
                        infoCliente.departamento,
                      ]
                        .filter(Boolean)
                        .map(SetCapitalLetter)
                        .join(", ")}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Fecha de Inicio:</strong>{" "}
                      {fechasProyecto.fecha_inicio || "-"}
                    </p>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Plazo de Ejecución:</strong>{" "}
                      {fechasProyecto.plazo_dias ? `${fechasProyecto.plazo_dias} días` : "-"}
                    </p>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Fecha de Finalización:</strong>{" "}
                      {fechasProyecto.fecha_fin || "-"}
                    </p>
                    <p className="mb-0 fs-6">
                      <strong className="text-secondary">Monto Contratado:</strong>{" "}
                      {formatMoneda(metricas.presupuesto)}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </section>

          {/* Sección 2: Balance de Rentabilidad */}
          <section className="mb-4 report-section">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              2. Balance de Rentabilidad (Gerencial)
            </h5>
            <Table hover responsive size="sm" className="align-middle border">
              <tbody>
                <tr>
                  <td>A. Monto Contratado / Presupuesto Total</td>
                  <td className="text-end fw-semibold">{formatMoneda(metricas.presupuesto)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ Base Imponible (Sin IGV)</td>
                  <td className="text-end">{formatMoneda(infoFinanciera.baseImponible)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ IGV Ventas (18%)</td>
                  <td className="text-end">{formatMoneda(infoFinanciera.igv)}</td>
                </tr>
                <tr>
                  <td>B. Costo Real Total (CRT)</td>
                  <td className="text-end fw-semibold">{formatMoneda(metricas.costoTotal)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ B.1. Gastos operativos facturados</td>
                  <td className="text-end">{formatMoneda(gastos.gastosFacturados)}</td>
                </tr>
                <tr className="text-muted small fst-italic">
                  <td className="ps-4">↳ B.2. Gastos operativos no facturados</td>
                  <td className="text-end">{formatMoneda(gastos.gastosNoFacturados)}</td>
                </tr>
                {metricas.personal > 0 && (
                  <tr className="text-muted small fst-italic">
                    <td className="ps-4">↳ B.3. Pago a personal / mano de obra</td>
                    <td className="text-end">{formatMoneda(metricas.personal)}</td>
                  </tr>
                )}
                <tr className="table-light fw-bold">
                  <td>C. Utilidad Bruta (A - B)</td>
                  <td className="text-end">{formatMoneda(metricas.utilidadGerencial)}</td>
                </tr>
                <tr className="table-light fw-bold">
                  <td>Margen Bruto (%)</td>
                  <td
                    className={`text-end ${
                      metricas.margenBrutoPorc >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {metricas.margenBrutoPorc.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* Sección 3: Control de Gastos por Categoría */}
          <section className="mb-4 report-section">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              3. Control de Gastos por Categoría (CGC)
            </h5>
            <Table hover responsive size="sm" className="align-middle border">
              <thead className="table-light">
                <tr>
                  <th>Categoría</th>
                  <th className="text-end">Monto Total</th>
                  <th className="text-end" style={{ width: "120px" }}>
                    % del Gasto
                  </th>
                </tr>
              </thead>
              <tbody>
                {listaCategoriasGasto.map((item) => {
                  const porcentaje =
                    metricas.operativos > 0 ? (item.montoTotal / metricas.operativos) * 100 : 0;
                  return (
                    <tr key={item.categoria}>
                      <td>{SetCapitalLetter(item.categoria)}</td>
                      <td className="text-end">{formatMoneda(item.montoTotal)}</td>
                      <td className="text-end text-muted">{porcentaje.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {metricas.personal > 0 && (
                  <tr>
                    <td>Mano de Obra / Personal</td>
                    <td className="text-end">{formatMoneda(metricas.personal)}</td>
                    <td className="text-end text-muted">
                      {metricas.costoTotal > 0
                        ? ((metricas.personal / metricas.costoTotal) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </td>
                  </tr>
                )}
                <tr className="table-secondary fw-bold">
                  <td>Total Costo Real del Proyecto</td>
                  <td className="text-end">{formatMoneda(metricas.costoTotal)}</td>
                  <td className="text-end">100.0%</td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* Sección 4: Flujo de Caja */}
          <section className="mb-4 report-section">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              4. Flujo de Caja y Liquidez
            </h5>
            <Table hover responsive size="sm" className="align-middle border">
              <tbody>
                <tr>
                  <td>Monto Total Facturado al Cliente</td>
                  <td className="text-end">{formatMoneda(flujoCaja.facturado)}</td>
                </tr>
                <tr>
                  <td>(-) Retención SUNAT Aplicada</td>
                  <td className="text-end text-danger">-{formatMoneda(metricas.retencion)}</td>
                </tr>
                {metricas.detraccion > 0 && (
                  <tr>
                    <td>(-) Detracción Depositada (Cuenta Banco de la Nación)</td>
                    <td className="text-end text-warning">-{formatMoneda(metricas.detraccion)}</td>
                  </tr>
                )}
                <tr className="table-light fw-bold">
                  <td>Ingreso Neto Esperado en Cuenta Corriente</td>
                  <td className="text-end">{formatMoneda(flujoCaja.ingresoNetoEsperado)}</td>
                </tr>
                <tr>
                  <td>(-) Costo Real Total Ejecutado (CRT)</td>
                  <td className="text-end text-danger">-{formatMoneda(metricas.costoTotal)}</td>
                </tr>
                <tr className="table-primary fw-bold">
                  <td>Utilidad Neta Líquida Estimada</td>
                  <td
                    className={`text-end ${
                      flujoCaja.utilidadNetaLiquida >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatMoneda(flujoCaja.utilidadNetaLiquida)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* Sección 5: Lista Detallada de Gastos */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              5. Lista Detallada de Gastos ({gastos.infoTablaGastos?.length || 0} registros)
            </h5>
            <TablaGastos items={gastos.infoTablaGastos || []} />
          </section>

          {/* Sección 6: Lista Detallada de Ingresos */}
          <section className="mb-2">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              6. Lista Detallada de Ingresos y Cobros
            </h5>
            <TablaIngresos idProyecto={infoPrincipal.id || idProyecto} />
          </section>
        </Card.Body>
      </Card>
    </Container>
  );
}

// ==========================================
// COMPONENTES AUXILIARES DE TABLAS INTERNAS
// ==========================================

function TablaGastos({ items = [] }) {
  if (!items.length) {
    return <p className="text-muted fst-italic small">No hay gastos registrados en este proyecto.</p>;
  }

  return (
    <Table bordered hover responsive size="sm" className="align-middle text-center">
      <thead className="table-light">
        <tr>
          <th>Fecha</th>
          <th>Cant.</th>
          <th>U.M.</th>
          <th className="text-start">Descripción</th>
          <th className="text-end">P. Unitario</th>
          <th className="text-end">Total</th>
          <th>Comprobante</th>
        </tr>
      </thead>
      <tbody>
        {items.map((g, idx) => (
          <tr key={g.idGasto || idx}>
            <td>{g.fecha}</td>
            <td>{g.cantidad}</td>
            <td>{g.unidadMedida}</td>
            <td className="text-start text-truncate print-wrap-text" style={{ maxWidth: "280px" }}>
              {g.descripcion}
            </td>
            <td className="text-end">{formatMoneda(g.precioUnitario)}</td>
            <td className="text-end fw-semibold">{formatMoneda(g.total)}</td>
            <td>
              <Badge bg="light" text="dark" className="border">
                {g.comprobante || "S/N"}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TablaIngresos({ idProyecto }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!idProyecto) return;
      try {
        setLoading(true);
        const res = await getListIngresosProyectoDB(idProyecto);
        const cleanData = convertirMoneda(res || []);

        if (isMounted) {
          setList(cleanData);
        }
      } catch (error) {
        console.error("Error al obtener ingresos:", error);
        if (isMounted) setList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [idProyecto]);

  return (
    <div className="table-responsive">
      <Table striped bordered hover size="sm" className="align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th className="text-start">Descripción</th>
            <th className="text-end">Monto Recibido</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th className="text-end">Monto Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-3">
                Cargando detalle de ingresos...
              </td>
            </tr>
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-3">
                No hay ingresos registrados para este proyecto.
              </td>
            </tr>
          ) : (
            list.map((e) => {
              const doc = e.documentos_tributarios;
              const tieneComprobante = doc?.serie_comprobante && doc?.nro_comprobante;
              const esNotaCredito = e.tipo_ingreso === "nc emitida";
              const comprobanteTexto = tieneComprobante
                ? `${doc.serie_comprobante.toUpperCase()}-${doc.nro_comprobante}`
                : "S/N";

              return (
                <tr key={e.id}>
                  <td>{e.fecha}</td>
                  <td>
                    <Badge bg={e.tipo_ingreso === "devolucion" || esNotaCredito ? "warning" : "success"}>
                      {SetCapitalLetter(e.tipo_ingreso || "")}
                    </Badge>
                  </td>
                  <td className="text-start">{SetCapitalLetter(e.descripcion || "")}</td>
                  <td className={`text-end fw-bold ${esNotaCredito ? "text-danger" : "text-success"}`}>
                    {esNotaCredito ? formatMoneda(-e.monto_total) : formatMoneda(e.monto_total)}
                  </td>
                  <td>
                    <Badge
                      bg={
                        e.estado === "confirmado"
                          ? "success"
                          : e.estado === "anulado"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {SetCapitalLetter(e.estado || "")}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={tieneComprobante ? "secondary" : "light"}
                      text={tieneComprobante ? "white" : "dark"}
                      className="border"
                    >
                      {comprobanteTexto}
                    </Badge>
                  </td>
                  <td className="text-end text-success fw-bold">
                    {doc?.monto ? formatMoneda(doc.monto) : "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
}