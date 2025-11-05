import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import BusPage from './components/pages/BusPage'
import SbuBusPage from './components/pages/SbuBusPage'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/bus" element={<BusPage />} />
          <Route path="/sbu-bus" element={<SbuBusPage />} />
          <Route path="/" element={<Navigate to="/bus" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App