import { useEffect, useState } from "react";
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
    .min(11, "El RUC debe tener 11 dígitos")
    .max(11, "El RUC debe tener 11 dígitos"),

  razon_social: z.string().min(2, "Ingrese la razón social"),

  monto: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0"),

  moneda: z.enum(["PEN", "USD"]),

  tipo_cambio: z.coerce.number().optional(),

  mes_declarado: z.string().min(1, "Seleccione el mes"),

  estado_comprobante: z.string().min(1, "Seleccione el estado"),
});

/* =========================================================
   COMPONENTE
========================================================= */

export function NewInvoice({
  hideInvoiceForm,
  isProjectContext,
  idProyecto,
}) {
  const [loadingRuc, setLoadingRuc] = useState(false);
  const [rucFound, setRucFound] = useState(null);

  const methods = useForm({
    resolver: zodResolver(docTributarioSchema),

    defaultValues: {
      tipo_doc: "factura recibida",
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
      estado_comprobante: "pendiente",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  /* =========================================================
     WATCHERS
  ========================================================= */

  const fechaEmision = watch("fecha_emision");
  const moneda = watch("moneda");
  const ruc = watch("ruc");

  const estado = watch("estado_comprobante");

  /* =========================================================
     EFECTOS
  ========================================================= */

  useEffect(() => {
    setValue("fecha_vencimiento", fechaEmision);
  }, [fechaEmision, setValue]);

  useEffect(() => {
    if (ruc?.length === 11) {
      getRsByRuc(ruc);
    } else {
      setRucFound(null);
    }
  }, [ruc]);

  /* =========================================================
     OBTENER RAZÓN SOCIAL
  ========================================================= */

  const getRsByRuc = async (value) => {
    try {
      setLoadingRuc(true);
      setRucFound(null);

      const rs = await obtenerRazonSocialPorRUC(value);

      if (rs) {
        setValue("razon_social", rs);
        setRucFound(true);
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

  /* =========================================================
     SUBMIT
  ========================================================= */

  const onSubmit = (data) => {
    const finalData = isProjectContext
      ? { ...data, id_proyecto: idProyecto }
      : data;

    hideInvoiceForm(finalData);

    reset({
      tipo_doc: "factura recibida",
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
      estado_comprobante: "pendiente",
    });

    setRucFound(null);
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  /*const formatCurrency = (value) => {
    if (!value) return "S/. 0.00";

    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: moneda === "USD" ? "USD" : "PEN",
    }).format(value);
  };*/

  const getBadgeVariant = () => {
    switch (estado) {
      case "pagado":
        return "success";

      case "pendiente":
        return "warning";

      case "atrasado":
        return "danger";

      case "anulado":
        return "dark";

      default:
        return "secondary";
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">

          <div>
            <h4 className="fw-bold mb-1">
              Nuevo comprobante
            </h4>

            <small className="text-muted">
              {isProjectContext
                ? "Registro asociado a proyecto"
                : "Registro tributario"}
            </small>
          </div>

          <Badge bg={getBadgeVariant()} className="px-3 py-2">
            {estado?.toUpperCase()}
          </Badge>

        </Card.Body>
      </Card>

      <Row>

        {/* =====================================================
            FORMULARIO
        ====================================================== */}

        <Col lg={12}>

          {/* INFORMACIÓN COMPROBANTE */}

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>

              <h5 className="fw-bold mb-4">
                Información del comprobante
              </h5>

              <Row>

                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Tipo de documento</Form.Label>

                    <Form.Select {...register("tipo_doc")}>
                      <option value="factura emitida">
                        Factura Emitida
                      </option>

                      <option value="factura recibida">
                        Factura Recibida
                      </option>

                      <option value="nc emitido">
                        Nota Crédito Emitido
                      </option>

                      <option value="nc recibido">
                        Nota Crédito Recibido
                      </option>

                      <option value="retencion recibido">
                        Retención Recibido
                      </option>

                      <option value="r.h. recibido">
                        Recibo por Honorarios
                      </option>
                    </Form.Select>

                    <small className="text-danger">
                      {errors.tipo_doc?.message}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Serie</Form.Label>

                    <Form.Control
                      {...register("serie_comprobante")}
                      placeholder="F001"
                    />

                    <small className="text-danger">
                      {errors.serie_comprobante?.message}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Número</Form.Label>

                    <Form.Control
                      {...register("nro_comprobante")}
                      placeholder="000123"
                    />

                    <small className="text-danger">
                      {errors.nro_comprobante?.message}
                    </small>
                  </Form.Group>
                </Col>

              </Row>

            </Card.Body>
          </Card>

          {/* FECHAS */}

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>

              <h5 className="fw-bold mb-4">
                Fechas y declaración
              </h5>

              <Row>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Fecha emisión</Form.Label>

                    <Form.Control
                      type="date"
                      {...register("fecha_emision")}
                    />

                    <small className="text-danger">
                      {errors.fecha_emision?.message}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Fecha vencimiento</Form.Label>

                    <Form.Control
                      type="date"
                      {...register("fecha_vencimiento")}
                    />

                    <small className="text-danger">
                      {errors.fecha_vencimiento?.message}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>Mes declarado</Form.Label>

                    <Form.Control
                      type="month"
                      {...register("mes_declarado")}
                    />

                    <small className="text-danger">
                      {errors.mes_declarado?.message}
                    </small>
                  </Form.Group>
                </Col>

              </Row>

            </Card.Body>
          </Card>

          {/* PROVEEDOR */}

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>

              <h5 className="fw-bold mb-4">
                Datos del proveedor
              </h5>

              <Row>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label>RUC</Form.Label>

                    <Form.Control
                      {...register("ruc")}
                      placeholder="20123456789"
                    />

                    <small className="text-danger">
                      {errors.ruc?.message}
                    </small>

                    <div className="mt-1">

                      {loadingRuc && (
                        <small className="text-primary">
                          <Spinner size="sm" className="me-1" />
                          Consultando RUC...
                        </small>
                      )}

                      {!loadingRuc && rucFound === true && (
                        <small className="text-success">
                          ✓ RUC encontrado
                        </small>
                      )}

                      {!loadingRuc && rucFound === false && (
                        <small className="text-danger">
                          ✕ No se encontró el RUC
                        </small>
                      )}

                    </div>

                  </Form.Group>
                </Col>

                <Col md={8} className="mb-3">
                  <Form.Group>
                    <Form.Label>Razón social</Form.Label>

                    <Form.Control
                      {...register("razon_social")}
                    />

                    <small className="text-danger">
                      {errors.razon_social?.message}
                    </small>
                  </Form.Group>
                </Col>

              </Row>

            </Card.Body>
          </Card>

          {/* INFORMACIÓN MONETARIA */}

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>

              <h5 className="fw-bold mb-4">
                Información monetaria
              </h5>

              <Row>

                <Col md={moneda === "USD" ? 4 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Monto</Form.Label>

                    <InputGroup>
                      <InputGroup.Text>
                        {moneda === "USD" ? "$" : "S/"}
                      </InputGroup.Text>

                      <Form.Control
                        type="number"
                        step="0.0001"
                        {...register("monto")}
                      />
                    </InputGroup>

                    <small className="text-danger">
                      {errors.monto?.message}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={moneda === "USD" ? 4 : 6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Moneda</Form.Label>

                    <Form.Select {...register("moneda")}>
                      <option value="PEN">
                        Soles (PEN)
                      </option>

                      <option value="USD">
                        Dólares (USD)
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {moneda === "USD" && (
                  <Col md={4} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tipo de cambio</Form.Label>

                      <Form.Control
                        type="number"
                        step="0.0001"
                        {...register("tipo_cambio")}
                      />
                    </Form.Group>
                  </Col>
                )}

              </Row>

            </Card.Body>
          </Card>

          {/* ESTADO */}

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>

              <h5 className="fw-bold mb-4">
                Estado tributario
              </h5>

              <Form.Select {...register("estado_comprobante")}>

                {listStateTaxDocument.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}

              </Form.Select>

            </Card.Body>
          </Card>

          {/* BOTÓN */}

          <Button
            type="submit"
            size="lg"
            className="w-100 rounded-3 fw-semibold"
          >
            <i className="bi bi-arrow-right-circle me-2"></i>
            Continuar y registrar gastos
          </Button>

        </Col>

      </Row>

    </Form>
  );
}