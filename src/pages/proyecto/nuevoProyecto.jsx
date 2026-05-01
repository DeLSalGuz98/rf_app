import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button, Row, Col, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { proyectoSchema } from "../../utils/schemas/schemaProyecto";
import { obtenerRazonSocialPorRUC } from "../../utils/rsPorRuc";
import { GetUserNameAndNameCompany } from "../../utils/getUserAndCompany";
import { SaveNewProjectData } from "../../querysDB/projects/saveNewProject";
// import { toast } from "react-toastify"; // opcional

export function NuevoProyecto() {
  const navigate = useNavigate();

  const [loadingRuc, setLoadingRuc] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      estado: "pendiente",
    },
  });

  const rucCliente = watch("ruc_cliente");
  const fechaInicio = watch("fecha_inicio");
  const plazo = watch("plazo_dias");

  // 🔍 Buscar RUC con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      getRsByRuc(rucCliente);
    }, 500);

    return () => clearTimeout(timeout);
  }, [rucCliente]);

  const getRsByRuc = async (ruc = "") => {
    if (ruc.length !== 11) return;

    try {
      setLoadingRuc(true);
      const res = await obtenerRazonSocialPorRUC(ruc);

      if (res) {
        setValue("rs_cliente", res);
      }
    } catch (error) {
      console.error("Error al obtener RUC:", error);
    } finally {
      setLoadingRuc(false);
    }
  };

  const calcularFechaFin = (fechaInicio, plazoDias) => {
    if (!fechaInicio) return "";

    const fecha = new Date(fechaInicio);
    const dias = Number(plazoDias) || 0;

    fecha.setDate(fecha.getDate() + dias);

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const fechaFinPreview = calcularFechaFin(fechaInicio, plazo);

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      const res = await GetUserNameAndNameCompany();

      const dataProject = {
        ...data,
        fecha_fin: fechaFinPreview,
        id_empresa: res.idEmpresa,
        estado: "pendiente",
        id_usuario: res.idUser,
      };

      await SaveNewProjectData(dataProject);

      // toast.success("Proyecto creado correctamente");
      navigate("/rf/todos-los-proyectos");
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      // toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h4 className="mb-4">Nuevo Proyecto</h4>

        <Form onSubmit={handleSubmit(onSubmit)}>

          {/* 🧾 DATOS GENERALES */}
          <h5 className="fw-bold border-bottom pb-2 mb-3">Datos Generales</h5>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nombre del Proyecto <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control autoFocus {...register("nombre_proyecto")} isInvalid={errors.nombre_proyecto} />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre_proyecto?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control {...register("descripcion_proyecto")} />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control {...register("direccion")} />
              </Form.Group>
            </Col>
          </Row>

          {/* 📍 UBICACIÓN */}
          <h5 className="fw-bold border-bottom pb-2 mb-3">Ubicación</h5>

          <Row>
            <Col md={3}><Form.Control placeholder="Distrito" {...register("distrito")} /></Col>
            <Col md={3}><Form.Control placeholder="Provincia" {...register("provincia")} /></Col>
            <Col md={3}><Form.Control placeholder="Departamento" {...register("departamento")} /></Col>
          </Row>

          {/* 📅 PROYECTO */}
          <h5 className="fw-bold border-bottom pb-2 mt-4 mb-3">Datos del Proyecto</h5>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control type="date" {...register("fecha_inicio")} />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Plazo (días)</Form.Label>
                <Form.Control type="number" {...register("plazo_dias")} />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Monto Ofertado</Form.Label>
                <Form.Control type="number" step="0.01" {...register("monto_ofertado")} />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select {...register("tipo")}>
                  <option value="privado">Privado</option>
                  <option value="orden compra">Orden de Compra</option>
                  <option value="orden servicio">Orden de Servicio</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* 📅 FECHA FIN (preview) */}
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control value={fechaFinPreview} disabled />
              </Form.Group>
            </Col>
          </Row>

          {/* 🏢 CLIENTE */}
          <h5 className="fw-bold border-bottom pb-2 mt-4 mb-3">Cliente</h5>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>RUC</Form.Label>
                <Form.Control {...register("ruc_cliente")} isInvalid={errors.ruc_cliente} />
                <Form.Control.Feedback type="invalid">
                  {errors.ruc_cliente?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Razón Social</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control {...register("rs_cliente")} disabled={loadingRuc} />
                  {loadingRuc && <Spinner size="sm" />}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* 🏛️ ADMINISTRATIVO */}
          <h5 className="fw-bold border-bottom pb-2 mt-4 mb-3">Datos Administrativos</h5>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Unidad Ejecutora</Form.Label>
                <Form.Control {...register("unidad_ejecutora")} />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Expediente SIAF</Form.Label>
                <Form.Control {...register("exp_siaf")} />
              </Form.Group>
            </Col>
          </Row>

          {/* BOTÓN */}
          <div className="d-flex justify-content-end mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Proyecto"}
            </Button>
          </div>

        </Form>
      </Card.Body>
    </Card>
  );
}