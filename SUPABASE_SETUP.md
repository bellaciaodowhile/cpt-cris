# Configuración de Supabase para CPT Sistema

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: CPT Sistema (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a Venezuela (ej: South America)
   - **Pricing Plan**: Free (para empezar)
5. Haz clic en "Create new project"
6. Espera unos minutos mientras se crea el proyecto

## Paso 2: Obtener las Credenciales

1. Una vez creado el proyecto, ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API**
3. Copia los siguientes valores:
   - **Project URL**: Esta es tu `VITE_SUPABASE_URL`
   - **anon public**: Esta es tu `VITE_SUPABASE_ANON_KEY`

## Paso 3: Configurar Variables de Entorno

1. En la carpeta raíz del proyecto, crea un archivo `.env`:

```bash
copy .env.example .env
```

2. Abre el archivo `.env` y completa con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Paso 4: Crear las Tablas en la Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en "New query"
3. Copia TODO el contenido del archivo `supabase-schema.sql`
4. Pégalo en el editor SQL
5. Haz clic en "Run" (▶️) para ejecutar el script

Esto creará:
- ✅ Tabla `cpt_config` (configuración del consultorio)
- ✅ Tabla `medicos` (médicos registrados)
- ✅ Tabla `consultas` (registro de consultas)
- ✅ Índices para optimizar consultas
- ✅ Políticas de seguridad (RLS)
- ✅ Triggers automáticos

## Paso 5: Verificar las Tablas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las 3 tablas creadas:
   - `cpt_config`
   - `medicos`
   - `consultas`

## Paso 6: Configurar Autenticación (Opcional)

Por defecto, Supabase permite registro con email. Si quieres personalizar:

1. Ve a **Authentication** > **Providers**
2. Configura los proveedores que desees (Email, Google, etc.)
3. En **Email Templates**, puedes personalizar los correos de confirmación

### Configuración Recomendada:

- **Email Auth**: Habilitado ✅
- **Confirm email**: Deshabilitado (para desarrollo) o Habilitado (para producción)
- **Secure email change**: Habilitado ✅

## Paso 7: Probar la Aplicación

1. Inicia la aplicación:

```bash
npm run dev
```

2. Abre tu navegador en `http://localhost:5173`
3. Crea una cuenta de prueba
4. Completa la configuración del CPT
5. Registra un médico
6. Crea tu primera consulta

## Estructura de las Tablas

### Tabla: cpt_config

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del usuario (FK) |
| nombre_cpt | TEXT | Nombre del consultorio |
| tipo_cpt | TEXT | Tipo (Urbano/Rural/Mixto) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### Tabla: medicos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del usuario (FK) |
| nombre | TEXT | Nombre del médico |
| apellido | TEXT | Apellido del médico |
| mpps | TEXT | Número MPPS |
| especialidad | TEXT | Especialidad (opcional) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

### Tabla: consultas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del usuario (FK) |
| medico_id | UUID | ID del médico (FK) |
| cedula_paciente | TEXT | Cédula del paciente |
| nacionalidad | TEXT | V o E |
| sexo | TEXT | M o F |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| rango_edad | TEXT | Rango calculado automáticamente |
| etnia | TEXT | Etnia (opcional) |
| discapacidad | TEXT | Sí o No |
| fecha_consulta | TIMESTAMP | Fecha y hora de la consulta |
| tipo_consulta | TEXT | Consultorio o Terreno |
| diagnostico | TEXT | Diagnóstico completo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de actualización |

## Seguridad (RLS)

El sistema implementa Row Level Security (RLS) para garantizar que:

- ✅ Cada usuario solo puede ver sus propios datos
- ✅ No se puede acceder a datos de otros consultorios
- ✅ Las políticas se aplican automáticamente a nivel de base de datos
- ✅ No es necesario validar permisos en el código frontend

## Backup y Mantenimiento

### Hacer Backup Manual

1. Ve a **Database** > **Backups**
2. Haz clic en "Create backup"
3. Espera a que se complete

### Restaurar Backup

1. Ve a **Database** > **Backups**
2. Selecciona el backup que deseas restaurar
3. Haz clic en "Restore"

### Monitoreo

1. Ve a **Database** > **Logs** para ver logs de consultas
2. Ve a **Auth** > **Users** para ver usuarios registrados
3. Ve a **Table Editor** para ver y editar datos directamente

## Límites del Plan Free

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB
- **Monthly Active Users**: Ilimitado

Para consultorios pequeños, el plan free es suficiente. Si necesitas más recursos, puedes actualizar a un plan de pago.

## Solución de Problemas

### Error: "Invalid API key"

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Row Level Security policy violation"

- Verifica que hayas ejecutado el script SQL completo
- Asegúrate de que las políticas RLS estén habilitadas
- Verifica que el usuario esté autenticado

### No se muestran datos

- Verifica que el usuario esté autenticado
- Revisa la consola del navegador para ver errores
- Verifica que las tablas tengan datos

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo.
