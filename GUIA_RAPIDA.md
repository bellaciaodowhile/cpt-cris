# 🚀 Guía Rápida de Inicio - CPT Sistema

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
cd cpt-app
npm install --legacy-peer-deps
```

### 2. Configurar Supabase

**Opción A: Crear nuevo proyecto**
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Copia las credenciales (URL y anon key)
3. Ejecuta el script SQL de `supabase-schema.sql`

**Opción B: Usar proyecto existente**
1. Obtén las credenciales de tu proyecto
2. Ejecuta el script SQL si no lo has hecho

### 3. Configurar Variables de Entorno
```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env y agrega tus credenciales
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Iniciar la Aplicación
```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`

## 📱 Primer Uso

### Paso 1: Crear Cuenta
1. Haz clic en el formulario de login
2. Ingresa tu correo y contraseña
3. Haz clic en "Iniciar Sesión" (se creará automáticamente si no existe)

### Paso 2: Configurar CPT
1. Ve a la pestaña "Perfil" (👤)
2. Completa:
   - Nombre del CPT: `CPT Los Rosales`
   - Tipo: `Urbano`
3. Guarda

### Paso 3: Registrar Médicos
1. Ve a la pestaña "Médicos" (🩺)
2. Haz clic en "Nuevo"
3. Completa los datos:
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - MPPS: `12345678`
   - Especialidad: `Medicina General`
4. Guarda

### Paso 4: Registrar Primera Consulta
1. Ve a la pestaña "Consultas" (📄)
2. Haz clic en "Nueva"
3. Completa el formulario:
   - **Paciente**: V-12345678, Masculino, Fecha de nacimiento
   - **Consulta**: Selecciona médico y fecha/hora
   - **Diagnóstico**: Marca "HTA"
4. Guarda

### Paso 5: Ver Dashboard
1. Ve a la pestaña "Dashboard" (📊)
2. Verás gráficos con tus datos
3. Ajusta los filtros de fecha según necesites

## 🎯 Funcionalidades Clave

### Registro de Consultas
- ✅ Clasificación automática Consultorio/Terreno según hora
- ✅ Cálculo automático de rango de edad
- ✅ Selector múltiple de enfermedades
- ✅ Campo libre para diagnósticos adicionales

### Búsqueda y Filtros
- 🔍 Buscar por cédula de paciente
- 📅 Filtrar por rango de fechas
- 📊 Vista por día, semana o mes

### Dashboard
- 📈 Gráfico de pacientes atendidos
- 🦠 Gráfico de incidencia de enfermedades
- 📋 Tabla de morbilidad (Enfermedad x Edad x Sexo)

## ⏰ Clasificación de Horarios

| Horario | Tipo |
|---------|------|
| 07:00 - 12:00 | Consultorio |
| 13:00 - 16:00 | Terreno |

## 📊 Rangos de Edad

El sistema calcula automáticamente:
- <1, 1-4, 5-6, 7-9, 10-11, 12-14
- 15-19, 20-24, 25-44, 45-59, 60-64, 65+

## 🏥 Enfermedades Predeterminadas

- HTA
- Diabetes
- Síndrome Febril
- Asma
- Parasitismo

## 🎨 Navegación

La app tiene 5 secciones principales:

| Icono | Sección | Función |
|-------|---------|---------|
| 🏠 | Inicio | Resumen y estadísticas rápidas |
| 📄 | Consultas | Lista y registro de consultas |
| 📊 | Dashboard | Gráficos y reportes detallados |
| 🩺 | Médicos | Gestión de médicos (CRUD) |
| 👤 | Perfil | Configuración y cierre de sesión |

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Linter
npm run lint
```

## 📱 Diseño Mobile-First

La aplicación está optimizada para móviles:
- ✅ Navegación inferior fija
- ✅ Formularios adaptados a pantallas pequeñas
- ✅ Gráficos responsivos
- ✅ Tablas con scroll horizontal

## 🐛 Solución Rápida de Problemas

### No puedo iniciar sesión
- Verifica que Supabase esté configurado
- Revisa las variables de entorno en `.env`
- Verifica que el script SQL se haya ejecutado

### No veo mis datos
- Asegúrate de estar autenticado
- Verifica que las políticas RLS estén activas
- Revisa la consola del navegador (F12)

### Error al instalar dependencias
- Usa `npm install --legacy-peer-deps`
- Verifica que tengas Node.js 18+ instalado

### Los gráficos no se muestran
- Verifica que tengas datos en el rango de fechas seleccionado
- Ajusta los filtros de fecha
- Recarga la página

## 📚 Documentación Completa

- `README.md` - Documentación general
- `SUPABASE_SETUP.md` - Configuración detallada de Supabase
- `DATOS_PRUEBA.md` - Datos de ejemplo para pruebas
- `supabase-schema.sql` - Script de base de datos

## 🆘 Soporte

Si tienes problemas:
1. Revisa la documentación completa
2. Verifica la consola del navegador (F12)
3. Revisa los logs de Supabase
4. Contacta al equipo de desarrollo

## ✅ Checklist de Verificación

Antes de usar en producción, verifica:

- [ ] Supabase configurado correctamente
- [ ] Variables de entorno configuradas
- [ ] Script SQL ejecutado
- [ ] Políticas RLS activas
- [ ] Backup configurado
- [ ] Email de confirmación configurado (opcional)
- [ ] Datos de prueba eliminados
- [ ] Aplicación compilada (`npm run build`)

## 🎉 ¡Listo!

Tu sistema CPT está configurado y listo para usar. Comienza registrando consultas y generando reportes epidemiológicos automáticos.

---

**Desarrollado con ❤️ para Consultorios Populares de Venezuela**
