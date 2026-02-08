import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import SkeletonCard from '../components/SkeletonCard';

export default function Pacientes() {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    nacionalidad: 'V',
    sexo: 'M',
    fecha_nacimiento: '',
    etnia: '',
    discapacidad: 'No',
  });

  useEffect(() => {
    if (user) {
      loadPacientes();
    }
  }, [user]);

  const loadPacientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('user_id', user.id)
        .order('apellidos', { ascending: true });

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPaciente) {
        const { error } = await supabase
          .from('pacientes')
          .update(formData)
          .eq('id', editingPaciente.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pacientes')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      setShowModal(false);
      resetForm();
      loadPacientes();
    } catch (error) {
      console.error('Error guardando paciente:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (paciente) => {
    setEditingPaciente(paciente);
    setFormData({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      cedula: paciente.cedula,
      nacionalidad: paciente.nacionalidad,
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
      etnia: paciente.etnia || '',
      discapacidad: paciente.discapacidad,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este paciente?')) return;

    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPacientes();
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      alert('Error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      nacionalidad: 'V',
      sexo: 'M',
      fecha_nacimiento: '',
      etnia: '',
      discapacidad: 'No',
    });
    setEditingPaciente(null);
  };

  const filteredPacientes = pacientes.filter(p =>
    p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula.includes(searchTerm)
  );

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Pacientes</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido o cédula..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de pacientes */}
      {filteredPacientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacientes.map((paciente) => (
            <div
              key={paciente.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                    <User className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">
                      {paciente.nombres} {paciente.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {paciente.nacionalidad}-{paciente.cedula}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>
                  <span className="font-medium">Sexo:</span> {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                </p>
                <p>
                  <span className="font-medium">Edad:</span> {calcularEdad(paciente.fecha_nacimiento)} años
                </p>
                <p>
                  <span className="font-medium">Fecha Nac:</span> {format(new Date(paciente.fecha_nacimiento), 'dd/MM/yyyy')}
                </p>
                {paciente.etnia && (
                  <p>
                    <span className="font-medium">Etnia:</span> {paciente.etnia}
                  </p>
                )}
                <p>
                  <span className="font-medium">Discapacidad:</span> {paciente.discapacidad}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(paciente)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(paciente.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nacionalidad *
                  </label>
                  <select
                    value={formData.nacionalidad}
                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
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
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="12345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={editingPaciente !== null}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo *
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
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
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etnia
                  </label>
                  <input
                    type="text"
                    value={formData.etnia}
                    onChange={(e) => setFormData({ ...formData, etnia: e.target.value })}
                    placeholder="Opcional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discapacidad
                  </label>
                  <select
                    value={formData.discapacidad}
                    onChange={(e) => setFormData({ ...formData, discapacidad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  {editingPaciente ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
