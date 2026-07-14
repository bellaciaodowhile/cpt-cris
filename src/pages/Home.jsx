import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileText, BarChart3, Users, Activity, Search, MapPin, Building2, Stethoscope } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCedula, setSearchCedula] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { count: consultasHoy } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('fecha_consulta', today);

      const { count: consultorioHoy } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('tipo_consulta', 'Consultorio')
        .gte('fecha_consulta', today);

      const { count: terrenoHoy } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('tipo_consulta', 'Terreno')
        .gte('fecha_consulta', today);

      const { count: totalConsultas } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: totalConsultorio } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('tipo_consulta', 'Consultorio');

      const { count: totalTerreno } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('tipo_consulta', 'Terreno');

      const { count: totalMedicos } = await supabase
        .from('medicos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: totalPacientes } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        consultasHoy: consultasHoy || 0,
        consultorioHoy: consultorioHoy || 0,
        terrenoHoy: terrenoHoy || 0,
        totalConsultas: totalConsultas || 0,
        totalConsultorio: totalConsultorio || 0,
        totalTerreno: totalTerreno || 0,
        totalMedicos: totalMedicos || 0,
        totalPacientes: totalPacientes || 0,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCedula.trim()) return;

    setSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          *,
          medicos (nombre, apellido, mpps)
        `)
        .eq('user_id', user.id)
        .ilike('cedula_paciente', `%${searchCedula}%`)
        .order('fecha_consulta', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error buscando paciente:', error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchCedula('');
    setSearchResults([]);
    setHasSearched(false);
  };

  if (loading) return <LoadingSpinner />;

  const cards = [
    {
      title: 'Consultas Hoy',
      value: stats?.consultasHoy || 0,
      icon: Activity,
      color: 'bg-blue-500',
      link: '/consultas',
    },
    {
      title: 'Total Consultas',
      value: stats?.totalConsultas || 0,
      icon: FileText,
      color: 'bg-green-500',
      link: '/consultas',
    },
    {
      title: 'Pacientes',
      value: stats?.totalPacientes || 0,
      icon: Users,
      color: 'bg-purple-500',
      link: '/pacientes',
    },
    {
      title: 'Médicos',
      value: stats?.totalMedicos || 0,
      icon: Stethoscope,
      color: 'bg-orange-500',
      link: '/medicos',
    },
    {
      title: 'Estadísticas',
      value: 'Ver',
      icon: BarChart3,
      color: 'bg-indigo-500',
      link: '/dashboard',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">
        Sistema CPT
      </h1>

      {/* Buscador Rápido */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Búsqueda Rápida de Paciente
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchCedula}
              onChange={(e) => setSearchCedula(e.target.value)}
              placeholder="Buscar por cédula del paciente..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
          {searchResults.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          )}
        </form>

        {/* Resultados de búsqueda */}
        {hasSearched && searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              {searchResults.length} resultado(s) encontrado(s):
            </p>
            {searchResults.map((consulta) => (
              <div
                key={consulta.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/consultas')}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-secondary">
                        {consulta.nombres} {consulta.apellidos}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        consulta.tipo_consulta === 'Consultorio'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {consulta.tipo_consulta}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cédula: {consulta.cedula_paciente} | Sexo: {consulta.sexo} | Edad: {consulta.rango_edad}
                    </p>
                    <p className="text-sm text-gray-600">
                      Diagnóstico: {consulta.diagnostico}
                    </p>
                    {consulta.medicos && (
                      <p className="text-sm text-gray-600">
                        Médico: {consulta.medicos.nombre} {consulta.medicos.apellido}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(consulta.fecha_consulta).toLocaleDateString('es-VE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasSearched && searchResults.length === 0 && !searching && (
          <div className="mt-4 text-center text-gray-500">
            No se encontraron consultas para esta cédula
          </div>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-secondary mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Estadísticas de Consultorio vs Terreno con Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Consultorio */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">Consultorio</h3>
              <p className="text-sm text-gray-600">07:00 - 12:00</p>
            </div>
          </div>
          
          {/* Progreso del día */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Meta Diaria: 10 consultas</span>
              <span className="text-sm font-semibold text-blue-600">
                {stats?.consultorioHoy || 0} / 10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  (stats?.consultorioHoy || 0) >= 10 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(((stats?.consultorioHoy || 0) / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-center">
              {(stats?.consultorioHoy || 0) >= 10 ? (
                <span className="text-sm font-semibold text-green-600">
                  ✓ Meta alcanzada
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  Faltan {10 - (stats?.consultorioHoy || 0)} consultas
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hoy:</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.consultorioHoy || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-xl font-semibold text-secondary">
                {stats?.totalConsultorio || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Terreno */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <MapPin className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">Terreno</h3>
              <p className="text-sm text-gray-600">13:00 - 16:00</p>
            </div>
          </div>
          
          {/* Progreso del día */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Meta Diaria: 55 consultas</span>
              <span className="text-sm font-semibold text-green-600">
                {stats?.terrenoHoy || 0} / 55
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  (stats?.terrenoHoy || 0) >= 55 ? 'bg-green-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(((stats?.terrenoHoy || 0) / 55) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 text-center">
              {(stats?.terrenoHoy || 0) >= 55 ? (
                <span className="text-sm font-semibold text-green-600">
                  ✓ Meta alcanzada
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  Faltan {55 - (stats?.terrenoHoy || 0)} consultas
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hoy:</span>
              <span className="text-2xl font-bold text-green-600">
                {stats?.terrenoHoy || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-xl font-semibold text-secondary">
                {stats?.totalTerreno || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Meta Total */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-md p-6 mb-8 text-white">
        <h3 className="text-xl font-bold mb-4">Meta Total del Día: 65 consultas</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg">Progreso Total:</span>
            <span className="text-2xl font-bold">
              {(stats?.consultorioHoy || 0) + (stats?.terrenoHoy || 0)} / 65
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all"
              style={{ 
                width: `${Math.min((((stats?.consultorioHoy || 0) + (stats?.terrenoHoy || 0)) / 65) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-center text-lg">
            {((stats?.consultorioHoy || 0) + (stats?.terrenoHoy || 0)) >= 65 ? (
              <span className="font-bold">
                🎉 ¡Felicidades! Meta del día alcanzada
              </span>
            ) : (
              <span>
                Faltan {65 - ((stats?.consultorioHoy || 0) + (stats?.terrenoHoy || 0))} consultas para alcanzar la meta
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-secondary mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/consultas/nueva?modo=existente"
            className="bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center flex flex-col items-center gap-2"
          >
            <Users size={28} />
            <span className="text-lg">Re-consulta</span>
            <span className="text-sm opacity-90">Paciente Existente</span>
          </Link>
          <Link
            to="/consultas/nueva?modo=nuevo"
            className="bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors text-center flex flex-col items-center gap-2"
          >
            <FileText size={28} />
            <span className="text-lg">Nueva Consulta</span>
            <span className="text-sm opacity-90">Nuevo Paciente</span>
          </Link>
          <Link
            to="/dashboard"
            className="bg-secondary text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-center md:col-span-2"
          >
            Ver Reportes
          </Link>
        </div>
      </div>
    </div>
  );
}
