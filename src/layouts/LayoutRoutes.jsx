import {Routes, Route} from 'react-router-dom'
import { LandingPage } from '../pages/landing'
import { LoginPage } from '../pages/login'
import { RegisterPage } from '../pages/register'
import { DasboardPage } from '../pages/dashboard'
import { ProtectedRoute, RedirectRoutesUserLogged } from '../services/protectedRoutes'
import { LayoutNavApp } from './LayoutNav'
import { CreateNewProject } from '../pages/newProject'
import { AllProjects } from '../pages/allProjects'
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
          <Route path="proyectos" element={
            <ProtectedRoute>
              <AllProjects />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  </div>
}