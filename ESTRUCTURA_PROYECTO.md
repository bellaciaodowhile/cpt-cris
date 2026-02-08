# 📁 Estructura del Proyecto CPT Sistema

```
cpt-app/
│
├── public/                          # Archivos públicos estáticos
│   └── vite.svg                     # Logo de Vite
│
├── src/                             # Código fuente de la aplicación
│   │
│   ├── assets/                      # Recursos estáticos (imágenes, etc.)
│   │   └── react.svg
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── Layout.jsx              # Layout principal con navegación
│   │   ├── LoadingSpinner.jsx      # Spinner de carga
│   │   ├── ProtectedRoute.jsx      # HOC para rutas protegidas
│   │   └── SkeletonCard.jsx        # Skeleton screen para carga
│   │
│   ├── context/                     # Contextos de React
│   │   └── AuthContext.jsx         # Contexto de autenticación
│   │
│   ├── lib/                         # Librerías y configuraciones
│   │   └── supabase.js             # Cliente de Supabase
│   │
│   ├── pages/                       # Páginas de la aplicación
│   │   ├── Consultas.jsx           # Lista de consultas con filtros
│   │   ├── Dashboard.jsx           # Dashboard con gráficos
│   │   ├── Home.jsx                # Página de inicio
│   │   ├── Login.jsx               # Página de login
│   │   ├── Medicos.jsx             # CRUD de médicos
│   │   ├── NuevaConsulta.jsx       # Formulario de nueva consulta
│   │   └── Perfil.jsx              # Perfil y configuración
│   │
│   ├── utils/                       # Utilidades y funciones helper
│   │   ├── ageRanges.js            # Función getAgeRange() y constantes
│   │   └── consultaUtils.js        # Utilidades para consultas
│   │
│   ├── App.css                      # Estilos del componente App
│   ├── App.jsx                      # Componente principal con routing
│   ├── index.css                    # Estilos globales con Tailwind
│   └── main.jsx                     # Punto de entrada de la app
│
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── eslint.config.js                 # Configuración de ESLint
├── index.html                       # HTML principal
├── package.json                     # Dependencias y scripts
├── package-lock.json                # Lock de dependencias
├── postcss.config.js                # Configuración de PostCSS
├── tailwind.config.js               # Configuración de Tailwind CSS
├── vite.config.js                   # Configuración de Vite
│
├── supabase-schema.sql              # Script SQL para crear tablas
│
├── README.md                        # Documentación principal
├── SUPABASE_SETUP.md               # Guía de configuración de Supabase
├── DATOS_PRUEBA.md                 # Datos de ejemplo para pruebas
├── GUIA_RAPIDA.md                  # Guía rápida de inicio
└── ESTRUCTURA_PROYECTO.md          # Este archivo
```

## 📦 Dependencias Principales

### Producción
```json
{
  "react": "^19.2.0",                    // Framework UI
  "react-dom": "^19.2.0",                // React DOM
  "react-router-dom": "^6.22.0",         // Routing
  "@supabase/supabase-js": "^2.39.7",    // Cliente Supabase
  "recharts": "^2.12.0",                 // Gráficos
  "date-fns": "^2.30.0",                 // Manejo de fechas
  "date-fns-tz": "^2.0.0",               // Zonas horarias
  "lucide-react": "^0.344.0"             // Iconos
}
```

### Desarrollo
```json
{
  "@vitejs/plugin-react": "^5.1.1",     // Plugin React para Vite
  "autoprefixer": "^10.4.17",            // PostCSS autoprefixer
  "eslint": "^9.39.1",                   // Linter
  "postcss": "^8.4.35",                  // PostCSS
  "tailwindcss": "^3.4.1",               // Framework CSS
  "vite": "npm:rolldown-vite@7.2.5"      // Build tool
}
```

## 🗂️ Descripción de Archivos Clave

### Configuración

| Archivo | Descripción |
|---------|-------------|
| `vite.config.js` | Configuración del bundler Vite |
| `tailwind.config.js` | Configuración de Tailwind CSS (colores, tema) |
| `postcss.config.js` | Configuración de PostCSS para Tailwind |
| `eslint.config.js` | Reglas de linting |
| `.env.example` | Template de variables de entorno |

### Código Fuente

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `src/main.jsx` | Punto de entrada, renderiza App | ~10 |
| `src/App.jsx` | Routing principal de la aplicación | ~40 |
| `src/index.css` | Estilos globales con Tailwind | ~15 |

### Componentes

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `Layout.jsx` | Layout con navegación inferior | ~50 |
| `LoadingSpinner.jsx` | Spinner animado | ~20 |
| `ProtectedRoute.jsx` | Protección de rutas | ~20 |
| `SkeletonCard.jsx` | Skeleton para carga | ~15 |

### Contextos

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `AuthContext.jsx` | Manejo de autenticación | ~60 |

### Páginas

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `Login.jsx` | Formulario de login | ~80 |
| `Home.jsx` | Dashboard principal | ~100 |
| `Consultas.jsx` | Lista de consultas | ~150 |
| `NuevaConsulta.jsx` | Formulario de consulta | ~250 |
| `Dashboard.jsx` | Gráficos y reportes | ~200 |
| `Medicos.jsx` | CRUD de médicos | ~180 |
| `Perfil.jsx` | Configuración de usuario | ~120 |

### Utilidades

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `ageRanges.js` | Función getAgeRange() | ~40 |
| `consultaUtils.js` | Utilidades de consultas | ~50 |
| `supabase.js` | Cliente de Supabase | ~10 |

### Base de Datos

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `supabase-schema.sql` | Schema completo de BD | ~150 |

### Documentación

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Documentación completa del proyecto |
| `SUPABASE_SETUP.md` | Guía paso a paso de Supabase |
| `DATOS_PRUEBA.md` | Datos de ejemplo para testing |
| `GUIA_RAPIDA.md` | Inicio rápido en 5 minutos |
| `ESTRUCTURA_PROYECTO.md` | Este archivo |

## 🎨 Arquitectura de Componentes

```
App (Router)
│
├── Login (Pública)
│
└── Layout (Protegida)
    ├── Navegación Inferior
    │   ├── Home
    │   ├── Consultas
    │   ├── Dashboard
    │   ├── Médicos
    │   └── Perfil
    │
    └── Outlet (Contenido)
        ├── Home
        │   └── Cards de estadísticas
        │
        ├── Consultas
        │   ├── Filtros
        │   └── Lista de consultas
        │
        ├── NuevaConsulta
        │   ├── Formulario paciente
        │   ├── Formulario consulta
        │   └── Selector diagnóstico
        │
        ├── Dashboard
        │   ├── Filtros
        │   ├── Gráfico pacientes
        │   ├── Gráfico enfermedades
        │   └── Tabla morbilidad
        │
        ├── Medicos
        │   ├── Formulario CRUD
        │   └── Lista de médicos
        │
        └── Perfil
            ├── Info usuario
            ├── Config CPT
            └── Cerrar sesión
```

## 🗄️ Estructura de Base de Datos

```
Supabase Database
│
├── auth.users (Supabase Auth)
│   └── Usuarios autenticados
│
├── cpt_config
│   ├── id (PK)
│   ├── user_id (FK → auth.users)
│   ├── nombre_cpt
│   ├── tipo_cpt
│   └── timestamps
│
├── medicos
│   ├── id (PK)
│   ├── user_id (FK → auth.users)
│   ├── nombre
│   ├── apellido
│   ├── mpps
│   ├── especialidad
│   └── timestamps
│
└── consultas
    ├── id (PK)
    ├── user_id (FK → auth.users)
    ├── medico_id (FK → medicos)
    ├── cedula_paciente
    ├── nacionalidad
    ├── sexo
    ├── fecha_nacimiento
    ├── rango_edad
    ├── etnia
    ├── discapacidad
    ├── fecha_consulta
    ├── tipo_consulta
    ├── diagnostico
    └── timestamps
```

## 🔐 Flujo de Autenticación

```
Usuario → Login
    ↓
Supabase Auth
    ↓
Token JWT
    ↓
AuthContext
    ↓
ProtectedRoute
    ↓
Layout + Páginas
```

## 📊 Flujo de Datos

```
Usuario ingresa datos
    ↓
Formulario React
    ↓
Validación cliente
    ↓
Supabase Client
    ↓
Row Level Security
    ↓
PostgreSQL
    ↓
Respuesta
    ↓
Actualización UI
```

## 🎯 Patrones de Diseño Utilizados

1. **Context API**: Para estado global de autenticación
2. **Protected Routes**: HOC para proteger rutas
3. **Compound Components**: Layout con Outlet
4. **Custom Hooks**: useAuth()
5. **Controlled Components**: Formularios controlados
6. **Skeleton Screens**: Estados de carga
7. **Mobile-First**: Diseño responsive

## 📈 Métricas del Proyecto

- **Total de archivos**: ~30
- **Total de líneas de código**: ~2,000
- **Componentes React**: 13
- **Páginas**: 7
- **Utilidades**: 3
- **Tablas de BD**: 3
- **Políticas RLS**: 12

## 🚀 Flujo de Desarrollo

```
1. Clonar repositorio
2. Instalar dependencias (npm install --legacy-peer-deps)
3. Configurar Supabase
4. Crear .env con credenciales
5. Ejecutar script SQL
6. npm run dev
7. Desarrollar features
8. npm run build
9. Desplegar
```

## 📦 Build de Producción

```bash
npm run build
```

Genera:
```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── index.html
```

## 🌐 Despliegue

Compatible con:
- Vercel
- Netlify
- GitHub Pages
- Cualquier hosting estático

Variables de entorno requeridas:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

**Última actualización**: Febrero 2026
