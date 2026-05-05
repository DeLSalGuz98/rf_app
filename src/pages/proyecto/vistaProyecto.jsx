import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  Form,
  Modal
} from "react-bootstrap";

// Funciones
import { getInfoProject } from "../../querysDB/projects/getInfoProject";
import { getListToGraphProjectDB } from "../../querysDB/gastos/getListToGraphProject";
import { getTotalExpenditureProject } from "../../querysDB/gastos/getTotalExpenditureProject";
import { updateStateProjectDB } from "../../querysDB/projects/updateStateProject";
import { getListExpenditureProject } from "../../querysDB/gastos/listExpenditureProject";
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

// Componentes
import { TableExpenditure } from "../../components/tableExpenditureProject";
import { GraphExpenditureProject } from "../../components/graphExpenditureProject";

export function ProjectPage() {
  const { idProyecto } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listGraphProject, setListGraphProject] = useState([]);
  const [show, setShow] = useState(false);
  const [stateProjectValue, setStateProjectValue] = useState("");

  useEffect(() => {
    fetchProyecto();
    getListToGraphProject();
  }, []);

  const fetchProyecto = async () => {
    const data = await getInfoProject(idProyecto);
    const totalExpenditure = await getTotalExpenditure();
    const invoice = await invoiceNoInvoice();

    const total = Number(totalExpenditure);
    const dif = data.monto_ofertado - total;
    const porcentaje = (dif * 100) / data.monto_ofertado;

    setProyecto({
      ...data,
      total_expenditure: total,
      dif,
      porcentaje,
      facturado: invoice.facturado.toFixed(2),
      noFacturado: invoice.noFacturado.toFixed(2)
    });

    setStateProjectValue(data.estado);
    setLoading(false);
  };

  const getListToGraphProject = async () => {
    const res = await getListToGraphProjectDB(idProyecto);
    setListGraphProject(res);
  };

  const getTotalExpenditure = async () => {
    const res = await getTotalExpenditureProject(idProyecto);
    return res.toFixed(2);
  };

  const invoiceNoInvoice = async () => {
    const res = await getListExpenditureProject(idProyecto);

    let invoice = 0;
    let noInvoice = 0;

    res.forEach(e => {
      let totalSoles =
        e.moneda !== "PEN"
          ? e.monto_total * e.tipo_cambio
          : e.monto_total;

      if (e.nro_comprobante === "" && e.serie_comprobante === "") {
        noInvoice += totalSoles;
      } else {
        invoice += totalSoles;
      }
    });

    return {
      facturado: invoice,
      noFacturado: noInvoice
    };
  };

  const handleClose = async (e) => {
    const { name } = e.target;
    if (name === "save") {
      await updateStateProjectDB({ estado: stateProjectValue }, idProyecto);
    }
    setShow(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
        <Spinner />
      </div>
    );
  }

  if (!proyecto) {
    return <p className="text-center text-muted">No se encontró el proyecto.</p>;
  }

  return (
    <div className="container">

      {/* HEADER COMPLETO */}
      <Card className="mb-3 shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">

          <div className="w-25">
            <h4 className="text-uppercase mb-1">{proyecto.nombre_proyecto}</h4>
            <small className="text-muted">{SetCapitalLetter(proyecto.tipo)}</small>
          </div>

          <div className="text-center">
            <p className="fst-italic m-0 fs-5">
              {SetCapitalLetter(proyecto.descripcion_proyecto)}
            </p>

            {proyecto.exp_siaf && (
              <small className="text-muted">Exp. SIAF: {proyecto.exp_siaf}</small>
            )}
          </div>

          <div className="text-end w-25">
            <Badge
              className="px-3 py-2 text-uppercase"
              bg={
                proyecto.estado === "finalizado"
                  ? "success"
                  : proyecto.estado === "pendiente"
                  ? "warning"
                  : "secondary"
              }
            >
              {proyecto.estado}
            </Badge>
          </div>

        </Card.Body>
      </Card>

      {/* MENÚ */}
      <Card className="mb-3 shadow-sm">
        <Card.Body className="d-flex flex-wrap gap-2 justify-content-between">

          <div className="d-flex gap-2 flex-wrap">
            <Button as={Link} to="/rf/todos-los-proyectos" variant="outline-secondary">
              ← Volver
            </Button>

            <Button as={Link} to={`/rf/registrar-gastos-proyecto/${idProyecto}`} variant="primary">
              Registrar gasto
            </Button>

            <Button as={Link} to={`/rf/registrar-documentos/${idProyecto}`} variant="outline-primary">
              Documentos
            </Button>

            <Button as={Link} to={`/rf/reporte-proyecto/${idProyecto}`} variant="outline-dark">
              Reporte
            </Button>
          </div>

          <Button variant="outline-warning" onClick={() => setShow(true)}>
            Cambiar estado
          </Button>

        </Card.Body>
      </Card>

      {/* MÉTRICAS */}
      <Row className="mb-3">
        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <small>Presupuesto</small>
            <h5>{formatCurrency(proyecto.monto_ofertado)}</h5>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <small>Invertido</small>
            <h5>{formatCurrency(proyecto.total_expenditure)}</h5>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <small>Diferencia</small>
            <h5 className={proyecto.dif < 0 ? "text-danger" : "text-success"}>
              {formatCurrency(proyecto.dif)}
            </h5>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="p-3 shadow-sm">
            <small>Margen restante</small>
            <h5>{proyecto.porcentaje.toFixed(2)}%</h5>
            <small className="text-muted">% disponible del presupuesto</small>
          </Card>
        </Col>
      </Row>

      {/* INFO DETALLADA */}
      <Row>

        {/* CLIENTE */}
        <Col md={4} className="p-2">
          <Card className="h-100 shadow-sm">
            <Card.Header><strong>Cliente</strong></Card.Header>
            <Card.Body>

              {proyecto.ruc_cliente && <p><strong>RUC:</strong> {proyecto.ruc_cliente}</p>}
              <p><strong>Razón Social:</strong> {proyecto.rs_cliente}</p>

              {proyecto.unidad_ejecutora && (
                <p><strong>Unidad Ejecutora:</strong> {proyecto.unidad_ejecutora}</p>
              )}

              <p>
                <strong>Dirección:</strong><br />
                {proyecto.direccion},<br />
                {proyecto.distrito?.toUpperCase()}, {proyecto.provincia?.toUpperCase()}<br />
                {proyecto.departamento?.toUpperCase()}
              </p>

            </Card.Body>
          </Card>
        </Col>

        {/* FECHAS (RECUPERADO PLAZO) */}
        <Col md={4} className="p-2">
          <Card className="h-100 shadow-sm">
            <Card.Header><strong>Fechas</strong></Card.Header>
            <Card.Body>
              <p><strong>Inicio:</strong> {proyecto.fecha_inicio}</p>
              <p><strong>Plazo:</strong> {proyecto.plazo_dias} días</p>
              <p><strong>Fin:</strong> {proyecto.fecha_fin}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* FACTURACIÓN */}
        <Col md={4} className="p-2">
          <Card className="h-100 shadow-sm">
            <Card.Header><strong>Facturación</strong></Card.Header>
            <Card.Body>
              <p><strong>Facturado:</strong> {formatCurrency(proyecto.facturado)}</p>
              <p><strong>No facturado:</strong> {formatCurrency(proyecto.noFacturado)}</p>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* TABLA */}
      <Card className="mt-3 shadow-sm">
        <Card.Header><strong>Tabla de gastos y compras</strong></Card.Header>
        <Card.Body style={{ maxHeight: 400, overflow: "auto" }}>
          <TableExpenditure idProject={idProyecto} />
        </Card.Body>
      </Card>

      {/* GRÁFICO */}
      <Card className="mt-3 shadow-sm">
        <Card.Header><strong>Distribución de gastos</strong></Card.Header>
        <Card.Body>
          {listGraphProject.length > 0 ? (
            <GraphExpenditureProject data={listGraphProject} />
          ) : (
            <p className="text-muted text-center">No hay datos disponibles</p>
          )}
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Cambiar estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            onChange={(e) => setStateProjectValue(e.target.value)}
            value={stateProjectValue}
          >
            <option value="pendiente">Pendiente</option>
            <option value="paralizado">Paralizado</option>
            <option value="finalizado">Finalizado</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button name="close" onClick={handleClose}>Cancelar</Button>
          <Button name="save" onClick={handleClose}>Guardar</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}