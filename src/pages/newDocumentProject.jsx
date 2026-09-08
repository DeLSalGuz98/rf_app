import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col, Container, Button, Form, Card } from "react-bootstrap";
import { saveTaxDocumentDB } from "../querysDB/taxDocument/saveTaxDocument";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerRazonSocialPorRUC } from "../utils/rsPorRuc";
import { listStateTaxDocument } from "../utils/listStateTaxDocument";

const docTributarioSchema = z.object({
  tipo_doc: z.string().min(1, "El tipo de documento es requerido"),
  fecha_emision: z.string().min(1, "La fecha de emisión es requerida"),
  fecha_vencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  serie_comprobante: z.string().min(1, "La serie es requerida"),
  nro_comprobante: z.string().min(1, "El número es requerido"),
  ruc: z.string().min(11, "El RUC debe tener 11 dígitos"),
  razon_social: z.string().min(2, "La razón social es requerida"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"], { message: "Seleccione una moneda válida" }),
  tipo_cambio: z.coerce.number().optional(),
  mes_declarado: z.string().min(1, "El mes declarado es requerido"),
  estado_comprobante: z.enum(["pendiente", "devengado", "girado", "con retencion", "pagado", "atrasado", "anulado", "archivado"])
});

export function NewDocumentProject() {
  const { idProyecto } = useParams();
  const navigate = useNavigate();

  // Estado para controlar el modo de ingreso: null (no elegido), 'xml' o 'manual'
  const [mode, setMode] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(docTributarioSchema),
    defaultValues: {
      moneda: "PEN"
    }
  });

  const emitDate = watch("fecha_emision");
  const typeCoin = watch("moneda");
  const ruc = watch("ruc");

  useEffect(() => {
    if (ruc && ruc.length >= 11) {
      getRsByRuc(ruc);
    }
  }, [ruc]);

  useEffect(() => {
    if (emitDate) {
      setValue("fecha_vencimiento", emitDate);
    }
  }, [emitDate, setValue]);

  const getRsByRuc = async (rucValue) => {
    const res = await obtenerRazonSocialPorRUC(rucValue);
    if (res) {
      setValue("razon_social", res);
    }
  };

  const onSubmit = async (data) => {
    await saveTaxDocumentDB(data, idProyecto);
    reset();
  };

  // Handler preparado para la carga de XML futura
  const handleXmlUpload = () => {
    if (!xmlFile) return;
    // TODO: Lógica para parsear XML y autorrellenar los valores
    console.log("Archivo XML listo para procesar:", xmlFile);
    
    // Una vez procesado, pasamos a la vista del formulario para verificar/completar los datos
    setMode("manual");
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "850px" }}>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
          <h5 className="mb-0 fw-bold text-primary">Registrar Documento Tributario</h5>
          {mode && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setMode(null)}
            >
              Cambiar método de ingreso
            </Button>
          )}
        </Card.Header>

        <Card.Body className="p-4">

          {/* 1. SELECCIÓN INICIAL DE MÉTODO (Si mode es null) */}
          {!mode && (
            <div className="text-center py-4">
              <h5 className="mb-4">¿Cómo deseas registrar el documento?</h5>
              <Row className="g-3 justify-content-center">
                <Col md={5}>
                  <Card 
                    className="h-100 border-primary shadow-sm text-center p-3 btn-hover"
                    style={{ cursor: "pointer" }}
                    onClick={() => setMode("xml")}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                      <div className="fs-1 text-primary mb-2">📄</div>
                      <Card.Title as="h6" className="fw-bold">Cargar mediante XML</Card.Title>
                      <Card.Text className="small text-muted">
                        Sube el archivo .XML emitido por SUNAT para extraer los datos automáticamente.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={5}>
                  <Card 
                    className="h-100 border-secondary shadow-sm text-center p-3 btn-hover"
                    style={{ cursor: "pointer" }}
                    onClick={() => setMode("manual")}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                      <div className="fs-1 text-secondary mb-2">✍️</div>
                      <Card.Title as="h6" className="fw-bold">Registro Manual</Card.Title>
                      <Card.Text className="small text-muted">
                        Ingresa todos los datos del comprobante o factura de forma manual.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="mt-4">
                <Button variant="link" className="text-muted" onClick={() => navigate(-1)}>
                  Cancelar y regresar
                </Button>
              </div>
            </div>
          )}

          {/* 2. OPCIÓN CÁRGA XML */}
          {mode === "xml" && (
            <Card className="bg-light border-0 p-3 mb-3">
              <Card.Body>
                <h6 className="fw-bold mb-3">Cargar archivo XML (SUNAT)</h6>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="file" 
                    accept=".xml" 
                    onChange={(e) => setXmlFile(e.target.files[0])}
                  />
                  <Form.Text className="text-muted">
                    Selecciona un archivo XML válido de factura o comprobante.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleXmlUpload}
                    disabled={!xmlFile}
                  >
                    Procesar XML
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setMode("manual")}
                  >
                    Continuar manualmente
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* 3. FORMULARIO PRINCIPAL (Se muestra en 'manual' o tras procesar el XML) */}
          {mode === "manual" && (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row className="g-3">
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

                <Col md={3}>
                  <Form.Group controlId="ruc">
                    <Form.Label>RUC</Form.Label>
                    <Form.Control 
                      type="text" 
                      {...register("ruc")} 
                      isInvalid={!!errors.ruc} 
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ruc?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

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

                <Col md={typeCoin === "USD" ? 4 : 6}>
                  <Form.Group controlId="monto">
                    <Form.Label>Monto</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.0001" 
                      {...register("monto")} 
                      isInvalid={!!errors.monto} 
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.monto?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={typeCoin === "USD" ? 4 : 6}>
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

                {typeCoin === "USD" && (
                  <Col md={4}>
                    <Form.Group controlId="tipo_cambio">
                      <Form.Label>Tipo de Cambio</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.0001" 
                        {...register("tipo_cambio")} 
                        isInvalid={!!errors.tipo_cambio} 
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.tipo_cambio?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}

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

                <Col md={6}>
                  <Form.Group controlId="estado_comprobante">
                    <Form.Label>Estado del Comprobante</Form.Label>
                    <Form.Select {...register("estado_comprobante")} isInvalid={!!errors.estado_comprobante}>
                      <option value="">Seleccione un estado...</option>
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

              <div className="mt-4">
                <Button type="submit" variant="primary" className="w-100 mb-2">
                  Guardar Documento
                </Button>
                <Button 
                  variant="outline-secondary" 
                  className="w-100" 
                  onClick={() => navigate(-1)}
                >
                  Regresar
                </Button>
              </div>
            </Form>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
}