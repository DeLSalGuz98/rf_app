import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Card, Form, Row, Col, Button, Spinner, Alert } from "react-bootstrap";

import { getDataIngresoProyectoDB } from "../../querysDB/ingresos/getDataIngreso";
import { updateDataIngresoProjectDB } from "../../querysDB/ingresos/updateDataIngreso";

/* ESQUEMA ZOD CON VALIDACIÓN DINÁMICA DE TIPO DE CAMBIO */
const ingresoSchema = z
  .object({
    descripcion: z.string().min(2, "La descripción es requerida"),
    tipo_ingreso: z.string().min(1, "Seleccione el tipo de ingreso"),
    fecha: z.string().min(1, "La fecha es requerida"),
    moneda: z.enum(["PEN", "USD"], { message: "Seleccione una moneda válida" }),
    monto_total: z.coerce.number().positive("El monto debe ser mayor a 0"),
    tipo_cambio: z.coerce.number().nullable().optional(),
    estado: z.string().min(1, "El estado es requerido"),
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

export function EditarDataIngreso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(ingresoSchema),
    defaultValues: {
      descripcion: "",
      tipo_ingreso: "",
      fecha: "",
      moneda: "PEN",
      monto_total: "",
      tipo_cambio: null,
      estado: "confirmado",
    },
  });

  const moneda = watch("moneda");

  /* BLOQUEO DEL SCROLL WHEEL EN INPUTS NUMÉRICOS */
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement?.type === "number") {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  /* CARGA DE DATOS E INICIALIZACIÓN DE REACT-HOOK-FORM */
  useEffect(() => {
    const fetchIngreso = async () => {
      try {
        setLoadingData(true);
        const res = await getDataIngresoProyectoDB(id);
        if (res) {
          reset({
            descripcion: res.descripcion || "",
            tipo_ingreso: res.tipo_ingreso || "",
            fecha: res.fecha || "",
            moneda: res.moneda || "PEN",
            monto_total: res.monto_total ?? "",
            tipo_cambio: res.tipo_cambio ?? null,
            estado: res.estado || "confirmado",
          });
        }
      } catch (err) {
        console.error("Error al obtener ingreso:", err);
        setErrorMsg("No se pudieron cargar los datos del ingreso.");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) fetchIngreso();
  }, [id, reset]);

  /* ENVÍO: OBTIENE ÚNICAMENTE LOS CAMPOS EDITADOS (DIRTY) */
  const onSubmit = async (data) => {
    const editedFields = {};

    Object.keys(dirtyFields).forEach((key) => {
      let value = data[key];

      // Ajuste si la moneda cambia a PEN para limpiar tipo_cambio
      if (key === "moneda" && value === "PEN") {
        editedFields.tipo_cambio = null;
      }

      editedFields[key] = value;
    });

    const resUpdate = await updateDataIngresoProjectDB(editedFields, id)
    if (resUpdate?.status === "ok"){
      navigate(-1);
    }
  };

  if (loadingData) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted fw-medium">Cargando datos del ingreso...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: "800px" }}>
      <h3 className="fw-bold mb-4">Editar Ingreso</h3>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Card className="border rounded-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="g-3">
              {/* DESCRIPCIÓN */}
              <Col md={12}>
                <Form.Group controlId="descripcion">
                  <Form.Label className="fw-medium">Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. NC Municipalidad Lares"
                    {...register("descripcion")}
                    isInvalid={!!errors.descripcion}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descripcion?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* TIPO DE INGRESO */}
              <Col md={6}>
                <Form.Group controlId="tipo_ingreso">
                  <Form.Label className="fw-medium">Tipo de Ingreso</Form.Label>
                  <Form.Select {...register("tipo_ingreso")} isInvalid={!!errors.tipo_ingreso}>
                    <option value="adelanto">Adelanto</option>
                    <option value="pago parcial">Pago parcial</option>
                    <option value="pago final">Pago final</option>
                    <option value="garantia">Garantía</option>
                    <option value="devolucion">Devolución</option>
                    <option value="nc emitida">NC emitida</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tipo_ingreso?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* FECHA */}
              <Col md={6}>
                <Form.Group controlId="fecha">
                  <Form.Label className="fw-medium">Fecha</Form.Label>
                  <Form.Control type="date" {...register("fecha")} isInvalid={!!errors.fecha} />
                  <Form.Control.Feedback type="invalid">
                    {errors.fecha?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* MONEDA */}
              <Col md={moneda === "USD" ? 4 : 6}>
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

              {/* MONTO TOTAL */}
              <Col md={moneda === "USD" ? 4 : 6}>
                <Form.Group controlId="monto_total">
                  <Form.Label className="fw-medium">Monto Total</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("monto_total")}
                    isInvalid={!!errors.monto_total}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.monto_total?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* TIPO DE CAMBIO (CONDICIONAL USD) */}
              {moneda === "USD" && (
                <Col md={4}>
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

              {/* ESTADO */}
              <Col md={12}>
                <Form.Group controlId="estado">
                  <Form.Label className="fw-medium">Estado</Form.Label>
                  <Form.Select {...register("estado")} isInvalid={!!errors.estado}>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="anulado">Anulado</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.estado?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

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
                    Actualizando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>

              <Button
                variant="outline-secondary"
                className="w-100 py-2 rounded-3 fw-medium"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}