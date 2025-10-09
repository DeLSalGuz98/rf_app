import {Routes, Route} from 'react-router-dom'
import { LandingPage } from '../pages/landing'
import { LoginPage } from '../pages/login'
import { RegisterPage } from '../pages/register'
import { DasboardPage } from '../pages/dashboard'
import { ProtectedRoute, RedirectRoutesUserLogged } from '../services/protectedRoutes'
import { LayoutNavApp } from './LayoutNav'
import { CreateNewProject } from '../pages/newProject'
import { AllProjects } from '../pages/allProjects'
import { ProjectPage } from '../pages/viewProject'
import { NewExpenditureProject } from '../pages/newExpenditureProject'
import { NewExpenditure } from '../pages/newExpenditure'
import { NewTaxDocument } from '../pages/newTaxDocument'
import { ListTaxDocumetPage } from '../pages/listTaxDocument'
import { NewDocumentProject } from '../pages/newDocumentProject'
import { ProjectReport } from '../pages/projectReport'
export function Layout() {
  return<div>
    <div className="">
      <Routes>
        <Route path="/" element={<RedirectRoutesUserLogged><LandingPage /></RedirectRoutesUserLogged>} />
        <Route path="/login" element={<RedirectRoutesUserLogged><LoginPage /></RedirectRoutesUserLogged>} />
        <Route path="/register" element={<RedirectRoutesUserLogged><RegisterPage /></RedirectRoutesUserLogged>} />
        <Route path="/rf" element={<LayoutNavApp/>}>
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DasboardPage />
            </ProtectedRoute>
          } />
          <Route path="crear-nuevo-proyecto" element={
            <ProtectedRoute>
              <CreateNewProject />
            </ProtectedRoute>
          } />
          <Route path="todos-los-proyectos" element={
            <ProtectedRoute>
              <AllProjects />
            </ProtectedRoute>
          } />
          <Route path="proyecto/:idProyecto" element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          } />
          <Route path="registrar-gastos-proyecto/:idProyecto" element={
            <ProtectedRoute>
              <NewExpenditureProject/>
            </ProtectedRoute>
          } />
          <Route path="registrar-documentos/:idProyecto" element={
            <ProtectedRoute>
              <NewDocumentProject/>
            </ProtectedRoute>
          } />
          <Route path="reporte-proyecto/:idProyecto" element={
            <ProtectedRoute>
              <ProjectReport/>
            </ProtectedRoute>
          } />
          <Route path="registrar-gastos" element={
            <ProtectedRoute>
              <NewExpenditure/>
            </ProtectedRoute>
          } />
          <Route path="registrar-documentos-tributarios" element={
            <ProtectedRoute>
              <NewTaxDocument/>
            </ProtectedRoute>
          } />
          <Route path="lista-documentos-tributarios" element={
            <ProtectedRoute>
              <ListTaxDocumetPage/>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  </div>
}