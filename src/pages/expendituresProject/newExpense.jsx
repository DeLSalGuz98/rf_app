/**
 * NUEVO FLUJO DE REGISTRO DE GASTOS
 * --------------------------------
 * OBJETIVO:
 * - Convertir el registro en un flujo guiado
 * - Mejorar UX sin romper la lógica existente
 * - Mantener RHF + Zod + Queries actuales
 * - Separar visualmente el proceso
 */

import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
  Badge,
  Alert
} from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";

// COMPONENTES
import { NewInvoice } from "./newInvoice";
import { NewExpenditureItem } from "./newItemExpense";

// QUERIES
import { saveTaxDocumentDB } from "../../querysDB/taxDocument/saveTaxDocument";
import { saveBolckExpenditureDB } from "../../querysDB/gastos/saveExpenditure";

export function NewExpensePage() {

  const { idProyecto } = useParams();
  const navigate = useNavigate();

  /**
   * =========================
   * ESTADOS PRINCIPALES
   * =========================
   */

  // Flujo actual
  const [currentStep, setCurrentStep] = useState("type");

  // ¿Tiene comprobante?
  const [hasInvoice, setHasInvoice] = useState(null);

  // Datos factura
  const [dataInvoice, setDataInvoice] = useState({});

  // Lista items
  const [dataItemInvoice, setDataItemInvoice] = useState([]);

  // Loading guardado
  const [saving, setSaving] = useState(false);

  /**
   * =========================
   * HELPERS
   * =========================
   */

  const isProjectContext = !!idProyecto;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value || 0);

  /**
   * =========================
   * FLUJO
   * =========================
   */

  // PASO 1
  const handleSelectInvoiceOption = (value) => {

    setHasInvoice(value);

    if (value) {
      setCurrentStep("invoice");
    } else {
      setCurrentStep("items");
    }
  };

  // PASO 2
  const handleInvoiceSaved = (data) => {

    setDataInvoice(data);

    // pasar automáticamente a items
    setCurrentStep("items");
  };

  // PASO 3
  const addItemInvoice = (dataItem) => {

    setDataItemInvoice(prev => [...prev, dataItem]);
  };

  const deleteItemInvoice = (index) => {

    setDataItemInvoice(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  /**
   * =========================
   * GUARDAR TODO
   * =========================
   */

  const saveAllItems = async () => {

    try {

      setSaving(true);

      // Guardar comprobante
      if (hasInvoice && Object.keys(dataInvoice).length > 0) {

        const invoiceData = isProjectContext
          ? { ...dataInvoice, id_proyecto: idProyecto }
          : dataInvoice;

        await saveTaxDocumentDB(invoiceData);
      }

      // Guardar items
      const itemsToSave = dataItemInvoice.map(item => {

        return isProjectContext
          ? { ...item, id_proyecto: idProyecto }
          : item;
      });

      await saveBolckExpenditureDB(itemsToSave);

      navigate(-1);

    } catch (error) {

      console.error(error);

    } finally {

      setSaving(false);
    }
  };

  /**
   * =========================
   * TOTAL
   * =========================
   */

  const totalAmount = dataItemInvoice.reduce(
    (sum, item) => sum + parseFloat(item.monto_total || 0),
    0
  );

  return (
    <Container fluid className="py-4 px-4">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-bold mb-1">
            Registro de Gastos
          </h3>

          <p className="text-muted mb-0">
            Registra comprobantes e ítems del proyecto
          </p>
        </div>

        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Regresar
        </Button>

      </div>

      {/* ===================================================== */}
      {/* STEPPER */}
      {/* ===================================================== */}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>

          <div className="d-flex justify-content-between align-items-center">

            <div className="text-center flex-fill">
              <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                currentStep === "type"
                  ? "bg-primary text-white"
                  : "bg-light"
              }`}
              style={{ width: 45, height: 45 }}
              >
                1
              </div>

              <small>
                Tipo de Registro
              </small>
            </div>

            <div className="flex-fill border-top"></div>

            <div className="text-center flex-fill">
              <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                currentStep === "invoice"
                  ? "bg-primary text-white"
                  : Object.keys(dataInvoice).length > 0
                  ? "bg-success text-white"
                  : "bg-light"
              }`}
              style={{ width: 45, height: 45 }}
              >
                2
              </div>

              <small>
                Documento
              </small>
            </div>

            <div className="flex-fill border-top"></div>

            <div className="text-center flex-fill">
              <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                currentStep === "items"
                  ? "bg-primary text-white"
                  : dataItemInvoice.length > 0
                  ? "bg-success text-white"
                  : "bg-light"
              }`}
              style={{ width: 45, height: 45 }}
              >
                3
              </div>

              <small>
                Gastos
              </small>
            </div>

          </div>

        </Card.Body>
      </Card>

      {/* ===================================================== */}
      {/* CONTENIDO */}
      {/* ===================================================== */}

      <Row>

        {/* ===================================================== */}
        {/* IZQUIERDA */}
        {/* ===================================================== */}

        <Col lg={7}>

          {/* PASO 1 */}
          {currentStep === "type" && (

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body className="p-4">

                <h4 className="fw-bold mb-3">
                  ¿El gasto tiene comprobante?
                </h4>

                <p className="text-muted mb-4">
                  Selecciona cómo deseas registrar este gasto.
                </p>

                <div className="d-flex gap-3">

                  <Button
                    size="lg"
                    variant="primary"
                    className="flex-fill py-3"
                    onClick={() => handleSelectInvoiceOption(true)}
                  >
                    Sí, registrar comprobante
                  </Button>

                  <Button
                    size="lg"
                    variant="outline-secondary"
                    className="flex-fill py-3"
                    onClick={() => handleSelectInvoiceOption(false)}
                  >
                    No tiene comprobante
                  </Button>

                </div>

              </Card.Body>

            </Card>
          )}

          {/* PASO 2 */}
          {currentStep === "invoice" && (

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body>

                <div className="mb-4">

                  <h4 className="fw-bold">
                    Registrar Documento
                  </h4>

                  <p className="text-muted mb-0">
                    Completa la información del comprobante tributario.
                  </p>

                </div>

                <NewInvoice
                  hideInvoiceForm={handleInvoiceSaved}
                  isProjectContext={isProjectContext}
                  idProyecto={idProyecto}
                />

              </Card.Body>

            </Card>
          )}

          {/* PASO 3 */}
          {currentStep === "items" && (

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body>

                <div className="mb-4">

                  <h4 className="fw-bold">
                    Registrar Gastos
                  </h4>

                  <p className="text-muted mb-0">
                    Agrega los ítems relacionados al gasto.
                  </p>

                </div>

                <NewExpenditureItem
                  title=""
                  isProjectContext={isProjectContext}
                  idProyecto={idProyecto}
                  defaultData={{
                    serie: dataInvoice?.serie_comprobante || "",
                    nro: dataInvoice?.nro_comprobante || "",
                    fecha: dataInvoice?.fecha_emision || ""
                  }}
                  addItemInvoice={addItemInvoice}
                />

              </Card.Body>

            </Card>
          )}

        </Col>

        {/* ===================================================== */}
        {/* PANEL DERECHO */}
        {/* ===================================================== */}

        <Col lg={5}>

          <div className="sticky-top" style={{ top: 20 }}>

            <Card className="border-0 shadow-sm rounded-4">

              <Card.Body>

                {/* HEADER */}
                <div className="mb-4">

                  <h4 className="fw-bold mb-1">
                    Resumen del Registro
                  </h4>

                  <p className="text-muted mb-0">
                    Estado actual del proceso
                  </p>

                </div>

                {/* ESTADO */}
                <div className="mb-4">

                  <Alert variant="light" className="border">

                    {dataItemInvoice.length === 0 ? (
                      <>
                        ⚠ Aún no hay gastos registrados
                      </>
                    ) : (
                      <>
                        ✅ Registro listo para guardar
                      </>
                    )}

                  </Alert>

                </div>

                {/* FACTURA */}
                {hasInvoice && Object.keys(dataInvoice).length > 0 && (

                  <div className="mb-4">

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <h6 className="fw-bold mb-0">
                        Documento
                      </h6>

                      <Badge bg="success">
                        Registrado
                      </Badge>

                    </div>

                    <div className="small">

                      <p className="mb-2">
                        <strong>Proveedor:</strong><br />
                        {dataInvoice.razon_social}
                      </p>

                      <p className="mb-2">
                        <strong>Comprobante:</strong><br />
                        {dataInvoice.serie_comprobante} - {dataInvoice.nro_comprobante}
                      </p>

                      <p className="mb-0">
                        <strong>Fecha:</strong><br />
                        {dataInvoice.fecha_emision}
                      </p>

                      <p className="mb-0">
                        <strong>Monto Facturado:</strong><br />
                        <strong>S/.</strong> {Number(dataInvoice.monto).toFixed(2)}
                      </p>

                    </div>

                  </div>
                )}

                {/* ITEMS */}
                <div className="mb-4">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h6 className="fw-bold mb-0">
                      Ítems Registrados
                    </h6>

                    <Badge bg="primary">
                      {dataItemInvoice.length}
                    </Badge>

                  </div>

                  {dataItemInvoice.length === 0 ? (

                    <p className="text-muted small">
                      No hay ítems agregados
                    </p>

                  ) : (

                    <div
                      style={{
                        maxHeight: 250,
                        overflow: "auto"
                      }}
                    >

                      <Table size="sm" hover>

                        <tbody>

                          {dataItemInvoice.map((item, index) => (

                            <tr key={index}>

                              <td>
                                <div className="fw-semibold">
                                  {item.descripcion}
                                </div>

                                <small className="text-muted">
                                  {item.cantidad} {item.unidad_medida}
                                </small>
                              </td>

                              <td className="text-end text-nowrap">
                                {formatCurrency(item.monto_total)}
                              </td>

                              <td width={40}>

                                <Button
                                  size="sm"
                                  variant="light"
                                  onClick={() => deleteItemInvoice(index)}
                                >
                                  ×
                                </Button>

                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </Table>

                    </div>

                  )}

                </div>

                {/* TOTAL */}
                <Card className="bg-light border-0">

                  <Card.Body>

                    <small className="text-muted">
                      Total acumulado
                    </small>

                    <h2 className="fw-bold text-success mb-0">
                      {formatCurrency(totalAmount)}
                    </h2>

                  </Card.Body>

                </Card>

                {/* BOTÓN */}
                <Button
                  className="w-100 mt-4 py-3"
                  size="lg"
                  disabled={dataItemInvoice.length === 0 || saving}
                  onClick={saveAllItems}
                >

                  {saving
                    ? "Guardando..."
                    : "Guardar Registro"
                  }

                </Button>

              </Card.Body>

            </Card>

          </div>

        </Col>

      </Row>

    </Container>
  );
}