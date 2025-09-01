import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col } from "react-bootstrap";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";
import { HandleRegister } from "../services/handleRegister";
import { useState } from "react";
import { RegisterEmployeeForm } from "./registerEmplForm";

const empresaSchema = z.object({
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener exactamente 11 dígitos"),
  razon_social: z.string().min(2, "La razón social es obligatoria"),
  direccion: z.string().min(5, "La dirección es obligatoria"),
  distrito: z.string().min(2, "El distrito es obligatorio"),
  provincia: z.string().min(2, "La provincia es obligatoria"),
  departamento: z.string().min(2, "El departamento es obligatorio"),
  representante_legal: z.string().min(3, "El representante es obligatorio"),
  correo: z.email("Correo inválido"),
});

export function RegisterFormCompany() {
  const [showFormEmpl, setShowFormEmpl] = useState(false)
  const [dataCompany, setDataCompany] = useState({})
  const methods = useForm({
        resolver: zodResolver(empresaSchema),
      });
  
    const onSubmit = async(data) => {
      setDataCompany(data)
      setShowFormEmpl(true)
    }
  return <div className="container">
    {
      !showFormEmpl?<>
        <FormComponent methods={methods} onSubmit={onSubmit} title={"Registrar Datos de la Empresa"}>
          <Row>
            <Col md={6}>
              <InputField label="RUC" name="ruc" placeholder="11 dígitos" />
            </Col>
            <Col md={6}>
              <InputField label="Razón Social" name="razon_social" />
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <InputField label="Dirección" name="direccion" />
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <InputField label="Distrito" name="distrito" />
            </Col>
            <Col md={4}>
              <InputField label="Provincia" name="provincia" />
            </Col>
            <Col md={4}>
              <InputField label="Departamento" name="departamento" />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <InputField label="Representante Legal" name="representante_legal" />
            </Col>
            <Col md={6}>
              <InputField label="Correo" name="correo" type="email" />
            </Col>
          </Row>
          <BtnSubmitForm/>
        </FormComponent>
      </>:<>
        <RegisterEmployeeForm dataCompany={dataCompany}/>
      </>
    }
  </div>
}