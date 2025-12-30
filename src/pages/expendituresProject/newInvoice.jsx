/**
 * Componente para registrar nuevos documentos tributarios (facturas, notas de crédito, etc.)
 * @component
 * @param {Function} hideInvoiceForm - Función callback para enviar datos al componente padre
 */
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Row, Col, Button } from "react-bootstrap";
import { useEffect } from "react";
import { obtenerRazonSocialPorRUC } from "../../utils/rsPorRuc";
import { listStateTaxDocument } from "../../utils/listStateTaxDocument";
import { InputField, SelectField } from "../../components/inputComponent";
import FormComponent from "../../components/formComponent";

/**
 * Esquema de validación para documentos tributarios usando Zod
 * Define las reglas de validación para todos los campos del formulario
 */
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
  estado_comprobante: z.enum([
    "pendiente", "devengado", "girado", "con retencion", 
    "pagado", "atrasado", "anulado", "archivado"
  ])
});

export function NewInvoice({ hideInvoiceForm, isProjectContext, idProyecto }) {
  /**
   * Valores iniciales del formulario
   */
  const initData = {
    tipo_doc: "factura recibida",
    fecha_emision: "",
    fecha_vencimiento: "",
    moneda: "PEN"
  }

  /**
   * Configuración del formulario con React Hook Form y validación Zod
   */
  const methods = useForm({
    resolver: zodResolver(docTributarioSchema),
    defaultValues: initData,
  })

  // Destructuración de métodos y estados del formulario
  const { reset, watch, setValue } = methods;
  
  // Observar cambios en campos específicos para efectos reactivos
  const emitDate = watch("fecha_emision");
  const typeCoin = watch("moneda");
  const ruc = watch("ruc");

  /**
   * Efecto para obtener automáticamente la razón social cuando el RUC tiene 11 dígitos
   */
  useEffect(() => {
    getRsByRuc(ruc);
  }, [ruc]);

  /**
   * Efecto para sincronizar fecha de vencimiento con fecha de emisión
   * Cuando cambia la fecha de emisión, se actualiza automáticamente la fecha de vencimiento
   */
  useEffect(() => {
    setValue("fecha_vencimiento", emitDate);
  }, [emitDate, setValue]);

  /**
   * Obtiene la razón social automáticamente desde un servicio externo
   * @param {string} ruc - Número de RUC (11 dígitos)
   */
  const getRsByRuc = async (ruc = "") => {
    if (ruc.length < 11) {
      return;
    } else {
      const res = await obtenerRazonSocialPorRUC(ruc);
      setValue("razon_social", res);
    }
  }

  /**
   * Maneja el envío del formulario
   * @param {Object} data - Datos validados del formulario
   */
  const onSubmit = async (data) => {
    //Preparar datos con o sin proyecto
    const finalData = isProjectContext 
      ? {...data, id_proyecto: idProyecto}
      : data
    
    hideInvoiceForm(finalData)
    reset(initData); // Reinicia el formulario a valores iniciales
  };

  return (
    <>
      <FormComponent 
        moreClasses="" 
        methods={methods} 
        onSubmit={onSubmit} 
        title={isProjectContext 
          ? "Registrar Documento Tributario - Proyecto" 
          : "Registrar Documento Tributario"
        }
      >
        <Row>
          {/* TIPO DE DOCUMENTO */}
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

          {/* FECHAS DE EMISIÓN Y VENCIMIENTO */}
          <Col md={4}>
            <InputField label="Fecha de Emisión" name="fecha_emision" type="date" />
          </Col>
          <Col md={4}>
            <InputField label="Fecha de Vencimiento" name="fecha_vencimiento" type="date" />
          </Col>

          {/* SERIE Y NÚMERO DEL COMPROBANTE */}
          <Col md={2}>
            <InputField label="Serie" name="serie_comprobante" />
          </Col>
          <Col md={2}>
            <InputField label="Número" name="nro_comprobante" />
          </Col>

          {/* DATOS DEL PROVEEDOR */}
          <Col md={3}>
            <InputField label="RUC" name="ruc" />
          </Col>
          <Col md={5}>
            <InputField label="Razón Social" name="razon_social" />
          </Col>

          {/* INFORMACIÓN MONETARIA */}
          <Col md={typeCoin === "USD" ? 4 : 6}>
            <InputField label="Monto" name="monto" type="number" step="0.0001" />
          </Col>
          <Col md={typeCoin === "USD" ? 4 : 6}>
            <SelectField
              name="moneda"
              label="Moneda"
              options={[
                { value: "PEN", label: "Soles (PEN)" },
                { value: "USD", label: "Dólares (USD)" }
              ]}
            />
          </Col>

          {/* TIPO DE CAMBIO (SOLO PARA DÓLARES) */}
          {typeCoin === "USD" ? (
            <Col md={4}>
              <InputField label="Tipo de Cambio" name="tipo_cambio" type="number" step="0.0001" />
            </Col>
          ) : <></>}

          {/* INFORMACIÓN ADICIONAL */}
          <Col md={6}>
            <InputField 
              label={"Mes Declarado"}
              name={"mes_declarado"}
              type="month"
            />
          </Col>
          <Col md={6}>
            <SelectField
              name="estado_comprobante"
              label="Estado del Comprobante"
              options={listStateTaxDocument}
            />
          </Col>
        </Row>

        {/* BOTÓN DE ENVÍO */}
        <Button type="submit" variant="primary" className="w-100 mt-2 fs-5">
          <i className="bi bi-floppy2-fill"></i> Guardar Factura
        </Button>
      </FormComponent>
    </>
  )
}
