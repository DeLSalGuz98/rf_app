import { Col, Container, Row } from "react-bootstrap";

//Componentes
import { MonthlySummary } from "./dashResumenMes";
import { GraphYearIncomeAndExpenses } from "../../components/graphMainDash";
import { ProyectosPendientes } from "./dashProyectosPendientes";
import { PersonalActivo } from "./dashPersonalActivo";

export function DasboardHomePage(){
  return<Container>
    <Row>
      {/*vista - estado del mes*/}
      <Col className="p-2" md="12">
        <MonthlySummary></MonthlySummary>
      </Col>
      {/*Vista - estado ultimos 12 meses*/}
      <Col className="p-2" md="12">
        <p className="h3">Vista General</p>
        <div className="border rounded" style={{height: "200px"}}>
          <GraphYearIncomeAndExpenses></GraphYearIncomeAndExpenses>
        </div>
      </Col>
      {/*vista proyectos pendientes o en proceso*/}
      <Col className="p-2 overflow-scroll" lg="9">
        <ProyectosPendientes></ProyectosPendientes>
      </Col>
      <Col className="pt-2" lg="3">
        <PersonalActivo></PersonalActivo>          
      </Col>
    </Row>
  {/*vista Personal activo*/}

  </Container>
}