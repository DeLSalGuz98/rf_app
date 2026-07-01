import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Row,
  Col,
  Button,
  Card,
  Form,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";

import { obtenerRazonSocialPorRUC } from "../../utils/rsPorRuc";
import { listStateTaxDocument } from "../../utils/listStateTaxDocument";

/* =========================================================
   VALIDACIÓN
========================================================= */

const docTributarioSchema = z.object({
  tipo_doc: z.string().min(1, "Seleccione un tipo"),
  fecha_emision: z.string().min(1, "Ingrese la fecha"),
  fecha_vencimiento: z.string().min(1, "Ingrese la fecha"),
  serie_comprobante: z.string().min(1, "Ingrese la serie"),
  nro_comprobante: z.string().min(1, "Ingrese el número"),
  ruc: z
    .string()
    .length(11, "El RUC debe tener exactamente 11 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener números"),
  razon_social: z.string().min(2, "Ingrese la razón social"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"]),
  tipo_cambio: z.coerce.number().optional(),
  mes_declarado: z.string().min(1, "Seleccione el mes"),
  estado_comprobante: z.string().min(1, "Seleccione el estado"),

  // Campos de Detracción (Facturas)
  sujeto_detraccion: z.boolean().optional(),
  porcentaje_detraccion: z.coerce.number().optional(),
  monto_detraccion: z.coerce.number().optional(),

  // Campos de Nota de Crédito
  serie_factura_afectada: z.string().optional(),
  nro_factura_afectada: z.string().optional(),
  motivo_sustento: z.string().optional(),
}).superRefine((data, ctx) => {
  // 1. Validación de Tipo de Cambio
  if (data.moneda === "USD" && (!data.tipo_cambio || data.tipo_cambio <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El tipo de cambio es requerido para Dólares",
      path: ["tipo_cambio"],
    });
  }

  // 2. Validación Condicional para FACTURAS (Detracción)
  if (data.tipo_doc.includes("factura") && data.sujeto_detraccion) {
    if (!data.porcentaje_detraccion || data.porcentaje_detraccion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese el porcentaje de detracción",
        path: ["porcentaje_detraccion"],
      });
    }
    if (!data.monto_detraccion || data.monto_detraccion <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese el monto de la detracción",
        path: ["monto_detraccion"],
      });
    }
  }

  // 3. Validación Condicional para NOTAS DE CRÉDITO
  if (data.tipo_doc.includes("nc ")) {
    if (!data.serie_factura_afectada || data.serie_factura_afectada.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese la serie de la factura afectada",
        path: ["serie_factura_afectada"],
      });
    }
    if (!data.nro_factura_afectada || data.nro_factura_afectada.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese el número de la factura afectada",
        path: ["nro_factura_afectada"],
      });
    }
    if (!data.motivo_sustento || data.motivo_sustento.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingrese el motivo o sustento de la nota de crédito",
        path: ["motivo_sustento"],
      });
    }
  }
});

/* =========================================================
   COMPONENTE
========================================================= */

export function NewInvoiceForm({ 
  hideInvoiceForm,  
  isProjectContext,  
  idProyecto, 
  defaultInvoiceDataValue = {
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
    mes_declarado: "",
    estado_comprobante: "archivado",
    sujeto_detraccion: false,
    porcentaje_detraccion: "",
    monto_detraccion: "",
    serie_factura_afectada: "",
    nro_factura_afectada: "",
    motivo_sustento: "",
  }
}) {
  const [loadingRuc, setLoadingRuc] = useState(false);
  const [rucFound, setRucFound] = useState(null);
  const ultimoRucConsultado = useRef("");

  const methods = useForm({
    resolver: zodResolver(docTributarioSchema),
    defaultValues: defaultInvoiceDataValue,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = methods;

  /* =========================================================
     WATCHERS
  ========================================================= */
  const tipoDoc = watch("tipo_doc");
  const fechaEmision = watch("fecha_emision");
  const moneda = watch("moneda");
  const ruc = watch("ruc");
  const estado = watch("estado_comprobante");
  const sujetoDetraccion = watch("sujeto_detraccion");

  /* =========================================================
     EFECTOS
  ========================================================= */
  useEffect(() => {
    if (fechaEmision) {
      setValue("fecha_vencimiento", fechaEmision);
      clearErrors("fecha_vencimiento");
    }
  }, [fechaEmision, setValue, clearErrors]);

  useEffect(() => {
    if (ruc?.length === 11) {
      if (ruc !== ultimoRucConsultado.current) {
        getRsByRuc(ruc);
      }
    } else {
      setRucFound(null);
    }
  }, [ruc]);

  // Limpiar campos condicionales si cambia el tipo de documento
  useEffect(() => {
    if (!tipoDoc?.includes("factura")) {
      setValue("sujeto_detraccion", false);
      setValue("porcentaje_detraccion", "");
      setValue("monto_detraccion", "");
    }
    if (!tipoDoc?.includes("nc ")) {
      setValue("serie_factura_afectada", "");
      setValue("nro_factura_afectada", "");
      setValue("motivo_sustento", "");
    }
    clearErrors(["porcentaje_detraccion", "monto_detraccion", "serie_factura_afectada", "nro_factura_afectada", "motivo_sustento"]);
  }, [tipoDoc, setValue, clearErrors]);

  const getRsByRuc = async (value) => {
    try {
      setLoadingRuc(true);
      setRucFound(null);
      const rs = await obtenerRazonSocialPorRUC(value);
      if (rs) {
        setValue("razon_social", rs);
        ultimoRucConsultado.current = value;
        setRucFound(true);
        trigger("razon_social"); 
      } else {
        setRucFound(false);
      }
    } catch (error) {
      console.error(error);
      setRucFound(false);
    } finally {
      setLoadingRuc(false);
    }
  };

  const onSubmit = (data) => {
    const finalData = isProjectContext ? { ...data, id_proyecto: idProyecto } : data;
    hideInvoiceForm(finalData);
    reset(defaultInvoiceDataValue);
    ultimoRucConsultado.current = "";
    setRucFound(null);
  };

  const getBadgeVariant = () => {
    switch (estado) {
      case "pagado": return "success";
      case "pendiente": return "warning";
      case "atrasado": return "danger";
      case "anulado": return "dark";
      default: return "secondary";
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* HEADER */}
      <Card className="border rounded-4 mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1">Nuevo comprobante</h4>
            <small className="text-muted">
              {isProjectContext ? "Registro asociado a proyecto" : "Registro tributario"}
            </small>
          </div>
          <Badge bg={getBadgeVariant()} className="px-3 py-2">
            {estado?.toUpperCase()}
          </Badge>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={12}>
          {/* INFORMACIÓN COMPROBANTE */}
          <Card className="border rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Información del comprobante</h5>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Tipo de documento</Form.Label>
                    <Form.Select {...register("tipo_doc")}>
                      <option value="factura emitida">Factura Emitida</option>
                      <option value="factura recibida">Factura Recibida</option>
                      <option value="nc emitido">Nota Crédito Emitido</option>
                      <option value="nc recibido">Nota Crédito Recibido</option>
                      <option value="retencion recibido">Retención Recibido</option>
                      <option value="r.h. recibido">Recibo por Honorarios</option>
                    </Form.Select>
                    <small className="text-danger">{errors.tipo_doc?.message}</small>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Serie</Form.Label>
                    <Form.Control {...register("serie_comprobante")} placeholder="F001" />
                    <small className="text-danger">{errors.serie_comprobante?.message}</small>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Número</Form.Label>
                    <Form.Control {...register("nro_comprobante")} placeholder="000123" />
                    <small className="text-danger">{errors.nro_comprobante?.message}</small>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* BLOQUE CONDICIONAL: NOTA DE CRÉDITO (Afectación) */}
          {tipoDoc?.includes("nc ") && (
            <Card className="border border-warning rounded-4 mb-4 bg-light bg-opacity-10">
              <Card.Body>
                <h5 className="fw-bold text-warning mb-4">
                  <i className="bi bi-link-45deg me-2"></i>Documento Afectado (Referencia)
                </h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Serie Factura Afectada</Form.Label>
                      <Form.Control {...register("serie_factura_afectada")} placeholder="F001" />
                      <small className="text-danger">{errors.serie_factura_afectada?.message}</small>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Número Factura Afectada</Form.Label>
                      <Form.Control {...register("nro_factura_afectada")} placeholder="000123" />
                      <small className="text-danger">{errors.nro_factura_afectada?.message}</small>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Motivo / Sustento de la Nota</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={2} 
                        {...register("motivo_sustento")} 
                        placeholder="Ej. Anulación por error en el RUC o descuento global..." 
                      />
                      <small className="text-danger">{errors.motivo_sustento?.message}</small>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* FECHAS */}
          <Card className="border rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Fechas y declaración</h5>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Fecha emisión</Form.Label>
                    <Form.Control type="date" {...register("fecha_emision")} />
                    <small className="text-danger">{errors.fecha_emision?.message}</small>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Fecha vencimiento</Form.Label>
                    <Form.Control type="date" {...register("fecha_vencimiento")} />
                    <small className="text-danger">{errors.fecha_vencimiento?.message}</small>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Mes declarado</Form.Label>
                    <Form.Control type="month" {...register("mes_declarado")} />
                    <small className="text-danger">{errors.mes_declarado?.message}</small>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* PROVEEDOR */}
          <Card className="border rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Datos del proveedor / cliente</h5>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>RUC</Form.Label>
                    <Form.Control {...register("ruc")} placeholder="20123456789" maxLength={11} />
                    <small className="text-danger">{errors.ruc?.message}</small>
                    <div className="mt-1">
                      {loadingRuc && (
                        <small className="text-primary">
                          <Spinner size="sm" className="me-1" animation="border" />
                          Consultando RUC...
                        </small>
                      )}
                      {!loadingRuc && rucFound === true && <small className="text-success">✓ RUC encontrado</small>}
                      {!loadingRuc && rucFound === false && <small className="text-danger">✕ No se encontró el RUC</small>}
                    </div>
                  </Form.Group>
                </Col>

                <Col md={8} className="mb-3">
                  <Form.Group>
                    <Form.Label>Razón social</Form.Label>
                    <Form.Control {...register("razon_social")} />
                    <small className="text-danger">{errors.razon_social?.message}</small>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* INFORMACIÓN MONETARIA */}
          <Card className="border rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Información monetaria</h5>
              <Row>
                <Col md={moneda === "USD" ? 4 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Monto Total</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>{moneda === "USD" ? "$" : "S/"}</InputGroup.Text>
                      <Form.Control type="number" step="0.01" {...register("monto")} />
                    </InputGroup>
                    <small className="text-danger">{errors.monto?.message}</small>
                  </Form.Group>
                </Col>

                <Col md={moneda === "USD" ? 4 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Moneda</Form.Label>
                    <Form.Select {...register("moneda")}>
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {moneda === "USD" && (
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tipo de cambio</Form.Label>
                      <Form.Control type="number" step="0.001" {...register("tipo_cambio")} />
                      <small className="text-danger">{errors.tipo_cambio?.message}</small>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* BLOQUE CONDICIONAL: DETRACCIÓN (Solo Facturas) */}
          {tipoDoc?.includes("factura") && (
            <Card className="border border-info rounded-4 mb-4 bg-light bg-opacity-10">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-info mb-0">
                    <i className="bi bi-shield-check me-2"></i>Detracciones SUNAT
                  </h5>
                  <Form.Check 
                    type="switch"
                    id="sujeto_detraccion"
                    label="¿Sujeto a detracción?"
                    className="fw-semibold text-muted"
                    {...register("sujeto_detraccion")}
                  />
                </div>

                {sujetoDetraccion && (
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Porcentaje de Detracción (%)</Form.Label>
                        <InputGroup>
                          <Form.Control 
                            type="number" 
                            step="0.1" 
                            placeholder="12" 
                            {...register("porcentaje_detraccion")} 
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                        <small className="text-danger">{errors.porcentaje_detraccion?.message}</small>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Monto de la Detracción</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>{moneda === "USD" ? "$" : "S/"}</InputGroup.Text>
                          <Form.Control 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...register("monto_detraccion")} 
                          />
                        </InputGroup>
                        <small className="text-danger">{errors.monto_detraccion?.message}</small>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}

          {/* ESTADO */}
          <Card className="border rounded-4 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Estado tributario</h5>
              <Form.Select {...register("estado_comprobante")}>
                {listStateTaxDocument.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </Form.Select>
            </Card.Body>
          </Card>

          {/* BOTÓN SUBMIT */}
          <Button type="submit" size="lg" className="w-100 rounded-3 fw-semibold">
            <i className="bi bi-arrow-right-circle me-2"></i>
            Continuar y registrar gastos
          </Button>
        </Col>
      </Row>
    </Form>
  );
}