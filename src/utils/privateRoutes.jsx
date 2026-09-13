import { DashPricesPage } from "../pages/consultarPrecios/dashPrices";
import { EditExpenditureProyect } from "../pages/editExpenditureProject";
import { EditProjectData } from "../pages/editProjectData";
import { EditTaxDocument } from "../pages/editTaxDocument";
import { NewExpensePage } from "../pages/expendituresProject/newExpense";
import { ListTaxDocumetPage } from "../pages/listTaxDocument";
import { NewDocumentProject } from "../pages/newDocumentProject";
import { NewExpenditureProject } from "../pages/newExpenditureProject";
import { ProjectReport } from "../pages/projectReport";
import { ReportTaxDocument } from "../pages/reportTaxDocument";
import { NewWorker } from "../pages/workers/newWorker";

//NUEVAS RUTAS
import { DasboardHomePage } from "../pages/dashboardHome/dashboard";
import { NuevoProyecto } from "../pages/proyecto/nuevoProyecto";
import { AllProjects } from "../pages/proyecto/listaProyectos";
import { ProjectPage } from "../pages/proyecto/vistaProyecto";
import { NuevoIngresoPage } from "../pages/ingresosProyecto/nuevoIngreso";
import { NewTaxDocument } from "../pages/documentosTributarios/newTaxDocument";
import { EditarDataIngreso } from "../pages/ingresosProyecto/editarIngreso";

export const privateRoutes = [
  { path: "dashboard", element: <DasboardHomePage /> },
  { path: "crear-nuevo-proyecto", element: <NuevoProyecto/> },
  { path: "todos-los-proyectos", element: <AllProjects /> },
  { path: "proyecto/:idProyecto", element: <ProjectPage /> },
  { path: "registrar-gastos-proyecto/:idProyecto", element: <NewExpensePage/>},
  { path: "registrar-ingresos-proyecto/:idProyecto", element: <NuevoIngresoPage/>},
  { path: "registrar-documentos-tributarios", element: <NewTaxDocument /> },
  { path: "proyecto/:idProyecto/ingreso/:id", element: <EditarDataIngreso/> },
  { path: "proyecto/:idProyecto/editar-datos", element: <EditProjectData /> },

  { path: "proyecto/:idProyecto/gasto/:idGasto", element: <EditExpenditureProyect /> },
  { path: "registrar-documentos/:idProyecto", element: <NewDocumentProject /> },
  { path: "editar-documento/:idTaxDocument", element: <EditTaxDocument /> },
  { path: "reporte-proyecto/:idProyecto", element: <ProjectReport /> },
  { path: "registrar-gastos", element: <NewExpensePage/> /*<NewExpenditure />*/ },
  { path: "lista-documentos-tributarios", element: <ListTaxDocumetPage /> },
  { path: "reporte-mensual", element: <ReportTaxDocument /> },
  { path: "registrar-trabajador", element: <NewWorker /> },
  { path: "consultar-precios", element: <DashPricesPage /> },
];