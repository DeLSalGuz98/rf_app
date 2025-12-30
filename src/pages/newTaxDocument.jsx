import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col, Container } from "react-bootstrap";
import FormComponent from "../components/formComponent";
import { BtnSubmitForm, InputField, SelectField } from "../components/inputComponent";
import { saveTaxDocumentDB } from "../querysDB/taxDocument/saveTaxDocument";
import { useEffect } from "react";
import { obtenerRazonSocialPorRUC } from "../utils/rsPorRuc";
import { listStateTaxDocument } from "../utils/listStateTaxDocument";

const docTributarioSchema = z.object({
  tipo_doc: z.string().min(1, "El tipo de documento es requerido"),
  fecha_emision: z.string().min(1, "La fecha de emisión es requerida"),
  fecha_vencimiento: z.string().min(1, "La fecha de vencimiento es requerida"),
  serie_comprobante: z.string().min(1, "La serie es requerida"),
  nro_comprobante: z.string().min(1, "El número es requerido"),
  ruc: z.string().min(11, "El RUC debe tener 11 dígitos"),
  razon_social: z.string().min(2, "La razón social es requerida"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.enum(["PEN", "USD"], { message: "Seleccione una moneda válida" }),
  tipo_cambio: z.coerce.number().optional(),
  mes_declarado: z.string().min(1, "El mes declarado es requerido"),
  estado_comprobante: z.enum(["pendiente","devengado", "girado", "con retencion", "pagado", "atrasado", "anulado", "archivado"])
});


export function NewTaxDocument(){
  const methods = useForm({
    resolver: zodResolver(docTributarioSchema),
  })
  const {reset, watch, setValue} = methods
  const emitDate = watch("fecha_emision")
  const ruc = watch("ruc")
  const moneda = watch("moneda")

  useEffect(()=>{
    getRsByRuc(ruc)
  },[ruc])

  useEffect(()=>{
    setValue("fecha_vencimiento", emitDate)
  },[emitDate])

  const getRsByRuc = async (ruc="")=>{
    if(ruc.length<11){
      return
    }else{
      const res = await obtenerRazonSocialPorRUC(ruc)
      setValue("razon_social", res)
    }
  }
  const onSubmit = async (data) => {
    await saveTaxDocumentDB(data)
    reset()
  };
  return(
    <Container>
      <FormComponent methods={methods} onSubmit={onSubmit} title="Registrar Documento Tributario">
        <Row>
          <Col md={4}>
            <SelectField
              name="tipo_doc"
              label="Tipo de Documento"
              options={[
                { value: "factura emitida", label: "Factura Emitida" },
                { value: "factura recibida", label: "Factura Recibida" },
                { value: "nc emitido", label: "Nota de Credito Emitido" },
                { value: "nc recibido", label: "Nota de Credito Recibido" },
                { value: "retencion recibido", label: "Comprobante de Retencion Recibido" },
                { value: "r.h. recibido", label: "R.H. Recibido" },
              ]}
            />
          </Col>
          <Col md={4}>
            <InputField label="Fecha de Emisión" name="fecha_emision" type="date" />
          </Col>
          <Col md={4}>
            <InputField label="Fecha de Vencimiento" name="fecha_vencimiento" type="date" />
          </Col>
          <Col md={2}>
            <InputField label="Serie" name="serie_comprobante" />
          </Col>
          <Col md={2}>
            <InputField label="Número" name="nro_comprobante" />
          </Col>
          <Col md={3}>
            <InputField label="RUC" name="ruc" />
          </Col>
          <Col md={5}>
            <InputField label="Razón Social" name="razon_social" />
          </Col>
          <Col md={moneda==="PEN"?6:4}>
            <InputField label="Monto" name="monto" type="number" step="0.01" />
          </Col>
          <Col md={moneda==="PEN"?6:4}>
            <SelectField
              name="moneda"
              label="Moneda"
              options={[
                { value: "PEN", label: "Soles (PEN)" },
                { value: "USD", label: "Dólares (USD)" }
              ]}
            />
          </Col>
          {
            moneda!=="PEN"?
            <Col md={4}>
              <InputField label="Tipo de Cambio" name="tipo_cambio" type="number" step="0.0001" />
            </Col>:<></>
          }
          <Col md={6}>
            <InputField 
              label={"Mes Declarado"}
              name={"mes_declarado"}
              type="month"
            ></InputField>
          </Col>
          <Col md={6}>
            <SelectField
              name="estado_comprobante"
              label="Estado del Comprobante"
              options={listStateTaxDocument}
            />
          </Col>
        </Row>
        <BtnSubmitForm />
      </FormComponent>
    </Container>
  )
}