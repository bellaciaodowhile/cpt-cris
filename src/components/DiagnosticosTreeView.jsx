import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Edit2, Trash2 } from 'lucide-react';

export default function DiagnosticosTreeView({ 
  categorias, 
  diagnosticos, 
  onSelectCategoria, 
  selectedCategoriaId,
  onSelectDiagnosticos,
  selectedDiagnosticsIds = [],
  onEditCategoria,
  onDeleteCategoria
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false); // Modo selección para transferencias

  const toggleCategory = (categoriaId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoriaId)) {
      newExpanded.delete(categoriaId);
    } else {
      newExpanded.add(categoriaId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDiagnosticosParaCategoria = (categoriaId) => {
    return diagnosticos.filter(d => d.categoria_id === categoriaId);
  };

  const handleSelectCategoria = (categoria) => {
    if (selectMode) {
      // En modo selección, toggle de los diagnósticos de la categoría
      const diagsDeCategoria = getDiagnosticosParaCategoria(categoria.id);
      const diagIds = diagsDeCategoria.map(d => d.id);
      
      // Si todos están seleccionados, deseleccionar; sino, seleccionar todos
      const allSelected = diagIds.every(id => selectedDiagnosticsIds.includes(id));
      
      let newSelection = selectedDiagnosticsIds.filter(id => !diagIds.includes(id));
      if (!allSelected) {
        newSelection = [...newSelection, ...diagIds];
      }
      
      onSelectDiagnosticos(newSelection);
    } else {
      // Modo normal: ver diagnósticos de la categoría
      toggleCategory(categoria.id);
      onSelectCategoria(categoria.id);
    }
  };

  const handleSelectDiagnostico = (diagId) => {
    if (selectMode) {
      const newSelection = selectedDiagnosticsIds.includes(diagId)
        ? selectedDiagnosticsIds.filter(id => id !== diagId)
        : [...selectedDiagnosticsIds, diagId];
      onSelectDiagnosticos(newSelection);
    }
  };

  const getCategoriaColor = (color) => {
    return { backgroundColor: color };
  };

  const isCategoriaParcialmentSeleccionada = (categoriaId) => {
    if (!selectMode) return false;
    const diagsDeCategoria = getDiagnosticosParaCategoria(categoriaId);
    const diagIds = diagsDeCategoria.map(d => d.id);
    const selectedCount = diagIds.filter(id => selectedDiagnosticsIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < diagIds.length;
  };

  const isCategoriaCompleteSeleccionada = (categoriaId) => {
    if (!selectMode) return false;
    const diagsDeCategoria = getDiagnosticosParaCategoria(categoriaId);
    const diagIds = diagsDeCategoria.map(d => d.id);
    return diagIds.length > 0 && diagIds.every(id => selectedDiagnosticsIds.includes(id));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary">Categorías y Diagnósticos</h3>
        <button
          onClick={() => setSelectMode(!selectMode)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {selectMode ? '✓ Modo Selección' : 'Modo Vista'}
        </button>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {categorias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="mx-auto mb-2 opacity-50" size={32} />
            <p>No hay categorías creadas</p>
          </div>
        ) : (
          categorias.map(categoria => {
            const diagsDeCategoria = getDiagnosticosParaCategoria(categoria.id);
            const isExpanded = expandedCategories.has(categoria.id);
            const isSelected = selectedCategoriaId === categoria.id;
            const isParcialmenteSeleccionada = isCategoriaParcialmentSeleccionada(categoria.id);
            const isCompleteSeleccionada = isCategoriaCompleteSeleccionada(categoria.id);

            return (
              <div key={categoria.id}>
                <div
                  onClick={() => handleSelectCategoria(categoria)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectMode
                      ? isParcialmenteSeleccionada || isCompleteSeleccionada
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                      : isSelected
                      ? 'bg-blue-50 border-l-4 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Checkbox para modo selección */}
                  {selectMode && (
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isCompleteSeleccionada}
                        onChange={() => {}}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                        indeterminate={isParcialmenteSeleccionada}
                        style={isParcialmenteSeleccionada ? { opacity: 0.6 } : {}}
                      />
                    </div>
                  )}

                  {/* Botón expandir/contraer */}
                  {diagsDeCategoria.length > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(categoria.id);
                      }}
                      className="flex-shrink-0 text-gray-600 hover:text-gray-900"
                    >
                      {isExpanded ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                  ) : (
                    <div className="flex-shrink-0 w-5" />
                  )}

                  {/* Icono y nombre */}
                  <div className="flex-shrink-0">
                    {isExpanded && diagsDeCategoria.length > 0 ? (
                      <FolderOpen size={18} className="text-blue-600" />
                    ) : (
                      <Folder size={18} className="text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {categoria.nombre}
                      </span>
                      <span
                        className="flex-shrink-0 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                        style={getCategoriaColor(categoria.color)}
                      >
                        {diagsDeCategoria.length}
                      </span>
                    </div>
                    {categoria.descripcion && (
                      <p className="text-xs text-gray-500 truncate">
                        {categoria.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Botones de acción (no en modo selección) */}
                  {!selectMode && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCategoria(categoria);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Editar categoría"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategoria(categoria.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Diagnósticos de la categoría */}
                {isExpanded && diagsDeCategoria.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {diagsDeCategoria.map(diagnostico => {
                      const isDiagSelected = selectedDiagnosticsIds.includes(diagnostico.id);
                      return (
                        <div
                          key={diagnostico.id}
                          onClick={() => handleSelectDiagnostico(diagnostico.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectMode
                              ? isDiagSelected
                                ? 'bg-blue-100'
                                : 'hover:bg-gray-50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Checkbox para modo selección */}
                          {selectMode && (
                            <input
                              type="checkbox"
                              checked={isDiagSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600 flex-shrink-0"
                            />
                          )}

                          <FileText size={16} className="text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 truncate">
                              {diagnostico.nombre}
                            </div>
                            {diagnostico.descripcion && (
                              <p className="text-xs text-gray-500 truncate">
                                {diagnostico.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
