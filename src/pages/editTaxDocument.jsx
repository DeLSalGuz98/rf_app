import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";

import { obtenerRazonSocialPorRUC } from "../utils/rsPorRuc";
import { getTaxDocumentDataDB } from "../querysDB/taxDocument/getTaxDocumentData";
import { updateTaxDocDataDB } from "../querysDB/taxDocument/updateTaxDocumentData";
import { listStateTaxDocument } from "../utils/listStateTaxDocument";

const docTributarioSchema = z.object({
  tipo_doc: z.string().min(1, "El tipo de documento es requerido"),
  fecha_emision: z.string().min(1, "La fecha de emisión es requerida"),
  fecha_vencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  serie_comprobante: z.string().min(1, "La serie es requerida"),
  nro_comprobante: z.string().min(1, "El número es requerido"),
  ruc: z.string().length(11, "El RUC debe tener exactamente 11 dígitos"),
  razon_social: z.string().min(2, "La razón social es requerida"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"], { message: "Seleccione una moneda válida" }),
  tipo_cambio: z.coerce.number().optional().nullable(),
  mes_declarado: z.string().min(1, "El mes declarado es requerido"),
  estado_comprobante: z.enum([
    "pendiente",
    "devengado",
    "girado",
    "con retencion",
    "pagado",
    "atrasado",
    "anulado",
    "archivado"
  ])
});

export function EditTaxDocument() {
  const { idTaxDocument } = useParams();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchingRuc, setSearchingRuc] = useState(false);

  const lastConsultedRuc = useRef("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(docTributarioSchema)
  });

  const ruc = watch("ruc");
  const moneda = watch("moneda");

  // 1. Cargar datos iniciales
  useEffect(() => {
    let isMounted = true;
    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        const data = await getTaxDocumentDataDB(idTaxDocument);
        if (isMounted && data) {
          setInitialData(data);
          reset(data);
          lastConsultedRuc.current = data.ruc || "";
        }
      } catch (error) {
        console.error("Error al obtener el documento tributario:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (idTaxDocument) {
      fetchDocumentData();
    }

    return () => {
      isMounted = false;
    };
  }, [idTaxDocument, reset]);

  // 2. Búsqueda automática de Razón Social al cambiar el RUC (CORREGIDO)
  useEffect(() => {
    if (!initialData || !ruc) return;

    // Si vuelve al RUC original del documento, restablece la razón social inicial
    if (ruc === initialData.ruc) {
      clearErrors("ruc");
      setValue("razon_social", initialData.razon_social || "", { shouldValidate: true });
      lastConsultedRuc.current = ruc;
      return;
    }

    const autoFetchRazonSocial = async () => {
      if (ruc.length === 11 && ruc !== lastConsultedRuc.current) {
        try {
          setSearchingRuc(true);
          clearErrors("ruc");
          lastConsultedRuc.current = ruc;

          const razonSocial = await obtenerRazonSocialPorRUC(ruc);

          if (razonSocial) {
            setValue("razon_social", razonSocial, { shouldValidate: true });
          } else {
            // Si la API responde pero no encuentra la razón social
            setValue("razon_social", "", { shouldValidate: true });
            setError("ruc", {
              type: "manual",
              message: "El RUC ingresado no existe o no se encontraron datos."
            });
          }
        } catch (error) {
          console.error("Error al obtener la razón social por RUC:", error);
          setValue("razon_social", "", { shouldValidate: true });
          setError("ruc", {
            type: "manual",
            message: "Error al consultar el RUC. Verifique la conexión o el número."
          });
        } finally {
          setSearchingRuc(false);
        }
      }
    };

    autoFetchRazonSocial();
  }, [ruc, initialData, setValue, setError, clearErrors]);

  const getUpdatedFields = (newData, originalData) => {
    const updated = {};
    for (const key in newData) {
      if (newData[key] !== originalData[key]) {
        updated[key] = newData[key];
      }
    }
    return updated;
  };

  const onSubmit = async (data) => {
    if (!initialData) return;

    const payload = {
      ...data,
      tipo_cambio: data.moneda === "PEN" ? null : (data.tipo_cambio || null)
    };

    const updatedFields = getUpdatedFields(payload, initialData);

    if (Object.keys(updatedFields).length === 0) {
      alert("No se ha modificado ningún campo.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTaxDocDataDB(updatedFields, idTaxDocument);
      navigate(-1);
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
      alert("Ocurrió un error al guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando datos...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Editar Documento Tributario</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="g-3">
          
          {/* Tipo de Documento */}
          <Col md={4}>
            <Form.Group controlId="tipo_doc">
              <Form.Label>Tipo de Documento</Form.Label>
              <Form.Select {...register("tipo_doc")} isInvalid={!!errors.tipo_doc}>
                <option value="">Seleccione...</option>
                <option value="factura emitida">Factura Emitida</option>
                <option value="factura recibida">Factura Recibida</option>
                <option value="nc emitido">Nota de Crédito Emitida</option>
                <option value="nc recibido">Nota de Crédito Recibida</option>
                <option value="retencion recibido">Comprobante de Retención Recibido</option>
                <option value="r.h. recibido">R.H. Recibido</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.tipo_doc?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Fecha de Emisión */}
          <Col md={4}>
            <Form.Group controlId="fecha_emision">
              <Form.Label>Fecha de Emisión</Form.Label>
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

          {/* Fecha de Vencimiento */}
          <Col md={4}>
            <Form.Group controlId="fecha_vencimiento">
              <Form.Label>Fecha de Vencimiento</Form.Label>
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

          {/* Serie */}
          <Col md={2}>
            <Form.Group controlId="serie_comprobante">
              <Form.Label>Serie</Form.Label>
              <Form.Control 
                type="text" 
                {...register("serie_comprobante")} 
                isInvalid={!!errors.serie_comprobante} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.serie_comprobante?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Número */}
          <Col md={2}>
            <Form.Group controlId="nro_comprobante">
              <Form.Label>Número</Form.Label>
              <Form.Control 
                type="text" 
                {...register("nro_comprobante")} 
                isInvalid={!!errors.nro_comprobante} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.nro_comprobante?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* RUC */}
          <Col md={3}>
            <Form.Group controlId="ruc">
              <Form.Label>
                RUC {searchingRuc && <Spinner size="sm" animation="border" className="ms-1" />}
              </Form.Label>
              <Form.Control 
                type="text" 
                maxLength={11}
                {...register("ruc")} 
                isInvalid={!!errors.ruc} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.ruc?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Razón Social */}
          <Col md={5}>
            <Form.Group controlId="razon_social">
              <Form.Label>Razón Social</Form.Label>
              <Form.Control 
                type="text" 
                {...register("razon_social")} 
                isInvalid={!!errors.razon_social} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.razon_social?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Monto */}
          <Col md={moneda === "PEN" ? 6 : 4}>
            <Form.Group controlId="monto">
              <Form.Label>Monto</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                {...register("monto")} 
                isInvalid={!!errors.monto} 
              />
              <Form.Control.Feedback type="invalid">
                {errors.monto?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Moneda */}
          <Col md={moneda === "PEN" ? 6 : 4}>
            <Form.Group controlId="moneda">
              <Form.Label>Moneda</Form.Label>
              <Form.Select {...register("moneda")} isInvalid={!!errors.moneda}>
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.moneda?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Tipo de Cambio */}
          {moneda !== "PEN" && (
            <Col md={4}>
              <Form.Group controlId="tipo_cambio">
                <Form.Label>Tipo de Cambio</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.001" 
                  {...register("tipo_cambio")} 
                  isInvalid={!!errors.tipo_cambio} 
                />
                <Form.Control.Feedback type="invalid">
                  {errors.tipo_cambio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          )}

          {/* Mes Declarado */}
          <Col md={6}>
            <Form.Group controlId="mes_declarado">
              <Form.Label>Mes Declarado</Form.Label>
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

          {/* Estado del Comprobante */}
          <Col md={6}>
            <Form.Group controlId="estado_comprobante">
              <Form.Label>Estado del Comprobante</Form.Label>
              <Form.Select {...register("estado_comprobante")} isInvalid={!!errors.estado_comprobante}>
                <option value="">Seleccione un estado...</option>
                {listStateTaxDocument?.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.estado_comprobante?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

        </Row>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" animation="border" /> : "Guardar Cambios"}
          </Button>
        </div>
      </Form>
    </Container>
  );
}