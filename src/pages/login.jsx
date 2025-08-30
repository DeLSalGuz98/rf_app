import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormComponent from "../components/formComponent";
import {InputField, BtnSubmitForm } from "../components/inputComponent";
import { Link, useNavigate } from "react-router-dom";
import { handleLoging } from "../services/handleLoging";



const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});


export function LoginPage() {
  const navigate = useNavigate()
  const methods = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const res = await handleLoging(data.email, data.password)
    if(res.message === "error"){
      alert("error en la credenciales")
      navigate("/login")
    }else{
      navigate("/rf/dashboard")
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="container">
        <div className="col-12 col-md-6 mx-auto">
          <FormComponent methods={methods} onSubmit={onSubmit} title="Iniciar Sesión">
            <InputField name="email" label="Correo" type="email" placeholder="Ingresa tu correo" />
            <InputField name="password" label="Contraseña" type="password" placeholder="Ingresa tu contraseña" />
            <BtnSubmitForm/>
            <div className="text-center mx-auto mt-3">
              <Link to={"/"} className="btn btn-outline-secondary w-100">Regresar</Link>
            </div>
          </FormComponent>
        </div>
      </div>
    </div>
  );
}