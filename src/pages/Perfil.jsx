import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Save, Building2, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cptData, setCptData] = useState({
    nombre_cpt: '',
  });

  useEffect(() => {
    if (user) {
      loadCPTData();
    }
  }, [user]);

  const loadCPTData = async () => {
    try {
      const { data, error } = await supabase
        .from('cpt_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCptData({
          nombre_cpt: data.nombre_cpt || '',
        });
      }
    } catch (error) {
      console.error('Error cargando configuración CPT:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('cpt_config')
        .upsert({
          user_id: user.id,
          nombre_cpt: cptData.nombre_cpt,
        });

      if (error) throw error;
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error guardando configuración: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary mb-6">Perfil</h1>

      {/* Información del Usuario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
          <User size={24} />
          Información del Usuario
        </h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          {user?.nombre && (
            <p className="text-gray-600">
              <span className="font-medium">Nombre:</span> {user.nombre}
            </p>
          )}
        </div>
      </div>

      {/* Configuración del CPT */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-secondary mb-4 flex items-center gap-2">
          <Building2 size={24} />
          Configuración del CPT
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del CPT *
            </label>
            <input
              type="text"
              value={cptData.nombre_cpt}
              onChange={(e) => setCptData({ ...cptData, nombre_cpt: e.target.value })}
              placeholder="Ej: CPT Los Rosales"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>

      {/* Cerrar Sesión */}
      <button
        onClick={handleSignOut}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  );
}
