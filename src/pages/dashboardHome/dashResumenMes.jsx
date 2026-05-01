import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";
import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Funciones
import { getMonthDataDB } from "../../querysDB/dashInfo/getMonthData";

export const MonthlySummary = () => {
  const [dataMonth, setDataMonth] = useState({
    facturasEmitidas:0,
    facturasRecibidas:0,
    ncEmitido:0,
    ncRecibido:0,
    retencionesRecibidas:0,
    resultadoNeto:0,
    porcentajeNeto:0
  })
  useEffect(()=>{
    getMonthDataArray()
  },[])
  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    return `${year}-${month}`;
  };
  const getMonthDataArray = async()=>{
    const res = await getMonthDataDB(getCurrentYearMonth())
    setDataMonth(getResumenEstadoDelMes(res))    
  }
  const getResumenEstadoDelMes = (facturas = []) => {
    // Mapeo de tus valores actuales a claves internas
    const mapTipos = {
      "factura emitida": "FE",
      "factura recibida": "FR",
      "nc emitido": "NCe",
      "nc recibido": "NCr",
      "retencion recibido": "RET",
      "r.h. recibido": "RH",
    };

    // Acumulador principal
    const resumen = facturas.reduce(
      (acc, doc) => {

        // Convertir monto a número
        let monto = Number(doc.monto) || 0;

        // Convertir USD a PEN
        if (doc.moneda === "USD") {
          const tc = Number(doc.tipo_cambio) || 0;
          monto *= tc;
        }

        // Normalizar texto (minúsculas + trim)
        const tipo = doc.tipo_doc?.toLowerCase().trim();

        // Buscar en el mapa
        const key = mapTipos[tipo];

        if (key) acc[key] += monto;

        return acc;
      },
      {
        FE: 0,   // Facturas emitidas
        FR: 0,   // Facturas recibidas
        NCe: 0,  // NC emitidas
        NCr: 0,  // NC recibidas
        RET: 0,  // Retenciones
        RH: 0,   // Recibos por honorarios
      }
    );

    // Resultado neto
    const resultadoNeto = Number((resumen.FE - resumen.NCe) - (resumen.FR - resumen.NCr)).toFixed(2)

    // Porcentaje vs ventas
    const porcentajeNeto =
      resumen.FE > 0
        ? Number((resultadoNeto / resumen.FE) * 100).toFixed(2)
        : 0;

    return {
      facturasEmitidas: Number(resumen.FE).toFixed(2),
      facturasRecibidas: Number(resumen.FR).toFixed(2),
      ncEmitido: Number(resumen.NCe).toFixed(2),
      ncRecibido: Number(resumen.NCr).toFixed(2),
      retencionesRecibidas: Number(resumen.RET).toFixed(2),
      recibosHonorarios: Number(resumen.RH).toFixed(2), // opcional extra útil
      resultadoNeto,
      porcentajeNeto,
    }
  }
  const getTituloResumenMes = () => {
    const mes = format(new Date(), "MMMM", { locale: es });
    
    // Capitalizar primera letra
    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

    return `Resumen del Mes de ${mesCapitalizado}`;
  };
  return (
    <div className="mb-4">
      <h4 className="mb-3">{getTituloResumenMes()}</h4>
      <Row className="g-3">
        {/* Facturas Emitidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Facturas Emitidas</p>
                  <h5 className="fw-bold mb-0">S/ {Number(dataMonth.facturasEmitidas).toFixed(2)}</h5>
                </div>
                <i className="bi bi-receipt fs-3 text-primary"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Facturas Recibidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Facturas Recibidas</p>
                  <h5 className="fw-bold mb-0">S/ {Number(dataMonth.facturasRecibidas).toFixed(2)}</h5>
                </div>
                <i className="bi bi-box-seam fs-3 text-warning"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Emitidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">NC Emitidas</p>
                  <h5 className="fw-bold mb-0">S/ {Number(dataMonth.ncEmitido).toFixed(2)}</h5>
                </div>
                <i className="bi bi-arrow-return-left fs-3 text-danger"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Recibidas */}
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">NC Recibidas</p>
                  <h5 className="fw-bold mb-0">S/ {Number(dataMonth.ncRecibido).toFixed(2)}</h5>
                </div>
                <i className="bi bi-arrow-return-right fs-3 text-info"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila */}
      <Row className="g-3 mt-1">
        {/* Retenciones */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <p className="text-muted mb-1">Retenciones</p>
              <h5 className="fw-bold mb-0">S/ {Number(dataMonth.retencionesRecibidas).toFixed(2)}</h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Resultado */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <p className="text-muted mb-1">Resultado Neto</p>
              <h5 className="fw-bold mb-0 text-success">S/ {Number(dataMonth.resultadoNeto).toFixed(2)}</h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Porcentaje */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <p className="text-muted mb-1">% vs Ventas</p>
              <h5 className="fw-bold mb-0 text-primary"> {Number(dataMonth.porcentajeNeto).toFixed(2)}%</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};