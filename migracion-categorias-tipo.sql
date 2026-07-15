-- ============================================================================
-- MIGRACIÓN: Agregar campo 'tipo' a las categorías existentes
-- ============================================================================
-- Este script agrega el campo 'tipo' a la tabla categorias_diagnosticos
-- para permitir categorizar por Consultorio, Terreno o Ambos

-- Paso 1: Agregar columna 'tipo' si no existe
ALTER TABLE categorias_diagnosticos 
ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'Ambos' 
CHECK (tipo IN ('Consultorio', 'Terreno', 'Ambos'));

-- Paso 2: Agregar índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_categorias_diagnosticos_tipo 
ON categorias_diagnosticos(tipo);

-- Paso 3: Actualizar categorías existentes (todas a 'Ambos' por defecto)
UPDATE categorias_diagnosticos 
SET tipo = 'Ambos' 
WHERE tipo IS NULL;

-- (OPCIONAL) Si quieres cambiar tipos específicos, usa:
-- UPDATE categorias_diagnosticos 
-- SET tipo = 'Consultorio' 
-- WHERE nombre = 'Nombre de la Categoría';

-- Verificación: Ver todas las categorías y sus tipos
-- SELECT id, nombre, tipo FROM categorias_diagnosticos ORDER BY nombre;
