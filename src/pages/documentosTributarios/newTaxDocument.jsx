import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col, Container, Card, Badge, Spinner, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import { saveTaxDocumentDB } from "../../querysDB/taxDocument/saveTaxDocument";
import { obtenerRazonSocialPorRUC } from "../../utils/rsPorRuc";
import { listStateTaxDocument } from "../../utils/listStateTaxDocument";

/* HELPER PARA OBTENER EL MES ACTUAL EN FORMATO YYYY-MM */
const getCurrentYearMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/* ESQUEMA DE VALIDACIÓN ZOD */
const docTributarioSchema = z
  .object({
    tipo_doc: z.string().min(1, "Seleccione el tipo de documento"),
    fecha_emision: z.string().min(1, "La fecha de emisión es requerida"),
    fecha_vencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
    serie_comprobante: z.string().min(1, "La serie es requerida"),
    nro_comprobante: z.string().min(1, "El número es requerido"),
    ruc: z
      .string()
      .length(11, "El RUC debe tener exactamente 11 dígitos")
      .regex(/^\d+$/, "El RUC solo debe contener números"),
    razon_social: z.string().min(2, "La razón social es requerida"),
    monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
    moneda: z.enum(["PEN", "USD"], { message: "Seleccione una moneda válida" }),
    tipo_cambio: z.coerce.number().optional(),
    mes_declarado: z.string().min(1, "El mes declarado es requerido"),
    estado_comprobante: z.enum([
      "pendiente",
      "devengado",
      "girado",
      "con retencion",
      "pagado",
      "atrasado",
      "anulado",
      "archivado",
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.moneda === "USD" && (!data.tipo_cambio || data.tipo_cambio <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese un tipo de cambio válido para USD",
        path: ["tipo_cambio"],
      });
    }
  });

export function NewTaxDocument() {
  const navigate = useNavigate();
  const [loadingRuc, setLoadingRuc] = useState(false);
  const [rucStatus, setRucStatus] = useState(null); // 'found' | 'not_found' | null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(docTributarioSchema),
    defaultValues: {
      tipo_doc: "factura emitida",
      moneda: "PEN",
      estado_comprobante: "archivado",
      mes_declarado: getCurrentYearMonth(),
      fecha_emision: "",
      fecha_vencimiento: "",
      serie_comprobante: "",
      nro_comprobante: "",
      ruc: "",
      razon_social: "",
      monto: "",
      tipo_cambio: "",
    },
  });

  const emitDate = watch("fecha_emision");
  const ruc = watch("ruc");
  const moneda = watch("moneda");
  const estado = watch("estado_comprobante");

  const lastFetchedRuc = useRef("");

  /* BLOQUEO DE RUEDA DEL MOUSE PARA INPUTS NUMÉRICOS */
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement?.type === "number") {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  /* AUTO-COMPLETAR VENCIMIENTO SÓLO SI ESTÁ VACÍO */
  useEffect(() => {
    if (emitDate && !getValues("fecha_vencimiento")) {
      setValue("fecha_vencimiento", emitDate, { shouldValidate: true });
    }
  }, [emitDate, setValue, getValues]);

  /* CONSULTA DE RUC CON ESTADOS DE CARGA */
  useEffect(() => {
    if (ruc?.length === 11) {
      if (ruc !== lastFetchedRuc.current) {
        getRsByRuc(ruc);
      }
    } else {
      setRucStatus(null);
    }
  }, [ruc]);

  const getRsByRuc = async (rucVal) => {
    try {
      setLoadingRuc(true);
      setRucStatus(null);
      const res = await obtenerRazonSocialPorRUC(rucVal);
      if (res) {
        setValue("razon_social", res, { shouldValidate: true });
        lastFetchedRuc.current = rucVal;
        setRucStatus("found");
      } else {
        setRucStatus("not_found");
      }
    } catch (error) {
      console.error("Error al consultar RUC:", error);
      setRucStatus("not_found");
    } finally {
      setLoadingRuc(false);
    }
  };

  const onSubmit = async (data) => {
    await saveTaxDocumentDB(data);
    reset({
      tipo_doc: "factura emitida",
      moneda: "PEN",
      estado_comprobante: "archivado",
      mes_declarado: getCurrentYearMonth(),
      fecha_emision: "",
      fecha_vencimiento: "",
      serie_comprobante: "",
      nro_comprobante: "",
      ruc: "",
      razon_social: "",
      monto: "",
      tipo_cambio: "",
    });
    lastFetchedRuc.current = "";
    setRucStatus(null);
  };

  const getBadgeVariant = (state) => {
    switch (state) {
      case "pagado": return "success";
      case "pendiente": return "warning";
      case "atrasado": return "danger";
      case "anulado": return "dark";
      case "archivado": return "secondary";
      default: return "info";
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "920px" }}>
      <h3 className="fw-bold mb-4">Registrar Documento Tributario</h3>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* HEADER CON BADGE DE ESTADO */}
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 border">
          <div>
            <h5 className="fw-bold mb-0">Estado del Registro</h5>
            <small className="text-muted">Verifique los datos antes de guardar</small>
          </div>
          <Badge bg={getBadgeVariant(estado)} className="px-3 py-2 fs-6 text-uppercase">
            {estado}
          </Badge>
        </div>

        {/* SECCIÓN 1: DATOS DEL COMPROBANTE */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-file-earmark-text me-2"></i>1. Identificación del Comprobante
            </h6>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="tipo_doc">
                  <Form.Label className="fw-medium">Tipo de Documento</Form.Label>
                  <Form.Select {...register("tipo_doc")} isInvalid={!!errors.tipo_doc}>
                    <option value="factura emitida">Factura Emitida</option>
                    <option value="factura recibida">Factura Recibida</option>
                    <option value="nc emitido">Nota de Crédito Emitida</option>
                    <option value="nc recibido">Nota de Crédito Recibida</option>
                    <option value="retencion recibido">Comprobante de Retención</option>
                    <option value="r.h. recibido">Recibo por Honorarios (R.H.)</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tipo_doc?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="serie_comprobante">
                  <Form.Label className="fw-medium">Serie</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. F001"
                    {...register("serie_comprobante")}
                    isInvalid={!!errors.serie_comprobante}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.serie_comprobante?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="nro_comprobante">
                  <Form.Label className="fw-medium">Número</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. 00001234"
                    {...register("nro_comprobante")}
                    isInvalid={!!errors.nro_comprobante}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nro_comprobante?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECCIÓN 2: ENTIDAD EMISORA / RECEPTORA */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-building me-2"></i>2. Información del Contribuyente
            </h6>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="ruc">
                  <Form.Label className="fw-medium">RUC</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={11}
                    placeholder="20123456789"
                    {...register("ruc")}
                    isInvalid={!!errors.ruc}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ruc?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="mt-1" style={{ minHeight: "20px" }}>
                  {loadingRuc && (
                    <small className="text-primary d-flex align-items-center gap-1">
                      <Spinner animation="border" size="sm" style={{ borderWidth: "2px" }} />
                      Consultando SUNAT...
                    </small>
                  )}
                  {!loadingRuc && rucStatus === "found" && (
                    <small className="text-success fw-medium">✓ RUC Encontrado</small>
                  )}
                  {!loadingRuc && rucStatus === "not_found" && (
                    <small className="text-danger">✕ RUC no encontrado</small>
                  )}
                </div>
              </Col>

              <Col md={8}>
                <Form.Group controlId="razon_social">
                  <Form.Label className="fw-medium">Razón Social</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Razón social o nombre comercial"
                    {...register("razon_social")}
                    isInvalid={!!errors.razon_social}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.razon_social?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECCIÓN 3: FECHAS Y DECLARACIÓN */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-calendar-event me-2"></i>3. Fechas y Periodo Tributario
            </h6>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="fecha_emision">
                  <Form.Label className="fw-medium">Fecha de Emisión</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("fecha_emision")}
                    isInvalid={!!errors.fecha_emision}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fecha_emision?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="fecha_vencimiento">
                  <Form.Label className="fw-medium">Fecha de Vencimiento</Form.Label>
                  <Form.Control
                    type="date"
                    {...register("fecha_vencimiento")}
                    isInvalid={!!errors.fecha_vencimiento}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fecha_vencimiento?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="mes_declarado">
                  <Form.Label className="fw-medium">Mes Declarado</Form.Label>
                  <Form.Control
                    type="month"
                    {...register("mes_declarado")}
                    isInvalid={!!errors.mes_declarado}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mes_declarado?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECCIÓN 4: IMPORTES Y ESTADO */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="p-4">
            <h6 className="fw-bold text-primary mb-3">
              <i className="bi bi-cash-stack me-2"></i>4. Importes y Gestión
            </h6>
            <Row className="g-3">
              <Col md={moneda === "USD" ? 3 : 4}>
                <Form.Group controlId="moneda">
                  <Form.Label className="fw-medium">Moneda</Form.Label>
                  <Form.Select {...register("moneda")} isInvalid={!!errors.moneda}>
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.moneda?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={moneda === "USD" ? 3 : 4}>
                <Form.Group controlId="monto">
                  <Form.Label className="fw-medium">Monto Total</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("monto")}
                    isInvalid={!!errors.monto}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.monto?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {moneda === "USD" && (
                <Col md={3}>
                  <Form.Group controlId="tipo_cambio">
                    <Form.Label className="fw-medium">Tipo de Cambio</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.0001"
                      placeholder="3.750"
                      {...register("tipo_cambio")}
                      isInvalid={!!errors.tipo_cambio}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.tipo_cambio?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              <Col md={moneda === "USD" ? 3 : 4}>
                <Form.Group controlId="estado_comprobante">
                  <Form.Label className="fw-medium">Estado Tributario</Form.Label>
                  <Form.Select
                    {...register("estado_comprobante")}
                    isInvalid={!!errors.estado_comprobante}
                  >
                    {listStateTaxDocument.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.estado_comprobante?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* BOTONES DE ACCIÓN */}
        <div className="d-flex flex-column gap-2 mt-4">
          <Button
            type="submit"
            variant="primary"
            className="w-100 py-2 rounded-3 fw-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              "Guardar Documento Tributario"
            )}
          </Button>

          <Button
            variant="outline-secondary"
            className="w-100 py-2 rounded-3 fw-medium"
            onClick={() => navigate(-1)}
          >
            Regresar
          </Button>
        </div>
      </Form>
    </Container>
  );
}