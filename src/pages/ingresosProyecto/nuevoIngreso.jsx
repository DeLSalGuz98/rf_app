import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  Badge,
  Alert,
  Form
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// COMPONENTES
import { NewInvoiceForm } from "../documentosTributarios/documentoTributarioForm";

// QUERIES
import { saveTaxDocumentDB } from "../../querysDB/taxDocument/saveTaxDocument";
import { saveIngresoDB } from "../../querysDB/ingresos/saveIngresoBD";

export function NuevoIngresoPage() {
  const { idProyecto } = useParams();
  const navigate = useNavigate();

  /**
   * =====================================================
   * ESTADOS PRINCIPALES (Estructura idéntica a Gastos)
   * =====================================================
   */
  const [currentStep, setCurrentStep] = useState("type"); // "type" | "invoice" | "items"
  const [hasInvoice, setHasInvoice] = useState(null);
  const [dataInvoice, setDataInvoice] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * =====================================================
   * FORMULARIO INGRESO (Paso 3)
   * =====================================================
   */
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tipo_ingreso: "adelanto",
      descripcion: "",
      moneda: "PEN",
      tipo_cambio: "",
      monto_total: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "pendiente",
    },
  });

  // Watchers para el panel derecho en tiempo real
  const currentMoneda = watch("moneda");
  const currentDescripcion = watch("descripcion");
  const currentMonto = watch("monto_total");
  const currentTipoIngreso = watch("tipo_ingreso");

  const isProjectContext = !!idProyecto;

  const formatCurrency = (value, currencyType = "PEN") =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currencyType,
    }).format(value || 0);

  /**
   * =====================================================
   * FLUJO DEL STEPPER
   * =====================================================
   */

  // PASO 1: Selección de Tipo de Registro
  const handleSelectInvoiceOption = (value) => {
    setHasInvoice(value);
    if (value) {
      setCurrentStep("invoice");
    } else {
      setCurrentStep("items");
    }
  };

  // PASO 2: Documento guardado en estado local temporal
  const handleInvoiceSaved = (data) => {
    setDataInvoice(data);
    setCurrentStep("items");
  };

  /**
   * =====================================================
   * GUARDAR TODO (Procesamiento Final)
   * =====================================================
   */
  const onSubmitAll = async (incomeFormData) => {
    try {
      setSaving(true);
      let idComprobante = null;

      // 1. Guardar Comprobante en la DB si existe
      if (hasInvoice && Object.keys(dataInvoice).length > 0) {
        const savedInvoice = await saveTaxDocumentDB(dataInvoice, idProyecto);
        idComprobante = savedInvoice.id;
      }

      // 2. Construir payload limpio del ingreso asociado al comprobante
      const payloadIncome = {
        ...incomeFormData,
        id_comprobante: idComprobante,
        tipo_cambio: isNaN(incomeFormData.tipo_cambio) || incomeFormData.tipo_cambio === "" ? 0 : incomeFormData.tipo_cambio
      };

      // 3. Guardar Ingreso en la DB
      await saveIngresoDB(payloadIncome, idProyecto);

      toast.success("Ingreso financiero registrado con éxito");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4 px-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Registro de Ingresos</h3>
          <p className="text-muted mb-0">Registra comprobantes de pago e ingresos del proyecto</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          ← Regresar
        </Button>
      </div>

      {/* STEPPER */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            {/* Paso 1 */}
            <div className="text-center flex-fill">
              <div
                className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                  currentStep === "type" ? "bg-primary text-white" : "bg-light"
                }`}
                style={{ width: 45, height: 45 }}
              >
                1
              </div>
              <small>Tipo de Registro</small>
            </div>

            <div className="flex-fill border-top"></div>

            {/* Paso 2 */}
            <div className="text-center flex-fill">
              <div
                className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
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
              <small>Documento</small>
            </div>

            <div className="flex-fill border-top"></div>

            {/* Paso 3 */}
            <div className="text-center flex-fill">
              <div
                className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                  currentStep === "items" ? "bg-primary text-white" : "bg-light"
                }`}
                style={{ width: 45, height: 45 }}
              >
                3
              </div>
              <small>Datos de Ingreso</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* CONTENIDO PRINCIPAL */}
      <Row>
        {/* COLUMNA IZQUIERDA: FORMULARIOS DINÁMICOS */}
        <Col lg={7}>
          {/* PASO 1: Selector de tipo */}
          {currentStep === "type" && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">¿El ingreso tiene comprobante?</h4>
                <p className="text-muted mb-4">Selecciona cómo deseas registrar este flujo monetario.</p>
                <div className="d-flex gap-3">
                  <Button
                    size="lg"
                    variant="primary"
                    className="flex-fill py-3"
                    onClick={() => handleSelectInvoiceOption(true)}
                  >
                    Sí tiene comprobante
                  </Button>
                  <Button
                    size="lg"
                    variant="outline-secondary"
                    className="flex-fill py-3"
                    onClick={() => handleSelectInvoiceOption(false)}
                  >
                    Sin comprobante tributario
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* PASO 2: Formulario del Comprobante */}
          {currentStep === "invoice" && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <div className="mb-4">
                  <h4 className="fw-bold">Registrar Documento Emitido</h4>
                  <p className="text-muted mb-0">Completa la información tributaria de la factura o boleta.</p>
                </div>
                <NewInvoiceForm
                  hideInvoiceForm={handleInvoiceSaved}
                  isProjectContext={isProjectContext}
                  idProyecto={idProyecto}
                  defaultInvoiceDataValue={{
                    tipo_doc: "factura emitida",
                    fecha_emision: "",
                    fecha_vencimiento: "",
                    serie_comprobante: "",
                    nro_comprobante: "",
                    ruc: "",
                    razon_social: "",
                    monto: "",
                    moneda: "PEN",
                    tipo_cambio: "",
                    mes_declarado: new Date().toISOString().slice(0, 7),
                    estado_comprobante: "pendiente",
                  }}
                />
              </Card.Body>
            </Card>
          )}

          {/* PASO 3: Formulario Detallado del Ingreso */}
          {currentStep === "items" && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="mb-4">
                  <h4 className="fw-bold">Información Financiera</h4>
                  <p className="text-muted mb-0">Completa los detalles del ingreso para guardarlo en el proyecto.</p>
                </div>

                <Form onSubmit={handleSubmit(onSubmitAll)}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Label>Tipo de ingreso</Form.Label>
                      <Form.Select {...register("tipo_ingreso")}>
                        <option value="adelanto">Adelanto</option>
                        <option value="pago parcial">Pago parcial</option>
                        <option value="pago final">Pago final</option>
                        <option value="garantia">Garantía</option>
                        <option value="devolucion">Devolución</option>
                      </Form.Select>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Label>Estado</Form.Label>
                      <Form.Select {...register("estado")}>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="anulado">Anulado</option>
                      </Form.Select>
                    </Col>

                    <Col md={12} className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control
                        {...register("descripcion", { required: "La descripción es requerida" })}
                        placeholder="Ej. Liquidación de hito 1 o entrega de materiales"
                      />
                      {errors.descripcion && (
                        <small className="text-danger">{errors.descripcion.message}</small>
                      )}
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Label>Monto</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.0001"
                        {...register("monto_total", { 
                          required: "El monto es requerido",
                          valueAsNumber: true 
                        })}
                      />
                      {errors.monto_total && (
                        <small className="text-danger">{errors.monto_total.message}</small>
                      )}
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Label>Moneda</Form.Label>
                      <Form.Select {...register("moneda")}>
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                      </Form.Select>
                    </Col>

                    {currentMoneda === "USD" && (
                      <Col md={4} className="mb-3">
                        <Form.Label>Tipo cambio</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.0001"
                          {...register("tipo_cambio", { valueAsNumber: true })}
                        />
                      </Col>
                    )}

                    <Col md={4} className="mb-3">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control type="date" {...register("fecha")} />
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 mt-4 py-3"
                    disabled={saving}
                  >
                    {saving ? "Guardando Registro..." : "Finalizar y Guardar Ingreso"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* COLUMNA DERECHA: PANEL DE RESUMEN FIJO */}
        <Col lg={5}>
          <div className="sticky-top" style={{ top: 20 }}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body>
                <div className="mb-4">
                  <h4 className="fw-bold mb-1">Resumen del Registro</h4>
                  <p className="text-muted mb-0">Estado actual del proceso</p>
                </div>

                {/* Alerta de Estado */}
                <div className="mb-4">
                  <Alert variant="light" className="border mb-0">
                    {currentStep !== "items" ? (
                      <>⚠ Configurando datos iniciales del flujo</>
                    ) : (
                      <>✅ Formulario final listo para guardar</>
                    )}
                  </Alert>
                </div>

                {/* Datos del Comprobante Registrado en Paso 2 */}
                {hasInvoice && Object.keys(dataInvoice).length > 0 && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0">Documento Asociado</h6>
                      <Badge bg="success">Registrado Local</Badge>
                    </div>
                    <div className="small bg-light p-3 rounded-3 border">
                      <p className="mb-2">
                        <strong>Cliente / Razón Social:</strong><br />
                        {dataInvoice.razon_social || "No especificado"}
                      </p>
                      <p className="mb-2">
                        <strong>Comprobante:</strong><br />
                        {dataInvoice.serie_comprobante} - {dataInvoice.nro_comprobante}
                      </p>
                      <p className="mb-0">
                        <strong>Monto Facturado:</strong><br />
                        {formatCurrency(dataInvoice.monto, dataInvoice.moneda)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Datos de la transacción de Ingreso en tiempo real (Paso 3) */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Detalle Financiero</h6>
                  {currentDescripcion || currentMonto ? (
                    <div className="small">
                      <p className="mb-2">
                        <strong>Categoría:</strong> <span className="text-capitalize">{currentTipoIngreso}</span>
                      </p>
                      <p className="mb-0">
                        <strong>Descripción:</strong> {currentDescripcion}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted small">No hay detalles del ingreso todavía.</p>
                  )}
                </div>

                {/* Total Caja Acumulado */}
                <Card className="bg-light border-0">
                  <Card.Body>
                    <small className="text-muted">Total a ingresar en caja</small>
                    <h2 className="fw-bold text-success mb-0">
                      {formatCurrency(currentMonto, currentMoneda)}
                    </h2>
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}