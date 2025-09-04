import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { getInfoProject } from "../querysDB/projects/getInfoProject";

export default function ProyectoDetalle({idProyecto}) {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyecto = async () => {
      const data = await getInfoProject(idProyecto)
      setProyecto(data);
      setLoading(false);
    };
    fetchProyecto();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!proyecto) {
    return <p className="text-center text-muted">No se encontró el proyecto.</p>;
  }

  return (
    <Row className="g-3">
      {/* Datos Generales */}
      <Col md={6} lg={3}>
        <Card className="h-100">
          <Card.Header>
            <div className="d-flex justify-content-between">
              <strong className="text-uppercase">{proyecto.nombre_proyecto}</strong>
              <Badge
                bg={
                  proyecto.estado === "finalizado"
                    ? "success"
                    : proyecto.estado === "pendiente"
                    ? "danger"
                    : "secondary"
                }
              >
                {proyecto.estado}
              </Badge>
            </div>
            <Card.Text className="fst-italic w-75">{proyecto.descripcion_proyecto.charAt(0).toUpperCase()+proyecto.descripcion_proyecto.slice(1)}</Card.Text>
          </Card.Header>
          <Card.Body>
            <p><strong>Tipo:</strong> {proyecto.tipo}</p>
            <p><strong>Monto ofertado:</strong> S/. {Number(proyecto.monto_ofertado).toFixed(2)}</p>
          </Card.Body>
        </Card>
      </Col>
      {/* Fechas */}
      <Col md={6} lg={3}>
        <Card className="h-100">
          <Card.Header><strong>Fechas</strong></Card.Header>
          <Card.Body>
            <p><strong>Fecha inicio:</strong> {proyecto.fecha_inicio}</p>
            <p><strong>Plazo:</strong> {proyecto.plazo_dias} días</p>
            <p><strong>Fecha fin:</strong> {proyecto.fecha_fin}</p>
          </Card.Body>
        </Card>
      </Col>
      {/* Cliente */}
      <Col md={6} lg={3}>
        <Card className="h-100">
          <Card.Header><strong>Cliente</strong></Card.Header>
          <Card.Body>
            <p><strong>RUC:</strong> {proyecto.ruc_cliente}</p>
            <p><strong>Razón Social:</strong> {proyecto.rs_cliente}</p>
            <p><strong>Unidad Ejecutora:</strong> {proyecto.unidad_ejecutora}</p>
            <p><strong>Exp. SIAF:</strong> {proyecto.exp_siaf}</p>
          </Card.Body>
        </Card>
      </Col>
      {/* Ubicación */}
      <Col md={6} lg={3}>
        <Card className="h-100">
          <Card.Header><strong>Ubicación / Lugar de entrega</strong></Card.Header>
          <Card.Body>
            <p><strong>Direccion:</strong> {proyecto.direccion}</p>
            <p><strong>Distrito:</strong> {proyecto.distrito}</p>
            <p><strong>Provincia:</strong> {proyecto.provincia}</p>
            <p><strong>Departamento:</strong> {proyecto.departamento}</p>
          </Card.Body>
        </Card>
      </Col>      
    </Row>
  );
}