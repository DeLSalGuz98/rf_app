import { Row, Col, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect} from "react";

import FormComponent from "../../components/formComponent";
import {
  InputField,
  SelectField,
} from "../../components/inputComponent";


// 🧩 Esquema de validación del gasto
const gastoSchema = z.object({
  cantidad: z.coerce.number().min(1, "La cantidad es requerida"),
  unidad_medida: z.string().min(1, "La unidad de medida es requerida"),
  descripcion: z.string().min(3, "La descripción es requerida"),
  tipo: z.string().min(1, "El tipo es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  precio_unitario: z.coerce.number().min(0.01, "El precio unitario debe ser mayor a 0"),
  monto_total: z.coerce.number().min(0.01, "El monto total debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"], { required_error: "Selecciona una moneda" }),
  tipo_cambio: z.coerce.number().optional(),
  fecha: z.string().min(1, "La fecha es requerida"),
  serie_comprobante: z.string().optional(),
  nro_comprobante: z.string().optional(),
  id_proyecto: z.string().optional(),
});

export function NewExpenditureItem({ idProyecto = "", title, defaultData = {serie:"",nro:"", fecha:""}, addItemInvoice}) {

  const initialData = {
    cantidad: "",
    precio_unitario: "",
    monto_total: 0.00,
    moneda: "PEN",
    fecha: defaultData.fecha || new Date().toISOString().split("T")[0],
    tipo:"directo",
    categoria:"materiales",
    serie_comprobante:defaultData.serie,
    nro_comprobante:defaultData.nro,
  }

  // 🎯 Configuración del formulario con Zod y React Hook Form
  const methods = useForm({
    resolver: zodResolver(gastoSchema),
    defaultValues: initialData,
  });

  const { reset, watch, setValue, handleSubmit } = methods;

  // 👀 Variables reactivas
  const cantidad = watch("cantidad");
  const precio_unitario = watch("precio_unitario");
  const moneda = watch("moneda");

  // 🔄 Calcula monto total automáticamente
  useEffect(() => {
    const total = (cantidad || 0) * (precio_unitario || 0); //todo:agregar un checkbox si el precio incluye igv
    setValue("monto_total", total.toFixed(2));
  }, [cantidad, precio_unitario, setValue]);

  // 💾 Guardar gasto
  const onSubmit = async (data) => {
    const payload = idProyecto ? { ...data, id_proyecto: idProyecto } : { ...data, id_proyecto: null };
    addItemInvoice(payload)
    reset(initialData);
  };

  return (
    <>
      <FormComponent methods={methods} onSubmit={handleSubmit(onSubmit)} title={title}>        
        {/* 🔹 Fila 1 */}
        <Row>
          <Col md={7}><InputField label="Descripción" name="descripcion" /></Col>
          <Col md={2}><InputField label="Cantidad" name="cantidad" type="number" /></Col>
          <Col md={3}>
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
                { value: "srv", label: "Servicio" },
              ]}
            />
          </Col>          
        </Row>

        {/* 🔹 Fila 2 */}
        <Row>
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
              label="Categoría"
              options={[
                { value: "materiales", label: "Materiales" },
                { value: "operativos", label: "Gastos Operativos" },
                { value: "mano de obra", label: "Mano de Obra" },
                { value: "equipos y herramientas", label: "Equipos y Herramientas" },
                { value: "servicios", label: "Servicios Contratados" },
              ]}
            />
          </Col>
        </Row>

        {/* 🔹 Fila 3 */}
        <Row>
          <Col md={moneda === "PEN" ? 4 : 3}>
            <InputField label="Precio Unitario" name="precio_unitario" type="number" step="0.01" />
          </Col>
          <Col md={moneda === "PEN" ? 4 : 3}>
            <InputField label="Monto Total" name="monto_total" type="number" readOnly={true} step="0.01" />
          </Col>
          <Col md={moneda === "PEN" ? 4 : 3}>
            <SelectField
              name="moneda"
              label="Moneda"
              options={[
                { value: "PEN", label: "Soles (PEN)" },
                { value: "USD", label: "Dólares (USD)" },
              ]}
            />
          </Col>
          {moneda === "USD" && (
            <Col md={3}>
              <InputField label="Tipo de Cambio" name="tipo_cambio" type="number" step="0.0001" />
            </Col>
          )}
        </Row>

        {/* 🔹 Fila 4 */}
        <Row>
          <Col md={idProyecto === "" ? 3 : 4}>
            <InputField label="Fecha" name="fecha" type="date" />
          </Col>
          <Col md={idProyecto === "" ? 3 : 4}>
            <InputField label="Serie del Comprobante" name="serie_comprobante" />
          </Col>
          <Col md={idProyecto === "" ? 3 : 4}>
            <InputField label="Nro. del Comprobante" name="nro_comprobante" />
          </Col>
        </Row>

        {/* 🔹 Botones */}
        <Button className="w-100 mt-1" type="submit"><i className="bi bi-plus-circle"></i> Agregar</Button>
      </FormComponent>
    </>
  );
}