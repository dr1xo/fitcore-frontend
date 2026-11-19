import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProfileGuard } from './components/ProfileGuard'
import { APP_ROUTES } from './config/routes'
import { ProfileProvider } from './context/ProfileProvider'
import { AlumnoDetallePage } from './pages/AlumnoDetallePage'
import { AlumnosPage } from './pages/AlumnosPage'
import { CuotaDetallePage } from './pages/CuotaDetallePage'
import { CuotasPage } from './pages/CuotasPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SectionPage } from './pages/SectionPage'

// Rutas que tienen su propia pantalla; el resto usa la pantalla provisoria.
const CUSTOM_PATHS = ['/', '/gestion-alumnos', '/gestion-cuotas']

function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
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
            {APP_ROUTES.filter(
              (route) => !CUSTOM_PATHS.includes(route.path),
            ).map((route) => (
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
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  )
}

export default App