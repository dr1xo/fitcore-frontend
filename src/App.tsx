import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'
import { SessionProvider } from './context/SessionProvider'

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SessionProvider>
  )
}

export default App
