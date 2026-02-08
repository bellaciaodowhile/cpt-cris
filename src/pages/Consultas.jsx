import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonCard from '../components/SkeletonCard';

export default function Consultas() {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCedula, setSearchCedula] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'Consultorio', 'Terreno'
  const [stats, setStats] = useState({ total: 0, consultorio: 0, terreno: 0 });

  useEffect(() => {
    if (user) {
      loadConsultas();
      loadStats();
    }
  }, [user, searchCedula, fechaDesde, fechaHasta, tipoFiltro]);

  const loadConsultas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('consultas')
        .select(`
          *,
          medicos (nombre, apellido, mpps)
        `)
        .eq('user_id', user.id)
        .order('fecha_consulta', { ascending: false });

      if (searchCedula) {
        query = query.ilike('cedula_paciente', `%${searchCedula}%`);
      }

      if (fechaDesde) {
        query = query.gte('fecha_consulta', fechaDesde);
      }

      if (fechaHasta) {
        query = query.lte('fecha_consulta', fechaHasta);
      }

      if (tipoFiltro !== 'todos') {
        query = query.eq('tipo_consulta', tipoFiltro);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setConsultas(data || []);
    } catch (error) {
      console.error('Error cargando consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      let query = supabase
        .from('consultas')
        .select('tipo_consulta', { count: 'exact' })
        .eq('user_id', user.id);

      if (searchCedula) {
        query = query.ilike('cedula_paciente', `%${searchCedula}%`);
      }

      if (fechaDesde) {
        query = query.gte('fecha_consulta', fechaDesde);
      }

      if (fechaHasta) {
        query = query.lte('fecha_consulta', fechaHasta);
      }

      const { data, error } = await query;

      if (error) throw error;

      const consultorio = data?.filter(c => c.tipo_consulta === 'Consultorio').length || 0;
      const terreno = data?.filter(c => c.tipo_consulta === 'Terreno').length || 0;

      setStats({
        total: data?.length || 0,
        consultorio,
        terreno
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Consultas</h1>
        <Link
          to="/consultas/nueva"
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} />
          Nueva
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="font-semibold text-secondary mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search size={16} className="inline mr-1" />
              Buscar por Cédula
            </label>
            <input
              type="text"
              value={searchCedula}
              onChange={(e) => setSearchCedula(e.target.value)}
              placeholder="Ej: 12345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Consultas</p>
              <p className="text-2xl font-bold text-secondary">{stats.total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Consultorio</p>
              <p className="text-2xl font-bold text-blue-600">{stats.consultorio}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terreno</p>
              <p className="text-2xl font-bold text-green-600">{stats.terreno}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de consultas */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : consultas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron consultas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultas.map((consulta) => (
            <div
              key={consulta.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  {format(new Date(consulta.fecha_consulta), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
