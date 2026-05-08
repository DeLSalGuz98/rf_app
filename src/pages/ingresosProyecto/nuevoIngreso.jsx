import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

//Componentes
import { NewInvoiceForm } from "../documentosTributarios/documentoTributarioForm";
import { saveTaxDocumentDB } from "../../querysDB/taxDocument/saveTaxDocument";
import { saveIngresoDB } from "../../querysDB/ingresos/saveIngresoBD";

export function NuevoIngresoPage() {
  const navigate = useNavigate();
  const { idProyecto } = useParams();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [step, setStep] = useState(1);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // FORMULARIO INGRESO
  // =====================================================

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
      fecha: new Date()
        .toISOString()
        .split("T")[0],
      estado: "pendiente",
    },
  });

  // =====================================================
  // WATCHERS
  // =====================================================

  const moneda = watch("moneda");

  // =====================================================
  // SUBMIT INGRESO
  // =====================================================

  const onSubmitIncome = (data) => {
    setIncomeData(data);
    // ===============================================
    // SI TIENE FACTURA
    // ===============================================

    if (hasInvoice) {
      setStep(2);
      return;
    }
    // ===============================================
    // SI NO TIENE FACTURA
    // ===============================================

    saveAll(data, null);
  };

  // =====================================================
  // SUBMIT FACTURA
  // =====================================================

  const onSubmitInvoice = (data) => {
    setInvoiceData(data);
    saveAll(incomeData, data);
  };

  // =====================================================
  // GUARDAR TODO
  // =====================================================

  const saveAll = async (income, invoice) => {
    try {
      setSaving(true);
      let idComprobante = null;
      // ===============================================
      // GUARDAR COMPROBANTE
      // ===============================================

      if (invoice) {
        const savedInvoice = await saveTaxDocumentDB(invoice, idProyecto);
        idComprobante = savedInvoice.id;
      }

      // ===============================================
      // PAYLOAD INGRESO
      // ===============================================

      const payloadIncome = {
        ...income,
        id_comprobante: idComprobante,
        tipo_cambio: income.tipo_cambio===""?0:income.tipo_cambio
      };
      // ===============================================
      // GUARDAR INGRESO
      // ===============================================
      await saveIngresoDB(payloadIncome, idProyecto)

      navigate(-1);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);

    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <Container fluid className="py-4 px-4">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Registrar ingreso
          </h3>
          <small className="text-muted">
            Registro financiero del proyecto
          </small>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Regresar
        </Button>
      </div>

      <Row>

        {/* ================================================= */}
        {/* FORMULARIOS */}
        {/* ================================================= */}

        <Col lg={8}>

          {/* ================================================= */}
          {/* PASO 1 */}
          {/* ================================================= */}

          {step === 1 && (
            <Card className="border rounded-4">
              <Card.Body className="p-4">
                <div className="mb-4">
                  <Badge bg="success" className="mb-2">
                    PASO 1
                  </Badge>
                  <h5 className="fw-semibold mb-0">
                    Información del ingreso
                  </h5>
                </div>
                <Form onSubmit={handleSubmit(onSubmitIncome)}>
                  <Row>
                    {/* TIPO INGRESO */}
                    <Col md={6} className="mb-3">
                      <Form.Label>
                        Tipo de ingreso
                      </Form.Label>
                      <Form.Select {...register("tipo_ingreso")}>
                        <option value="adelanto">
                          Adelanto
                        </option>
                        <option value="pago parcial">
                          Pago parcial
                        </option>
                        <option value="pago final">
                          Pago final
                        </option>
                        <option value="garantia">
                          Garantía
                        </option>
                      </Form.Select>
                    </Col>

                    {/* ESTADO */}
                    <Col md={6} className="mb-3">
                      <Form.Label>
                        Estado
                      </Form.Label>
                      <Form.Select {...register("estado")}>
                        <option value="pendiente">
                          Pendiente
                        </option>
                        <option value="confirmado">
                          Confirmado
                        </option>
                        <option value="anulado">
                          Anulado
                        </option>
                      </Form.Select>
                    </Col>

                    {/* DESCRIPCIÓN */}
                    <Col md={12} className="mb-3">
                      <Form.Label>
                        Descripción
                      </Form.Label>
                      <Form.Control
                        {...register("descripcion", {
                          required: true,
                        })}
                      />
                      {errors.descripcion && (
                        <small className="text-danger">
                          La descripción es requerida
                        </small>
                      )}
                    </Col>

                    {/* MONTO */}
                    <Col md={4} className="mb-3">
                      <Form.Label>
                        Monto
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.0001"
                        {...register("monto_total", {
                          required: true,
                        })}
                      />
                    </Col>

                    {/* MONEDA */}
                    <Col md={4} className="mb-3">
                      <Form.Label>
                        Moneda
                      </Form.Label>
                      <Form.Select {...register("moneda")}>
                        <option value="PEN">
                          PEN
                        </option>
                        <option value="USD">
                          USD
                        </option>
                      </Form.Select>
                    </Col>

                    {/* TIPO CAMBIO */}
                    {moneda === "USD" && (
                      <Col md={4} className="mb-3">
                        <Form.Label>
                          Tipo cambio
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.0001"
                          {...register("tipo_cambio")}
                        />
                      </Col>
                    )}

                    {/* FECHA */}
                    <Col md={4} className="mb-3">
                      <Form.Label>
                        Fecha
                      </Form.Label>
                      <Form.Control
                        type="date"
                        {...register("fecha")}
                      />
                    </Col>
                  </Row>

                  {/* SWITCH */}
                  <Card className="bg-light border-0 rounded-4 mt-3">
                    <Card.Body>
                      <Form.Check
                        type="switch"
                        label="Este ingreso tiene comprobante"
                        checked={hasInvoice}
                        onChange={(e) =>
                          setHasInvoice(e.target.checked)
                        }
                      />
                    </Card.Body>
                  </Card>

                  {/* BOTÓN */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 mt-4"
                    disabled={saving}
                  >
                    {hasInvoice
                      ? "Continuar →"
                      : "Guardar ingreso"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

          {/* ================================================= */}
          {/* PASO 2 */}
          {/* ================================================= */}

          {step === 2 && (
            <NewInvoiceForm
              hideInvoiceForm={onSubmitInvoice}
              isProjectContext={true}
              idProyecto={idProyecto}
              defaultInvoiceDataValue={{
                tipo_doc: "factura emitida",
                fecha_emision: incomeData?.fecha,
                fecha_vencimiento: incomeData?.fecha,
                serie_comprobante: "",
                nro_comprobante: "",
                ruc: "",
                razon_social: "",
                monto: incomeData?.monto_total,
                moneda: incomeData?.moneda,
                tipo_cambio: incomeData?.tipo_cambio,
                mes_declarado: new Date()
                  .toISOString()
                  .slice(0, 7),
                estado_comprobante: "pendiente",
              }}
            />
          )}
        </Col>

        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <Col lg={4}>
          <Card className="border rounded-4 sticky-top">
            <Card.Body className="p-4">
              <h5 className="fw-semibold mb-4">
                Resumen
              </h5>
              {incomeData ? (
                <>
                  <div className="mb-3">
                    <small className="text-muted">
                      Tipo ingreso
                    </small>
                    <div className="fw-semibold">
                      {incomeData.tipo_ingreso}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      Descripción
                    </small>
                    <div className="fw-semibold">
                      {incomeData.descripcion}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      Monto
                    </small>
                    <div className="fw-bold fs-3 text-success">
                      {incomeData.moneda}
                      {" "}
                      {incomeData.monto_total}
                    </div>
                  </div>
                  {invoiceData && (
                    <>
                      <hr />
                      <div className="mb-3">
                        <small className="text-muted">
                          Comprobante
                        </small>
                        <div className="fw-semibold">
                          {invoiceData.tipo_doc}
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">
                          Razón social
                        </small>
                        <div className="fw-semibold">
                          {invoiceData.razon_social}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted">
                  Complete el formulario para visualizar
                  el resumen.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}