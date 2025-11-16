import {Routes, Route} from 'react-router-dom'
import { LandingPage } from '../pages/landing'
import { LoginPage } from '../pages/login'
import { RegisterPage } from '../pages/register'
import { ProtectedRoute, RedirectRoutesUserLogged } from '../services/protectedRoutes'
import { LayoutNavApp } from './LayoutNav'
import { privateRoutes } from '../utils/privateRoutes'
export function Layout() {
  return<div>
    <div className="">
      <Routes>
        <Route path="/" element={<RedirectRoutesUserLogged><LandingPage /></RedirectRoutesUserLogged>} />
        <Route path="/login" element={<RedirectRoutesUserLogged><LoginPage /></RedirectRoutesUserLogged>} />
        <Route path="/register" element={<RedirectRoutesUserLogged><RegisterPage /></RedirectRoutesUserLogged>} />
        {/* rutas privadas */}
        <Route path="/rf" element={<LayoutNavApp />}>
          {privateRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
        </Route>
      </Routes>
    </div>
  </div>
}