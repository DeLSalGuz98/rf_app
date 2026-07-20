import { useEffect } from "react";
import {
  Row,
  Col,
  Button,
  Card,
  Form,
  InputGroup,
  Badge
} from "react-bootstrap";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const gastoSchema = z.object({
  cantidad: z.coerce.number().min(0.01, "Ingrese cantidad"),
  unidad_medida: z.string().min(1, "Seleccione unidad"),
  descripcion: z.string().min(3, "Ingrese descripción"),
  tipo: z.string().min(1, "Seleccione tipo"),
  categoria: z.string().min(1, "Seleccione categoría"),
  precio_unitario: z.coerce.number().min(0.01, "Ingrese precio unitario"),
  incluye_igv: z.boolean(), 
  monto_total: z.coerce.number().min(0.01),
  moneda: z.enum(["PEN", "USD"]),
  tipo_cambio: z.coerce.number().optional(),
  fecha: z.string().min(1),
  serie_comprobante: z.string().optional(),
  nro_comprobante: z.string().optional(),
});

export function NewExpenditureItem({
    idProyecto = "",
    isProjectContext = false,
    title,
    defaultData = { serie: "", nro: "", fecha: "" },
    addItemInvoice
  }) {

  const initialData = {
    cantidad: "",
    precio_unitario: "",
    incluye_igv: true,
    monto_total: 0,
    moneda: "PEN",
    fecha: defaultData.fecha || new Date().toISOString().split("T")[0],
    tipo: "directo",
    categoria: "materiales",
    serie_comprobante: defaultData.serie,
    nro_comprobante: defaultData.nro,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(gastoSchema),
    defaultValues: initialData
  });

  const cantidad = watch("cantidad");
  const precio = watch("precio_unitario");
  const moneda = watch("moneda");
  const total = watch("monto_total");
  const incluyeIgv = watch("incluye_igv"); 

  useEffect(() => {
    const subtotal = (cantidad || 0) * (precio || 0);
    const resultadoFinal = incluyeIgv ? subtotal * 1.18 : subtotal;
    
    setValue("monto_total", Number(resultadoFinal.toFixed(4)));
  }, [cantidad, precio, incluyeIgv, setValue]);

  const onSubmit = (data) => {
    const precioConIgv = data.incluye_igv 
      ? Number((data.precio_unitario * 1.18).toFixed(4))
      : data.precio_unitario;

    const { incluye_igv, ...cleanData } = data;

    const finalData = {
      ...cleanData,
      precio_unitario: precioConIgv,
      monto_total: Number(data.monto_total.toFixed(2))
    };

    const payload = isProjectContext
      ? { ...finalData, id_proyecto: idProyecto }
      : finalData;

    addItemInvoice(payload);

    reset({
      ...initialData,
      moneda: data.moneda,
      categoria: data.categoria,
      tipo: data.tipo,
      fecha: data.fecha,
      incluye_igv: data.incluye_igv 
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>

      {/* HEADER */}
      <Card className="shadow-sm border-0 mb-3 rounded-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">{title}</h4>
            <small className="text-muted">
              Registro de gasto individual
            </small>
          </div>

          <Badge bg="primary" className="fs-6 px-3 py-2">
            {moneda}
          </Badge>
        </Card.Body>
      </Card>

      {/* INFORMACIÓN PRINCIPAL */}
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <h6 className="mb-3 text-secondary">
            Información del gasto
          </h6>

          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  {...register("descripcion")}
                  placeholder="Ej. Compra de cables eléctricos"
                />
                <Form.Text className="text-danger">
                  {errors.descripcion?.message}
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  step={0.01}
                  {...register("cantidad")}
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Unidad</Form.Label>
                <Form.Select {...register("unidad_medida")}>
                  <option value="">Seleccionar</option>
                  <option value="srv">Servicio</option>
                  <option value="und">Unidad</option>
                  <option value="rollo">Rollo</option>
                  <option value="galon">Galon</option>
                  <option value="paquete">Paquete</option>
                  <option value="juego">Juego</option>
                  <option value="bls">Bls</option>
                  <option value="par">Par</option>
                  <option value="kg">Kg</option>
                  <option value="m">Metro</option>
                  <option value="m2">M²</option>
                  <option value="m3">M³</option>
                  <option value="viaje">Viaje</option>
                  <option value="dias">Dias</option>
                  <option value="semana">Semana</option>
                  <option value="mes">Mes</option>
                  <option value="lt">Litro</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* CLASIFICACIÓN */}
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <h6 className="mb-3 text-secondary">
            Clasificación
          </h6>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select {...register("tipo")}>
                  <option value="directo">Directo</option>
                  <option value="indirecto">Indirecto</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Categoría</Form.Label>
                <Form.Select {...register("categoria")}>
                  <option value="materiales">Materiales</option>
                  <option value="equipos_herramientas">Equipos y herramientas</option>
                  <option value="implementos_seguridad">Implementos de Seguridad</option>
                  <option value="papeleria_escritorio">Papeleria y Escritorio</option>
                  <option value="trasnporte">Transporte</option>
                  <option value="mano_obra">Mano de obra</option>
                  <option value="refrigrrio">Refrigerio</option>
                  <option value="servicios">Servicios contratados</option>
                  <option value="otros">Otros</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* COSTOS */}
      <Card className="shadow-sm border-0 rounded-4 mb-3">
        <Card.Body>
          <h6 className="mb-3 text-secondary d-flex justify-content-between align-items-center">
            <span>Información financiera</span>
            <Form.Check 
              type="switch"
              id="incluye_igv"
              label="Agregar 18% de IGV al precio"
              className="text-muted small fw-normal user-select-none"
              {...register("incluye_igv")}
            />
          </h6>

          <Row className="g-3 align-items-center">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Precio Unitario</Form.Label>
                <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                  <InputGroup.Text className="bg-light border-end-0">
                    {moneda}
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    className="border-start-0"
                    {...register("precio_unitario")}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Moneda</Form.Label>
                <Form.Select className="shadow-sm" {...register("moneda")}>
                  <option value="PEN">Soles</option>
                  <option value="USD">Dólares</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {moneda === "USD" && (
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small text-muted mb-1">Tipo Cambio</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    className="shadow-sm"
                    {...register("tipo_cambio")}
                  />
                </Form.Group>
              </Col>
            )}

            <Col md={moneda === "USD" ? 5 : 7}>
              <div className="d-flex align-items-center justify-content-between p-3 bg-success-subtle text-success-emphasis rounded-4 border border-success-subtle shadow-sm h-100 mt-4 mt-md-0">
                <div className="d-flex flex-column text-start">
                  <span className="fw-bold tracking-wide small" style={{ fontSize: '0.75rem' }}>
                    MONTO TOTAL
                  </span>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {incluyeIgv ? "Precio + 18% IGV" : "IGV ya Incluido"}
                  </small>
                </div>
                <div className="text-end">
                  <span className="fs-3 fw-bold">
                    {moneda === "PEN" ? "S/ " : "$ "}
                    {Number(total || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* DOCUMENTO */}
      <Card className="shadow-sm border-0 rounded-4 mb-4">
        <Card.Body>
          <h6 className="mb-3 text-secondary">
            Documento asociado
          </h6>

          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  {...register("fecha")}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Serie</Form.Label>
                <Form.Control
                  {...register("serie_comprobante")}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Número</Form.Label>
                <Form.Control
                  {...register("nro_comprobante")}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* BOTÓN */}
      <Button
        type="submit"
        size="lg"
        className="w-100 rounded-3"
      >
        <i className="bi bi-plus-circle me-2"></i>
        Agregar gasto
      </Button>

    </Form>
  );
}