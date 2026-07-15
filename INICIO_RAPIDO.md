# 🚀 Inicio Rápido: Enfermedades en Base de Datos

## ⏱️ 5 minutos para instalarlo

### 1️⃣ Abre Supabase SQL Editor

```
Supabase → SQL Editor → New Query
```

### 2️⃣ Copia este código

```sql
BEGIN;

-- Crear tabla base de enfermedades
CREATE TABLE IF NOT EXISTS enfermedades_base (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_predeterminado TEXT DEFAULT 'Ambos',
  activo BOOLEAN DEFAULT true
);

-- Insertar las 11 enfermedades
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

-- Crear función para nuevos usuarios
CREATE OR REPLACE FUNCTION crear_enfermedades_predeterminadas()
RETURNS TRIGGER AS $$
DECLARE
  categoria_id UUID;
BEGIN
  INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
  VALUES (NEW.id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
  RETURNING id INTO categoria_id;

  INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
  SELECT NEW.id, categoria_id, nombre, descripcion, tipo_predeterminado, true
  FROM enfermedades_base WHERE activo = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_crear_enfermedades_predeterminadas ON usuarios;
CREATE TRIGGER trigger_crear_enfermedades_predeterminadas
AFTER INSERT ON usuarios FOR EACH ROW
EXECUTE FUNCTION crear_enfermedades_predeterminadas();

-- Agregar a usuarios existentes
DO $$
DECLARE
  v_user_id UUID;
  v_categoria_id UUID;
BEGIN
  FOR v_user_id IN SELECT id FROM usuarios LOOP
    IF NOT EXISTS (SELECT 1 FROM categorias_diagnosticos WHERE user_id = v_user_id AND nombre = 'Enfermedades Predeterminadas') THEN
      INSERT INTO categorias_diagnosticos (user_id, nombre, descripcion, color)
      VALUES (v_user_id, 'Enfermedades Predeterminadas', 'Enfermedades estándar del sistema', '#6366F1')
      RETURNING id INTO v_categoria_id;

      INSERT INTO diagnosticos_personalizados (user_id, categoria_id, nombre, descripcion, tipo, activo)
      SELECT v_user_id, v_categoria_id, nombre, descripcion, tipo_predeterminado, true
      FROM enfermedades_base WHERE activo = true;
    END IF;
  END LOOP;
END $$;

COMMIT;
```

### 3️⃣ Ejecuta (Ctrl+Enter o botón Run)

### 4️⃣ ¡Listo! Abre la app y verás:

**En Diagnósticos:**
```
📦 Enfermedades Predeterminadas (púrpura)
   ├─ Hipertensión arterial
   ├─ Cardiopatía isquémica
   └─ ... (9 más)
```

**En Nueva Consulta:**
```
Diagnósticos Personalizados
└─ 📦 Enfermedades Predeterminadas
   ├─ ☐ Hipertensión arterial
   ├─ ☐ Cardiopatía isquémica
   └─ ... (9 más)
```

## ✅ Listo

- ✅ 11 enfermedades insertadas
- ✅ Categoría "Enfermedades Predeterminadas" creada
- ✅ Automático para nuevos usuarios
- ✅ Editable desde la interfaz
- ✅ Filtrable por tipo

## 📁 Archivos para referencia

Si necesitas más detalles:
- `ENFERMEDADES_SETUP_GUIDE.md` - Guía completa
- `CHECKLIST_INSTALACION.md` - Checklist paso a paso
- `enfermedades-insertar-simple.sql` - Script original completo
