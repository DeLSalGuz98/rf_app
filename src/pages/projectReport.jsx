import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Row, Col, Table, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { usePrintReport } from "../hooks/printReportHook";
import { getReportProjectDataDB } from "../querysDB/projects/getReportProjectData";
import { getListIngresosProyectoDB } from "../querysDB/ingresos/getListIngresosProyecto";
import { getInfoFinancieraProyectoDB } from "../querysDB/projects/getInfoFnanciera";

import { SetCapitalLetter } from "../utils/setCapitalLetterString";
import { exportToExcel } from "../utils/exportToExcel";
import { convertirMoneda } from "../utils/convertirMoneda";

// ==========================================
// FUNCIONES AUXILIARES (UTILIDADES)
// ==========================================

const getMontoSoles = (monto = 0, moneda = "PEN", tipoCambio = 1) => {
  const numMonto = Number(monto) || 0;
  const numTC = Number(tipoCambio) || 1;
  return moneda !== "PEN" ? numMonto * numTC : numMonto;
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatComprobante = (serie, nro) => {
  if (!serie && !nro) return "S/N";
  return `${(serie || "").toUpperCase()}-${nro || ""}`;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export function ProjectReport() {
  const { idProyecto } = useParams();
  const navigate = useNavigate();
  const [printRef, handlePrint] = usePrintReport();

  const [loading, setLoading] = useState(true);
  const [dataReportProject, setDataReportProject] = useState({});
  const [dataExpenditure, setDataExpenditure] = useState([]);
  const [dataTaxDoc, setDataTaxDoc] = useState([]);
  const [financialInfo, setFinancialInfo] = useState({
    monto_detraccion: 0,
    monto_adelanto: 0,
  });

  // ------------------------------------------
  // CÁLCULO DE MÉTRICAS FINANCIERAS
  // ------------------------------------------
  const calculateFinancialMetrics = useCallback((res) => {
    if (!res || !Array.isArray(res.ingresos)) {
      return { monto_detraccion: 0, monto_adelanto: 0 };
    }

    const totalDetraccion = res.ingresos.reduce((acc, item) => {
      const montoDetraccion =
        item?.documentos_tributarios?.factura?.[0]?.monto_detraccion || 0;
      return acc + Number(montoDetraccion);
    }, 0);

    const totalAdelanto = res.ingresos.reduce((acc, item) => {
      const tipo = item?.tipo_ingreso;
      const monto = Number(item?.monto_total) || 0;

      if (tipo === "devolucion") return acc;
      if (tipo === "nc emitida") return acc - monto;
      return acc + monto;
    }, 0);

    return {
      monto_detraccion: totalDetraccion,
      monto_adelanto: totalAdelanto,
    };
  }, []);

  // ------------------------------------------
  // CARGA DE DATOS EN PARALELO
  // ------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProject, resFinancialInfo] = await Promise.all([
          getReportProjectDataDB(idProyecto),
          getInfoFinancieraProyectoDB(idProyecto),
        ]);

        if (isMounted) {
          if (resProject) {
            setDataReportProject(resProject);
            setDataExpenditure(resProject.gastos || []);
            setDataTaxDoc(resProject.documentos_tributarios || []);
          }
          if (resFinancialInfo) {
            const metrics = calculateFinancialMetrics(resFinancialInfo);
            setFinancialInfo(metrics);
          }
        }
      } catch (err) {
        console.error("Error al obtener datos del reporte:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (idProyecto) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [idProyecto, calculateFinancialMetrics]);

  // ------------------------------------------
  // CÁLCULOS OPTIMIZADOS (MEMOIZADOS)
  // ------------------------------------------

  // Clasificación de gastos en una sola pasada
  const { gastosDirectos, gastosIndirectos } = useMemo(() => {
    const directos = [];
    const indirectos = [];

    dataExpenditure.forEach((g) => {
      if (g.tipo === "directo") directos.push(g);
      else if (g.tipo === "indirecto") indirectos.push(g);
    });

    return { gastosDirectos: directos, gastosIndirectos: indirectos };
  }, [dataExpenditure]);

  // Totales de gastos facturados vs no facturados
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

  // Flujo de caja y retenciones
  const flujoCaja = useMemo(() => {
    const retenciones = dataTaxDoc.filter((d) => d.tipo_doc === "retencion recibido");
    const totalRetenido = retenciones.reduce((acc, d) => acc + (Number(d.monto) || 0), 0);

    const totalDetracciones = dataTaxDoc
      .filter((d) => d.tipo_doc === "detraccion")
      .reduce((acc, d) => acc + (Number(d.monto) || 0), 0);

    const facturado = Number(dataReportProject.monto_ofertado) || 0;
    const gastosTotal = gastosFacturadoYNo.total;

    const tieneExpSiaf = Boolean(dataReportProject.exp_siaf?.trim());
    const tieneComprobante = retenciones.length > 0 && totalRetenido > 0;

    let retencionAplicada = 0;
    let esEstimado = false;

    if (tieneComprobante) {
      retencionAplicada = totalRetenido;
      esEstimado = false;
    } else if (tieneExpSiaf) {
      retencionAplicada = facturado * 0.03;
      esEstimado = true;
    }

    const ingresoNeto = facturado - retencionAplicada;
    const utilidadNeta = ingresoNeto - gastosTotal;

    return {
      montoFacturado: facturado,
      totalGastos: gastosTotal,
      retencionSunat: retencionAplicada,
      montoDetraccion: totalDetracciones,
      esEstimado,
      ingresoNeto,
      utilidadNeta,
    };
  }, [dataTaxDoc, dataReportProject, gastosFacturadoYNo.total]);

  // Margen y Utilidad Bruta
  const { utilidadNetaBruta, margenBrutoPorc } = useMemo(() => {
    const ofertado = Number(dataReportProject.monto_ofertado) || 0;
    const utilidadBruta = ofertado - gastosFacturadoYNo.total;
    const porcentaje = ofertado > 0 ? (utilidadBruta / ofertado) * 100 : 0;

    return {
      utilidadNetaBruta: utilidadBruta,
      margenBrutoPorc: porcentaje,
    };
  }, [dataReportProject.monto_ofertado, gastosFacturadoYNo.total]);

  // Exportar Excel
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
        <p className="text-muted">Cargando reporte de proyecto...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Botones de Acción */}
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

      {/* Reporte Principal Imprimible */}
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Body className="p-4" ref={printRef}>
          {/* Cabecera */}
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

          {/* Tarjetas de Métricas Clave */}
          <Row className="g-3 mb-4">
            <Col sm={6} md={4} lg={3}>
              <Card className="border-start border-4 border-primary shadow-sm h-100">
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Monto Contratado</small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(dataReportProject.monto_ofertado)}</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={3}>
              <Card className="border-start border-4 border-info shadow-sm h-100">
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Monto Adelanto</small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(financialInfo.monto_adelanto)}</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={3}>
              <Card className="border-start border-4 border-warning shadow-sm h-100">
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Costo Real Total</small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(gastosFacturadoYNo.total)}</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={3}>
              <Card className={`border-start border-4 border-${utilidadNetaBruta >= 0 ? "success" : "danger"} shadow-sm h-100`}>
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Utilidad Bruta Est.</small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(utilidadNetaBruta)}</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={4}>
              <Card className={`border-start border-4 border-${margenBrutoPorc >= 0 ? "success" : "danger"} shadow-sm h-100`}>
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Margen Bruto Est.</small>
                  <h5 className="fw-bold mb-0 mt-1">{margenBrutoPorc.toFixed(2)}%</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={4}>
              <Card className="border-start border-4 border-secondary shadow-sm h-100">
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">Monto Detracciones</small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(financialInfo.monto_detraccion)}</h5>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} md={4} lg={4}>
              <Card className="border-start border-4 border-dark shadow-sm h-100">
                <Card.Body className="p-3">
                  <small className="text-muted fw-semibold text-uppercase">
                    Monto Retención {flujoCaja.esEstimado ? "(Estimado 3%)" : ""}
                  </small>
                  <h5 className="fw-bold mb-0 mt-1">{formatCurrency(flujoCaja.retencionSunat)}</h5>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sección 1: Información General */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              1. Información General
            </h5>
            <Card className="bg-light border-0">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Cliente:</strong>{" "}
                      {SetCapitalLetter(dataReportProject.rs_cliente || "")} (RUC: {dataReportProject.ruc_cliente || "-"})
                    </p>
                    {dataReportProject.unidad_ejecutora && (
                      <>
                        <p className="mb-2 fs-6">
                          <strong className="text-secondary">Unidad Ejecutora:</strong> {dataReportProject.unidad_ejecutora}
                        </p>
                        <p className="mb-2 fs-6">
                          <strong className="text-secondary">Expediente SIAF:</strong> {dataReportProject.exp_siaf}
                        </p>
                      </>
                    )}
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Dirección:</strong>{" "}
                      {[
                        dataReportProject.direccion,
                        dataReportProject.distrito,
                        dataReportProject.provincia,
                        dataReportProject.departamento,
                      ]
                        .filter(Boolean)
                        .map(SetCapitalLetter)
                        .join(", ")}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Fecha de Inicio:</strong> {dataReportProject.fecha_inicio || "-"}
                    </p>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Fecha de Finalización:</strong> {dataReportProject.fecha_fin || "-"}
                    </p>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Monto Contratado:</strong> {formatCurrency(dataReportProject.monto_ofertado)}
                    </p>
                    <p className="mb-2 fs-6">
                      <strong className="text-secondary">Estado del Proyecto:</strong> {SetCapitalLetter(dataReportProject.estado || "-")}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </section>

          {/* Sección 2: Balance de Rentabilidad */}
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

          {/* Sección 3: Control de Gastos por Categoría */}
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
                {gastosPorCategoria.map((g) => (
                  <tr key={g.categoria}>
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

          {/* Sección 4: Flujo de Caja */}
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
                    {flujoCaja.esEstimado && (
                      <Badge bg="warning" text="dark">Estimado 3%</Badge>
                    )}
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
                  <td>Utilidad Neta Líquida</td>
                  <td className={`text-end ${flujoCaja.utilidadNeta >= 0 ? "text-success" : "text-danger"}`}>
                    {formatCurrency(flujoCaja.utilidadNeta)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </section>

          {/* Sección 5: Listas de Gastos */}
          <section className="mb-4">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              5. Lista Detallada de Gastos
            </h5>

            <h6 className="fw-bold text-secondary mt-3 mb-2">5.1 Gastos Directos</h6>
            <TablaGastos items={gastosDirectos} />

            <h6 className="fw-bold text-secondary mt-4 mb-2">5.2 Gastos Indirectos</h6>
            <TablaGastos items={gastosIndirectos} />
          </section>

          {/* Sección 6: Lista de Ingresos */}
          <section className="mb-2">
            <h5 className="fw-bold text-dark mb-3 border-start border-4 border-primary ps-2">
              6. Lista Detallada de Ingresos
            </h5>
            <TablaIngresos idProyecto={idProyecto} />
          </section>
        </Card.Body>
      </Card>
    </Container>
  );
}

// ==========================================
// TABLAS INTERNAS (MISMOS COMPONENTES LOCALE)
// ==========================================

function TablaGastos({ items = [] }) {
  if (!items.length) {
    return <p className="text-muted fst-italic small">No hay gastos registrados en esta categoría.</p>;
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
            <th>Monto Recibido</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Monto Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-3">
                Cargando ingresos...
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

              return (
                <tr key={e.id}>
                  <td>{e.fecha}</td>
                  <td>
                    <Badge bg={e.tipo_ingreso === "devolucion" || esNotaCredito ? "warning" : "success"}>
                      {SetCapitalLetter(e.tipo_ingreso || "")}
                    </Badge>
                  </td>
                  <td className="text-start">{SetCapitalLetter(e.descripcion || "")}</td>
                  <td className={esNotaCredito ? "text-danger fw-bold" : "text-success fw-bold"}>
                    {esNotaCredito ? formatCurrency(-e.monto_total) : formatCurrency(e.monto_total)}
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
                      {tieneComprobante
                        ? formatComprobante(doc.serie_comprobante, doc.nro_comprobante)
                        : "S/N"}
                    </Badge>
                  </td>
                  <td className="text-success fw-bold">
                    {doc?.monto ? formatCurrency(doc.monto) : "-"}
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