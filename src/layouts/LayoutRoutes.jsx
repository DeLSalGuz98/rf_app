import {Routes, Route} from 'react-router-dom'
import { LandingPage } from '../pages/landing'
import { LoginPage } from '../pages/login'
import { RegisterPage } from '../pages/register'
import { DasboardPage } from '../pages/dashboard'
export function Layout() {
  return<div>
    <div className="">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DasboardPage />} />
      </Routes>
    </div>
  </div>
}