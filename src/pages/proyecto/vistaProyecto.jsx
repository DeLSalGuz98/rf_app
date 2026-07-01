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
  Stack,
  Tabs,
  Tab
} from "react-bootstrap";

// Funciones
import { getInfoProject } from "../../querysDB/projects/getInfoProject";
import { getListToGraphProjectDB } from "../../querysDB/gastos/getListToGraphProject";
import { getTotalExpenditureProject } from "../../querysDB/gastos/getTotalExpenditureProject";
import { updateStateProjectDB } from "../../querysDB/projects/updateStateProject";
import { getListExpenditureProject } from "../../querysDB/gastos/listExpenditureProject";

import { SetCapitalLetter } from "../../utils/setCapitalLetterString";

// Componentes
import { GraphExpenditureProject } from "../../components/graphExpenditureProject";
import { DataProyectComponent } from "./componentsVistaProyecto/datosGeneralesProyecto";
import { getTotalIncomesProject } from "../../querysDB/ingresos/getTotalIngresos";
import { TableGastos } from "./componentsVistaProyecto/tablaGastosProyecto";
import { TableIngresos } from "./componentsVistaProyecto/tablaIngresosProyecto";

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

  const [totalIngresos, setTotalIngresos] = useState(0)
  // const [totalEgresos, setTotalEgresos] = useState(0)
  useEffect(()=>{
    getTotalIngresosEgresos()
  },[])

  const getTotalIngresosEgresos = async ()=>{
    setTotalIngresos(await getTotalIngresos())
    // setTotalEgresos(await getTotalExpenditure())
  }

  const getTotalExpenditure = async () => {
    const res = await getTotalExpenditureProject(idProyecto);
    return Number(res).toFixed(2);
  };

  const getTotalIngresos = async () => {
    const res = await getTotalIncomesProject(idProyecto);
    return Number(res).toFixed(2);
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

  // const balance = totalIngresos - totalEgresos

  /**
   * ==============================
   * 📊 CÁLCULOS FINANCIEROS
   * ==============================
   */

  // Total gastado
  const totalGastado = proyecto.total_expenditure || 0;

  // Presupuesto total
  const presupuesto = proyecto.monto_ofertado || 0;

  // % ejecución presupuestal
  const porcentajeEjecutado = presupuesto
    ? (totalGastado / presupuesto) * 100
    : 0;

  // Margen real del proyecto
  const margen = totalIngresos - totalGastado;

  // ROI (%)
  const roi = totalGastado
    ? ((totalIngresos - totalGastado) / totalGastado) * 100
    : 0;

  /**
   * CPI (Cost Performance Index)
   * Si tienes Earned Value (EV), aquí lo puedes integrar.
   * Por ahora lo dejamos preparado.
   */
  const cpi = proyecto.cpi || null;

  /**
   * EAC (Estimate At Completion)
   * Proyección simple basada en ritmo actual:
   * EAC = Presupuesto / CPI
   */
  const eac = cpi ? presupuesto / cpi : null;

  /**
   * ==============================
   * 🎨 LÓGICA DE COLORES (SEMAFORO)
   * ==============================
   */

  // const getBudgetVariant = () => {
  //   if (porcentajeEjecutado >= 90) return "danger";
  //   if (porcentajeEjecutado >= 75) return "warning";
  //   return "success";
  // };

  const getMarginVariant = () => {
    if (margen < 0) return "danger";
    if (margen === 0) return "warning";
    return "success";
  };

  const getROIColor = () => {
    if (roi < 0) return "text-danger";
    if (roi < 15) return "text-warning";
    return "text-success";
  };

  /**
   * ==============================
   * 🧠 INSIGHTS AUTOMÁTICOS
   * ==============================
   */

  const insights = [];

  if (porcentajeEjecutado >= 90) {
    insights.push("⚠️ El proyecto ha consumido más del 90% del presupuesto.");
  }

  if (margen < 0) {
    insights.push("🔴 El proyecto actualmente tiene margen negativo.");
  }

  if (cpi && cpi < 1) {
    insights.push("📉 El desempeño de costos es ineficiente (CPI < 1).");
  }

  return (
    <div className="container-fluid">
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
                  now={(100 - proyecto.porcentaje)}
                  className="mt-1"
                  style={{ height: 12 }}
                />
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">
                    Disponible:
                    {" "}
                    {(100 - proyecto.porcentaje).toFixed(2)}%
                  </small>
                  <small className="text-muted">
                    Gastado:
                    {" "}
                    {proyecto.porcentaje.toFixed(2)}%
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
      <Row>
        <Col lg={3}>
          {/* KPIs */}
          <DataProyectComponent proyecto={proyecto} />
        </Col>
        <Col lg={9}>
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>

                  <h5 className="fw-bold mb-4">
                    Resumen Financiero Estratégico
                  </h5>

                  {/* ================= KPI PRINCIPALES ================= */}
                  <Row className="mb-4 text-center">

                    <Col md={3}>
                      <small className="text-muted">ROI</small>
                      <h4 className={getROIColor()}>
                        {roi.toFixed(2)}%
                      </h4>
                    </Col>

                    <Col md={3}>
                      <small className="text-muted">Margen</small>
                      <h4 className={getMarginVariant() === "danger" ? "text-danger" : "text-success"}>
                        {formatCurrency(margen)}
                      </h4>
                    </Col>

                    <Col md={3}>
                      <small className="text-muted">Presupuesto Ejecutado</small>
                      <h4>
                        {porcentajeEjecutado.toFixed(1)}%
                      </h4>
                    </Col>

                    <Col md={3}>
                      <small className="text-muted">EAC (Proyección)</small>
                      <h4>
                        {eac ? formatCurrency(eac) : "N/A"}
                      </h4>
                    </Col>

                  </Row>

                  {/* ================= BARRA DE PROGRESO ================= 

                  <div className="mb-4">
                    <ProgressBar
                      now={porcentajeEjecutado}
                      variant={getBudgetVariant()}
                    />
                  </div>*/}

                  {/* ================= INFORMACIÓN FINANCIERA ================= */}

                  <Row className="text-start">

                    <Col md={6}>
                      <p>
                        <strong>Presupuesto Total:</strong>{" "}
                        {formatCurrency(presupuesto)}
                      </p>

                      <p>
                        <strong>Total Gastado:</strong>{" "}
                        <span className="text-danger">
                          {formatCurrency(totalGastado)}
                        </span>
                      </p>
                    </Col>

                    <Col md={6}>
                      <p>
                        <strong>Total Ingresos:</strong>{" "}
                        <span className="text-success">
                          {formatCurrency(totalIngresos)}
                        </span>
                      </p>

                      <p>
                        <strong>Disponible:</strong>{" "}
                        {formatCurrency(presupuesto - totalGastado)}
                      </p>
                    </Col>

                  </Row>

                  {/* ================= INSIGHTS AUTOMÁTICOS ================= */}

                  {insights.length > 0 && (
                    <div className="mt-4">
                      <h6 className="fw-bold">Recomendaciones Automáticas</h6>

                      {insights.map((insight, index) => (
                        <Badge
                          key={index}
                          bg="warning"
                          text="dark"
                          className="me-2 mb-2"
                        >
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  )}

                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* RESUMEN FINANCIERO */}
          {/* <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <Row className="text-center">
                    <h5 className="fw-bold mb-3">
                      Resumen financiero
                    </h5>
                    <Col md={3} className="text-start">
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
                    </Col>
                    <Col md={3} className="text-start">
                      <div className="mb-3">
                        <small className="text-muted">
                          Monto Facturado
                        </small>
                        <h5>
                          {formatCurrency(proyecto.facturado)}
                        </h5>
                      </div>
                      <div>
                        <small className="text-muted">
                          Monto no facturado
                        </small>
                        <h5 className="text-warning">
                          {formatCurrency(proyecto.noFacturado)}
                        </h5>
                      </div>
                    </Col>
                    <Col md={3} className="text-start">
                      <div className="mb-3">
                        <small className="text-muted">
                          Total de Ingresos
                        </small>
                        <h5 className="fw-bold text-success">
                          {formatCurrency(totalIngresos)}
                        </h5>
                      </div>
                      <div>
                        <small className="text-muted">
                          Monto Restante
                        </small>
                        <h5 className="text-warning">
                          {formatCurrency(proyecto.monto_ofertado - totalIngresos)}
                        </h5>
                      </div>
                    </Col>

                    {/* INGRESOS */}
                    {/* <Col md={4} className="mb-3 mb-md-0">
                      <small className="text-muted">Total Ingresos</small>
                      <h4 className="fw-bold text-success">
                        {formatCurrency(totalIngresos)}
                      </h4>
                    </Col>

                    {/* GASTOS
                    <Col md={4} className="mb-3 mb-md-0">
                      <small className="text-muted">Total Gastos</small>
                      <h4 className="fw-bold text-danger">
                        {formatCurrency(totalEgresos)}
                      </h4>
                    </Col>

                    {/* BALANCE
                    <Col md={4}>
                      <small className="text-muted">Balance</small>
                      <h4
                        className={`fw-bold ${
                          balance >= 0 ? "text-primary" : "text-danger"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </h4>
                    </Col>

                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row> */}
          {/* CONTENIDO */}
          <Row className="mt-4">

            {/* TABLA */}
            <Col lg={12}>
              <Card className="border rounded-4">
                <Card.Body>
                  <Tabs
                    defaultActiveKey="gastos"
                    id="tabs-ingresos-gastos"
                    className="mb-3"
                    justify
                  >
                    {/* ===================== */}
                    {/* GASTOS */}
                    {/* ===================== */}
                    <Tab eventKey="gastos" title="Gastos">
                      <TableGastos
                        idProject={idProyecto}
                      />
                    </Tab>

                    {/* ===================== */}
                    {/* INGRESOS */}
                    {/* ===================== */}
                    <Tab eventKey="ingresos" title="Ingresos">
                      <TableIngresos
                        idProject={idProyecto}
                      />
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>

            {/* SIDEBAR */}
            <Col lg={12}>

              {/* RESUMEN */}
              <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body>
                  
                  <hr />
                  
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