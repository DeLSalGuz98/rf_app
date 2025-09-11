import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Row, Col, Container } from "react-bootstrap";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";
import { GetUserNameAndNameCompany } from "../utils/getUserAndCompany";
import { SaveNewProjectData } from "../querysDB/projects/saveNewProject";
import { useNavigate } from "react-router-dom";

const proyectoSchema = z.object({
  nombre_proyecto: z.string().min(3, "El nombre del proyecto es obligatorio"),
  descripcion_proyecto: z.string().min(5, "La descripción es obligatoria"),
  direccion: z.string().min(2, "El lugar es obligatorio"),
  distrito: z.string().min(2, "El lugar es obligatorio"),
  provincia: z.string().min(2, "El lugar es obligatorio"),
  departamento: z.string().min(2, "El lugar es obligatorio"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  plazo_dias: z.coerce.number().min(1, "El plazo debe ser mayor a 0"),
  monto_ofertado: z.coerce.number().min(0, "El monto debe ser positivo"),
  tipo: z.enum(["privado", "orden compra", "orden servicio"]),
  rs_cliente: z.string().min(2, "La razón social es obligatoria"),
  ruc_cliente: z.string().max(11, "El RUC debe tener 11 dígitos").optional().nullable(),
  unidad_ejecutora: z.string().optional().nullable(),
  exp_siaf: z.string().optional().nullable()
});

export function CreateNewProject() {
  const navigate = useNavigate()
  const methods = useForm({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      estado: "pendiente",
    },
  });

  const onSubmit = async (data) => {
    const res = await GetUserNameAndNameCompany()
    const dataProject = {...data, fecha_fin: calcularFechaFin(data.fecha_inicio, data.plazo_dias), id_empresa: res.idEmpresa, estado: "pendiente"}
    await SaveNewProjectData(dataProject)
    navigate("/rf/todos-los-proyectos")
  };

  function calcularFechaFin(fechaInicio, plazoDias) {
    const fecha = new Date(fechaInicio)
    fecha.setDate(fecha.getDate() + plazoDias+1)

    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, "0")
    const dia = String(fecha.getDate()).padStart(2, "0")

    return `${anio}-${mes}-${dia}`
  }

  return (
    <Container>
      <FormComponent methods={methods} onSubmit={onSubmit} title="Crear Nuevo Proyecto">
        <Row>
          <Col md={3}><InputField label="Nombre del Proyecto" name="nombre_proyecto" /></Col>
          <Col md={6}><InputField label="Descripción" name="descripcion_proyecto" /></Col>
          <Col md={3}><InputField label="Direccion" name="direccion" /></Col>
          <Col md={3}><InputField label="Disitrito" name="distrito" /></Col>
          <Col md={3}><InputField label="Provincia" name="provincia" /></Col>
          <Col md={3}><InputField label="Departamento" name="departamento" /></Col>
          <Col md={3}><InputField label="Fecha de Inicio" name="fecha_inicio" type="date" /></Col>
          <Col md={3}><InputField label="Plazo (días)" name="plazo_dias" type="number" /></Col>
          <Col md={3}><InputField label="Monto Ofertado (S/.)" name="monto_ofertado" type="number" step="0.01" /></Col>
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
          <Col md={3}><InputField label="Razón Social Cliente" name="rs_cliente" /></Col>
          <Col md={3}><InputField label="RUC Cliente" name="ruc_cliente" /></Col>
          <Col md={3}><InputField label="Unidad Ejecutora" name="unidad_ejecutora" /></Col>
          <Col md={3}><InputField label="Expediente SIAF" name="exp_siaf" /></Col>
        </Row>
        <BtnSubmitForm />
      </FormComponent>
    </Container>
  );
}