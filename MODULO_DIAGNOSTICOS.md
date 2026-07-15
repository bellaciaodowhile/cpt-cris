# Módulo de Diagnósticos - Guía de Implementación

## Descripción

El módulo de Diagnósticos permite crear categorías de diagnósticos personalizados y asociarlos a tipos de consulta (Consultorio, Terreno o Ambos). Esto facilita la selección de diagnósticos relevantes al tipo de consulta que se está registrando.

## Características

✅ **Crear Categorías**: Organiza diagnósticos por categorías con colores personalizados
✅ **Crear Diagnósticos Personalizados**: Agrega diagnósticos específicos para tu práctica
✅ **Filtrar por Tipo**: Especifica si un diagnóstico es para Consultorio, Terreno o ambos
✅ **Integración con Nueva Consulta**: Los diagnósticos se filtran automáticamente según el tipo de consulta
✅ **Búsqueda y Filtros**: Busca diagnósticos por nombre, categoría o tipo

## Instalación

### Paso 1: Crear las tablas en Supabase

Ejecuta el siguiente SQL en tu editor SQL de Supabase:

```sql
-- Tabla de categorías de diagnósticos
CREATE TABLE categorias_diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nombre)
);

-- Tabla de diagnósticos personalizados
CREATE TABLE diagnosticos_personalizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_diagnosticos(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'Ambos' CHECK (tipo IN ('Consultorio', 'Terreno', 'Ambos')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nombre)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_categorias_diagnosticos_user_id ON categorias_diagnosticos(user_id);
CREATE INDEX idx_diagnosticos_personalizados_user_id ON diagnosticos_personalizados(user_id);
CREATE INDEX idx_diagnosticos_personalizados_categoria_id ON diagnosticos_personalizados(categoria_id);
CREATE INDEX idx_diagnosticos_personalizados_tipo ON diagnosticos_personalizados(tipo);
```

### Paso 2: Verificar archivos creados

Los siguientes archivos han sido creados/modificados:

#### Nuevos archivos:
- `src/pages/Diagnosticos.jsx` - Página principal del módulo
- `src/utils/diagnosticosUtils.js` - Funciones utilitarias
- `diagnosticos-schema.sql` - Script SQL para crear tablas

#### Archivos modificados:
- `src/App.jsx` - Agregó importación y ruta
- `src/components/Layout.jsx` - Agregó enlace en navegación
- `src/pages/NuevaConsulta.jsx` - Integración de diagnósticos categorizados

## Uso

### Acceder al módulo

1. En la navegación lateral, haz clic en "Diagnósticos"
2. Se abrirá la página de gestión de diagnósticos

### Crear una categoría

1. Haz clic en el botón "Nueva Categoría"
2. Completa el formulario:
   - **Nombre**: Nombre descriptivo (ej: "Enfermedades Cardiovasculares")
   - **Descripción**: Opcional, proporciona contexto
   - **Color**: Selecciona un color para identificar la categoría
3. Haz clic en "Guardar"

### Crear un diagnóstico

1. Haz clic en el botón "Nuevo Diagnóstico"
2. Completa el formulario:
   - **Nombre**: Nombre del diagnóstico (ej: "Hipertensión arterial primaria")
   - **Descripción**: Detalles o notas adicionales
   - **Categoría**: Selecciona la categoría (opcional)
   - **Tipo de Consulta**: Elige:
     - **Solo Consultorio**: Disponible solo en consultas de consultorio (07:00-12:00)
     - **Solo Terreno**: Disponible solo en consultas de terreno (13:00-16:00)
     - **Ambos Tipos**: Disponible en ambos tipos de consulta
3. Haz clic en "Guardar"

### Filtrar diagnósticos

- **Búsqueda**: Escribe en el campo de búsqueda para filtrar por nombre o descripción
- **Por Categoría**: Usa el selector para filtrar por categoría específica
- **Por Tipo**: Usa el selector para filtrar por tipo de consulta

### Editar o eliminar

- Haz clic en "Editar" para modificar un diagnóstico o categoría
- Haz clic en "Eliminar" para eliminarlo (requiere confirmación)

## Integración en Nueva Consulta

Cuando registres una nueva consulta:

1. El tipo de consulta se determina automáticamente por la hora o se puede seleccionar manualmente
2. Los diagnósticos disponibles se filtran automáticamente según el tipo
3. Se muestran en las siguientes secciones:
   - **Enfermedades Predeterminadas**: Listado fijo de enfermedades estándar
   - **Diagnósticos Personalizados**: Organizados por categoría con colores
   - **Otros Diagnósticos Personalizados**: Sin categoría asignada
   - **Diagnóstico Adicional**: Texto libre para diagnósticos no listados

## Notas importantes

- Los diagnósticos personalizados complementan (no reemplazan) las enfermedades predeterminadas
- Los diagnósticos filtrados se basan en el tipo de consulta seleccionado
- Puedes cambiar el tipo de consulta en cualquier momento durante el registro
- Las categorías son privadas de cada usuario
- Las enfermedades predeterminadas siempre están disponibles

## Estructura de datos

### Tabla: categorias_diagnosticos
```
id: UUID (Primary Key)
user_id: UUID (Foreign Key a usuarios)
nombre: TEXT (único por usuario)
descripcion: TEXT
color: TEXT (código hexadecimal)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Tabla: diagnosticos_personalizados
```
id: UUID (Primary Key)
user_id: UUID (Foreign Key a usuarios)
categoria_id: UUID (Foreign Key a categorias_diagnosticos, nullable)
nombre: TEXT (único por usuario)
descripcion: TEXT
tipo: TEXT ('Consultorio', 'Terreno', 'Ambos')
activo: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## Ejemplo de uso

1. **Crear una categoría** "Infecciones Respiratorias" con color azul
2. **Crear diagnósticos** bajo esta categoría:
   - "Bronquitis aguda" - Ambos tipos
   - "Neumonía bacteriana" - Ambos tipos
   - "Síndrome de tos crónica" - Solo Consultorio
3. **Crear una categoría** "Enfermedades Tropicales" con color verde
4. **Crear diagnósticos** bajo esta categoría:
   - "Paludismo" - Solo Terreno
   - "Dengue" - Ambos tipos

Cuando registres una consulta de "Terreno", verás solo los diagnósticos relevantes para ese tipo.

## Troubleshooting

### Los diagnósticos no aparecen en Nueva Consulta

Verifica que:
1. Las tablas estén creadas correctamente en Supabase
2. El usuario tenga diagnósticos personalizados creados
3. El tipo de consulta sea compatible con el diagnóstico

### Error al crear un diagnóstico

Asegúrate de:
1. El nombre sea único para ese usuario
2. La categoría seleccionada exista
3. Tengas conexión a la base de datos
