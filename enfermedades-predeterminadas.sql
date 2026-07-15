-- Script para insertar enfermedades predeterminadas como diagnósticos personalizados
-- Este script debe ejecutarse después de que los usuarios estén registrados en el sistema

-- Nota: Necesitarás reemplazar los UUIDs de usuario con los UUIDs reales de tus usuarios
-- Opción 1: Si quieres que todas las enfermedades predeterminadas estén disponibles para todos los usuarios,
-- ejecuta este script para cada user_id individual

-- Para obtener los UUIDs de tus usuarios, ejecuta:
-- SELECT id, email FROM usuarios;

-- Ejemplo para un usuario específico (reemplaza 'YOUR_USER_ID' con el UUID real):
-- BEGIN;

-- Insertar la categoría "Enfermedades Predeterminadas"
-- INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
-- VALUES ('YOUR_USER_ID', 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
-- ON CONFLICT DO NOTHING;

-- -- Obtener el ID de la categoría que acabamos de insertar
-- WITH categoria AS (
--   SELECT id FROM categorias_diagnosticos 
--   WHERE user_id = 'YOUR_USER_ID' AND nombre = 'Enfermedades Predeterminadas'
-- )
-- -- Insertar todas las enfermedades predeterminadas
-- INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
-- SELECT 
--   'YOUR_USER_ID' as user_id,
--   categoria.id as categoria_id,
--   enfermedad as nombre,
--   'Enfermedad predeterminada del sistema' as descripcion,
--   'Ambos' as tipo,
--   true as activo
-- FROM categoria,
-- (VALUES 
--   ('Hipertensión arterial'),
--   ('Cardiopatía isquémica'),
--   ('Enfermedad cerebrovascular'),
--   ('Asma bronquial'),
--   ('Diabetes mellitus'),
--   ('Tumores malignos'),
--   ('Epilepsia'),
--   ('Otras crónicas no transmisibles'),
--   ('Síndrome Febril'),
--   ('Parasitismo'),
--   ('Restos de las causas')
-- ) AS t(enfermedad)
-- ON CONFLICT DO NOTHING;

-- COMMIT;

-- ============================================================================
-- OPCIÓN ALTERNATIVA: Script que funciona para cualquier usuario
-- Este script crea un trigger que inserta automáticamente estas enfermedades
-- cuando se crea un nuevo usuario
-- ============================================================================

-- Crear tabla de enfermedades de base de datos (opcional, para referencia)
CREATE TABLE IF NOT EXISTS enfermedades_base (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_predeterminado TEXT DEFAULT 'Ambos',
  activo BOOLEAN DEFAULT true
);

-- Insertar enfermedades de base (estas actúan como plantilla)
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

-- ============================================================================
-- Crear función que agregue automáticamente enfermedades predeterminadas
-- a nuevos usuarios
-- ============================================================================

CREATE OR REPLACE FUNCTION crear_enfermedades_predeterminadas()
RETURNS TRIGGER AS $$
DECLARE
  categoria_id UUID;
BEGIN
  -- Crear la categoría "Enfermedades Predeterminadas" para el nuevo usuario
  INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
  VALUES (NEW.id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
  RETURNING id INTO categoria_id;

  -- Insertar todos los diagnósticos predeterminados
  INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
  SELECT
    NEW.id as user_id,
    categoria_id as categoria_id,
    nombre as nombre,
    descripcion as descripcion,
    tipo_predeterminado as tipo,
    true as activo
  FROM enfermedades_base
  WHERE activo = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que ejecute la función cuando se cree un nuevo usuario
DROP TRIGGER IF EXISTS trigger_crear_enfermedades_predeterminadas ON usuarios;
CREATE TRIGGER trigger_crear_enfermedades_predeterminadas
AFTER INSERT ON usuarios
FOR EACH ROW
EXECUTE FUNCTION crear_enfermedades_predeterminadas();

-- ============================================================================
-- Para usuarios EXISTENTES: Ejecuta el siguiente script para cada user_id
-- ============================================================================

-- Opción 1: Agregar enfermedades predeterminadas a TODOS los usuarios existentes

-- BEGIN;

-- WITH categoria_insertada AS (
--   INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
--   SELECT DISTINCT u.id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1'
--   FROM usuarios u
--   WHERE NOT EXISTS (
--     SELECT 1 FROM categorias_diagnosticos cd
--     WHERE cd.user_id = u.id AND cd.nombre = 'Enfermedades Predeterminadas'
--   )
--   RETURNING id, user_id
-- )
-- INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
-- SELECT 
--   cat.user_id,
--   cat.id,
--   eb.nombre,
--   eb.descripcion,
--   'Ambos',
--   true
-- FROM categoria_insertada cat
-- CROSS JOIN enfermedades_base eb
-- WHERE eb.activo = true
-- AND NOT EXISTS (
--   SELECT 1 FROM diagnosticos_personalizados dp
--   WHERE dp.user_id = cat.user_id
--   AND dp.nombre = eb.nombre
--   AND dp.categoria_id = cat.id
-- )
-- ON CONFLICT DO NOTHING;

-- COMMIT;

-- ============================================================================
-- Script SIMPLE para un usuario específico
-- ============================================================================

-- Descomentar y reemplazar 'YOUR_USER_ID' con el UUID real del usuario
/*
BEGIN;

-- Insertar categoría
INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
VALUES ('YOUR_USER_ID', 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Obtener la categoría e insertar diagnósticos
WITH categoria AS (
  SELECT id FROM categorias_diagnosticos 
  WHERE user_id = 'YOUR_USER_ID' AND nombre = 'Enfermedades Predeterminadas' LIMIT 1
)
INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
SELECT 
  'YOUR_USER_ID',
  categoria.id,
  nombre,
  descripcion,
  tipo_predeterminado,
  true
FROM categoria, enfermedades_base
WHERE enfermedades_base.activo = true
ON CONFLICT (user_id, nombre) DO NOTHING;

COMMIT;
*/