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
  Modal,
  ProgressBar,
  Stack
} from "react-bootstrap";

// Funciones
import { getInfoProject } from "../../querysDB/projects/getInfoProject";
import { getListToGraphProjectDB } from "../../querysDB/gastos/getListToGraphProject";
import { getTotalExpenditureProject } from "../../querysDB/gastos/getTotalExpenditureProject";
import { updateStateProjectDB } from "../../querysDB/projects/updateStateProject";
import { getListExpenditureProject } from "../../querysDB/gastos/listExpenditureProject";

import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

// Componentes
import { TableExpenditure } from "./componentsVistaProyecto/tablaGastosProyecto";
import { GraphExpenditureProject } from "../../components/graphExpenditureProject";
import { DataProyectComponent } from "./componentsVistaProyecto/datosGeneralesProyecto";

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

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value);

  const fetchProyecto = async () => {

    const data = await getInfoProject(idProyecto);

    const totalExpenditure = await getTotalExpenditure();

    const invoice = await invoiceNoInvoice();

    const total = Number(totalExpenditure);

    const dif = data.monto_ofertado - total;

    const porcentaje = (total * 100) / data.monto_ofertado;

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

    res.forEach((e) => {

      let totalSoles =
        e.moneda !== "PEN"
          ? e.monto_total * e.tipo_cambio
          : e.monto_total;

      if (
        e.nro_comprobante === "" &&
        e.serie_comprobante === ""
      ) {
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
      await updateStateProjectDB(
        { estado: stateProjectValue },
        idProyecto
      );
    }

    setShow(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <Spinner />
      </div>
    );
  }

  if (!proyecto) {
    return (
      <p className="text-center text-muted">
        No se encontró el proyecto.
      </p>
    );
  }

  return (
    <div className="container-fluid py-3 px-4">

      {/* HERO HEADER */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">

        <Card.Body className="p-4">

          <Row className="align-items-center">

            {/* IZQUIERDA */}
            <Col lg={8}>

              <div className="d-flex align-items-center gap-3 mb-3">

                <div>

                  <h2 className="fw-bold mb-1 text-uppercase">
                    {proyecto.nombre_proyecto}
                  </h2>

                  <div className="d-flex gap-2 align-items-center flex-wrap">

                    <Badge bg="dark">
                      {SetCapitalLetter(proyecto.tipo)}
                    </Badge>

                    <Badge
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

                    {proyecto.exp_siaf && (
                      <Badge bg="light" text="dark">
                        Exp. SIAF: {proyecto.exp_siaf}
                      </Badge>
                    )}

                  </div>
                </div>

              </div>

              <p className="text-muted fs-5 mb-3">
                {SetCapitalLetter(proyecto.descripcion_proyecto)}
              </p>

              <div>

                <small className="text-muted">
                  EJECUCIÓN PRESUPUESTAL
                </small>

                <ProgressBar
                  now={proyecto.porcentaje}
                  className="mt-1"
                  style={{ height: 12 }}
                />

                <div className="d-flex justify-content-between mt-1">

                  <small className="text-muted">
                    Gastado:
                    {" "}
                    {proyecto.porcentaje.toFixed(2)}%
                  </small>

                  <small className="text-muted">
                    Disponible:
                    {" "}
                    {(100 - proyecto.porcentaje).toFixed(2)}%
                  </small>

                </div>

              </div>

            </Col>

            {/* DERECHA */}
            <Col lg={4}>

              <Stack gap={2}>

                <Stack direction="horizontal" gap={2}>
                  <Button
                    as={Link}
                    to={`/rf/registrar-ingresos-proyecto/${idProyecto}`}
                    size="lg"
                    variant="success"
                    className="w-50"
                  >
                    <i className="bi bi-cash me-2"></i>
                    Registrar ingreso
                  </Button>

                  <Button
                    as={Link}
                    to={`/rf/registrar-gastos-proyecto/${idProyecto}`}
                    size="lg"
                    variant="danger"
                    className="w-50"
                  >
                    <i className="bi bi-cash me-2"></i>
                    Registrar gasto
                  </Button>
                </Stack>
                

                <Button
                  as={Link}
                  to={`/rf/registrar-documentos/${idProyecto}`}
                  variant="outline-primary"
                >
                  Documentos
                </Button>

                <Button
                  as={Link}
                  to={`/rf/reporte-proyecto/${idProyecto}`}
                  variant="outline-dark"
                >
                  Reporte financiero
                </Button>

                <Button
                  variant="outline-warning"
                  onClick={() => setShow(true)}
                >
                  Cambiar estado
                </Button>

              </Stack>

            </Col>

          </Row>

        </Card.Body>

      </Card>

      {/* KPIs */}
      <DataProyectComponent proyecto={proyecto} />

      {/* CONTENIDO */}
      <Row className="mt-4">

        {/* TABLA */}
        <Col lg={8}>

          <Card className="border-0 shadow-sm rounded-4">

            <Card.Header className="bg-white border-0 pt-4 px-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <h5 className="mb-0 fw-bold">
                    Gastos y compras
                  </h5>

                  <small className="text-muted">
                    Registro detallado del proyecto
                  </small>

                </div>

                <Badge bg="light" text="dark">
                  {formatCurrency(proyecto.total_expenditure)}
                </Badge>

              </div>

            </Card.Header>

            <Card.Body
              style={{
                maxHeight: "75vh",
                overflow: "auto"
              }}
            >
              <TableExpenditure idProject={idProyecto} />
            </Card.Body>

          </Card>

        </Col>

        {/* SIDEBAR */}
        <Col lg={4}>

          {/* RESUMEN */}
          <Card className="border-0 shadow-sm rounded-4 mb-3">

            <Card.Body>

              <h5 className="fw-bold mb-3">
                Resumen financiero
              </h5>

              <div className="mb-3">
                <small className="text-muted">
                  Presupuesto
                </small>

                <h5>
                  {formatCurrency(proyecto.monto_ofertado)}
                </h5>
              </div>

              <div className="mb-3">
                <small className="text-muted">
                  Invertido
                </small>

                <h5 className="text-danger">
                  {formatCurrency(proyecto.total_expenditure)}
                </h5>
              </div>

              <div className="mb-3">
                <small className="text-muted">
                  Disponible
                </small>

                <h5 className="text-success">
                  {formatCurrency(proyecto.dif)}
                </h5>
              </div>

              <hr />

              <div className="mb-3">
                <small className="text-muted">
                  Facturado
                </small>

                <h6>
                  {formatCurrency(proyecto.facturado)}
                </h6>
              </div>

              <div>
                <small className="text-muted">
                  No facturado
                </small>

                <h6 className="text-warning">
                  {formatCurrency(proyecto.noFacturado)}
                </h6>
              </div>

            </Card.Body>

          </Card>

          {/* GRÁFICO */}
          <Card className="border-0 shadow-sm rounded-4">

            <Card.Header className="bg-white border-0 pt-4 px-4">

              <h5 className="fw-bold mb-0">
                Distribución de gastos
              </h5>

            </Card.Header>

            <Card.Body>

              {listGraphProject.length > 0 ? (
                <GraphExpenditureProject
                  data={listGraphProject}
                />
              ) : (
                <p className="text-muted text-center">
                  No hay datos disponibles
                </p>
              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>

      {/* MODAL */}
      <Modal show={show} onHide={handleClose} centered>

        <Modal.Header closeButton>
          <Modal.Title>
            Cambiar estado del proyecto
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form.Select
            onChange={(e) =>
              setStateProjectValue(e.target.value)
            }
            value={stateProjectValue}
          >
            <option value="pendiente">
              Pendiente
            </option>

            <option value="paralizado">
              Paralizado
            </option>

            <option value="finalizado">
              Finalizado
            </option>

          </Form.Select>

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="light"
            name="close"
            onClick={handleClose}
          >
            Cancelar
          </Button>

          <Button
            variant="warning"
            name="save"
            onClick={handleClose}
          >
            Guardar cambios
          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
}