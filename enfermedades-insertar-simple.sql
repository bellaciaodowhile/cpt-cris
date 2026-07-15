-- ============================================================================
-- SCRIPT SIMPLE: Insertar Enfermedades Predeterminadas
-- ============================================================================
-- Este es el script más simple y directo para insertar las enfermedades
-- predeterminadas en la base de datos.
--
-- Ejecución: 
-- 1. Abre Supabase SQL Editor
-- 2. Copia todo el contenido de este archivo
-- 3. Pégalo en el editor
-- 4. Presiona "Ejecutar" o "Run"
-- ============================================================================

BEGIN;

-- Crear tabla base de enfermedades (si no existe)
CREATE TABLE IF NOT EXISTS enfermedades_base (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_predeterminado TEXT DEFAULT 'Ambos',
  activo BOOLEAN DEFAULT true
);

-- Insertar las 11 enfermedades predeterminadas
INSERT INTO enfermedades_base (nombre, descripcion, tipo_predeterminado) VALUES
  ('Hipertensión arterial', 'Elevación crónica de la presión arterial', 'Ambos'),
  ('Cardiopatía isquémica', 'Enfermedad del corazón por falta de riego sanguíneo', 'Ambos'),
  ('Enfermedad cerebrovascular', 'Enfermedad vascular del cerebro', 'Ambos'),
  ('Asma bronquial', 'Enfermedad inflamatoria de las vías respiratorias', 'Ambos'),
  ('Diabetes mellitus', 'Enfermedad endocrina crónica', 'Ambos'),
  ('Tumores malignos', 'Crecimiento anormal de células malignas', 'Ambos'),
  ('Epilepsia', 'Trastorno neurológico caracterizado por convulsiones', 'Ambos'),
  ('Otras crónicas no transmisibles', 'Otras enfermedades crónicas no infecciosas', 'Ambos'),
  ('Síndrome Febril', 'Síndrome de fiebre de etiología variada', 'Ambos'),
  ('Parasitismo', 'Infestación parasitaria', 'Ambos'),
  ('Restos de las causas', 'Otras causas no clasificadas', 'Ambos')
ON CONFLICT (nombre) DO NOTHING;

-- Crear función trigger para nuevos usuarios
CREATE OR REPLACE FUNCTION crear_enfermedades_predeterminadas()
RETURNS TRIGGER AS $$
DECLARE
  categoria_id UUID;
BEGIN
  -- Crear la categoría "Enfermedades Predeterminadas"
  INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
  VALUES (NEW.id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
  RETURNING id INTO categoria_id;

  -- Insertar todos los diagnósticos predeterminados
  INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
  SELECT
    NEW.id,
    categoria_id,
    nombre,
    descripcion,
    tipo_predeterminado,
    true
  FROM enfermedades_base
  WHERE activo = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger (eliminamos el anterior si existe)
DROP TRIGGER IF EXISTS trigger_crear_enfermedades_predeterminadas ON usuarios;
CREATE TRIGGER trigger_crear_enfermedades_predeterminadas
AFTER INSERT ON usuarios
FOR EACH ROW
EXECUTE FUNCTION crear_enfermedades_predeterminadas();

-- Agregar enfermedades a usuarios EXISTENTES
DO $$
DECLARE
  v_user_id UUID;
  v_categoria_id UUID;
BEGIN
  -- Para cada usuario existente
  FOR v_user_id IN SELECT id FROM usuarios LOOP
    -- Verificar si ya tiene la categoría
    IF NOT EXISTS (
      SELECT 1 FROM categorias_diagnosticos 
      WHERE user_id = v_user_id AND nombre = 'Enfermedades Predeterminadas'
    ) THEN
      -- Crear categoría para este usuario
      INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
      VALUES (v_user_id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
      RETURNING id INTO v_categoria_id;

      -- Insertar todas las enfermedades para este usuario
      INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
      SELECT
        v_user_id,
        v_categoria_id,
        nombre,
        descripcion,
        tipo_predeterminado,
        true
      FROM enfermedades_base
      WHERE activo = true;
    END IF;
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN: Ejecuta estas consultas para verificar que todo se insertó
-- ============================================================================
-- SELECT COUNT(*) as total_categorias FROM categorias_diagnosticos 
-- WHERE nombre = 'Enfermedades Predeterminadas';

-- SELECT COUNT(*) as total_enfermedades FROM diagnosticos_personalizados 
-- WHERE categoria_id IN (
--   SELECT id FROM categorias_diagnosticos 
--   WHERE nombre = 'Enfermedades Predeterminadas'
-- );

-- SELECT * FROM diagnosticos_personalizados 
-- WHERE categoria_id IN (
--   SELECT id FROM categorias_diagnosticos 
--   WHERE nombre = 'Enfermedades Predeterminadas'
-- )
-- LIMIT 20;