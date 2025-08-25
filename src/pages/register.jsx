import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col } from "react-bootstrap";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno es requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno es requerido"),
  tipoContrata: z.enum(["permanente", "parcial"]),
  fechaInicio: z.string().min(1,"La fecha de inicio es obligatoria"),
  fechaFin: z.string().min(1,"La fecha de fin es obligatoria"),
  activo: z.enum(["si", "no"]),
  tipoTrabajo: z.string().min(1,"Selecciona un tipo de trabajo"),
  tipoDoc: z.enum(["dni", "ce"]),
  nroDoc: z.string().min(8, "Número de documento inválido"),
  sexo: z.enum(["masculino", "femenino"]),
  fechaNacimiento: z.string().min(1,"Fecha de nacimiento requerida"),
  telf: z.string().min(9, "Teléfono inválido"),
  email: z.email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
  permisos: z.enum(["admin", "general"])
});

export function RegisterPage() {
  const methods = useForm({
      resolver: zodResolver(registerSchema),
    });

  const onSubmit = (data) => {
    console.log("Register data:", data);
  }

  return (
    <div className="container py-5">
      <FormComponent methods={methods} onSubmit={onSubmit} title="Registrar Nuevo Usuario">
        <Row>
          <Col md={6}>
            <InputField label="Nombre" name="nombre" placeholder="Ingresa tu nombre" />
          </Col>
          <Col md={6}>
            <InputField label="Apellido Paterno" name="apellidoPaterno"  />
          </Col>
          <Col md={6}>
            <InputField label="Apellido Materno" name="apellidoMaterno"  />
          </Col>
          <Col md={6}>
            <SelectField
              name="tipoContrata"
              label="Tipo de contrata"
              options={[
                { value: "permanente", label: "Permanente" },
                { value: "parcial", label: "Parcial" },
              ]}
            />
          </Col>
          <Col md={6}>
            <InputField label="Fecha Inicio Contrata" name="fechaInicio" type="date"  />
          </Col>
          <Col md={6}>
            <InputField label="Fecha Fin Contrata" name="fechaFin" type="date"  />
          </Col>
          <Col md={6}>
            <SelectField
              name="activo"
              label="Seleccione si el personal esta activo o no"
              options={[
                { value: "si", label: "SI" },
                { value: "no", label: "NO" },
              ]}
            />
          </Col>
          <Col md={6}>
            <InputField label="Tipo Trabajo" name="tipoTrabajo" type="text"  />
          </Col>
          <Col md={6}>
            <SelectField
              name="tipoDoc"
              label="Seleccione el tipo de Documento"
              options={[
                { value: "dni", label: "DNI" },
                { value: "ce", label: "CE" },
              ]}
            />
          </Col>
          <Col md={6}>
            <InputField label="Nro Doc" name="nroDoc" type="text"  />
          </Col>
          <Col md={6}>
            <SelectField
              name="sexo"
              label="Sexo"
              options={[
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
              ]}
            />
          </Col>
          <Col md={6}>
            <InputField label="Fecha Nacimiento" name="fechaNacimiento" type="date"  />
          </Col>
          <Col md={6}>
            <InputField label="Teléfono" name="telf" type="text"  />
          </Col>
          <Col md={6}>
            <InputField label="Email" name="email" type="email"  />
          </Col>
          <Col md={6}>
            <InputField label="Contraseña" name="password" type="password"  />
          </Col>
          <Col md={6}>
            <SelectField
              name="permisos"
              label="Tipo de permisos"
              options={[
                { value: "admin", label: "administrador" },
                { value: "general", label: "general" },
              ]}
            />
          </Col>
        </Row>

        <BtnSubmitForm/>
      </FormComponent>
    </div>
  );
}
