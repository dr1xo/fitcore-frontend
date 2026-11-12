import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProfileGuard } from './components/ProfileGuard'
import { APP_ROUTES } from './config/routes'
import { ProfileProvider } from './context/ProfileProvider'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SectionPage } from './pages/SectionPage'

function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            {APP_ROUTES.filter((route) => route.path !== '/').map((route) => (
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