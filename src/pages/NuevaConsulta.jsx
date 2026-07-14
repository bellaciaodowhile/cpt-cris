import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getAgeRange } from '../utils/ageRanges';
import { clasificarTipoConsulta, ENFERMEDADES_PREDETERMINADAS } from '../utils/consultaUtils';
import { ArrowLeft, Save, Loader2, Search, User } from 'lucide-react';
import { format } from 'date-fns';

export default function NuevaConsulta() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [error, setError] = useState('');
  
  // Detectar el modo desde la URL
  const modoInicial = searchParams.get('modo') === 'nuevo' ? 'nuevo' : 'existente';
  const [modoRegistro, setModoRegistro] = useState(modoInicial); // 'existente' o 'nuevo'

  const [formData, setFormData] = useState({
    paciente_id: '',
    nombres: '',
    apellidos: '',
    cedula_paciente: '',
    sexo: 'M',
    nacionalidad: 'V',
    etnia: '',
    discapacidad: 'No',
    fecha_nacimiento: '',
    fecha_consulta: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    medico_id: '',
    enfermedades: [],
    diagnostico_adicional: '',
    tipo_paciente: 'Consultorio', // Agregamos el campo tipo_paciente
  });

  const [rangoEdad, setRangoEdad] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState('Consultorio');
  const [searchPaciente, setSearchPaciente] = useState('');
  const [edadCalculada, setEdadCalculada] = useState(null);

  useEffect(() => {
    if (user) {
      loadMedicos();
      loadPacientes();
    }
  }, [user]);

  useEffect(() => {
    if (formData.fecha_nacimiento) {
      const rango = getAgeRange(formData.fecha_nacimiento);
      setRangoEdad(rango);
      
      // Calcular edad
      const hoy = new Date();
      const nacimiento = new Date(formData.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      setEdadCalculada(edad);
    } else {
      setRangoEdad('');
      setEdadCalculada(null);
    }
  }, [formData.fecha_nacimiento]);

  useEffect(() => {
    if (formData.fecha_consulta) {
      if (modoRegistro === 'nuevo') {
        // Para pacientes nuevos, usar el tipo seleccionado manualmente
        setTipoConsulta(formData.tipo_paciente);
      } else {
        // Para pacientes existentes, usar la clasificación automática por hora
        const tipo = clasificarTipoConsulta(formData.fecha_consulta);
        setTipoConsulta(tipo);
      }
    }
  }, [formData.fecha_consulta, formData.tipo_paciente, modoRegistro]);

  const loadMedicos = async () => {
    const { data } = await supabase
      .from('medicos')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre');
    setMedicos(data || []);
  };

  const loadPacientes = async () => {
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .eq('user_id', user.id)
      .order('apellidos');
    setPacientes(data || []);
  };

  const handlePacienteSelect = (e) => {
    const pacienteId = e.target.value;
    setFormData(prev => ({ ...prev, paciente_id: pacienteId }));

    if (pacienteId) {
      const paciente = pacientes.find(p => p.id === pacienteId);
      if (paciente) {
        setFormData(prev => ({
          ...prev,
          paciente_id: pacienteId,
          nombres: paciente.nombres,
          apellidos: paciente.apellidos,
          cedula_paciente: paciente.cedula,
          nacionalidad: paciente.nacionalidad,
          sexo: paciente.sexo,
          fecha_nacimiento: paciente.fecha_nacimiento,
          etnia: paciente.etnia || '',
          discapacidad: paciente.discapacidad,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        paciente_id: '',
        nombres: '',
        apellidos: '',
        cedula_paciente: '',
        nacionalidad: 'V',
        sexo: 'M',
        fecha_nacimiento: '',
        etnia: '',
        discapacidad: 'No',
      }));
    }
  };

  const handlePacienteClick = (paciente) => {
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      cedula_paciente: paciente.cedula,
      nacionalidad: paciente.nacionalidad,
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
      etnia: paciente.etnia || '',
      discapacidad: paciente.discapacidad,
    }));
    setSearchPaciente('');
  };

  const filteredPacientes = pacientes.filter(p => {
    const searchLower = searchPaciente.toLowerCase();
    return (
      p.nombres.toLowerCase().includes(searchLower) ||
      p.apellidos.toLowerCase().includes(searchLower) ||
      p.cedula.includes(searchPaciente)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEnfermedadToggle = (enfermedad) => {
    setFormData(prev => ({
      ...prev,
      enfermedades: prev.enfermedades.includes(enfermedad)
        ? prev.enfermedades.filter(e => e !== enfermedad)
        : [...prev.enfermedades, enfermedad]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const diagnosticoCompleto = [
        ...formData.enfermedades,
        formData.diagnostico_adicional
      ].filter(Boolean).join(', ');

      // Si es un paciente nuevo, primero lo registramos
      let pacienteId = formData.paciente_id;
      
      if (modoRegistro === 'nuevo' && !formData.paciente_id) {
        const { data: nuevoPaciente, error: pacienteError } = await supabase
          .from('pacientes')
          .insert({
            user_id: user.id,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            cedula: formData.cedula_paciente,
            nacionalidad: formData.nacionalidad,
            sexo: formData.sexo,
            fecha_nacimiento: formData.fecha_nacimiento,
            etnia: formData.etnia,
            discapacidad: formData.discapacidad,
          })
          .select()
          .single();

        if (pacienteError) throw pacienteError;
        pacienteId = nuevoPaciente.id;
      }

      const { error: insertError } = await supabase
        .from('consultas')
        .insert({
          user_id: user.id,
          paciente_id: pacienteId,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          cedula_paciente: formData.cedula_paciente,
          sexo: formData.sexo,
          nacionalidad: formData.nacionalidad,
          etnia: formData.etnia,
          discapacidad: formData.discapacidad,
          fecha_nacimiento: formData.fecha_nacimiento,
          rango_edad: rangoEdad,
          fecha_consulta: formData.fecha_consulta,
          tipo_consulta: tipoConsulta,
          medico_id: formData.medico_id || null,
          diagnostico: diagnosticoCompleto,
        });

      if (insertError) throw insertError;

      navigate('/consultas');
    } catch (err) {
      console.error('Error guardando consulta:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/consultas')}
          className="text-gray-600 hover:text-primary"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-secondary">Nueva Consulta</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {medicos.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          ⚠️ No hay médicos registrados. Por favor, registra al menos un médico antes de crear consultas.
          <Link to="/medicos" className="ml-2 underline font-semibold">
            Ir a Médicos
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Datos del Paciente */}
        <div>
          <h2 className="text-xl font-semibold text-secondary mb-4">Datos del Paciente</h2>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setModoRegistro('existente');
                  setFormData(prev => ({
                    ...prev,
                    paciente_id: '',
                    nombres: '',
                    apellidos: '',
                    cedula_paciente: '',
                    nacionalidad: 'V',
                    sexo: 'M',
                    fecha_nacimiento: '',
                    etnia: '',
                    discapacidad: 'No',
                  }));
                }}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  modoRegistro === 'existente'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Paciente Existente
              </button>
              <button
                type="button"
                onClick={() => {
                  setModoRegistro('nuevo');
                  setFormData(prev => ({
                    ...prev,
                    paciente_id: '',
                    nombres: '',
                    apellidos: '',
                    cedula_paciente: '',
                    nacionalidad: 'V',
                    sexo: 'M',
                    fecha_nacimiento: '',
                    etnia: '',
                    discapacidad: 'No',
                  }));
                }}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  modoRegistro === 'nuevo'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Nuevo Paciente
              </button>
            </div>
          </div>

          {modoRegistro === 'existente' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Paciente
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchPaciente}
                  onChange={(e) => setSearchPaciente(e.target.value)}
                  placeholder="Buscar por cédula, nombres o apellidos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {formData.paciente_id ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                        <User className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary">
                          {formData.nombres} {formData.apellidos}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.nacionalidad}-{formData.cedula_paciente}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.sexo === 'M' ? 'Masculino' : 'Femenino'} • {format(new Date(formData.fecha_nacimiento), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          paciente_id: '',
                          nombres: '',
                          apellidos: '',
                          cedula_paciente: '',
                          nacionalidad: 'V',
                          sexo: 'M',
                          fecha_nacimiento: '',
                          etnia: '',
                          discapacidad: 'No',
                        }));
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {searchPaciente && filteredPacientes.length > 0 && (
                    <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                      {filteredPacientes.map((paciente) => (
                        <button
                          key={paciente.id}
                          type="button"
                          onClick={() => handlePacienteClick(paciente)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <User className="text-gray-600" size={16} />
                            </div>
                            <div>
                              <p className="font-medium text-secondary">
                                {paciente.nombres} {paciente.apellidos}
                              </p>
                              <p className="text-sm text-gray-600">
                                {paciente.nacionalidad}-{paciente.cedula} • {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchPaciente && filteredPacientes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No se encontraron pacientes</p>
                      <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                    </div>
                  )}

                  {!searchPaciente && pacientes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay pacientes registrados</p>
                      <p className="text-sm mt-1">Cambia a "Nuevo Paciente" para registrar uno</p>
                    </div>
                  )}

                  {!searchPaciente && pacientes.length > 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Search size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Escribe para buscar un paciente</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {(modoRegistro === 'nuevo' || formData.paciente_id) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres del paciente"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Apellidos del paciente"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidad *
              </label>
              <select
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              >
                <option value="V">V - Venezolano</option>
                <option value="E">E - Extranjero</option>
                <option value="C">C - Colombiano</option>
                <option value="B">B - Brasileño</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                name="cedula_paciente"
                value={formData.cedula_paciente}
                onChange={handleChange}
                placeholder="12345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={modoRegistro === 'existente'}
              />
              {rangoEdad && (
                <div className="text-sm mt-1 space-y-1">
                  <p className="text-primary font-medium">
                    Edad: {edadCalculada !== null ? `${edadCalculada} años` : '-'}
                  </p>
                  <p className="text-gray-600">
                    Rango de edad: {rangoEdad}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etnia
              </label>
              <input
                type="text"
                name="etnia"
                value={formData.etnia}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={modoRegistro === 'existente'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discapacidad
              </label>
              <select
                name="discapacidad"
                value={formData.discapacidad}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={modoRegistro === 'existente'}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>
            
            {/* Selector de tipo de paciente - solo para pacientes nuevos */}
            {modoRegistro === 'nuevo' && (
              <div className="md:col-span-2 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Tipo de Paciente *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`
                    relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-200
                    ${formData.tipo_paciente === 'Consultorio' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                    }
                  `}>
                    <input
                      type="radio"
                      className="sr-only"
                      name="tipo_paciente"
                      value="Consultorio"
                      checked={formData.tipo_paciente === 'Consultorio'}
                      onChange={handleChange}
                    />
                    <div className="flex">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.tipo_paciente === 'Consultorio' 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.tipo_paciente === 'Consultorio' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className={`font-medium ${
                            formData.tipo_paciente === 'Consultorio' ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            Consultorio
                          </span>
                        </div>
                        <p className={`text-sm ${
                          formData.tipo_paciente === 'Consultorio' ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          Horario: 07:00 - 12:00
                        </p>
                        <p className={`text-xs ${
                          formData.tipo_paciente === 'Consultorio' ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          Meta diaria: 10 consultas
                        </p>
                      </div>
                    </div>
                  </label>

                  <label className={`
                    relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-all duration-200
                    ${formData.tipo_paciente === 'Terreno' 
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                    }
                  `}>
                    <input
                      type="radio"
                      className="sr-only"
                      name="tipo_paciente"
                      value="Terreno"
                      checked={formData.tipo_paciente === 'Terreno'}
                      onChange={handleChange}
                    />
                    <div className="flex">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.tipo_paciente === 'Terreno' 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.tipo_paciente === 'Terreno' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className={`font-medium ${
                            formData.tipo_paciente === 'Terreno' ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            Terreno
                          </span>
                        </div>
                        <p className={`text-sm ${
                          formData.tipo_paciente === 'Terreno' ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          Horario: 13:00 - 16:00
                        </p>
                        <p className={`text-xs ${
                          formData.tipo_paciente === 'Terreno' ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          Meta diaria: 55 consultas
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Datos de la Consulta */}
        <div>
          <h2 className="text-xl font-semibold text-secondary mb-4">Datos de la Consulta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora de Consulta *
              </label>
              <input
                type="datetime-local"
                name="fecha_consulta"
                value={formData.fecha_consulta}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <p className="text-sm text-primary mt-1">
                Tipo: {tipoConsulta}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médico
              </label>
              <select
                name="medico_id"
                value={formData.medico_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Seleccionar médico</option>
                {medicos.map(medico => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nombre} {medico.apellido} - MPPS: {medico.mpps}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        <div>
          <h2 className="text-xl font-semibold text-secondary mb-4">Diagnóstico</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enfermedades Predeterminadas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ENFERMEDADES_PREDETERMINADAS.map(enfermedad => (
                <label
                  key={enfermedad}
                  className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.enfermedades.includes(enfermedad)}
                    onChange={() => handleEnfermedadToggle(enfermedad)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{enfermedad}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico Adicional
            </label>
            <textarea
              name="diagnostico_adicional"
              value={formData.diagnostico_adicional}
              onChange={handleChange}
              rows="3"
              placeholder="Agregar otros diagnósticos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/consultas')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || medicos.length === 0}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Consulta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
