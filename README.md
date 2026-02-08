# Sistema CPT - Consultorios Populares

Aplicación web mobile-first para gestión de consultas médicas en Consultorios Populares de Tratamiento (CPT).

## 🚀 Características

- ✅ **Autenticación** con Supabase
- ✅ **Registro de Consultas Inteligente**
  - Clasificación automática por horario (Consultorio/Terreno)
  - Cálculo automático de rangos de edad
  - Selector múltiple de enfermedades predeterminadas
- ✅ **Sistema de Búsqueda y Filtros**
  - Búsqueda por cédula de paciente
  - Filtros por rango de fechas
- ✅ **Dashboard con Estadísticas**
  - Gráficos de pacientes atendidos (día/semana/mes)
  - Gráficos de incidencia de enfermedades
  - Tabla de morbilidad (Enfermedad x Edad x Sexo)
- ✅ **CRUD de Médicos** con MPPS
- ✅ **Configuración de CPT** (Nombre y Tipo)
- ✅ **Diseño Mobile-First** con navegación inferior
- ✅ **Skeleton Screens** y estados de carga

## 🛠️ Stack Tecnológico

- **Frontend**: React.js 19 + Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Backend**: Supabase (Auth + PostgreSQL)
- **Gráficos**: Recharts
- **Fechas**: date-fns + date-fns-tz (Timezone: America/Caracas)
- **Routing**: React Router DOM

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

3. Completa las variables de entorno en `.env`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Crear las tablas en Supabase

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido del archivo `supabase-schema.sql`

Esto creará:
- Tabla `cpt_config` (configuración del consultorio)
- Tabla `medicos` (médicos registrados)
- Tabla `consultas` (registro de consultas)
- Índices para optimizar consultas
- Políticas de seguridad (RLS)
- Triggers automáticos

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📱 Uso de la Aplicación

### Primer Uso

1. **Registro**: Crea una cuenta con tu correo electrónico
2. **Configuración**: Completa el nombre y tipo de tu CPT en la sección Perfil
3. **Médicos**: Registra los médicos que trabajarán en el consultorio
4. **Consultas**: Comienza a registrar consultas

### Registro de Consultas

El formulario de consultas incluye:

- **Datos del Paciente**:
  - Nacionalidad (V/E)
  - Cédula
  - Sexo (M/F)
  - Fecha de nacimiento (calcula automáticamente el rango de edad)
  - Etnia (opcional)
  - Discapacidad (Sí/No)

- **Datos de la Consulta**:
  - Fecha y hora (clasifica automáticamente Consultorio/Terreno)
  - Médico tratante
  - Diagnóstico (selector múltiple + campo libre)

### Clasificación Automática

- **Consultorio**: 07:00 - 12:00
- **Terreno**: 13:00 - 16:00

### Rangos de Edad

El sistema calcula automáticamente el rango según la fecha de nacimiento:
- <1, 1-4, 5-6, 7-9, 10-11, 12-14, 15-19, 20-24, 25-44, 45-59, 60-64, 65+, Edad Ignorada

### Enfermedades Predeterminadas

- HTA
- Diabetes
- Síndrome Febril
- Asma
- Parasitismo

## 📊 Dashboard

El dashboard incluye:

1. **Gráfico de Pacientes Atendidos**
   - Vista por día, semana o mes
   - Filtrable por rango de fechas

2. **Gráfico de Incidencia de Enfermedades**
   - Muestra la frecuencia de cada enfermedad predeterminada

3. **Tabla de Morbilidad**
   - Matriz cruzada: Enfermedad x Rango de Edad x Sexo
   - Totales por sexo

## 🎨 Paleta de Colores

- **Primary**: #3C50E0 (Azul)
- **Secondary**: #1C2434 (Azul oscuro)
- **Light**: #F1F5F9 (Gris claro)

## 📱 Navegación

La aplicación usa un menú de navegación inferior fijo con 5 secciones:

- 🏠 **Inicio**: Dashboard principal con estadísticas
- 📄 **Consultas**: Lista y registro de consultas
- 📊 **Dashboard**: Gráficos y reportes
- 🩺 **Médicos**: Gestión de médicos
- 👤 **Perfil**: Configuración y cierre de sesión

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) habilitado
- Cada usuario solo puede ver y modificar sus propios datos
- Políticas de seguridad a nivel de base de datos

## 🚀 Producción

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📝 Notas Importantes

- La aplicación usa la zona horaria `America/Caracas` para todas las fechas
- Los datos se almacenan en UTC en la base de datos
- Se recomienda hacer backups regulares de la base de datos
- El sistema está optimizado para dispositivos móviles pero funciona en desktop

## 🤝 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Consultorios Populares de Venezuela**
