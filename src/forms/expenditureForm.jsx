import { Container, Row, Col, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { saveExpenditure } from "../querysDB/gastos/saveExpenditure";
import FormComponent from "../components/formComponent";
import {
  BtnSubmitForm,
  InputField,
  SelectField,
} from "../components/inputComponent";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { GetAllListProjects } from "../querysDB/projects/getAllProjects";
import { updateDataExpenditureProjectDB } from "../querysDB/gastos/updateDataExpenditureProject";


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


/**
 * 📄 Componente: ExpenditureForm
 * Props:
 *  - idProyecto: ID del proyecto (opcional)
 *  - title: título del formulario
 *  - backPage: callback para regresar a la vista anterior
 *  - defaultData: datos por defecto si se está editando un gasto existente
 */
export function ExpenditureForm({ idProyecto = "", title, backPage, defaultData = {}, editarGasto=false }) {
  
  // 🧠 Datos iniciales del formulario
  const initialData = useMemo(() => (
    Object.keys(defaultData).length === 0
      ? {
          cantidad: 0,
          precio_unitario: 0.00,
          monto_total: 0,
          moneda: "PEN",
          fecha: new Date().toISOString().split("T")[0],
          tipo_cambio:0
        }
      : defaultData
  ), [defaultData]);

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
    const total = (cantidad || 0) * (precio_unitario || 0);
    setValue("monto_total", parseFloat(total.toFixed(2)));
  }, [cantidad, precio_unitario, setValue]);

  // 🔁 Si llegan datos por props (modo edición), actualiza el formulario
  useEffect(() => {
    if (Object.keys(defaultData).length > 0) reset(defaultData);
  }, [defaultData, reset]);

  // ✅ Función para detectar qué campos cambiaron
  const getUpdatedFields = (newData, originalData) => {
    const updated = {};
    for (const key in newData) {
      if (newData[key] !== originalData[key]) {
        updated[key] = newData[key];
      }
    }
    return updated;
  };
  // 💾 Guardar gasto
  const onSubmit = async (data) => {
    if(editarGasto){
      const updatedFields = getUpdatedFields(data, initialData);
      if (Object.keys(updatedFields).length === 0) {
        alert("No se ha modificado ningún campo.");
        return;
      }
      await updateDataExpenditureProjectDB(updatedFields, defaultData.id);
      backPage()
    }else{
      const payload = idProyecto ? { ...data, id_proyecto: idProyecto } : { ...data, id_proyecto: null };
      await saveExpenditure(payload);
      reset(initialData);
    }
    
  };

  // 📋 Cargar lista de proyectos (solo si no hay idProyecto)
  const [listProjects, setListProjects] = useState([]);

  useEffect(() => {
    if (idProyecto === "") loadProjects();
  }, [idProyecto]);

  const loadProjects = async () => {
    try {
      const { idEmpresa } = await GetUserNameAndNameCompany();
      const proyectos = await GetAllListProjects("pendiente", idEmpresa);
      const formatted = [
        { value: "", label: "Sin proyecto" },
        ...proyectos.map((p) => ({
          value: p.id,
          label: p.nombre_proyecto,
        })),
      ];
      setListProjects(formatted);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    }
  };

  return (
    <Container className="my-4">
      <FormComponent methods={methods} onSubmit={handleSubmit(onSubmit)} title={title}>
        
        {/* 🔹 Fila 1 */}
        <Row>
          <Col md={2}><InputField label="Cantidad" name="cantidad" type="number" /></Col>
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
                { value: "srv", label: "Servicio" },
              ]}
            />
          </Col>
          <Col md={8}><InputField label="Descripción" name="descripcion" /></Col>
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
            <InputField label="Precio Unitario" name="precio_unitario" type="number" step="0.0001" />
          </Col>
          <Col md={moneda === "PEN" ? 4 : 3}>
            <InputField label="Monto Total" name="monto_total" type="number" readOnly />
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
          {idProyecto === "" && (
            <Col md={3}>
              <SelectField name="id_proyecto" label="Enlazar a un Proyecto" options={listProjects} />
            </Col>
          )}
        </Row>

        {/* 🔹 Botones */}
        <BtnSubmitForm />
        <Button onClick={backPage} variant="secondary" className="w-100 mt-2">
          Regresar
        </Button>
      </FormComponent>
    </Container>
  );
}
