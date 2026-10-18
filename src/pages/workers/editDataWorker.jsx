import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateWorkerDataDB } from "../../querysDB/workers/updateDataWorker";
// Importa aquí tu función de actualización en la base de datos (ejemplo)
// import { updateWorkerDataDB } from "../../querysDB/workers/updateWorkerData";

// 1. Esquema de Validación con Zod
const workerEditSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellido_materno: z.string().min(1, 'El apellido materno es requerido'),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  sexo: z.enum(['masculino', 'femenino', 'otro'], {
    errorMap: () => ({ message: 'Seleccione un sexo válido' })
  }),
  telf: z.string().refine((val) => !val || /^\d{7,15}$/.test(val), {
    message: 'Ingrese un número de teléfono válido'
  }).optional().nullable(),
  tipo_doc: z.enum(['dni', 'ce', 'pasaporte', 'otro'], {
    errorMap: () => ({ message: 'Seleccione un tipo de documento válido' })
  }),
  nro_doc: z.string().min(1, 'El número de documento es requerido'),
  tipo_trabajo: z.string().min(1, 'El tipo de trabajo es requerido'),
  tipo_contrata: z.string().min(1, 'El tipo de contrata es requerido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().optional().nullable()
});

/**
 * Componente FormEditDataWorker
 * Permite actualizar selectivamente solo los campos modificados del trabajador usando dirtyFields.
 */
export function FormEditDataWorker() {
  const location = useLocation();
  const workerData = location.state || {};

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, dirtyFields }
  } = useForm({
    resolver: zodResolver(workerEditSchema),
    defaultValues: {
      nombre: workerData.nombre || "",
      apellido_paterno: workerData.apellido_paterno || "",
      apellido_materno: workerData.apellido_materno || "",
      fecha_nacimiento: workerData.fecha_nacimiento || "",
      sexo: workerData.sexo || "masculino",
      telf: workerData.telf || "",
      tipo_doc: workerData.tipo_doc || "dni",
      nro_doc: workerData.nro_doc || "",
      tipo_trabajo: workerData.tipo_trabajo || "",
      tipo_contrata: workerData.tipo_contrata || "permanente",
      fecha_inicio: workerData.fecha_inicio || "",
      fecha_fin: workerData.fecha_fin || ""
    }
  });

  const onCancel = () => navigate(-1);

  const onSubmitForm = async (data) => {
    try {
      // Función recursiva para extraer únicamente los valores modificados (dirtyFields)
      const getDirtyValues = (dirty, allData) => {
        if (dirty === true) return allData;
        if (typeof dirty !== 'object' || dirty === null) return undefined;

        return Object.keys(dirty).reduce((acc, key) => {
          const value = getDirtyValues(dirty[key], allData[key]);
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});
      };

      // Obtenemos solo los campos que cambiaron
      const modifiedData = getDirtyValues(dirtyFields, data);

      // Si no hay ningún cambio realizado, informamos al usuario o salimos
      if (!modifiedData || Object.keys(modifiedData).length === 0) {
        toast.info("No se realizaron modificaciones para guardar.");
        return;
      }

      // Añadimos la fecha de actualización de forma automática al payload
      const payload = {
        ...modifiedData,
        fecha_actualizacion: new Date().toISOString()
      };

      const res = await updateWorkerDataDB(payload, workerData.id);
      if(res){
        navigate(-1);
      }
    } catch (error) {
      console.error("Error al actualizar el trabajador:", error);
      toast.error("No se pudieron actualizar los datos");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-primary text-white py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-person-gear me-2"></i>
          Editar Datos del Trabajador: <span className="text-capitalize">{workerData.nombre} {workerData.apellido_paterno}</span>
        </h5>
      </Card.Header>

      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit(onSubmitForm)}>
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <h6 className="text-secondary fw-bold text-uppercase fs-7 mb-3">
            1. Información Personal
          </h6>
          <Row className="g-3 mb-4">
            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Nombres</Form.Label>
              <Form.Control
                type="text"
                {...register("nombre")}
                isInvalid={!!errors.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombre?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Apellido Paterno</Form.Label>
              <Form.Control
                type="text"
                {...register("apellido_paterno")}
                isInvalid={!!errors.apellido_paterno}
              />
              <Form.Control.Feedback type="invalid">
                {errors.apellido_paterno?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Apellido Materno</Form.Label>
              <Form.Control
                type="text"
                {...register("apellido_materno")}
                isInvalid={!!errors.apellido_materno}
              />
              <Form.Control.Feedback type="invalid">
                {errors.apellido_materno?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                {...register("fecha_nacimiento")}
                isInvalid={!!errors.fecha_nacimiento}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fecha_nacimiento?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Sexo</Form.Label>
              <Form.Select {...register("sexo")} isInvalid={!!errors.sexo}>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.sexo?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={4}>
              <Form.Label className="fw-semibold">Teléfono / Celular</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. 980558364"
                {...register("telf")}
                isInvalid={!!errors.telf}
              />
              <Form.Control.Feedback type="invalid">
                {errors.telf?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <hr className="my-4 text-muted" />

          {/* SECCIÓN 2: IDENTIFICACIÓN */}
          <h6 className="text-secondary fw-bold text-uppercase fs-7 mb-3">
            2. Documento de Identidad
          </h6>
          <Row className="g-3 mb-4">
            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Tipo de Documento</Form.Label>
              <Form.Select {...register("tipo_doc")} isInvalid={!!errors.tipo_doc}>
                <option value="dni">DNI</option>
                <option value="ce">Carnet de Extranjería</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="otro">Otro</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.tipo_doc?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Número de Documento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. 74035099"
                {...register("nro_doc")}
                isInvalid={!!errors.nro_doc}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nro_doc?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <hr className="my-4 text-muted" />

          {/* SECCIÓN 3: INFORMACIÓN LABORAL */}
          <h6 className="text-secondary fw-bold text-uppercase fs-7 mb-3">
            3. Datos Laborales y Contractuales
          </h6>
          <Row className="g-3 mb-4">
            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Tipo de Trabajo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. Informático, Operario, etc."
                {...register("tipo_trabajo")}
                isInvalid={!!errors.tipo_trabajo}
              />
              <Form.Control.Feedback type="invalid">
                {errors.tipo_trabajo?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Tipo de Contrata</Form.Label>
              <Form.Select {...register("tipo_contrata")} isInvalid={!!errors.tipo_contrata}>
                <option value="permanente">Permanente</option>
                <option value="parcial">Parcial</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.tipo_contrata?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Fecha de Inicio</Form.Label>
              <Form.Control
                type="date"
                {...register("fecha_inicio")}
                isInvalid={!!errors.fecha_inicio}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fecha_inicio?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md={6}>
              <Form.Label className="fw-semibold">Fecha de Fin (Opcional)</Form.Label>
              <Form.Control
                type="date"
                {...register("fecha_fin")}
                isInvalid={!!errors.fecha_fin}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fecha_fin?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          {/* BOTONES DE ACCIÓN */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button variant="outline-secondary" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>

            <Button variant="primary" type="submit" disabled={isSubmitting} className="px-4">
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Guardando Cambios...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}