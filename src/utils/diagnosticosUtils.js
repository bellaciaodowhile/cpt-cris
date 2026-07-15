import { supabase } from '../lib/supabase';
import { ENFERMEDADES_PREDETERMINADAS } from './consultaUtils';

/**
 * Obtiene los diagnósticos disponibles para un tipo de consulta específico
 * @param {string} userId - ID del usuario
 * @param {string} tipoConsulta - 'Consultorio' o 'Terreno'
 * @returns {Promise<Array>} - Lista de diagnósticos categorizados
 */
export async function getDiagnosticosParaTipo(userId, tipoConsulta) {
  try {
    // Obtener diagnósticos personalizados del usuario filtrando por tipo
    const { data: diagnosticosPersonalizados, error } = await supabase
      .from('diagnosticos_personalizados')
      .select(`
        *,
        categoria:categorias_diagnosticos(nombre, color, tipo)
      `)
      .eq('user_id', userId)
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo diagnósticos personalizados:', error);
      return {
        predeterminados: ENFERMEDADES_PREDETERMINADAS,
        personalizados: [],
        porCategoria: {}
      };
    }

    // Agrupar diagnósticos personalizados por categoría, filtrando por tipo
    const porCategoria = {};
    const sinCategoria = [];

    (diagnosticosPersonalizados || []).forEach(diagnostico => {
      // Verificar que el diagnóstico sea compatible con el tipo seleccionado
      const diagnósticoCompatible = diagnostico.tipo === tipoConsulta || diagnostico.tipo === 'Ambos';
      
      if (!diagnósticoCompatible) {
        return; // Saltar si no es compatible
      }

      // Verificar que la categoría también sea compatible con el tipo
      if (diagnostico.categoria) {
        const categoriaCompatible = diagnostico.categoria.tipo === tipoConsulta || diagnostico.categoria.tipo === 'Ambos';
        
        if (categoriaCompatible) {
          const categoriaNombre = diagnostico.categoria.nombre;
          if (!porCategoria[categoriaNombre]) {
            porCategoria[categoriaNombre] = {
              color: diagnostico.categoria.color,
              tipo: diagnostico.categoria.tipo,
              diagnosticos: []
            };
          }
          porCategoria[categoriaNombre].diagnosticos.push(diagnostico);
        }
      } else {
        // Diagnósticos sin categoría solo se incluyen si son compatibles
        sinCategoria.push(diagnostico);
      }
    });

    return {
      predeterminados: ENFERMEDADES_PREDETERMINADAS,
      personalizados: sinCategoria,
      porCategoria
    };

  } catch (error) {
    console.error('Error en getDiagnosticosParaTipo:', error);
    return {
      predeterminados: ENFERMEDADES_PREDETERMINADAS,
      personalizados: [],
      porCategoria: {}
    };
  }
}

/**
 * Obtiene todas las categorías de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de categorías
 */
export async function getCategoriasDiagnosticos(userId) {
  try {
    const { data, error } = await supabase
      .from('categorias_diagnosticos')
      .select('*')
      .eq('user_id', userId)
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
}

/**
 * Formatea un diagnóstico para mostrar en la interfaz
 * @param {Object} diagnostico - Objeto de diagnóstico
 * @returns {string} - Nombre formateado del diagnóstico
 */
export function formatDiagnostico(diagnostico) {
  if (typeof diagnostico === 'string') {
    return diagnostico;
  }
  return diagnostico.nombre || '';
}