import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Tag, Building2, MapPin, Globe, Loader2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import DiagnosticosTreeView from '../components/DiagnosticosTreeView';

export default function Diagnosticos() {
  const { user } = useAuth();
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('diagnostico');
  const [loadingForm, setLoadingForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedDiagnosticsForTransfer, setSelectedDiagnosticsForTransfer] = useState([]);
  const [transferTargetCategoria, setTransferTargetCategoria] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    tipo: 'Ambos',
  });

  const [categoriaFormData, setCategoriaFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    tipo: 'Ambos',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategorias(), loadDiagnosticos()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias_diagnosticos')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre');

    if (error) throw error;
    setCategorias(data || []);
  };

  const loadDiagnosticos = async () => {
    const { data, error } = await supabase
      .from('diagnosticos_personalizados')
      .select(`
        *,
        categoria:categorias_diagnosticos(nombre, color)
      `)
      .eq('user_id', user.id)
      .order('nombre');

    if (error) throw error;
    setDiagnosticos(data || []);
  };

  const handleSubmitDiagnostico = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      if (editingItem && modalType === 'diagnostico') {
        const { error } = await supabase
          .from('diagnosticos_personalizados')
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else if (modalType === 'diagnostico') {
        const { error } = await supabase
          .from('diagnosticos_personalizados')
          .insert({
            ...formData,
            user_id: user.id,
          });
        if (error) throw error;
      }

      setShowModal(false);
      resetForms();
      loadDiagnosticos();
    } catch (error) {
      console.error('Error guardando diagnóstico:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      if (editingItem && modalType === 'categoria') {
        const { error } = await supabase
          .from('categorias_diagnosticos')
          .update(categoriaFormData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else if (modalType === 'categoria') {
        const { error } = await supabase
          .from('categorias_diagnosticos')
          .insert({
            ...categoriaFormData,
            user_id: user.id,
          });
        if (error) throw error;
      }

      setShowModal(false);
      resetForms();
      loadData();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setModalType(type);
    
    if (type === 'diagnostico') {
      setFormData({
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        categoria_id: item.categoria_id || '',
        tipo: item.tipo,
      });
    } else {
      setCategoriaFormData({
        nombre: item.nombre,
        descripcion: item.descripcion || '',
        color: item.color,
        tipo: item.tipo || 'Ambos',
      });
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    const tabla = type === 'diagnostico' ? 'diagnosticos_personalizados' : 'categorias_diagnosticos';
    const mensaje = type === 'diagnostico' ? 'diagnóstico' : 'categoría';
    
    if (!confirm(`¿Estás seguro de eliminar este ${mensaje}?`)) return;

    try {
      const { error } = await supabase
        .from(tabla)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      if (type === 'diagnostico') {
        loadDiagnosticos();
      } else {
        loadData();
      }
    } catch (error) {
      console.error(`Error eliminando ${mensaje}:`, error);
      alert('Error: ' + error.message);
    }
  };

  const handleTransferDiagnosticos = async () => {
    if (selectedDiagnosticsForTransfer.length === 0) {
      alert('Selecciona al menos un diagnóstico para transferir');
      return;
    }

    if (!transferTargetCategoria) {
      alert('Selecciona una categoría de destino');
      return;
    }

    setLoadingForm(true);
    try {
      // Transferir todos los diagnósticos seleccionados a la nueva categoría
      const { error } = await supabase
        .from('diagnosticos_personalizados')
        .update({ categoria_id: transferTargetCategoria || null })
        .in('id', selectedDiagnosticsForTransfer);

      if (error) throw error;

      setShowTransferModal(false);
      setSelectedDiagnosticsForTransfer([]);
      setTransferTargetCategoria('');
      loadDiagnosticos();
    } catch (error) {
      console.error('Error transfiriendo diagnósticos:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const resetForms = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoria_id: '',
      tipo: 'Ambos',
    });
    setCategoriaFormData({
      nombre: '',
      descripcion: '',
      color: '#3B82F6',
      tipo: 'Ambos',
    });
    setEditingItem(null);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Consultorio':
        return <Building2 size={16} className="text-blue-600" />;
      case 'Terreno':
        return <MapPin size={16} className="text-green-600" />;
      case 'Ambos':
        return <Globe size={16} className="text-purple-600" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Consultorio':
        return 'bg-blue-100 text-blue-800';
      case 'Terreno':
        return 'bg-green-100 text-green-800';
      case 'Ambos':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDiagnosticos = diagnosticos.filter(d => {
    const matchesSearch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.descripcion && d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategoria = filterCategoria === '' || d.categoria_id === filterCategoria;
    const matchesTipo = filterTipo === '' || d.tipo === filterTipo;
    
    return matchesSearch && matchesCategoria && matchesTipo;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-secondary">Gestión de Diagnósticos</h1>
        <div className="flex gap-3">
          {selectedDiagnosticsForTransfer.length > 0 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 animate-pulse"
            >
              <ArrowRight size={16} />
              Transferir ({selectedDiagnosticsForTransfer.length})
            </button>
          )}
          <button
            onClick={() => {
              setModalType('categoria');
              setEditingItem(null);
              setCategoriaFormData({
                nombre: '',
                descripcion: '',
                color: '#3B82F6',
                tipo: 'Ambos',
              });
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Tag size={16} />
            Nueva Categoría
          </button>
          <button
            onClick={() => {
              setModalType('diagnostico');
              setEditingItem(null);
              setFormData({
                nombre: '',
                descripcion: '',
                categoria_id: '',
                tipo: 'Ambos',
              });
              setShowModal(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Nuevo Diagnóstico
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar diagnósticos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Terreno">Terreno</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resumen</label>
            <div className="text-sm text-gray-600 py-2">
              <div>Categorías: {categorias.length}</div>
              <div>Diagnósticos: {diagnosticos.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TreeView de Categorías y Diagnósticos */}
      <div className="mb-6">
        <DiagnosticosTreeView
          categorias={categorias}
          diagnosticos={diagnosticos}
          onSelectCategoria={setFilterCategoria}
          selectedCategoriaId={filterCategoria}
          onSelectDiagnosticos={setSelectedDiagnosticsForTransfer}
          selectedDiagnosticsIds={selectedDiagnosticsForTransfer}
          onEditCategoria={(categoria) => handleEdit(categoria, 'categoria')}
          onDeleteCategoria={(id) => handleDelete(id, 'categoria')}
        />
      </div>

      {/* Lista de Diagnósticos */}
      <div className="space-y-4">
        {filteredDiagnosticos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Tag className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay diagnósticos</h3>
            <p className="text-gray-600">Comienza creando tu primer diagnóstico personalizado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiagnosticos.map((diagnostico) => (
              <div
                key={diagnostico.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary mb-1">{diagnostico.nombre}</h3>
                    {diagnostico.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">{diagnostico.descripcion}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTipoColor(diagnostico.tipo)}`}>
                    {getTipoIcon(diagnostico.tipo)}
                    {diagnostico.tipo}
                  </div>
                </div>

                {diagnostico.categoria && (
                  <div className="mb-3">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: diagnostico.categoria.color }}
                    >
                      <Tag size={12} className="mr-1" />
                      {diagnostico.categoria.nombre}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(diagnostico, 'diagnostico')}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(diagnostico.id, 'diagnostico')}
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
      </div>


      {/* Modal de Transferencia */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-secondary mb-4">Transferir Diagnósticos</h2>

            <div className="space-y-4">
              {/* Información de diagnósticos seleccionados */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Diagnósticos seleccionados:</h3>
                <div className="text-sm text-blue-800">
                  {selectedDiagnosticsForTransfer.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedDiagnosticsForTransfer.map(diagId => {
                        const diag = diagnosticos.find(d => d.id === diagId);
                        return diag ? (
                          <li key={diagId} className="flex items-center gap-2">
                            <span className="text-blue-600">•</span>
                            {diag.nombre}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-blue-700">Selecciona diagnósticos desde el TreeView arriba</p>
                  )}
                </div>
              </div>

              {/* Selector de categoría destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transferir a categoría *
                </label>
                <select
                  value={transferTargetCategoria}
                  onChange={(e) => setTransferTargetCategoria(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">-- Sin categoría --</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedDiagnosticsForTransfer([]);
                    setTransferTargetCategoria('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  disabled={loadingForm}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTransferDiagnosticos}
                  disabled={loadingForm || selectedDiagnosticsForTransfer.length === 0}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingForm ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Transfiriendo...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} />
                      Transferir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {modalType === 'diagnostico' 
                ? (editingItem ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico')
                : (editingItem ? 'Editar Categoría' : 'Nueva Categoría')
              }
            </h2>

            {modalType === 'diagnostico' ? (
              <form onSubmit={handleSubmitDiagnostico} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Diagnóstico *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="Ej: Hipertensión arterial primaria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descripción opcional del diagnóstico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tipo de Consulta *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="tipo"
                        value="Consultorio"
                        checked={formData.tipo === 'Consultorio'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Building2 size={18} className="text-blue-600" />
                        <div>
                          <span className="text-sm font-medium">Solo Consultorio</span>
                          <p className="text-xs text-gray-500">Disponible solo en consultas de consultorio (07:00-12:00)</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="tipo"
                        value="Terreno"
                        checked={formData.tipo === 'Terreno'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MapPin size={18} className="text-green-600" />
                        <div>
                          <span className="text-sm font-medium">Solo Terreno</span>
                          <p className="text-xs text-gray-500">Disponible solo en consultas de terreno (13:00-16:00)</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="tipo"
                        value="Ambos"
                        checked={formData.tipo === 'Ambos'}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Globe size={18} className="text-purple-600" />
                        <div>
                          <span className="text-sm font-medium">Ambos Tipos</span>
                          <p className="text-xs text-gray-500">Disponible en ambos tipos de consulta</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={loadingForm}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingForm ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Guardando...
                      </>
                    ) : (
                      editingItem ? 'Actualizar' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitCategoria} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    value={categoriaFormData.nombre}
                    onChange={(e) => setCategoriaFormData({ ...categoriaFormData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    placeholder="Ej: Enfermedades Cardiovasculares"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={categoriaFormData.descripcion}
                    onChange={(e) => setCategoriaFormData({ ...categoriaFormData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descripción opcional de la categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={categoriaFormData.color}
                      onChange={(e) => setCategoriaFormData({ ...categoriaFormData, color: e.target.value })}
                      className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">
                      Selecciona un color para identificar esta categoría
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tipo de Categoría *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="categoria_tipo"
                        value="Consultorio"
                        checked={categoriaFormData.tipo === 'Consultorio'}
                        onChange={(e) => setCategoriaFormData({ ...categoriaFormData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Building2 size={18} className="text-blue-600" />
                        <div>
                          <span className="text-sm font-medium">Solo Consultorio</span>
                          <p className="text-xs text-gray-500">Disponible solo en consultas de consultorio (07:00-12:00)</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="categoria_tipo"
                        value="Terreno"
                        checked={categoriaFormData.tipo === 'Terreno'}
                        onChange={(e) => setCategoriaFormData({ ...categoriaFormData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MapPin size={18} className="text-green-600" />
                        <div>
                          <span className="text-sm font-medium">Solo Terreno</span>
                          <p className="text-xs text-gray-500">Disponible solo en consultas de terreno (13:00-16:00)</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="categoria_tipo"
                        value="Ambos"
                        checked={categoriaFormData.tipo === 'Ambos'}
                        onChange={(e) => setCategoriaFormData({ ...categoriaFormData, tipo: e.target.value })}
                        className="w-4 h-4 text-primary"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Globe size={18} className="text-purple-600" />
                        <div>
                          <span className="text-sm font-medium">Ambos Tipos</span>
                          <p className="text-xs text-gray-500">Disponible en ambos tipos de consulta</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={loadingForm}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingForm}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingForm ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Guardando...
                      </>
                    ) : (
                      editingItem ? 'Actualizar' : 'Guardar'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}