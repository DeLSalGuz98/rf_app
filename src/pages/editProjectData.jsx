import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Row, Col, Container, Button } from "react-bootstrap";

import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";
import { obtenerRazonSocialPorRUC } from "../utils/rsPorRuc";
import { updateDataProjectDB } from "../querysDB/projects/updateDataProject";

// Schema con validación corregida
const proyectoSchema = z.object({
  nombre_proyecto: z.string().min(3, "El nombre del proyecto es obligatorio"),
  descripcion_proyecto: z.string().min(5, "La descripción es obligatoria"),
  direccion: z.string().min(2, "La dirección es obligatoria"),
  distrito: z.string().min(2, "El distrito es obligatorio"),
  provincia: z.string().min(2, "La provincia es obligatoria"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  plazo_dias: z.coerce.number().min(1, "El plazo debe ser mayor a 0"),
  monto_ofertado: z.coerce.number().min(0, "El monto debe ser positivo"),
  tipo: z.enum(["privado", "orden compra", "orden servicio"]),
  rs_cliente: z.string().min(2, "La razón social es obligatoria"),
  ruc_cliente: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[0-9]{11}$/.test(val), {
      message: "El RUC debe contener exactamente 11 dígitos numéricos",
    }),
  unidad_ejecutora: z.string().optional().nullable(),
  exp_siaf: z.string().optional().nullable(),
});

export function EditProjectData() {
  const { idProyecto } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const dataProject = location.state || {};

  const methods = useForm({
    resolver: zodResolver(proyectoSchema),
    defaultValues: dataProject,
  });

  const { watch, setValue, reset } = methods;
  const rucCliente = watch("ruc_cliente");

  // Sincronizar defaultValues en caso de carga demorada o navegaciones externas
  useEffect(() => {
    if (dataProject && Object.keys(dataProject).length > 0) {
      reset(dataProject);
    }
  }, [dataProject, reset]);

  // Consulta automática de Razón Social por RUC
  useEffect(() => {
    if (!rucCliente) return;

    const cleanedRuc = rucCliente.trim();
    if (cleanedRuc.length === 11) {
      getRsByRuc(cleanedRuc);
    }
  }, [rucCliente]);

  const getRsByRuc = async (ruc) => {
    try {
      const res = await obtenerRazonSocialPorRUC(ruc);
      if (res) {
        setValue("rs_cliente", res, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      console.error("Error consultando RUC:", error);
    }
  };

  // Comparación de campos modificados
  const getUpdatedFields = (newData, originalData) => {
    const updated = {};
    for (const key in newData) {
      if (newData[key] !== originalData[key]) {
        updated[key] = newData[key];
      }
    }
    return updated;
  };

  // Cálculo de fecha final evitando desfasaje UTC
  function calcularFechaFin(fechaInicioStr, plazoDias) {
    if (!fechaInicioStr) return "";
    
    const [year, month, day] = fechaInicioStr.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);
    fecha.setDate(fecha.getDate() + Number(plazoDias));

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  }

  const onSubmit = async (data) => {
    const fecha_fin = calcularFechaFin(data.fecha_inicio, data.plazo_dias);
    const updatedFields = getUpdatedFields({ ...data, fecha_fin }, dataProject);

    if (Object.keys(updatedFields).length === 0) {
      alert("No se ha modificado ningún campo.");
      return;
    }

    const res = await updateDataProjectDB(updatedFields, idProyecto);
    if (res !== null) {
      backPage();
    }
  };

  const backPage = () => {
    navigate(-1);
  };

  return (
    <Container className="py-4">
      <FormComponent
        methods={methods}
        onSubmit={onSubmit}
        title={`Actualizar Datos - Proyecto ${dataProject.nombre_proyecto || ""}`}
      >
        <Row className="g-3">
          <Col md={3}>
            <InputField label="Nombre del Proyecto" name="nombre_proyecto" />
          </Col>
          <Col md={6}>
            <InputField label="Descripción" name="descripcion_proyecto" />
          </Col>
          <Col md={3}>
            <InputField label="Dirección" name="direccion" />
          </Col>
          <Col md={3}>
            <InputField label="Distrito" name="distrito" />
          </Col>
          <Col md={3}>
            <InputField label="Provincia" name="provincia" />
          </Col>
          <Col md={3}>
            <InputField label="Departamento" name="departamento" />
          </Col>
          <Col md={3}>
            <InputField label="Fecha de Inicio" name="fecha_inicio" type="date" />
          </Col>
          <Col md={3}>
            <InputField label="Plazo (días)" name="plazo_dias" type="number" />
          </Col>
          <Col md={3}>
            <InputField label="Monto Ofertado (S/.)" name="monto_ofertado" type="number" step="0.01" />
          </Col>
          <Col md={3}>
            <SelectField
              name="tipo"
              label="Tipo de Proyecto"
              options={[
                { value: "privado", label: "Privado" },
                { value: "orden compra", label: "Orden de compra" },
                { value: "orden servicio", label: "Orden de Servicio" },
              ]}
            />
          </Col>
          <Col md={3}>
            <InputField label="RUC Cliente" name="ruc_cliente" maxLength={11} />
          </Col>
          <Col md={3}>
            <InputField label="Razón Social Cliente" name="rs_cliente" />
          </Col>
          <Col md={3}>
            <InputField label="Unidad Ejecutora" name="unidad_ejecutora" />
          </Col>
          <Col md={3}>
            <InputField label="Expediente SIAF" name="exp_siaf" />
          </Col>
        </Row>

        <div className="mt-4 d-flex flex-column gap-2">
          <BtnSubmitForm label="Guardar Cambios" />
          <Button variant="outline-secondary" onClick={backPage}>
            Regresar
          </Button>
        </div>
      </FormComponent>
    </Container>
  );
}