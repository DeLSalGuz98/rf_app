// ProjectReport.jsx
import { Container, Row, Col, Table, Card, Button } from "react-bootstrap";
import { usePrintReport } from "../hooks/printReportHook";
import { useEffect, useState, useMemo } from "react";
import { getReportProjectDataDB } from "../querysDB/projects/getReportProjectData";
import { useNavigate, useParams } from "react-router-dom";
import { SetCapitalLetter } from "../utils/setCapitalLetterString";

export function ProjectReport() {
  const { idProyecto } = useParams();
  const [dataReportProject, setDataReportProject] = useState({});
  const [dataExpenditure, setDataExpenditure] = useState([]);
  const [dataTaxDoc, setDataTaxDoc] = useState([]);
  const [printRef, handlePrint] = usePrintReport();
  const navigation = useNavigate()

  // 🔹 Obtiene la información del proyecto al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      const res = await getReportProjectDataDB(idProyecto);
      setDataReportProject(res);
      setDataExpenditure(res.gastos || []);
      setDataTaxDoc(res.documentos_tributarios || []);
    };
    fetchData();
  }, [idProyecto]);

  const backPage = ()=>{
    navigation(-1)
  }

  // 🔹 Calcula los gastos facturados, no facturados y total
  const gastosFacturanoYNo = useMemo(() => {
    let totalFacturado = 0;
    let totalNoFacturado = 0;

    dataExpenditure.forEach((g) => {
      const monto =
        g.moneda !== "PEN" ? g.monto_total * g.tipo_cambio : g.monto_total;
      g.serie_comprobante && g.nro_comprobante
        ? (totalFacturado += monto)
        : (totalNoFacturado += monto);
    });

    return {
      facturado: totalFacturado,
      noFacturado: totalNoFacturado,
      total: totalFacturado + totalNoFacturado,
    };
  }, [dataExpenditure]);

  // 🔹 Agrupa gastos por categoría
  const gastosPorCategoria = useMemo(() => {
    const agrupado = dataExpenditure.reduce((acc, g) => {
      const categoria = g.categoria;
      const monto =
        g.moneda !== "PEN" ? g.monto_total * g.tipo_cambio : g.monto_total;
      acc[categoria] = (acc[categoria] || 0) + monto;
      return acc;
    }, {});
    return Object.entries(agrupado).map(([categoria, montoTotal]) => ({
      categoria,
      montoTotal,
    }));
  }, [dataExpenditure]);

  // 🔹 Calcula flujo de caja (liquidez)
  const flujoCaja = useMemo(() => {
    const totalRetenido = dataTaxDoc
      .filter((d) => d.tipo_doc === "retencion recibido")
      .reduce((acc, d) => acc + d.monto, 0);

    const facturado = dataReportProject.monto_ofertado || 0;
    const gastosTotal = gastosFacturanoYNo.total;

    return {
      montoFacturado: facturado,
      totalGastos: gastosTotal,
      retencionSunat: totalRetenido,
      ingresoNeto: facturado - totalRetenido,
      utilidadNeta: facturado - totalRetenido - gastosTotal,
    };
  }, [dataTaxDoc, dataReportProject, gastosFacturanoYNo]);

  // 🔹 Cálculos derivados del proyecto
  const utilidadNeta =
    (dataReportProject.monto_ofertado || 0) - gastosFacturanoYNo.total;
  const margenBrutoPorc = useMemo(() => {
    if (!dataReportProject.monto_ofertado) return 0;
    return (
      (utilidadNeta / dataReportProject.monto_ofertado) *
      100
    );
  }, [dataReportProject, utilidadNeta]);

  return (
    <Container className="my-5">
      <Card className="border ">
        <Card.Body>
          {/* Sección imprimible */}
          <div ref={printRef}>
            <h3 className="text-primary mb-4">
              {dataReportProject.nombre_proyecto} -{" "}
              {SetCapitalLetter(dataReportProject.descripcion_proyecto)} -{" "}
              {SetCapitalLetter(dataReportProject.tipo)}
            </h3>

            {/* 1️⃣ Información General */}
            <h4>1. Información General</h4>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Cliente:</strong>{" "}
                  {SetCapitalLetter(dataReportProject.rs_cliente)} (RUC:{" "}
                  {dataReportProject.ruc_cliente})
                </p>
                {dataReportProject.unidad_ejecutora && (
                  <>
                    <p>
                      <strong>Unidad Ejecutora:</strong>{" "}
                      {dataReportProject.unidad_ejecutora}
                    </p>
                    <p>
                      <strong>Expediente SIAF:</strong>{" "}
                      {dataReportProject.exp_siaf}
                    </p>
                  </>
                )}
                <p>
                  <strong>Dirección:</strong>{" "}
                  {`${SetCapitalLetter(dataReportProject.direccion)}, ${SetCapitalLetter(
                    dataReportProject.distrito
                  )}, ${SetCapitalLetter(
                    dataReportProject.departamento
                  )}, ${SetCapitalLetter(dataReportProject.provincia)}`}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Fecha de Inicio:</strong>{" "}
                  {dataReportProject.fecha_inicio}
                </p>
                <p>
                  <strong>Fecha de Final:</strong>{" "}
                  {dataReportProject.fecha_fin}
                </p>
                <p>
                  <strong>Monto Contratado:</strong> S/{" "}
                  {Number(dataReportProject.monto_ofertado || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  {SetCapitalLetter(dataReportProject.estado)}
                </p>
              </Col>
            </Row>

            {/* 2️⃣ Balance de Rentabilidad */}
            <h4>2. Balance de Rentabilidad (Gerencial)</h4>
            <Table bordered responsive className="text-right align-middle">
              <tbody>
                <tr>
                  <td className="text-left">A. Ingresos Totales Facturados</td>
                  <td>S/. {dataReportProject.monto_ofertado?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-left">B. Costo Real Total (CRT)</td>
                  <td>S/. {gastosFacturanoYNo.total.toFixed(2)}</td>
                </tr>
                <tr className="text-secondary fst-italic">
                  <td className="text-left">B.1. Costos facturados</td>
                  <td>S/. {gastosFacturanoYNo.facturado.toFixed(2)}</td>
                </tr>
                <tr className="text-secondary fst-italic">
                  <td className="text-left">B.2. Costos no facturados</td>
                  <td>S/. {gastosFacturanoYNo.noFacturado.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-left">C. Utilidad Bruta (A - B)</td>
                  <td>S/. {utilidadNeta.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-left fw-bold">Margen Bruto (%)</td>
                  <td
                    className={`fw-bold ${
                      margenBrutoPorc >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {margenBrutoPorc.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* 3️⃣ Control de Gastos por Categoría */}
            <h4>3. Control de Gastos por Categoría (CGC)</h4>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Monto (S/.)</th>
                </tr>
              </thead>
              <tbody>
                {gastosPorCategoria.map((g, i) => (
                  <tr key={i}>
                    <td>{SetCapitalLetter(g.categoria)}</td>
                    <td>S/. {g.montoTotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="fw-bold bg-light">
                  <td>Total Costo Real del Proyecto</td>
                  <td>S/. {gastosFacturanoYNo.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>

            {/* 4️⃣ Documentos Relacionados */}
            <h4>4. Documentos Relacionados</h4>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo Documento</th>
                  <th>Serie</th>
                  <th>Número</th>
                  <th>Moneda</th>
                  <th>Tipo Cambio</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {dataTaxDoc.map((d) => {
                  if(d.tipo_doc !== "factura recibida"){
                    return (
                    <tr key={d.id}>
                      <td>{d.fecha_emision}</td>
                      <td>{SetCapitalLetter(d.tipo_doc)}</td>
                      <td className="text-uppercase">{d.serie_comprobante}</td>
                      <td>{d.nro_comprobante}</td>
                      <td>{d.moneda}</td>
                      <td>{d.tipo_cambio?.toFixed(3) || "0.000"}</td>
                      <td>
                        {d.moneda === "PEN" ? "S/ " : "$ "}
                        {d.monto.toFixed(2)}
                      </td>
                      <td>{d.estado_comprobante}</td>
                    </tr>
                    )  
                  }
                })}
              </tbody>
            </Table>

            {/* 5️⃣ Flujo de Caja */}
            <h4>5. Flujo de Caja (Liquidez)</h4>
            <Table bordered responsive className="text-right">
              <tbody>
                <tr>
                  <td className="text-left">Monto Facturado al Cliente</td>
                  <td>S/ {flujoCaja.montoFacturado.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-left">(-) Retención SUNAT</td>
                  <td>S/ {flujoCaja.retencionSunat.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-left fw-bold">Ingreso Neto</td>
                  <td className="fw-bold">
                    S/ {flujoCaja.ingresoNeto.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="text-left">(-) Total Gastos Pagados (CRT)</td>
                  <td>S/ {flujoCaja.totalGastos.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold bg-light">
                  <td className="text-left">Utilidad Neta</td>
                  <td
                    className={
                      flujoCaja.utilidadNeta >= 0
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    S/ {flujoCaja.utilidadNeta.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
            {/* 5️⃣ Flujo de Caja */}
            <h4>6. Lista de Gastos</h4>
            <h5>6.1. Gastos Directos</h5>
            <Table bordered responsive className="text-right">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                  <th>Unidad <br />Medida</th>
                  <th>Descripcion</th>
                  <th>P. Unitario</th>
                  <th>Total</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {
                  dataExpenditure.map(g=>{
                    if(g.tipo==="directo"){
                      let precioUnit = g.moneda!=="PEN"?g.precio_unitario*g.tipo_cambio:g.precio_unitario
                      let total = g.cantidad * precioUnit
                      return(
                        <tr>
                          <td className="text-left">{g.fecha}</td>
                          <td>{g.cantidad}</td>
                          <td>{g.unidad_medida}</td>
                          <td className="description-expenditure-report">{g.descripcion}</td>
                          <td>S/. {precioUnit.toFixed(2)}</td>
                          <td>S/. {total.toFixed(2)}</td>
                          <td className="text-uppercase">{g.serie_comprobante}-{g.nro_comprobante}</td>
                        </tr>
                      )
                    }
                  })
                }
              </tbody>
            </Table>
            <h5>6.2. Gastos Indirectos</h5>
            <Table bordered responsive className="text-right">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cantidad</th>
                  <th>Unidad <br />Medida</th>
                  <th>Descripcion</th>
                  <th>P. Unitario</th>
                  <th>Total</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {
                  dataExpenditure.map(g=>{
                    if(g.tipo==="indirecto"){
                      let precioUnit = g.moneda!=="PEN"?g.precio_unitario*g.tipo_cambio:g.precio_unitario
                      let total = g.cantidad * precioUnit
                      return(
                        <tr>
                          <td className="text-left">{g.fecha}</td>
                          <td>{g.cantidad}</td>
                          <td>{g.unidad_medida}</td>
                          <td className="description-expenditure-report">{g.descripcion}</td>
                          <td>S/. {precioUnit.toFixed(2)}</td>
                          <td>S/. {total.toFixed(2)}</td>
                          <td className="text-uppercase">{g.serie_comprobante}-{g.nro_comprobante}</td>
                        </tr>
                      )
                    }
                  })
                }
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Botón de impresión */}
        <Card.Footer className="d-flex gap-2 justify-content-center">
          <Button className="" variant="primary" onClick={handlePrint}>
            Imprimir 
          </Button>
          <Button className="" variant="outline-secondary" onClick={backPage}>
            Regresar
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}