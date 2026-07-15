# Instrucciones: Insertar Enfermedades Predeterminadas en la Base de Datos

## Descripción

Este documento explica cómo insertar las enfermedades predeterminadas en tu base de datos como diagnósticos personalizados organizados en una categoría especial.

## Opciones de instalación

### Opción 1: Automático para nuevos usuarios (Recomendado)

Si ejecutas el archivo `enfermedades-predeterminadas.sql` completo, se configurará un **trigger automático** que:

- Cuando se registre un nuevo usuario en el sistema
- Se creará automáticamente la categoría "Enfermedades Predeterminadas"
- Se insertarán todas las 11 enfermedades predeterminadas bajo esa categoría

**Pasos:**

1. Abre el editor SQL de Supabase
2. Copia el contenido completo de `enfermedades-predeterminadas.sql`
3. Pégalo en el editor
4. Ejecuta el script

Listo. De ahora en adelante, todos los nuevos usuarios tendrán automáticamente esta categoría con las enfermedades.

### Opción 2: Para un usuario específico (Manual)

Si quieres agregar las enfermedades a un usuario que ya existe:

**Pasos:**

1. Obtén el UUID del usuario:
   - En Supabase, ve a la tabla `usuarios`
   - Copia el `id` del usuario

2. En el editor SQL de Supabase, ejecuta este script reemplazando `YOUR_USER_ID`:

```sql
BEGIN;

-- Paso 1: Insertar la categoría
INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
VALUES ('YOUR_USER_ID', 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Paso 2: Insertar las enfermedades
WITH categoria AS (
  SELECT id FROM categorias_diagnosticos 
  WHERE user_id = 'YOUR_USER_ID' AND nombre = 'Enfermedades Predeterminadas' LIMIT 1
)
INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
VALUES
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Hipertensión arterial', 'Elevación crónica de la presión arterial', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Cardiopatía isquémica', 'Enfermedad del corazón por falta de riego sanguíneo', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Enfermedad cerebrovascular', 'Enfermedad vascular del cerebro', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Asma bronquial', 'Enfermedad inflamatoria de las vías respiratorias', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Diabetes mellitus', 'Enfermedad endocrina crónica', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Tumores malignos', 'Crecimiento anormal de células malignas', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Epilepsia', 'Trastorno neurológico caracterizado por convulsiones', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Otras crónicas no transmisibles', 'Otras enfermedades crónicas no infecciosas', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Síndrome Febril', 'Síndrome de fiebre de etiología variada', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Parasitismo', 'Infestación parasitaria', 'Ambos', true),
  ('YOUR_USER_ID', (SELECT id FROM categoria), 'Restos de las causas', 'Otras causas no clasificadas', 'Ambos', true)
ON CONFLICT (user_id, nombre) DO NOTHING;

COMMIT;
```

**Ejemplo con UUID real:**

```sql
BEGIN;

INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
ON CONFLICT (user_id, nombre) DO NOTHING;

WITH categoria AS (
  SELECT id FROM categorias_diagnosticos 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND nombre = 'Enfermedades Predeterminadas' LIMIT 1
)
INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM categoria), 'Hipertensión arterial', 'Elevación crónica de la presión arterial', 'Ambos', true),
  -- ... resto de enfermedades
COMMIT;
```

### Opción 3: Para TODOS los usuarios existentes

Si quieres agregar las enfermedades a todos tus usuarios actuales:

1. En el editor SQL de Supabase, ejecuta este script:

```sql
BEGIN;

-- Crear tabla de referencia si no existe
CREATE TABLE IF NOT EXISTS enfermedades_base (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_predeterminado TEXT DEFAULT 'Ambos',
  activo BOOLEAN DEFAULT true
);

-- Insertar enfermedades base
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

-- Crear categoría y diagnósticos para cada usuario
WITH usuarios_existentes AS (
  SELECT DISTINCT u.id FROM usuarios u
)
INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
SELECT u.id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1'
FROM usuarios_existentes u
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_diagnosticos cd
  WHERE cd.user_id = u.id AND cd.nombre = 'Enfermedades Predeterminadas'
)
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Insertar diagnósticos
WITH categoria_id_map AS (
  SELECT user_id, id FROM categorias_diagnosticos
  WHERE nombre = 'Enfermedades Predeterminadas'
)
INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
SELECT 
  cim.user_id,
  cim.id,
  eb.nombre,
  eb.descripcion,
  'Ambos',
  true
FROM categoria_id_map cim
CROSS JOIN enfermedades_base eb
WHERE eb.activo = true
AND NOT EXISTS (
  SELECT 1 FROM diagnosticos_personalizados dp
  WHERE dp.user_id = cim.user_id
  AND dp.nombre = eb.nombre
)
ON CONFLICT (user_id, nombre) DO NOTHING;

COMMIT;
```

## Enfermedades incluidas

La categoría "Enfermedades Predeterminadas" incluirá las siguientes 11 enfermedades (todas configuradas como "Ambos" tipos):

1. ✅ Hipertensión arterial
2. ✅ Cardiopatía isquémica
3. ✅ Enfermedad cerebrovascular
4. ✅ Asma bronquial
5. ✅ Diabetes mellitus
6. ✅ Tumores malignos
7. ✅ Epilepsia
8. ✅ Otras crónicas no transmisibles
9. ✅ Síndrome Febril
10. ✅ Parasitismo
11. ✅ Restos de las causas

## Verificación

Después de ejecutar el script, verifica que se insertaron correctamente:

1. Abre el módulo de **Diagnósticos** en la aplicación
2. Deberías ver la categoría "Enfermedades Predeterminadas" (color índigo/púrpura)
3. Al hacer clic en ella, verás las 11 enfermedades listadas

## Notas importantes

- Las enfermedades se insertan con tipo **"Ambos"**, lo que significa que aparecerán en ambos tipos de consulta
- La categoría tiene color índigo (`#6366F1`) para identificarla fácilmente
- Si intentas insertar una enfermedad que ya existe, se ignora (por la cláusula `ON CONFLICT`)
- El trigger automático solo funciona para **nuevos usuarios** registrados después de ejecutar el script
- Para usuarios existentes, usa la Opción 2 o Opción 3

## Eliminar datos (si es necesario)

Si deseas eliminar las enfermedades predeterminadas:

```sql
-- Eliminar los diagnósticos
DELETE FROM diagnosticos_personalizados
WHERE categoria_id IN (
  SELECT id FROM categorias_diagnosticos
  WHERE nombre = 'Enfermedades Predeterminadas'
);

-- Eliminar la categoría
DELETE FROM categorias_diagnosticos
WHERE nombre = 'Enfermedades Predeterminadas';

-- (Opcional) Eliminar la tabla base
-- DROP TABLE IF EXISTS enfermedades_base;

-- (Opcional) Eliminar el trigger
-- DROP TRIGGER IF EXISTS trigger_crear_enfermedades_predeterminadas ON usuarios;
```

## Troubleshooting

### Error: "duplicate key value violates unique constraint"

Esto significa que algunas enfermedades ya fueron insertadas. Usa `ON CONFLICT DO NOTHING` para ignorarlas.

### No veo la categoría en la aplicación

- Recarga la página (presiona F5)
- Verifica que hayas ejecutado el script completo
- Asegúrate de que estés conectado con el usuario correcto

### Quiero cambiar el tipo de una enfermedad

En el módulo de Diagnósticos, puedes editar cada enfermedad individualmente y cambiar su tipo de "Ambos" a "Solo Consultorio" o "Solo Terreno".
