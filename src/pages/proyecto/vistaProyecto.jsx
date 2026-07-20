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

// Funciones API
import { getInfoProject } from "../../querysDB/projects/getInfoProject";
import { getListToGraphProjectDB } from "../../querysDB/gastos/getListToGraphProject";
import { getTotalExpenditureProject } from "../../querysDB/gastos/getTotalExpenditureProject";
import { updateStateProjectDB } from "../../querysDB/projects/updateStateProject";
import { getListExpenditureProject } from "../../querysDB/gastos/listExpenditureProject";
// import { getTotalIncomesProject } from "../../querysDB/ingresos/getTotalIngresos";

// Utils y Componentes
import { SetCapitalLetter } from "../../utils/setCapitalLetterString";
import { GraphExpenditureProject } from "../../components/graphExpenditureProject";
import { DataProyectComponent } from "./componentsVistaProyecto/datosGeneralesProyecto";
import { TableGastos } from "./componentsVistaProyecto/tablaGastosProyecto";
import { TableIngresos } from "./componentsVistaProyecto/tablaIngresosProyecto";
import { VistasResumenFinancieroProyecto } from "./vistaResumenFinancieroProyecto";

export function ProjectPage() {
  const { idProyecto } = useParams();

  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listGraphProject, setListGraphProject] = useState([]);
  // const [totalIngresos, setTotalIngresos] = useState(0);
  const [stateProjectValue, setStateProjectValue] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadAllProjectData() {
      try {
        setLoading(true);

        // Promise.all ejecuta todas las consultas en paralelo (Mucho más rápido)
        const [
          dataProyecto,
          rawExpenditure,
          // rawIncomes,
          graphData,
          expenditureList
        ] = await Promise.all([
          getInfoProject(idProyecto),
          getTotalExpenditureProject(idProyecto),
          // getTotalIncomesProject(idProyecto),
          getListToGraphProjectDB(idProyecto),
          getListExpenditureProject(idProyecto)
        ]);

        // Procesar cálculos de facturación en memoria de forma limpia
        let facturado = 0;
        let noFacturado = 0;

        expenditureList.forEach((e) => {
          const totalSoles = e.moneda !== "PEN" ? e.monto_total * e.tipo_cambio : e.monto_total;
          if (!e.nro_comprobante && !e.serie_comprobante) {
            noFacturado += totalSoles;
          } else {
            facturado += totalSoles;
          }
        });

        const totalExpenditureNum = Number(rawExpenditure) || 0;
        // const totalIncomesNum = Number(rawIncomes) || 0;
        const porcentaje = dataProyecto.monto_ofertado ? (totalExpenditureNum * 100) / dataProyecto.monto_ofertado : 0;

        // Inyectar datos financieros calculados directamente en el objeto de estado del proyecto
        setProyecto({
          ...dataProyecto,
          total_expenditure: totalExpenditureNum,
          dif: dataProyecto.monto_ofertado - totalExpenditureNum,
          porcentaje,
          facturado: facturado.toFixed(2),
          noFacturado: noFacturado.toFixed(2)
        });

        // setTotalIngresos(totalIncomesNum);
        setListGraphProject(graphData);
        setStateProjectValue(dataProyecto.estado);
      } catch (error) {
        console.error("Error cargando los datos del proyecto:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllProjectData();
  }, [idProyecto]);

  // Manejo correcto del Guardar del modal sin depender del evento del botón
  const handleSaveState = async () => {
    try {
      await updateStateProjectDB({ estado: stateProjectValue }, idProyecto);
      setProyecto((prev) => ({ ...prev, estado: stateProjectValue }));
      setShowModal(false);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!proyecto) {
    return <p className="text-center text-muted mt-5">No se encontró el proyecto.</p>;
  }

  // Cálculos Financieros derivados del estado estable
  // const totalGastado = proyecto.total_expenditure || 0;
  // const presupuesto = proyecto.monto_ofertado || 0;
  // const porcentajeEjecutado = presupuesto ? (totalGastado / presupuesto) * 100 : 0;
  // const margen = totalIngresos - totalGastado;

  // Alertas dinámicas
  // const insights = [];
  // if (porcentajeEjecutado >= 90) insights.push("⚠️ El proyecto ha consumido más del 90% del presupuesto.");
  // if (margen < 0) insights.push("🔴 El proyecto actualmente tiene margen negativo.");

  return (
    <div className="container-fluid">
      {/* HERO HEADER */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div>
                  <h2 className="fw-bold mb-1 text-uppercase">{proyecto.nombre_proyecto}</h2>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <Badge bg="dark">{SetCapitalLetter(proyecto.tipo)}</Badge>
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
                      <Badge bg="light" text="dark">Exp. SIAF: {proyecto.exp_siaf}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-muted fs-5 mb-3">{SetCapitalLetter(proyecto.descripcion_proyecto)}</p>
              {/* <div>
                <small className="text-muted">EJECUCIÓN PRESUPUESTAL</small>
                <ProgressBar now={100 - proyecto.porcentaje} className="mt-1" style={{ height: 12 }} />
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted">Disponible: {(100 - proyecto.porcentaje).toFixed(2)}%</small>
                  <small className="text-muted">Gastado: {proyecto.porcentaje.toFixed(2)}%</small>
                </div>
              </div> */}
            </Col>

            <Col lg={4}>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2}>
                  <Button as={Link} to={`/rf/registrar-ingresos-proyecto/${idProyecto}`} size="lg" variant="success" className="w-50">
                    <i className="bi bi-cash me-2"></i>Ingreso
                  </Button>
                  <Button as={Link} to={`/rf/registrar-gastos-proyecto/${idProyecto}`} size="lg" variant="danger" className="w-50">
                    <i className="bi bi-cash me-2"></i>Gasto
                  </Button>
                </Stack>
                <Button as={Link} to={`/rf/registrar-documentos/${idProyecto}`} variant="outline-primary">Documentos</Button>
                <Button as={Link} to={`/rf/reporte-proyecto/${idProyecto}`} variant="outline-dark">Reporte financiero</Button>
                <Button variant="outline-warning" onClick={() => setShowModal(true)}>Cambiar estado</Button>
              </Stack>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={3}>
          <DataProyectComponent proyecto={proyecto} />
          {/* Renderizado de Insights dinámicos si existen */}
          {/* {insights.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 mt-3 bg-light">
              <Card.Body>
                <h6 className="fw-bold mb-2">Alertas del Proyecto</h6>
                {insights.map((insight, idx) => (
                  <p key={idx} className="small mb-1 text-secondary">{insight}</p>
                ))}
              </Card.Body>
            </Card>
          )} */}
        </Col>
        
        <Col lg={9}>
          <VistasResumenFinancieroProyecto 
            presupuestoTotal={proyecto.monto_ofertado}
            idProyecto={idProyecto}
            totalGastos={proyecto.total_expenditure}
          />
          <Row className="mt-4">
            <Col lg={12}>
              <Card className="border rounded-4">
                <Card.Body>
                  <Tabs defaultActiveKey="gastos" id="tabs-ingresos-gastos" className="mb-3" justify>
                    <Tab eventKey="gastos" title="Gastos">
                      <TableGastos idProject={idProyecto} />
                    </Tab>
                    <Tab eventKey="ingresos" title="Ingresos">
                      <TableIngresos idProject={idProyecto} />
                    </Tab>
                  </Tabs>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={12} className="mt-4">
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                  <h5 className="fw-bold mb-0">Distribución de gastos</h5>
                </Card.Header>
                <Card.Body>
                  {listGraphProject.length > 0 ? (
                    <GraphExpenditureProject data={listGraphProject} />
                  ) : (
                    <p className="text-muted text-center">No hay datos disponibles</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* MODAL CORREGIDO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar estado del proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select onChange={(e) => setStateProjectValue(e.target.value)} value={stateProjectValue}>
            <option value="pendiente">Pendiente</option>
            <option value="paralizado">Paralizado</option>
            <option value="finalizado">Finalizado</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="warning" onClick={handleSaveState}>Guardar cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}