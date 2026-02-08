# 🔐 Sistema de Autenticación Personalizada

## Cambios Realizados

El sistema ahora usa **autenticación personalizada** en lugar de Supabase Auth. Los usuarios se almacenan en una tabla propia de la base de datos.

---

## 📋 Resumen de Cambios

### 1. Nueva Tabla `usuarios`
Se creó una tabla personalizada para almacenar usuarios:

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. Actualización de Relaciones
Todas las tablas ahora referencian `usuarios` en lugar de `auth.users`:

- `cpt_config.user_id` → `usuarios.id`
- `medicos.user_id` → `usuarios.id`
- `consultas.user_id` → `usuarios.id`

### 3. Row Level Security (RLS) Deshabilitado
Se deshabilitó RLS ya que ahora manejamos la seguridad manualmente en el código:

```sql
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;
```

### 4. Nuevas Utilidades de Autenticación
Se creó `src/utils/auth.js` con funciones para:

- `hashPassword()` - Hash de contraseñas con SHA-256
- `verifyPassword()` - Verificación de contraseñas
- `saveUser()` - Guardar usuario en localStorage
- `getUser()` - Obtener usuario de localStorage
- `removeUser()` - Eliminar usuario de localStorage
- `isAuthenticated()` - Verificar si hay sesión activa

### 5. AuthContext Actualizado
El contexto de autenticación ahora:

- Registra usuarios en la tabla `usuarios`
- Verifica credenciales contra la base de datos
- Guarda la sesión en localStorage
- No usa Supabase Auth

### 6. Todas las Páginas Actualizadas
Se actualizaron todas las páginas para usar `user.id` del contexto:

- ✅ `Login.jsx` - Formulario de login y registro
- ✅ `Home.jsx` - Filtrado por user_id
- ✅ `Consultas.jsx` - Filtrado por user_id
- ✅ `NuevaConsulta.jsx` - Asignación de user_id
- ✅ `Dashboard.jsx` - Filtrado por user_id
- ✅ `Medicos.jsx` - CRUD con user_id
- ✅ `Perfil.jsx` - Configuración con user_id

---

## 🚀 Cómo Usar

### 1. Ejecutar el Nuevo Schema SQL

**IMPORTANTE**: Si ya tenías tablas creadas, necesitas eliminarlas primero:

```sql
-- Eliminar tablas antiguas (si existen)
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS cpt_config CASCADE;

-- Ahora ejecuta el contenido completo de supabase-schema.sql
```

### 2. Registrar un Usuario

1. Abre la aplicación: `http://localhost:5173`
2. Haz clic en **"¿No tienes cuenta? Regístrate aquí"**
3. Completa el formulario:
   - Email: `admin@cpt.com`
   - Contraseña: `Admin123456`
   - Confirmar contraseña: `Admin123456`
4. Haz clic en **"Crear Cuenta"**

### 3. Iniciar Sesión

1. Ingresa tu email y contraseña
2. Haz clic en **"Iniciar Sesión"**
3. La sesión se guarda en localStorage

### 4. Cerrar Sesión

1. Ve a la pestaña **"Perfil"**
2. Haz clic en **"Cerrar Sesión"**

---

## 🔒 Seguridad

### Hash de Contraseñas

Las contraseñas se hashean usando **SHA-256** antes de guardarse en la base de datos.

**NOTA**: Para producción, se recomienda usar **bcrypt** en el backend para mayor seguridad.

### Almacenamiento de Sesión

La sesión se guarda en **localStorage** del navegador:

```javascript
{
  id: "uuid-del-usuario",
  email: "usuario@ejemplo.com",
  nombre: "Nombre Usuario"
}
```

### Validaciones

- ✅ Email único (no se pueden registrar emails duplicados)
- ✅ Contraseña mínima de 6 caracteres
- ✅ Confirmación de contraseña en registro
- ✅ Verificación de credenciales en login

---

## 📊 Estructura de la Base de Datos

### Tabla: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del usuario |
| email | TEXT | Email único (usado para login) |
| password_hash | TEXT | Hash SHA-256 de la contraseña |
| nombre | TEXT | Nombre del usuario (opcional) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### Relaciones

```
usuarios (1) ──→ (N) cpt_config
usuarios (1) ──→ (N) medicos
usuarios (1) ──→ (N) consultas
```

---

## 🔧 Archivos Modificados

### Nuevos Archivos
1. `src/utils/auth.js` - Utilidades de autenticación

### Archivos Modificados
1. `supabase-schema.sql` - Nueva tabla usuarios y relaciones
2. `src/context/AuthContext.jsx` - Autenticación personalizada
3. `src/pages/Login.jsx` - Formulario de login/registro
4. `src/pages/Home.jsx` - Filtrado por user_id
5. `src/pages/Consultas.jsx` - Filtrado por user_id
6. `src/pages/NuevaConsulta.jsx` - Asignación de user_id
7. `src/pages/Dashboard.jsx` - Filtrado por user_id
8. `src/pages/Medicos.jsx` - CRUD con user_id
9. `src/pages/Perfil.jsx` - Configuración con user_id

---

## 🧪 Pruebas

### Crear Usuario de Prueba

```javascript
// Desde la consola del navegador (después de abrir la app)
const { supabase } = window;

// Hash de contraseña (ejemplo: "Test123456")
const passwordHash = await crypto.subtle.digest(
  'SHA-256', 
  new TextEncoder().encode('Test123456')
).then(buf => 
  Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
);

// Insertar usuario
await supabase.from('usuarios').insert({
  email: 'test@cpt.com',
  password_hash: passwordHash,
  nombre: 'Usuario de Prueba'
});
```

### Verificar Usuario

```sql
-- En Supabase SQL Editor
SELECT id, email, nombre, created_at 
FROM usuarios;
```

---

## ⚠️ Notas Importantes

### 1. Migración de Datos

Si ya tenías datos con Supabase Auth, necesitarás migrarlos:

```sql
-- Ejemplo de migración (ajusta según tus necesidades)
INSERT INTO usuarios (id, email, password_hash, nombre)
SELECT 
  id, 
  email, 
  'hash_temporal', -- Necesitarás resetear contraseñas
  raw_user_meta_data->>'nombre'
FROM auth.users;
```

### 2. Seguridad en Producción

Para producción, considera:

- ✅ Usar **bcrypt** en lugar de SHA-256
- ✅ Implementar **rate limiting** en login
- ✅ Agregar **verificación de email**
- ✅ Implementar **recuperación de contraseña**
- ✅ Usar **tokens JWT** en lugar de localStorage
- ✅ Agregar **2FA** (autenticación de dos factores)

### 3. Ventajas del Sistema Actual

- ✅ Control total sobre la autenticación
- ✅ No depende de Supabase Auth
- ✅ Fácil de personalizar
- ✅ Sin límites de usuarios (plan free de Supabase)
- ✅ Datos de usuarios en tu propia tabla

### 4. Desventajas

- ⚠️ Menos seguro que Supabase Auth (sin bcrypt)
- ⚠️ No tiene verificación de email automática
- ⚠️ No tiene recuperación de contraseña
- ⚠️ Sesión en localStorage (vulnerable a XSS)

---

## 🔄 Volver a Supabase Auth (Opcional)

Si prefieres usar Supabase Auth, puedes:

1. Restaurar el `supabase-schema.sql` original
2. Restaurar el `AuthContext.jsx` original
3. Habilitar RLS en las tablas
4. Usar `auth.users` en lugar de `usuarios`

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que ejecutaste el nuevo schema SQL
2. Verifica que las tablas antiguas fueron eliminadas
3. Revisa la consola del navegador para errores
4. Verifica que el `.env` esté configurado correctamente

---

**Última actualización**: Febrero 8, 2026
