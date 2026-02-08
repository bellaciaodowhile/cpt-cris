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

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, fechaDesde, fechaHasta, vistaGrafico]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: consultas, error } = await supabase
        .from('consultas')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha_consulta', fechaDesde)
        .lte('fecha_consulta', fechaHasta + 'T23:59:59');

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
        tabla[enf][rango] = { M: 0, F: 0 };
      });
    });

    consultas.forEach(c => {
      if (c.diagnostico && c.rango_edad) {
        ENFERMEDADES_MORBILIDAD.forEach(enf => {
          if (c.diagnostico.toLowerCase().includes(enf.toLowerCase())) {
            if (tabla[enf][c.rango_edad]) {
              tabla[enf][c.rango_edad][c.sexo]++;
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
        '0-19': { M: 0, F: 0 },
        '20+': { M: 0, F: 0 }
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
            tabla[enf][grupo][c.sexo]++;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Enfermedades Crónicas No Transmisibles
        </h2>
        
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
                  <th className="px-4 py-2 text-left font-semibold">Enfermedad</th>
                  <th className="px-4 py-2 text-center font-semibold" colSpan="3">0-19 años</th>
                  <th className="px-4 py-2 text-center font-semibold" colSpan="3">20+ años</th>
                  <th className="px-4 py-2 text-center font-semibold" colSpan="3">TOTAL</th>
                </tr>
                <tr className="bg-gray-50">
                  <th></th>
                  <th className="px-2 py-1 text-xs">M</th>
                  <th className="px-2 py-1 text-xs">F</th>
                  <th className="px-2 py-1 text-xs font-semibold">T</th>
                  <th className="px-2 py-1 text-xs">M</th>
                  <th className="px-2 py-1 text-xs">F</th>
                  <th className="px-2 py-1 text-xs font-semibold">T</th>
                  <th className="px-2 py-1 text-xs">M</th>
                  <th className="px-2 py-1 text-xs">F</th>
                  <th className="px-2 py-1 text-xs font-semibold">T</th>
                </tr>
              </thead>
              <tbody>
                {ENFERMEDADES_CRONICAS.map(enfermedad => {
                  const m_0_19 = tablaCronicas[enfermedad]?.['0-19']?.M || 0;
                  const f_0_19 = tablaCronicas[enfermedad]?.['0-19']?.F || 0;
                  const t_0_19 = m_0_19 + f_0_19;
                  
                  const m_20_plus = tablaCronicas[enfermedad]?.['20+']?.M || 0;
                  const f_20_plus = tablaCronicas[enfermedad]?.['20+']?.F || 0;
                  const t_20_plus = m_20_plus + f_20_plus;
                  
                  const totalM = m_0_19 + m_20_plus;
                  const totalF = f_0_19 + f_20_plus;
                  const totalT = totalM + totalF;

                  return (
                    <tr key={enfermedad} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{enfermedad}</td>
                      <td className="px-2 py-2 text-center">{m_0_19 || '-'}</td>
                      <td className="px-2 py-2 text-center">{f_0_19 || '-'}</td>
                      <td className="px-2 py-2 text-center font-semibold bg-gray-100">{t_0_19 || '-'}</td>
                      <td className="px-2 py-2 text-center">{m_20_plus || '-'}</td>
                      <td className="px-2 py-2 text-center">{f_20_plus || '-'}</td>
                      <td className="px-2 py-2 text-center font-semibold bg-gray-100">{t_20_plus || '-'}</td>
                      <td className="px-2 py-2 text-center font-semibold bg-blue-50">{totalM || '-'}</td>
                      <td className="px-2 py-2 text-center font-semibold bg-pink-50">{totalF || '-'}</td>
                      <td className="px-2 py-2 text-center font-bold bg-purple-50">{totalT || '-'}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                  <td className="px-4 py-2">TOTAL GENERAL</td>
                  {(() => {
                    let grandM_0_19 = 0, grandF_0_19 = 0;
                    let grandM_20_plus = 0, grandF_20_plus = 0;
                    
                    ENFERMEDADES_CRONICAS.forEach(enf => {
                      grandM_0_19 += tablaCronicas[enf]?.['0-19']?.M || 0;
                      grandF_0_19 += tablaCronicas[enf]?.['0-19']?.F || 0;
                      grandM_20_plus += tablaCronicas[enf]?.['20+']?.M || 0;
                      grandF_20_plus += tablaCronicas[enf]?.['20+']?.F || 0;
                    });
                    
                    const grandT_0_19 = grandM_0_19 + grandF_0_19;
                    const grandT_20_plus = grandM_20_plus + grandF_20_plus;
                    const grandTotalM = grandM_0_19 + grandM_20_plus;
                    const grandTotalF = grandF_0_19 + grandF_20_plus;
                    const grandTotalT = grandTotalM + grandTotalF;

                    return (
                      <>
                        <td className="px-2 py-2 text-center bg-blue-100">{grandM_0_19 || '-'}</td>
                        <td className="px-2 py-2 text-center bg-pink-100">{grandF_0_19 || '-'}</td>
                        <td className="px-2 py-2 text-center bg-gray-200">{grandT_0_19 || '-'}</td>
                        <td className="px-2 py-2 text-center bg-blue-100">{grandM_20_plus || '-'}</td>
                        <td className="px-2 py-2 text-center bg-pink-100">{grandF_20_plus || '-'}</td>
                        <td className="px-2 py-2 text-center bg-gray-200">{grandT_20_plus || '-'}</td>
                        <td className="px-2 py-2 text-center bg-blue-200">{grandTotalM || '-'}</td>
                        <td className="px-2 py-2 text-center bg-pink-200">{grandTotalF || '-'}</td>
                        <td className="px-2 py-2 text-center bg-purple-200">{grandTotalT || '-'}</td>
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
        <h2 className="text-xl font-semibold text-secondary mb-4">
          Tabla de Morbilidad (Enfermedad x Edad x Sexo)
        </h2>
        
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
                <th className="px-4 py-2 text-left font-semibold">Enfermedad</th>
                {AGE_RANGES.map(rango => (
                  <th key={rango} className="px-2 py-2 text-center font-semibold" colSpan="3">
                    {rango}
                  </th>
                ))}
                <th className="px-4 py-2 text-center font-semibold" colSpan="3">Total</th>
              </tr>
              <tr className="bg-gray-50">
                <th></th>
                {AGE_RANGES.map(rango => (
                  <>
                    <th key={`${rango}-M`} className="px-2 py-1 text-xs">M</th>
                    <th key={`${rango}-F`} className="px-2 py-1 text-xs">F</th>
                    <th key={`${rango}-T`} className="px-2 py-1 text-xs font-semibold">T</th>
                  </>
                ))}
                <th className="px-2 py-1 text-xs">M</th>
                <th className="px-2 py-1 text-xs">F</th>
                <th className="px-2 py-1 text-xs font-semibold">T</th>
              </tr>
            </thead>
            <tbody>
              {ENFERMEDADES_MORBILIDAD.map(enfermedad => {
                let totalM = 0, totalF = 0;
                return (
                  <tr key={enfermedad} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{enfermedad}</td>
                    {AGE_RANGES.map(rango => {
                      const m = tablaMorbilidad[enfermedad]?.[rango]?.M || 0;
                      const f = tablaMorbilidad[enfermedad]?.[rango]?.F || 0;
                      const total = m + f;
                      totalM += m;
                      totalF += f;
                      return (
                        <>
                          <td key={`${rango}-M`} className="px-2 py-2 text-center">{m || '-'}</td>
                          <td key={`${rango}-F`} className="px-2 py-2 text-center">{f || '-'}</td>
                          <td key={`${rango}-T`} className="px-2 py-2 text-center font-semibold bg-gray-100">{total || '-'}</td>
                        </>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-semibold bg-blue-50">{totalM}</td>
                    <td className="px-2 py-2 text-center font-semibold bg-pink-50">{totalF}</td>
                    <td className="px-2 py-2 text-center font-bold bg-purple-50">{totalM + totalF}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold">
                <td className="px-4 py-2">TOTAL GENERAL</td>
                {AGE_RANGES.map(rango => {
                  let rangoM = 0, rangoF = 0;
                  ENFERMEDADES_MORBILIDAD.forEach(enf => {
                    rangoM += tablaMorbilidad[enf]?.[rango]?.M || 0;
                    rangoF += tablaMorbilidad[enf]?.[rango]?.F || 0;
                  });
                  const rangoTotal = rangoM + rangoF;
                  return (
                    <>
                      <td key={`${rango}-M-total`} className="px-2 py-2 text-center bg-blue-100">{rangoM || '-'}</td>
                      <td key={`${rango}-F-total`} className="px-2 py-2 text-center bg-pink-100">{rangoF || '-'}</td>
                      <td key={`${rango}-T-total`} className="px-2 py-2 text-center bg-gray-200">{rangoTotal || '-'}</td>
                    </>
                  );
                })}
                {(() => {
                  let grandTotalM = 0, grandTotalF = 0;
                  ENFERMEDADES_MORBILIDAD.forEach(enf => {
                    AGE_RANGES.forEach(rango => {
                      grandTotalM += tablaMorbilidad[enf]?.[rango]?.M || 0;
                      grandTotalF += tablaMorbilidad[enf]?.[rango]?.F || 0;
                    });
                  });
                  return (
                    <>
                      <td className="px-2 py-2 text-center bg-blue-200">{grandTotalM}</td>
                      <td className="px-2 py-2 text-center bg-pink-200">{grandTotalF}</td>
                      <td className="px-2 py-2 text-center bg-purple-200">{grandTotalM + grandTotalF}</td>
                    </>
                  );
                })()}
              </tr>
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
