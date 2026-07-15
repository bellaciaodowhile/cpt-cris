import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Users, Stethoscope, LogOut, UserCircle, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/consultas', icon: FileText, label: 'Consultas' },
    { path: '/pacientes', icon: Users, label: 'Pacientes' },
    { path: '/diagnosticos', icon: Tag, label: 'Diagnósticos' },
    { path: '/medicos', icon: Stethoscope, label: 'Médicos' },
    { path: '/dashboard', icon: BarChart3, label: 'Estadísticas' },
    { path: '/perfil', icon: UserCircle, label: 'Perfil' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-secondary overflow-y-auto">
          {/* Logo/Header */}
          <div className="flex items-center flex-shrink-0 px-4 py-6 bg-primary">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Stethoscope className="text-primary" size={24} />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">CPT Sistema</h1>
                <p className="text-xs text-blue-200">Consultorios Populares</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 px-3 py-4 border-t border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6 max-w-7xl pb-20 lg:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navegación inferior móvil (solo en pantallas pequeñas) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
