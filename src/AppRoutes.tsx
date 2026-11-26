import { Route, Routes } from 'react-router-dom'
import { GuestOnly } from './components/GuestOnly'
import { Layout } from './components/layout/Layout'
import { ProfileGuard } from './components/ProfileGuard'
import { RequireSession } from './components/RequireSession'
import { APP_ROUTES } from './config/routes'
import { AlumnoDetallePage } from './pages/AlumnoDetallePage'
import { AlumnosPage } from './pages/AlumnosPage'
import { CuotaDetallePage } from './pages/CuotaDetallePage'
import { CuotasPage } from './pages/CuotasPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { SectionPage } from './pages/SectionPage'
import { ProfesoresPage } from './pages/ProfesoresPage'

// Rutas que tienen su propia pantalla; el resto usa la pantalla provisoria.
const CUSTOM_PATHS = ['/', '/gestion-alumnos', '/gestion-cuotas', '/profesores']

// Login y registro quedan fuera del Layout; el resto de la aplicación pide sesión.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireSession />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route
            path="/gestion-alumnos"
            element={
              <ProfileGuard profiles={['administracion']}>
                <AlumnosPage />
              </ProfileGuard>
            }
          />
          <Route
            path="/gestion-alumnos/:id"
            element={
              <ProfileGuard profiles={['administracion']}>
                <AlumnoDetallePage />
              </ProfileGuard>
            }
          />
          <Route
            path="/gestion-cuotas"
            element={
              <ProfileGuard profiles={['administracion']}>
                <CuotasPage />
              </ProfileGuard>
            }
          />
          <Route
            path="/gestion-cuotas/:id"
            element={
              <ProfileGuard profiles={['administracion']}>
                <CuotaDetallePage />
              </ProfileGuard>
            }
          />
          <Route
            path="/profesores"
            element={
              <ProfileGuard profiles={['administracion']}>
                <ProfesoresPage />
              </ProfileGuard>
            }
          />
          <Route
            path="/profesores/:id"
            element={
              <ProfileGuard profiles={['administracion']}>
                <SectionPage
                  title="Detalle del profesor"
                  description="Información del profesor seleccionado"
                />
              </ProfileGuard>
            }
          />
          {APP_ROUTES.filter((route) => !CUSTOM_PATHS.includes(route.path)).map(
            (route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProfileGuard profiles={route.profiles}>
                    <SectionPage
                      title={route.label}
                      description={route.description}
                    />
                  </ProfileGuard>
                }
              />
            ),
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
