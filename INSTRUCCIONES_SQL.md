# 📝 Instrucciones para Ejecutar el SQL

## ⚠️ Error: Triggers ya existen

Si recibes el error:
```
ERROR: 42710: trigger "update_cpt_config_updated_at" for relation "cpt_config" already exists
```

Significa que ya tienes tablas creadas anteriormente.

---

## ✅ Solución: Usar el Script de Limpieza

### Opción 1: Script Completo (Recomendado)

1. Ve a **Supabase** → **SQL Editor**
2. Haz clic en **"New query"**
3. Copia y pega el contenido completo de **`supabase-schema-clean.sql`**
4. Haz clic en **"Run"** (▶️)

Este script:
- ✅ Elimina todas las tablas antiguas
- ✅ Elimina todos los triggers existentes
- ✅ Elimina todas las funciones
- ✅ Crea todo desde cero
- ✅ Muestra mensaje de confirmación

---

### Opción 2: Limpieza Manual

Si prefieres hacerlo paso a paso:

#### Paso 1: Eliminar Tablas Antiguas

```sql
-- Ejecuta esto primero
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS cpt_config CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
```

#### Paso 2: Eliminar Triggers y Funciones

```sql
-- Eliminar triggers
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_cpt_config_updated_at ON cpt_config;
DROP TRIGGER IF EXISTS update_medicos_updated_at ON medicos;
DROP TRIGGER IF EXISTS update_consultas_updated_at ON consultas;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS set_user_id();
```

#### Paso 3: Ejecutar el Schema

Ahora ejecuta el contenido de **`supabase-schema.sql`**

---

## 🔍 Verificar que Todo Está Bien

Después de ejecutar el script, verifica:

### 1. Tablas Creadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'cpt_config', 'medicos', 'consultas');
```

Deberías ver:
- ✅ usuarios
- ✅ cpt_config
- ✅ medicos
- ✅ consultas

### 2. Índices Creados

```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'cpt_config', 'medicos', 'consultas');
```

Deberías ver 10 índices.

### 3. Triggers Creados

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Deberías ver 4 triggers (uno por tabla).

---

## 📊 Estructura Final

Después de ejecutar el script, tendrás:

```
Base de Datos CPT
│
├── usuarios (tabla principal de autenticación)
│   ├── id (UUID)
│   ├── email (TEXT UNIQUE)
│   ├── password_hash (TEXT)
│   ├── nombre (TEXT)
│   └── timestamps
│
├── cpt_config (configuración del consultorio)
│   ├── id (UUID)
│   ├── user_id → usuarios.id
│   ├── nombre_cpt (TEXT)
│   ├── tipo_cpt (TEXT)
│   └── timestamps
│
├── medicos (médicos del consultorio)
│   ├── id (UUID)
│   ├── user_id → usuarios.id
│   ├── nombre, apellido, mpps
│   ├── especialidad
│   └── timestamps
│
└── consultas (registro de consultas)
    ├── id (UUID)
    ├── user_id → usuarios.id
    ├── medico_id → medicos.id
    ├── datos del paciente
    ├── datos de la consulta
    └── timestamps
```

---

## 🚀 Siguiente Paso

Una vez ejecutado el SQL exitosamente:

1. Abre la aplicación: `http://localhost:5173`
2. Haz clic en **"¿No tienes cuenta? Regístrate aquí"**
3. Crea tu primer usuario
4. ¡Empieza a usar el sistema!

---

## ⚠️ Notas Importantes

### Pérdida de Datos

⚠️ **ADVERTENCIA**: El script `supabase-schema-clean.sql` **ELIMINA TODAS LAS TABLAS** y sus datos.

Si tienes datos importantes:
1. Haz un backup primero
2. Exporta los datos que necesites
3. Luego ejecuta el script

### Backup Manual

```sql
-- Ejemplo de backup de consultas
SELECT * FROM consultas;
-- Copia los resultados a un archivo CSV
```

### RLS Deshabilitado

El sistema ahora usa autenticación personalizada, por lo que:
- ✅ RLS está deshabilitado
- ✅ La seguridad se maneja en el código
- ✅ Cada usuario solo ve sus datos (filtrado por user_id)

---

## 🆘 Solución de Problemas

### Error: "relation does not exist"

Si ves este error, significa que las tablas no se crearon. Verifica:
1. Que ejecutaste el script completo
2. Que no hubo errores en la ejecución
3. Que estás en el proyecto correcto de Supabase

### Error: "permission denied"

Si ves este error:
1. Verifica que estás usando el SQL Editor de Supabase
2. Verifica que tienes permisos de administrador
3. Intenta refrescar la página y volver a intentar

### Error: "syntax error"

Si ves este error:
1. Asegúrate de copiar el script completo
2. No modifiques el script
3. Ejecuta todo de una vez (no línea por línea)

---

## 📞 Ayuda Adicional

Si sigues teniendo problemas:

1. Revisa la consola de Supabase para ver el error completo
2. Verifica que tu proyecto de Supabase esté activo
3. Intenta crear un nuevo proyecto de Supabase si es necesario

---

**Última actualización**: Febrero 8, 2026
