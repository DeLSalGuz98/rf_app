import { Link, useParams } from "react-router-dom"
import { useState } from "react"
import { Badge, Button, ButtonGroup, Card, Col, Dropdown, DropdownButton, Row, Spinner } from "react-bootstrap"
import { getInfoProject } from "../querysDB/projects/getInfoProject"
import { useEffect } from "react"
import { ModalComponet } from "../components/modalComponent"
import { SetCapitalLetter } from "../utils/setCapitalLetterString"
import { TableExpenditure } from "../components/tableExpenditureProject"
import { getTotalExpenditureProject } from "../querysDB/gastos/getTotalExpenditureProject"

export function ProjectPage() {
  let {idProyecto}= useParams()
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProyecto();
  }, []);
  const fetchProyecto = async () => {
    const data = await getInfoProject(idProyecto)
    const totalExpenditure = await getTotalExpenditure()
    const dif = data.monto_ofertado - totalExpenditure
    const porcentaje =  (dif * 100)/data.monto_ofertado
    setProyecto({...data, total_expenditure: totalExpenditure, dif: dif, porcentaje: porcentaje});
    setLoading(false);
  };
  
  const getTotalExpenditure = async()=>{
    const res = await getTotalExpenditureProject(idProyecto)
    return res.toFixed(2)
  }

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
  return <div className="container">
  <Row>
    <Col lg={12} className="mb-2">
      <Card>
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div className="w-25">
            <h3 className="text-uppercase">{proyecto.nombre_proyecto}</h3>
            <small className="text-muted">{SetCapitalLetter(proyecto.tipo)}</small>
          </div>
          <div className="text-center">
            <p className="fst-italic m-0 fs-2">{SetCapitalLetter(proyecto.descripcion_proyecto)}</p>
            {proyecto.exp_siaf?<small className="text-muted">Exp. SIAF: {proyecto.exp_siaf}</small>:<></>}
          </div>
          <div className="text-end w-25">
            <Badge className="d-inline-block px-3 py-2 text-uppercase" bg={proyecto.estado === "finalizado" ? "success" : proyecto.estado === "pendiente" ? "danger" : "secondary"}>{proyecto.estado}</Badge>
          </div>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={12}>
      <Card>
        <ButtonGroup>
          <Link className="btn btn-primary" to={"/rf/todos-los-proyectos"} > <i className="bi bi-arrow-left"></i> Regresar</Link>
          <DropdownButton as={ButtonGroup} title="Editar" id="bg-nested-dropdown">
            <Dropdown.Item eventKey="1" onClick={()=>alert("cambiar estado del proyecto")}>Estado del Proyecto</Dropdown.Item>
            <Dropdown.Item as={Link} to={"/rf/modificar-proyecto"} eventKey="2">Informacion del Proyecto</Dropdown.Item>
          </DropdownButton>
          <Button as={Link} to={`/rf/registrar-gastos-proyecto/${idProyecto}`} >Registrar gastos</Button>
          <Button >Agregar personal</Button>
        </ButtonGroup>
      </Card>
    </Col>  
    <Col lg={4} className="p-2">
      <Card className="h-100">
        <Card.Header><strong>Fechas</strong></Card.Header>
        <Card.Body>
          <p><strong>Fecha inicio:</strong> {proyecto.fecha_inicio}</p>
          <p><strong>Plazo:</strong> {proyecto.plazo_dias} días</p>
          <p><strong>Fecha fin:</strong> {proyecto.fecha_fin}</p>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={4} className="p-2">
      <Card className="h-100">
        <Card.Header><strong>Cliente</strong></Card.Header>
        <Card.Body>
          {proyecto.ruc_cliente?<p><strong>RUC:</strong> {proyecto.ruc_cliente}</p>:<></>}
          <p><strong>Razón Social:</strong> {proyecto.rs_cliente}</p>
          {proyecto.unidad_ejecutora?<p><strong>Unidad Ejecutora:</strong> {proyecto.unidad_ejecutora}</p>:<></>}
          <p><strong>Direccion:</strong> {proyecto.direccion}, {proyecto.distrito.toUpperCase()}, {proyecto.provincia.toUpperCase()}, {proyecto.departamento.toUpperCase()}</p>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={4} className="p-2">
      <Card className="h-100">
        <Card.Header><strong>Costos y Gastos</strong></Card.Header>
        <Card.Body>
          <p><strong>Monto ofertado:</strong> S/. {proyecto.monto_ofertado.toFixed(2)}</p>
          <p><strong>Monto invertido:</strong>  S/. {proyecto.total_expenditure}</p>
          <p><strong>Diferencia</strong>  S/. {proyecto.dif.toFixed(2)}</p>
          <p><strong>Porcentaje Restante:</strong> {proyecto.porcentaje.toFixed(2)} %</p>
        </Card.Body>
      </Card>
    </Col>
    <Col lg={8} className="p-2 overflow-x-scroll">
      <TableExpenditure idProject={proyecto.id}/>
    </Col>
    <Col lg={4}>
      <Row>
        <Col lg={12} className="border border-black bg-secondary p-2 text-white">vista total gastos facturados y no facturados</Col>
        <Col lg={12} className="border border-black bg-secondary p-2 text-white">grafico del monto total gastado por dia</Col>
        <Col lg={12} className="border border-black bg-secondary p-2 text-white">lista del personal asignado al proyecto</Col>
      </Row>
    </Col>
  </Row>
  </div>
}