import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Medicos() {
  const { user } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mpps: '',
    especialidad: '',
  });

  useEffect(() => {
    if (user) {
      loadMedicos();
    }
  }, [user]);

  const loadMedicos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre');

      if (error) throw error;
      setMedicos(data || []);
    } catch (error) {
      console.error('Error cargando médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('medicos')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medicos')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      resetForm();
      loadMedicos();
    } catch (error) {
      console.error('Error guardando médico:', error);
      alert('Error guardando médico: ' + error.message);
    }
  };

  const handleEdit = (medico) => {
    setFormData({
      nombre: medico.nombre,
      apellido: medico.apellido,
      mpps: medico.mpps,
      especialidad: medico.especialidad || '',
    });
    setEditingId(medico.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este médico?')) return;

    try {
      const { error } = await supabase
        .from('medicos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      loadMedicos();
    } catch (error) {
      console.error('Error eliminando médico:', error);
      alert('Error eliminando médico: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', apellido: '', mpps: '', especialidad: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Médicos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancelar' : 'Nuevo'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-secondary mb-4">
            {editingId ? 'Editar Médico' : 'Nuevo Médico'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MPPS *
                </label>
                <input
                  type="text"
                  value={formData.mpps}
                  onChange={(e) => setFormData({ ...formData, mpps: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de médicos */}
      <div className="space-y-4">
        {medicos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No hay médicos registrados</p>
          </div>
        ) : (
          medicos.map((medico) => (
            <div
              key={medico.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary">
                    {medico.nombre} {medico.apellido}
                  </h3>
                  <p className="text-sm text-gray-600">MPPS: {medico.mpps}</p>
                  {medico.especialidad && (
                    <p className="text-sm text-gray-600">
                      Especialidad: {medico.especialidad}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(medico)}
                    className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(medico.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
