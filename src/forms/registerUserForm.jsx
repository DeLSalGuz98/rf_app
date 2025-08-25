import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col } from "react-bootstrap";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";
import { registerUser } from "../services/registerUser";
import { supabase } from "../services/supabaseClient";

const registerSchema = z.object({
  username: z.string().min(2, "El nombre es requerido"),
  email: z.email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
  permisos: z.enum(["admin", "general"])
});

export function RegisterUserForm() {
  const methods = useForm({
      resolver: zodResolver(registerSchema),
    });

  const onSubmit = async(data) => {
    const {user} = await registerUser(data.email, data.password)
    if(user){
      const {error: insertError } = await supabase.from("usuario").insert([{
        id:user.id,
        username: data.username,
        permisos: data.permisos
      }])
      if (insertError) {
        console.error("Error al insertar datos en empleado:", insertError.message);
        return null
      }
      alert("Usuario registrado exitosamente")
      console.log(user.id);
    }

  }

  return (
    <div className="container py-5">
      <FormComponent methods={methods} onSubmit={onSubmit} title="Registrar Nuevo Usuario">
        <Row>
          <Col md={6}>
            <InputField label="Nombre de Usuario" name="username"/>
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
