import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveNewWorkerCompanyDB } from "../../querysDB/workers/newWorkerCompany";

// Esquema Zod con campos opcionales y validación condicional para credenciales
const registerSchema = z
  .object({
    // Campos obligatorios
    nombre: z.string().min(2, "El nombre es requerido"),
    apellidoPaterno: z.string().min(2, "Apellido paterno es requerido"),
    apellidoMaterno: z.string().min(2, "Apellido materno es requerido"),
    fechaNacimiento: z.string().min(1, "Fecha de nacimiento requerida"),
    tipoDoc: z.enum(["dni", "ce"], {
      message: "Seleccione un tipo de documento válido",
    }),
    nroDoc: z.string().min(8, "Número de documento inválido (mín. 8 caracteres)"),
    activo: z.enum(["si", "no"]),
    tipoContrata: z.enum(["permanente", "parcial"]),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),

    // Campos opcionales
    fechaFin: z.string().optional().nullable(),
    tipoTrabajo: z.string().optional().nullable(),
    sexo: z.enum(["masculino", "femenino"]).optional().nullable(),
    telf: z.string().optional().nullable(),

    // Toggle de credenciales
    hasCredentials: z.boolean().default(false),

    // Campos condicionales
    email: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    permisos: z.enum(["admin", "general"]).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.hasCredentials) {
      if (!data.email || !z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correo inválido o requerido",
          path: ["email"],
        });
      }
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La contraseña debe tener mínimo 6 caracteres",
          path: ["password"],
        });
      }
      if (!data.permisos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione un tipo de permiso",
          path: ["permisos"],
        });
      }
    }
  });

export function NewWorker({ title = "Registro de Nuevo Trabajador" }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tipoDoc: "dni",
      activo: "si",
      tipoContrata: "permanente",
      hasCredentials: false,
      email: "",
      password: "",
      permisos: null,
    },
  });

  // Observamos directamente el valor dentro de React Hook Form
  const addCredentials = watch("hasCredentials");

  const handleToggleCredentials = (e) => {
    const checked = e.target.checked;
    setValue("hasCredentials", checked);

    // Si desactiva las credenciales, limpiamos sus valores y errores para no bloquear el submit
    if (!checked) {
      setValue("email", "");
      setValue("password", "");
      setValue("permisos", null);
      clearErrors(["email", "password", "permisos"]);
    }
  };

  const onSubmit = async (data) => {
    const usuario = data.hasCredentials
      ? {
          id: "",
          username: (
            (data.nombre?.trim().charAt(0) || "") + (data.apellidoPaterno || "")
          ).toLowerCase(),
          permisos: data.permisos,
        }
      : null;

    const empleado = {
      empresa_id: "",
      usuario_id: "",
      nombre: data.nombre.toLowerCase(),
      apellido_paterno: data.apellidoPaterno.toLowerCase(),
      apellido_materno: data.apellidoMaterno.toLowerCase(),
      activo: data.activo === "si",
      email: data.hasCredentials && data.email ? data.email : null,
      fecha_inicio: data.fechaInicio,
      fecha_fin: data.fechaFin ? data.fechaFin : null,
      fecha_nacimiento: data.fechaNacimiento,
      nro_doc: data.nroDoc,
      sexo: data.sexo ? data.sexo.toLowerCase() : null,
      telf: data.telf || null,
      tipo_contrata: data.tipoContrata.toLowerCase(),
      tipo_doc: data.tipoDoc.toLowerCase(),
      tipo_trabajo: data.tipoTrabajo ? data.tipoTrabajo.toLowerCase() : null,
    };

    try {
      await saveNewWorkerCompanyDB(usuario, empleado, data.password);
      navigate("/")
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-primary">{title}</h2>
        <Button onClick={() => navigate(-1)} variant="outline-secondary">
          Regresar
        </Button>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Sección 1: Datos Personales */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light fw-bold">Información Personal</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="nombre">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.nombre}
                    {...register("nombre")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="apellidoPaterno">
                  <Form.Label>Apellido Paterno *</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.apellidoPaterno}
                    {...register("apellidoPaterno")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellidoPaterno?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="apellidoMaterno">
                  <Form.Label>Apellido Materno *</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.apellidoMaterno}
                    {...register("apellidoMaterno")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellidoMaterno?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="tipoDoc">
                  <Form.Label>Tipo de Documento *</Form.Label>
                  <Form.Select
                    isInvalid={!!errors.tipoDoc}
                    {...register("tipoDoc")}
                  >
                    <option value="dni">DNI</option>
                    <option value="ce">CE</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tipoDoc?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="nroDoc">
                  <Form.Label>Nro Documento *</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.nroDoc}
                    {...register("nroDoc")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nroDoc?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="fechaNacimiento">
                  <Form.Label>Fecha de Nacimiento *</Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.fechaNacimiento}
                    {...register("fechaNacimiento")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fechaNacimiento?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="sexo">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select {...register("sexo")}>
                    <option value="">-- Seleccionar --</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="telf">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    placeholder="Ej. 987654321"
                    {...register("telf")}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sección 2: Información de Contrato */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light fw-bold">Información de Contrato</Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="tipoContrata">
                  <Form.Label>Tipo de Contrata *</Form.Label>
                  <Form.Select
                    isInvalid={!!errors.tipoContrata}
                    {...register("tipoContrata")}
                  >
                    <option value="permanente">Permanente</option>
                    <option value="parcial">Parcial</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tipoContrata?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="activo">
                  <Form.Label>Estado Activo *</Form.Label>
                  <Form.Select
                    isInvalid={!!errors.activo}
                    {...register("activo")}
                  >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.activo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="tipoTrabajo">
                  <Form.Label>Tipo de Trabajo</Form.Label>
                  <Form.Control
                    placeholder="Ej. Operario, Técnico"
                    {...register("tipoTrabajo")}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="fechaInicio">
                  <Form.Label>Fecha Inicio Contrata *</Form.Label>
                  <Form.Control
                    type="date"
                    isInvalid={!!errors.fechaInicio}
                    {...register("fechaInicio")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fechaInicio?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="fechaFin">
                  <Form.Label>Fecha Fin Contrata</Form.Label>
                  <Form.Control type="date" {...register("fechaFin")} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sección 3: Acceso al Sistema */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center">
            <span className="fw-bold">Acceso al Sistema</span>
            <Form.Check
              id="credentials-switch"
              type="switch"
              label="Asignar Credenciales"
              checked={addCredentials}
              onChange={handleToggleCredentials}
            />
          </Card.Header>

          {addCredentials && (
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="email">
                    <Form.Label>Correo Electrónico *</Form.Label>
                    <Form.Control
                      type="email"
                      isInvalid={!!errors.email}
                      {...register("email")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="password">
                    <Form.Label>Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      isInvalid={!!errors.password}
                      {...register("password")}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="permisos">
                    <Form.Label>Permisos *</Form.Label>
                    <Form.Select
                      isInvalid={!!errors.permisos}
                      {...register("permisos")}
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="admin">Administrador</option>
                      <option value="general">General</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.permisos?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>

        {/* Botones de Acción */}
        <div className="d-flex gap-3 justify-content-end mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              "Guardar Trabajador"
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}