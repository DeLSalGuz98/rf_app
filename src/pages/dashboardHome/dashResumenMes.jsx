import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Función para obtener los datos del mes desde la base de datos
import { getMonthDataDB } from "../../querysDB/dashInfo/getMonthData";

/**
 * Componente MonthlySummary
 * Muestra el resumen financiero del mes actual o de meses anteriores seleccionados por el usuario,
 * calculando facturas, notas de crédito, retenciones y la utilidad o resultado neto.
 */
export const MonthlySummary = () => {
  // Estado para almacenar los valores procesados del resumen del mes
  const [dataMonth, setDataMonth] = useState({
    facturasEmitidas: 0,
    facturasRecibidas: 0,
    ncEmitido: 0,
    ncRecibido: 0,
    retencionesRecibidas: 0,
    recibosHonorarios: 0,
    resultadoNeto: 0,
    porcentajeNeto: 0,
  });

  const [loading, setLoading] = useState(false);
  
  /**
   * Obtiene el año y mes actual en formato "YYYY-MM" para los inputs de tipo month.
   */
  const getCurrentYearMonth = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  // Estado para el mes seleccionado (formato 'YYYY-MM')
  const [selectedYearMonth, setSelectedYearMonth] = useState(getCurrentYearMonth());

  /**
   * Carga los datos financieros del mes seleccionado desde el backend.
   */
  const fetchMonthData = useCallback(async (yearMonth) => {
    setLoading(true);
    try {
      const res = await getMonthDataDB(yearMonth);
      const resumenProcesado = getResumenEstadoDelMes(res || []);
      setDataMonth(resumenProcesado);
    } catch (error) {
      console.error("Error al obtener los datos del mes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto que se dispara cada vez que cambia el mes seleccionado
  useEffect(() => {
    fetchMonthData(selectedYearMonth);
  }, [selectedYearMonth, fetchMonthData]);

  /**
   * Procesa y agrupa los documentos del mes aplicando conversiones de moneda y cálculos lógicos.
   * 
   * @param {Array} [facturas=[]] - Lista de documentos financieros obtenidos de la base de datos.
   * @returns {Object} Objeto con las métricas calculadas y formateadas a dos decimales.
   */
  const getResumenEstadoDelMes = (facturas = []) => {
    const mapTipos = {
      "factura emitida": "FE",
      "factura recibida": "FR",
      "nc emitido": "NCe",
      "nc recibido": "NCr",
      "retencion recibido": "RET",
      "r.h. recibido": "RH",
    };

    const resumen = facturas.reduce(
      (acc, doc) => {
        let monto = Number(doc.monto) || 0;

        // Conversión de USD a PEN si aplica tipo de cambio
        if (doc.moneda === "USD") {
          const tc = Number(doc.tipo_cambio) || 0;
          monto *= tc;
        }

        const tipo = doc.tipo_doc?.toLowerCase().trim();
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

    // Cálculo del resultado neto
    const resultadoNeto = Number((resumen.FE - resumen.NCe) - (resumen.FR - resumen.NCr)).toFixed(2);

    // Porcentaje vs ventas (Facturas emitidas)
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
      recibosHonorarios: Number(resumen.RH).toFixed(2),
      resultadoNeto,
      porcentajeNeto,
    };
  };

  /**
   * Genera dinámicamente el título formateado según el mes seleccionado en formato largo en español.
   * 
   * @returns {string} Título del reporte (Ej: "Resumen del Mes de Octubre 2026")
   */
  const getTituloResumenMes = () => {
    try {
      // Parseamos el string 'YYYY-MM' añadiéndole el día 01 para poder formatearlo con date-fns
      const fechaParseada = parseISO(`${selectedYearMonth}-01`);
      const mesNombre = format(fechaParseada, "MMMM", { locale: es });
      const anio = format(fechaParseada, "yyyy");

      const mesCapitalizado = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1);
      return `Resumen de ${mesCapitalizado} ${anio}`;
    } catch {
      return "Resumen Financiero del Mes";
    }
  };

  return (
    <div className="mb-4">
      
      {/* Cabecera con Título dinámico y Selector de Meses Pasados */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">
        <div className="d-flex align-items-center gap-2">
          <h4 className="mb-0 fw-bold">{getTituloResumenMes()}</h4>
          {loading && <Spinner animation="border" size="sm" variant="primary" />}
        </div>

        {/* Controles para cambiar de mes */}
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="month"
            value={selectedYearMonth}
            onChange={(e) => {
              if (e.target.value) setSelectedYearMonth(e.target.value);
            }}
            size="sm"
            style={{ width: "170px" }}
            title="Seleccionar mes y año"
          />
          {selectedYearMonth !== getCurrentYearMonth() && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSelectedYearMonth(getCurrentYearMonth())}
              title="Volver al mes actual"
            >
              Mes Actual
            </Button>
          )}
        </div>
      </div>

      {/* Primera Fila de Tarjetas */}
      <Row className="g-3">
        
        {/* Facturas Emitidas */}
        <Col md={3} sm={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-medium">FACTURAS EMITIDAS</p>
                  <h5 className="fw-bold mb-0 text-primary">S/ {Number(dataMonth.facturasEmitidas).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h5>
                </div>
                <i className="bi bi-receipt fs-3 text-primary opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Facturas Recibidas */}
        <Col md={3} sm={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-medium">FACTURAS RECIBIDAS</p>
                  <h5 className="fw-bold mb-0 text-warning">S/ {Number(dataMonth.facturasRecibidas).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h5>
                </div>
                <i className="bi bi-box-seam fs-3 text-warning opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Emitidas */}
        <Col md={3} sm={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-medium">NC EMITIDAS</p>
                  <h5 className="fw-bold mb-0 text-danger">S/ {Number(dataMonth.ncEmitido).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h5>
                </div>
                <i className="bi bi-arrow-return-left fs-3 text-danger opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* NC Recibidas */}
        <Col md={3} sm={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small fw-medium">NC RECIBIDAS</p>
                  <h5 className="fw-bold mb-0 text-info">S/ {Number(dataMonth.ncRecibido).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h5>
                </div>
                <i className="bi bi-arrow-return-right fs-3 text-info opacity-75"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* Segunda Fila de Tarjetas (Indicadores y Retenciones) */}
      <Row className="g-3 mt-1">
        
        {/* Retenciones */}
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <p className="text-muted mb-1 small fw-medium">RETENCIONES</p>
              <h5 className="fw-bold mb-0 text-dark">S/ {Number(dataMonth.retencionesRecibidas).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Resultado Neto */}
        <Col md={4} sm={6}>
          <Card className="shadow-sm border-0 bg-light h-100 border-start border-success border-4">
            <Card.Body>
              <p className="text-muted mb-1 small fw-medium">RESULTADO NETO</p>
              <h5 className={`fw-bold mb-0 ${Number(dataMonth.resultadoNeto) >= 0 ? "text-success" : "text-danger"}`}>
                S/ {Number(dataMonth.resultadoNeto).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </h5>
            </Card.Body>
          </Card>
        </Col>

        {/* Porcentaje vs Ventas */}
        <Col md={4} sm={12}>
          <Card className="shadow-sm border-0 bg-light h-100 border-start border-primary border-4">
            <Card.Body>
              <p className="text-muted mb-1 small fw-medium">% VS VENTAS</p>
              <h5 className="fw-bold mb-0 text-primary">
                {Number(dataMonth.porcentajeNeto).toFixed(2)}%
              </h5>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
};