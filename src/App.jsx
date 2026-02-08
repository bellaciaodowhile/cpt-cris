import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Consultas from './pages/Consultas';
import NuevaConsulta from './pages/NuevaConsulta';
import Dashboard from './pages/Dashboard';
import Medicos from './pages/Medicos';
import Pacientes from './pages/Pacientes';
import Perfil from './pages/Perfil';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="consultas" element={<Consultas />} />
            <Route path="consultas/nueva" element={<NuevaConsulta />} />
            <Route path="pacientes" element={<Pacientes />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="medicos" element={<Medicos />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
