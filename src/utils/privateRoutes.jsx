import { AllProjects } from "../pages/allProjects";
import { DashPricesPage } from "../pages/consultarPrecios/dashPrices";
import { EditExpenditureProyect } from "../pages/editExpenditureProject";
import { EditProjectData } from "../pages/editProjectData";
import { EditTaxDocument } from "../pages/editTaxDocument";
import { NewExpensePage } from "../pages/expendituresProject/newExpense";
import { ListTaxDocumetPage } from "../pages/listTaxDocument";
import { NewDocumentProject } from "../pages/newDocumentProject";
//import { NewExpenditure } from "../pages/newExpenditure";
import { NewExpenditureProject } from "../pages/newExpenditureProject";
import { CreateNewProject } from "../pages/newProject";
import { NewTaxDocument } from "../pages/newTaxDocument";
import { ProjectReport } from "../pages/projectReport";
import { ReportTaxDocument } from "../pages/reportTaxDocument";
import { ProjectPage } from "../pages/viewProject";
import { NewWorker } from "../pages/workers/newWorker";

//NUEVAS RUTAS
import { DasboardHomePage } from "../pages/dashboardHome/dashboard";

export const privateRoutes = [
  { path: "dashboard", element: <DasboardHomePage /> },
  { path: "crear-nuevo-proyecto", element: <CreateNewProject /> },
  { path: "todos-los-proyectos", element: <AllProjects /> },
  { path: "proyecto/:idProyecto", element: <ProjectPage /> },
  { path: "proyecto/:idProyecto/gasto/:idGasto", element: <EditExpenditureProyect /> },
  { path: "proyecto/:idProyecto/editar-datos", element: <EditProjectData /> },
  { path: "registrar-gastos-proyecto/:idProyecto", element: <NewExpensePage/>/*<NewExpenditureProject />*/ },
  { path: "registrar-documentos/:idProyecto", element: <NewDocumentProject /> },
  { path: "editar-documento/:idTaxDocument", element: <EditTaxDocument /> },
  { path: "reporte-proyecto/:idProyecto", element: <ProjectReport /> },
  { path: "registrar-gastos", element: <NewExpensePage/> /*<NewExpenditure />*/ },
  { path: "registrar-documentos-tributarios", element: <NewTaxDocument /> },
  { path: "lista-documentos-tributarios", element: <ListTaxDocumetPage /> },
  { path: "reporte-mensual", element: <ReportTaxDocument /> },
  { path: "registrar-trabajador", element: <NewWorker /> },
  { path: "consultar-precios", element: <DashPricesPage /> },
];