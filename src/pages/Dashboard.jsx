import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';
import { ENFERMEDADES_PREDETERMINADAS, ENFERMEDADES_CRONICAS, ENFERMEDADES_MORBILIDAD } from '../utils/consultaUtils';
import { AGE_RANGES } from '../utils/ageRanges';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [fechaHasta, setFechaHasta] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [vistaGrafico, setVistaGrafico] = useState('dia'); // dia, semana, mes
  
  const [dataPacientes, setDataPacientes] = useState([]);
  const [dataEnfermedades, setDataEnfermedades] = useState([]);
  const [tablaMorbilidad, setTablaMorbilidad] = useState([]);
  const [tablaCronicas, setTablaCronicas] = useState([]);
  const [vistaCronicas, setVistaCronicas] = useState('tabla'); // 'tabla' o 'grafico'
  const [vistaMorbilidad, setVistaMorbilidad] = useState('tabla'); // 'tabla' o 'grafico'
  const [tipoConsultaFiltro, setTipoConsultaFiltro] = useState('todos'); // 'todos', 'Consultorio', 'Terreno'

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, fechaDesde, fechaHasta, vistaGrafico, tipoConsultaFiltro]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('consultas')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha_consulta', fechaDesde)
        .lte('fecha_consulta', fechaHasta + 'T23:59:59');

      // Aplicar filtro de tipo de consulta si no es "todos"
      if (tipoConsultaFiltro !== 'todos') {
        query = query.eq('tipo_consulta', tipoConsultaFiltro);
      }

      const { data: consultas, error } = await query;

      if (error) throw error;

      // Procesar datos para gráficos
      procesarDatosPacientes(consultas);
      procesarDatosEnfermedades(consultas);
      procesarTablaMorbilidad(consultas);
      procesarTablaCronicas(consultas);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const procesarDatosPacientes = (consultas) => {
    const agrupado = {};

    if (vistaGrafico === 'dia') {
      const dias = eachDayOfInterval({ start: new Date(fechaDesde), end: new Date(fechaHasta) });
      dias.forEach(dia => {
        const key = format(dia, 'dd/MM');
        agrupado[key] = 0;
      });

      consultas.forEach(c => {
        const key = format(new Date(c.fecha_consulta), 'dd/MM');
        if (agrupado[key] !== undefined) agrupado[key]++;
      });
    } else if (vistaGrafico === 'semana') {
      const semanas = eachWeekOfInterval({ start: new Date(fechaDesde), end: new Date(fechaHasta) });
      semanas.forEach(semana => {
        const key = `Sem ${format(semana, 'w', { locale: es })}`;
        agrupado[key] = 0;
      });

      consultas.forEach(c => {
        const key = `Sem ${format(new Date(c.fecha_consulta), 'w', { locale: es })}`;
        agrupado[key] = (agrupado[key] || 0) + 1;
      });
    } else {
      const meses = eachMonthOfInterval({ start: new Date(fechaDesde), end: new Date(fechaHasta) });
      meses.forEach(mes => {
        const key = format(mes, 'MMM', { locale: es });
        agrupado[key] = 0;
      });

      consultas.forEach(c => {
        const key = format(new Date(c.fecha_consulta), 'MMM', { locale: es });
        if (agrupado[key] !== undefined) agrupado[key]++;
      });
    }

    const data = Object.entries(agrupado).map(([periodo, cantidad]) => ({
      periodo,
      pacientes: cantidad
    }));

    setDataPacientes(data);
  };

  const procesarDatosEnfermedades = (consultas) => {
    const conteo = {};
    ENFERMEDADES_PREDETERMINADAS.forEach(enf => {
      conteo[enf] = 0;
    });

    consultas.forEach(c => {
      if (c.diagnostico) {
        ENFERMEDADES_PREDETERMINADAS.forEach(enf => {
          if (c.diagnostico.includes(enf)) {
            conteo[enf]++;
          }
        });
      }
    });

    const data = Object.entries(conteo).map(([enfermedad, cantidad]) => ({
      enfermedad,
      casos: cantidad
    }));

    setDataEnfermedades(data);
  };

  const procesarTablaMorbilidad = (consultas) => {
    const tabla = {};

    ENFERMEDADES_MORBILIDAD.forEach(enf => {
      tabla[enf] = {};
      AGE_RANGES.forEach(rango => {
        tabla[enf][rango] = { 
          Consultorio: { M: 0, F: 0 },
          Terreno: { M: 0, F: 0 }
        };
      });
    });

    consultas.forEach(c => {
      if (c.diagnostico && c.rango_edad) {
        ENFERMEDADES_MORBILIDAD.forEach(enf => {
          if (c.diagnostico.toLowerCase().includes(enf.toLowerCase())) {
            if (tabla[enf][c.rango_edad]) {
              if (c.tipo_consulta === 'Consultorio') {
                tabla[enf][c.rango_edad].Consultorio[c.sexo]++;
              } else if (c.tipo_consulta === 'Terreno') {
                tabla[enf][c.rango_edad].Terreno[c.sexo]++;
              }
            }
          }
        });
      }
    });

    setTablaMorbilidad(tabla);
  };

  const procesarTablaCronicas = (consultas) => {
    const tabla = {};

    ENFERMEDADES_CRONICAS.forEach(enf => {
      tabla[enf] = {
        '0-19': { 
          Consultorio: { M: 0, F: 0 },
          Terreno: { M: 0, F: 0 }
        },
        '20+': { 
          Consultorio: { M: 0, F: 0 },
          Terreno: { M: 0, F: 0 }
        }
      };
    });

    consultas.forEach(c => {
      if (c.diagnostico && c.rango_edad) {
        ENFERMEDADES_CRONICAS.forEach(enf => {
          if (c.diagnostico.toLowerCase().includes(enf.toLowerCase())) {
            // Calcular edad para determinar el grupo
            const fechaNac = new Date(c.fecha_nacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNac.getFullYear();
            const mes = hoy.getMonth() - fechaNac.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
              edad--;
            }

            const grupo = edad < 20 ? '0-19' : '20+';
            
            if (c.tipo_consulta === 'Consultorio') {
              tabla[enf][grupo].Consultorio[c.sexo]++;
            } else if (c.tipo_consulta === 'Terreno') {
              tabla[enf][grupo].Terreno[c.sexo]++;
            }
          }
        });
      }
    });

    setTablaCronicas(tabla);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">Estadísticas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="font-semibold text-secondary mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Vista
            </label>
            <select
              value={vistaGrafico}
              onChange={(e) => setVistaGrafico(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="dia">Por Día</option>
              <option value="semana">Por Semana</option>
              <option value="mes">Por Mes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta
            </label>
            <select
              value={tipoConsultaFiltro}
              onChange={(e) => setTipoConsultaFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Terreno">Terreno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gráfico de Pacientes */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Pacientes Atendidos
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataPacientes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pacientes" fill="#3C50E0" name="Pacientes" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Enfermedades */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Incidencia de Enfermedades
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataEnfermedades}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="enfermedad" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="casos" fill="#10B981" name="Casos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de Enfermedades Crónicas No Transmisibles */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            Enfermedades Crónicas No Transmisibles
            {tipoConsultaFiltro !== 'todos' && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({tipoConsultaFiltro})
              </span>
            )}
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setVistaCronicas('tabla')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaCronicas === 'tabla'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setVistaCronicas('grafico')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaCronicas === 'grafico'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gráfico
            </button>
          </div>
        </div>

        {vistaCronicas === 'tabla' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold" rowSpan="3">Enfermedad</th>
                  <th className="px-4 py-2 text-center font-semibold border-l border-gray-300" colSpan="6">0-19 años</th>
                  <th className="px-4 py-2 text-center font-semibold border-l border-gray-300" colSpan="6">20+ años</th>
                  <th className="px-4 py-2 text-center font-semibold border-l-2 border-gray-400" colSpan="6">TOTAL</th>
                </tr>
                <tr>
                  <th className="px-1 py-1 text-xs border-l border-gray-300" colSpan="2">Cons</th>
                  <th className="px-1 py-1 text-xs" colSpan="2">Terr</th>
                  <th className="px-1 py-1 text-xs bg-gray-50" colSpan="2">Tot</th>
                  <th className="px-1 py-1 text-xs border-l border-gray-300" colSpan="2">Cons</th>
                  <th className="px-1 py-1 text-xs" colSpan="2">Terr</th>
                  <th className="px-1 py-1 text-xs bg-gray-50" colSpan="2">Tot</th>
                  <th className="px-1 py-1 text-xs border-l-2 border-gray-400" colSpan="2">Cons</th>
                  <th className="px-1 py-1 text-xs" colSpan="2">Terr</th>
                  <th className="px-1 py-1 text-xs bg-gray-50" colSpan="2">Tot</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-1 py-1 text-xs border-l border-gray-300">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-blue-50">M</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-pink-50">F</th>
                  <th className="px-1 py-1 text-xs border-l border-gray-300">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-blue-50">M</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-pink-50">F</th>
                  <th className="px-1 py-1 text-xs border-l-2 border-gray-400">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs">M</th>
                  <th className="px-1 py-1 text-xs">F</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-blue-100">M</th>
                  <th className="px-1 py-1 text-xs font-semibold bg-pink-100">F</th>
                </tr>
              </thead>
              <tbody>
                {ENFERMEDADES_CRONICAS.map(enfermedad => {
                  const cons_m_0_19 = tablaCronicas[enfermedad]?.['0-19']?.Consultorio?.M || 0;
                  const cons_f_0_19 = tablaCronicas[enfermedad]?.['0-19']?.Consultorio?.F || 0;
                  const terr_m_0_19 = tablaCronicas[enfermedad]?.['0-19']?.Terreno?.M || 0;
                  const terr_f_0_19 = tablaCronicas[enfermedad]?.['0-19']?.Terreno?.F || 0;
                  const m_0_19 = cons_m_0_19 + terr_m_0_19;
                  const f_0_19 = cons_f_0_19 + terr_f_0_19;
                  
                  const cons_m_20_plus = tablaCronicas[enfermedad]?.['20+']?.Consultorio?.M || 0;
                  const cons_f_20_plus = tablaCronicas[enfermedad]?.['20+']?.Consultorio?.F || 0;
                  const terr_m_20_plus = tablaCronicas[enfermedad]?.['20+']?.Terreno?.M || 0;
                  const terr_f_20_plus = tablaCronicas[enfermedad]?.['20+']?.Terreno?.F || 0;
                  const m_20_plus = cons_m_20_plus + terr_m_20_plus;
                  const f_20_plus = cons_f_20_plus + terr_f_20_plus;
                  
                  const totalConsM = cons_m_0_19 + cons_m_20_plus;
                  const totalConsF = cons_f_0_19 + cons_f_20_plus;
                  const totalTerrM = terr_m_0_19 + terr_m_20_plus;
                  const totalTerrF = terr_f_0_19 + terr_f_20_plus;
                  const totalM = m_0_19 + m_20_plus;
                  const totalF = f_0_19 + f_20_plus;

                  return (
                    <tr key={enfermedad} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{enfermedad}</td>
                      <td className="px-1 py-2 text-center text-xs border-l border-gray-300">{cons_m_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{cons_f_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{terr_m_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{terr_f_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs font-semibold bg-blue-50">{m_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs font-semibold bg-pink-50">{f_0_19 || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs border-l border-gray-300">{cons_m_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{cons_f_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{terr_m_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{terr_f_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs font-semibold bg-blue-50">{m_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs font-semibold bg-pink-50">{f_20_plus || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs border-l-2 border-gray-400">{totalConsM || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{totalConsF || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{totalTerrM || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs">{totalTerrF || '-'}</td>
                      <td className="px-1 py-2 text-center text-xs font-bold bg-blue-100">{totalM}</td>
                      <td className="px-1 py-2 text-center text-xs font-bold bg-pink-100">{totalF}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                  <td className="px-4 py-2">TOTAL GENERAL</td>
                  {(() => {
                    let grandConsM_0_19 = 0, grandConsF_0_19 = 0;
                    let grandTerrM_0_19 = 0, grandTerrF_0_19 = 0;
                    let grandConsM_20_plus = 0, grandConsF_20_plus = 0;
                    let grandTerrM_20_plus = 0, grandTerrF_20_plus = 0;
                    
                    ENFERMEDADES_CRONICAS.forEach(enf => {
                      grandConsM_0_19 += tablaCronicas[enf]?.['0-19']?.Consultorio?.M || 0;
                      grandConsF_0_19 += tablaCronicas[enf]?.['0-19']?.Consultorio?.F || 0;
                      grandTerrM_0_19 += tablaCronicas[enf]?.['0-19']?.Terreno?.M || 0;
                      grandTerrF_0_19 += tablaCronicas[enf]?.['0-19']?.Terreno?.F || 0;
                      grandConsM_20_plus += tablaCronicas[enf]?.['20+']?.Consultorio?.M || 0;
                      grandConsF_20_plus += tablaCronicas[enf]?.['20+']?.Consultorio?.F || 0;
                      grandTerrM_20_plus += tablaCronicas[enf]?.['20+']?.Terreno?.M || 0;
                      grandTerrF_20_plus += tablaCronicas[enf]?.['20+']?.Terreno?.F || 0;
                    });
                    
                    const grandM_0_19 = grandConsM_0_19 + grandTerrM_0_19;
                    const grandF_0_19 = grandConsF_0_19 + grandTerrF_0_19;
                    const grandM_20_plus = grandConsM_20_plus + grandTerrM_20_plus;
                    const grandF_20_plus = grandConsF_20_plus + grandTerrF_20_plus;
                    const grandTotalConsM = grandConsM_0_19 + grandConsM_20_plus;
                    const grandTotalConsF = grandConsF_0_19 + grandConsF_20_plus;
                    const grandTotalTerrM = grandTerrM_0_19 + grandTerrM_20_plus;
                    const grandTotalTerrF = grandTerrF_0_19 + grandTerrF_20_plus;
                    const grandTotalM = grandM_0_19 + grandM_20_plus;
                    const grandTotalF = grandF_0_19 + grandF_20_plus;

                    return (
                      <>
                        <td className="px-1 py-2 text-center text-xs border-l border-gray-300">{grandConsM_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandConsF_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTerrM_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTerrF_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-blue-100">{grandM_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-pink-100">{grandF_0_19 || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs border-l border-gray-300">{grandConsM_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandConsF_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTerrM_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTerrF_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-blue-100">{grandM_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-pink-100">{grandF_20_plus || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs border-l-2 border-gray-400">{grandTotalConsM || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTotalConsF || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTotalTerrM || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs">{grandTotalTerrF || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-blue-200">{grandTotalM || '-'}</td>
                        <td className="px-1 py-2 text-center text-xs bg-pink-200">{grandTotalF || '-'}</td>
                      </>
                    );
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={ENFERMEDADES_CRONICAS.map(enf => ({
                enfermedad: enf.length > 20 ? enf.substring(0, 20) + '...' : enf,
                '0-19': (tablaCronicas[enf]?.['0-19']?.M || 0) + (tablaCronicas[enf]?.['0-19']?.F || 0),
                '20+': (tablaCronicas[enf]?.['20+']?.M || 0) + (tablaCronicas[enf]?.['20+']?.F || 0),
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="enfermedad" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="0-19" fill="#3B82F6" name="0-19 años" />
              <Bar dataKey="20+" fill="#10B981" name="20+ años" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabla de Morbilidad */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            Tabla de Morbilidad (Enfermedad x Edad x Sexo)
            {tipoConsultaFiltro !== 'todos' && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({tipoConsultaFiltro})
              </span>
            )}
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setVistaMorbilidad('tabla')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaMorbilidad === 'tabla'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setVistaMorbilidad('grafico')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                vistaMorbilidad === 'grafico'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gráfico
            </button>
          </div>
        </div>

        {vistaMorbilidad === 'tabla' ? (
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold" rowSpan="3">Enfermedad</th>
                {AGE_RANGES.map(rango => (
                  <th key={rango} className="px-2 py-2 text-center font-semibold border-l border-gray-300" colSpan="6">
                    {rango}
                  </th>
                ))}
                <th className="px-4 py-2 text-center font-semibold border-l-2 border-gray-400" colSpan="6">Total</th>
              </tr>
              <tr>
                {AGE_RANGES.map(rango => (
                  <>
                    <th key={`${rango}-cons`} className="px-1 py-1 text-xs border-l border-gray-300" colSpan="2">Cons</th>
                    <th key={`${rango}-terr`} className="px-1 py-1 text-xs" colSpan="2">Terr</th>
                    <th key={`${rango}-tot`} className="px-1 py-1 text-xs bg-gray-50" colSpan="2">Tot</th>
                  </>
                ))}
                <th className="px-1 py-1 text-xs border-l-2 border-gray-400" colSpan="2">Cons</th>
                <th className="px-1 py-1 text-xs" colSpan="2">Terr</th>
                <th className="px-1 py-1 text-xs bg-gray-50" colSpan="2">Tot</th>
              </tr>
              <tr className="bg-gray-50">
                {AGE_RANGES.map(rango => (
                  <>
                    <th key={`${rango}-cons-M`} className="px-1 py-1 text-xs border-l border-gray-300">M</th>
                    <th key={`${rango}-cons-F`} className="px-1 py-1 text-xs">F</th>
                    <th key={`${rango}-terr-M`} className="px-1 py-1 text-xs">M</th>
                    <th key={`${rango}-terr-F`} className="px-1 py-1 text-xs">F</th>
                    <th key={`${rango}-tot-M`} className="px-1 py-1 text-xs font-semibold bg-blue-50">M</th>
                    <th key={`${rango}-tot-F`} className="px-1 py-1 text-xs font-semibold bg-pink-50">F</th>
                  </>
                ))}
                <th className="px-1 py-1 text-xs border-l-2 border-gray-400">M</th>
                <th className="px-1 py-1 text-xs">F</th>
                <th className="px-1 py-1 text-xs">M</th>
                <th className="px-1 py-1 text-xs">F</th>
                <th className="px-1 py-1 text-xs font-semibold bg-blue-100">M</th>
                <th className="px-1 py-1 text-xs font-semibold bg-pink-100">F</th>
              </tr>
            </thead>
            <tbody>
              {ENFERMEDADES_MORBILIDAD.map(enfermedad => {
                let totalM = 0, totalF = 0;
                let totalConsM = 0, totalConsF = 0;
                let totalTerrM = 0, totalTerrF = 0;
                
                return (
                  <tr key={enfermedad} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium sticky left-0 bg-white">{enfermedad}</td>
                    {AGE_RANGES.map(rango => {
                      const consM = tablaMorbilidad[enfermedad]?.[rango]?.Consultorio?.M || 0;
                      const consF = tablaMorbilidad[enfermedad]?.[rango]?.Consultorio?.F || 0;
                      const terrM = tablaMorbilidad[enfermedad]?.[rango]?.Terreno?.M || 0;
                      const terrF = tablaMorbilidad[enfermedad]?.[rango]?.Terreno?.F || 0;
                      const m = consM + terrM;
                      const f = consF + terrF;
                      
                      totalM += m;
                      totalF += f;
                      totalConsM += consM;
                      totalConsF += consF;
                      totalTerrM += terrM;
                      totalTerrF += terrF;
                      
                      return (
                        <>
                          <td key={`${rango}-cons-M`} className="px-1 py-2 text-center text-xs border-l border-gray-300">{consM || '-'}</td>
                          <td key={`${rango}-cons-F`} className="px-1 py-2 text-center text-xs">{consF || '-'}</td>
                          <td key={`${rango}-terr-M`} className="px-1 py-2 text-center text-xs">{terrM || '-'}</td>
                          <td key={`${rango}-terr-F`} className="px-1 py-2 text-center text-xs">{terrF || '-'}</td>
                          <td key={`${rango}-tot-M`} className="px-1 py-2 text-center text-xs font-semibold bg-blue-50">{m || '-'}</td>
                          <td key={`${rango}-tot-F`} className="px-1 py-2 text-center text-xs font-semibold bg-pink-50">{f || '-'}</td>
                        </>
                      );
                    })}
                    <td className="px-1 py-2 text-center text-xs border-l-2 border-gray-400">{totalConsM || '-'}</td>
                    <td className="px-1 py-2 text-center text-xs">{totalConsF || '-'}</td>
                    <td className="px-1 py-2 text-center text-xs">{totalTerrM || '-'}</td>
                    <td className="px-1 py-2 text-center text-xs">{totalTerrF || '-'}</td>
                    <td className="px-1 py-2 text-center text-xs font-bold bg-blue-100">{totalM}</td>
                    <td className="px-1 py-2 text-center text-xs font-bold bg-pink-100">{totalF}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={ENFERMEDADES_MORBILIDAD.map(enf => {
                const data = { enfermedad: enf };
                AGE_RANGES.forEach(rango => {
                  const m = tablaMorbilidad[enf]?.[rango]?.M || 0;
                  const f = tablaMorbilidad[enf]?.[rango]?.F || 0;
                  data[rango] = m + f;
                });
                return data;
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="enfermedad" 
                angle={-45} 
                textAnchor="end" 
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                layout="horizontal"
                verticalAlign="top"
              />
              {AGE_RANGES.slice(0, 6).map((rango, index) => (
                <Bar 
                  key={rango} 
                  dataKey={rango} 
                  fill={`hsl(${index * 60}, 70%, 50%)`} 
                  name={rango}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
