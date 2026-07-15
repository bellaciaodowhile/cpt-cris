# 🎯 Selector de Tipo de Consulta - Nueva Consulta

Se ha implementado un selector visual e intuitivo del tipo de consulta al inicio del formulario de Nueva Consulta.

## 📍 Ubicación

**Página:** `Nueva Consulta`  
**Posición:** Al inicio del formulario, antes de "Datos del Paciente"  
**Componente:** `src/pages/NuevaConsulta.jsx`

## 🎨 Diseño Visual

El selector muestra dos opciones como tarjetas interactivas:

```
┌─────────────────────────────────────────────────────────────┐
│  Selecciona el tipo de consulta                             │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ 🏢 Consultorio       │  │ 📍 Terreno           │       │
│  │ ⭕ Seleccionado      │  │ ○ No seleccionado    │       │
│  │                      │  │                      │       │
│  │ Horario: 07:00-12:00 │  │ Horario: 13:00-16:00 │       │
│  │ Meta diaria: 10      │  │ Meta diaria: 55      │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Características

✅ **Intuitivo** - Iconos y colores claros (azul para Consultorio, verde para Terreno)  
✅ **Interactivo** - Se puede hacer clic en cualquier parte de la tarjeta  
✅ **Visual feedback** - Cambios de color y sombra al seleccionar  
✅ **Información** - Muestra horario y meta diaria de cada tipo  
✅ **Responsivo** - Se adapta a pantallas pequeñas (apiladas en mobile)  
✅ **Animado** - Transiciones suaves entre estados  

## 🎯 Flujo de uso

1. **Usuario abre** "Nueva Consulta"
2. **Ve el selector** de tipo de consulta
3. **Hace clic** en la tarjeta deseada (Consultorio o Terreno)
4. **Se resalta** la opción seleccionada
5. **Se filtran** automáticamente los diagnósticos según el tipo
6. **Continúa** con el resto del formulario

## 💻 Cambios técnicos

### En NuevaConsulta.jsx

```javascript
// Se agregó selector visual al inicio del formulario
// El selector actualiza formData.tipo_paciente
// Que se usa para filtrar diagnósticos disponibles

// El selector también dispara loadDiagnosticosDisponibles()
// que filtra diagnósticos según el tipo seleccionado
```

### En diagnosticosUtils.js

```javascript
// La función getDiagnosticosParaTipo() ahora:
// 1. Filtra diagnósticos por tipo
// 2. Filtra categorías por tipo
// 3. Solo muestra categorías compatibles con el tipo
```

### En Diagnosticos.jsx

```javascript
// Las categorías ahora tienen un campo 'tipo'
// Se puede elegir: Consultorio, Terreno o Ambos
// Al crear/editar categoría se muestra selector de tipo
```

## 📊 Integración con categorías

Las **categorías** ahora también pueden categorizarse:

- **Solo Consultorio** - Solo para consultas de consultorio (07:00-12:00)
- **Solo Terreno** - Solo para consultas de terreno (13:00-16:00)
- **Ambos Tipos** - Disponibles en ambos tipos de consulta

## 🔄 Funcionamiento

### Cuando seleccionas "Consultorio":
1. ✅ Se filtra `tipo_consulta` a 'Consultorio'
2. ✅ Los diagnósticos se filtran por tipo
3. ✅ Las categorías se filtran por tipo
4. ✅ Solo ves diagnósticos para Consultorio

### Cuando seleccionas "Terreno":
1. ✅ Se filtra `tipo_consulta` a 'Terreno'
2. ✅ Los diagnósticos se filtran por tipo
3. ✅ Las categorías se filtran por tipo
4. ✅ Solo ves diagnósticos para Terreno

## 📝 Ejemplo

**Escenario:**
- Tienes categoría "Enfermedades Respiratorias" (tipo: Ambos)
- Tienes categoría "Enfermedades Tropicales" (tipo: Solo Terreno)

**Cuando seleccionas Consultorio:**
- ✅ Ves "Enfermedades Respiratorias"
- ❌ No ves "Enfermedades Tropicales"

**Cuando seleccionas Terreno:**
- ✅ Ves "Enfermedades Respiratorias"
- ✅ Ves "Enfermedades Tropicales"

## 🚀 Cómo usar

### Para usuarios:
1. Abre "Nueva Consulta"
2. Selecciona el tipo (Consultorio o Terreno)
3. Los diagnósticos se filtran automáticamente
4. Continúa con el formulario

### Para administradores:
1. Ve a "Diagnósticos"
2. Crea/edita categorías
3. Asigna tipo a cada categoría (Consultorio/Terreno/Ambos)
4. Los diagnósticos bajo esa categoría se heredan el tipo

## 🛠️ Cambios en base de datos

**Tabla:** `categorias_diagnosticos`

**Nuevo campo:**
```sql
tipo TEXT NOT NULL DEFAULT 'Ambos' 
CHECK (tipo IN ('Consultorio', 'Terreno', 'Ambos'))
```

**Migración necesaria:**
Ejecuta el archivo `migracion-categorias-tipo.sql` en Supabase

## ✅ Verificación

Después de implementar, verifica que:

✅ El selector aparece al inicio de Nueva Consulta  
✅ Se puede hacer clic en cada opción  
✅ Los diagnósticos se filtran correctamente  
✅ Las categorías filtran por tipo  
✅ Se ve correctamente en mobile  

## 📚 Archivos modificados

- `src/pages/NuevaConsulta.jsx` - Agregó selector visual
- `src/pages/Diagnosticos.jsx` - Agregó campo tipo a categorías
- `src/utils/diagnosticosUtils.js` - Filtrado por tipo de categoría
- `diagnosticos-schema.sql` - Agregó campo tipo
- `migracion-categorias-tipo.sql` - Migración para tablas existentes

## 🎉 Resultado

Ahora los usuarios tienen:

✅ **Selector visual intuitivo** del tipo de consulta  
✅ **Filtrado automático** de diagnósticos por tipo  
✅ **Categorías flexible** que pueden ser específicas por tipo  
✅ **Mejor experiencia** al crear consultas  

---

**El selector está implementado y listo para usar.** 🚀
