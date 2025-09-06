import { Container,Row, Col, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { saveExpenditure } from "../querysDB/gastos/saveExpenditure";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";

const gastoSchema = z.object({
  cantidad: z.coerce.number().min(1, "La cantidad es requerida"),
  unidad_medida: z.string().min(1, "La unidad de medida es requerida"),
  descripcion: z.string().min(3, "La descripción es requerida"),
  tipo: z.string().min(1, "El tipo es requerido"),
  categoria: z.string().min(1, "La categoria es requerida"),
  precio_unitario: z.coerce.number().min(0.01, "El precio unitario debe ser mayor a 0"),
  monto_total: z.coerce.number().min(0.01, "El monto total debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"], { required_error: "Selecciona una moneda" }),
  tipo_cambio: z.coerce.number().optional(),
  fecha: z.string().min(1, "La fecha es requerida"),
  serie_comprobante: z.string().optional(),
  nro_comprobante: z.string().optional(),
});

export function ExpenditureForm({children, idProyecto="", title, backPage}) {
  const methods = useForm({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      cantidad: 0,
      precio_unitario: 0.00,
      monto_total: 0,
      moneda: "PEN",
      fecha: new Date()
    }
  });
  const { reset, watch, setValue } = methods;

  const cantidad = watch("cantidad");
  const precio_unitario = watch("precio_unitario")
  const moneda = watch("moneda")

  useEffect(() => {
    const total = (cantidad || 0) * (precio_unitario || 0);
    setValue("monto_total", total.toFixed(2));
  }, [cantidad, precio_unitario, setValue])

  const onSubmit = async (data) => {
    if(idProyecto === ""){
      await saveExpenditure(data)
    }else{
      await saveExpenditure({...data, id_proyecto: idProyecto})
    }
    reset()
  };
  return(
    <Container>
      <FormComponent methods={methods} onSubmit={onSubmit} title={title}>
        <Row>
          <Col md={2}>
            <InputField label="Cantidad" name="cantidad" type="number" />
          </Col>
          <Col md={2}>
            <SelectField
              name="unidad_medida"
              label="Unidad de Medida"
              options={[
                { value: "kg", label: "Kilogramos" },
                { value: "m", label: "Metros" },
                { value: "lt", label: "Litros" },
                { value: "und", label: "Unidades" },
                { value: "m2", label: "Metros cuadrados" },
                { value: "m3", label: "Metros cúbicos" },
              ]}
            />
          </Col>
          <Col md={8}>
            <InputField label="Descripción" name="descripcion" />
          </Col>
          <Col md={6}>
            <SelectField
              name="tipo"
              label="Tipo de gasto"
              options={[
                { value: "directo", label: "Directo" },
                { value: "indirecto", label: "Indirecto" },
              ]}
            />
          </Col>
          <Col md={6}>
            <SelectField
              name="categoria"
              label="Categoria"
              options={[
                { value: "materiales", label: "Materiales" },
                { value: "operativos", label: "Gastos operativos" },
                { value: "mano de obra", label: "Mano de obra" },
                { value: "equipos y herramientas", label: "Equipos y Herramientas" },
                { value: "servicios", label: "Servicios contratados" },
              ]}
            />
          </Col>
        </Row>
        <Row>
          <Col md={moneda==="PEN"?4:3}>
            <InputField label="Precio Unitario" name="precio_unitario" type="number" step={0.01}/>
          </Col>

          <Col md={moneda==="PEN"?4:3}>
            <InputField label="Monto Total" name="monto_total" type="number" readOnly={true}/>
          </Col>
          <Col md={moneda==="PEN"?4:3}>
            <SelectField
              name="moneda"
              label="Moneda"
              options={[
                { value: "PEN", label: "Soles (PEN)" },
                { value: "USD", label: "Dólares (USD)" },
              ]}
            />
          </Col>
          {
            moneda === "USD"?<Col md={3}>
            <InputField label="Tipo de Cambio" name="tipo_cambio" type="number" step="0.0001"/>
          </Col>:<></>
          }
        </Row>
        <Row>
          <Col md={idProyecto===""?3:4}>
            <InputField label="Fecha" name="fecha" type="date" />
          </Col>

          <Col md={idProyecto===""?3:4}>
            <InputField label="Serie Comprobante" name="serie_comprobante"/>
          </Col>
          <Col md={idProyecto===""?3:4}>
            <InputField label="Número de Comprobante" name="nro_comprobante" />
          </Col>
          {children}
        </Row>
        <BtnSubmitForm />
        <Button onClick={backPage} variant="secondary" className="w-100 mt-2">Regresar</Button>
      </FormComponent>
    </Container>
  )
}