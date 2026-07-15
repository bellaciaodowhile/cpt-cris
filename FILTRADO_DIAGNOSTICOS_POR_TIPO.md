# 🎯 Filtrado de Diagnósticos por Tipo de Consulta

Se ha corregido el filtrado de diagnósticos para que aparezcan **solamente** los que sean compatibles con el tipo de consulta seleccionado.

## 🔍 Cómo funciona

### Flujo de filtrado:

1. **Usuario selecciona tipo** en el selector visual
   - Consultorio ← formData.tipo_paciente = 'Consultorio'
   - Terreno ← formData.tipo_paciente = 'Terreno'

2. **Se actualiza tipoConsulta**
   - useEffect detecta cambio en formData.tipo_paciente
   - Actualiza estado tipoConsulta

3. **Se cargan diagnósticos filtrados**
   - useEffect detecta cambio en tipoConsulta
   - Llama a getDiagnosticosParaTipo(userId, tipoConsulta)
   - Filtra diagnósticos según tipo

4. **Se muestran solo diagnósticos compatibles**
   - Diagnósticos con tipo = tipoConsulta (ej: 'Consultorio')
   - Diagnósticos con tipo = 'Ambos'
   - Categorías con tipo compatible
   - Diagnósticos sin categoría que son compatibles

## 📋 Criterios de filtrado

### Para cada diagnóstico:
```
¿Es compatible? = 
  (diagnóstico.tipo === tipoConsulta) OR 
  (diagnóstico.tipo === 'Ambos')
```

### Para cada categoría:
```
¿Es compatible? = 
  (categoría.tipo === tipoConsulta) OR 
  (categoría.tipo === 'Ambos')
```

## 📊 Ejemplos

### Caso 1: Usuario selecciona "Consultorio"

**Diagnósticos visibles:**
```
✅ Diagnóstico "Hipertensión" con tipo = 'Consultorio'
✅ Diagnóstico "Diabetes" con tipo = 'Ambos'
❌ Diagnóstico "Paludismo" con tipo = 'Terreno'
```

**Categorías visibles:**
```
✅ Categoría "Enfermedades Crónicas" con tipo = 'Consultorio'
✅ Categoría "Comunes" con tipo = 'Ambos'
❌ Categoría "Tropicales" con tipo = 'Terreno'
```

### Caso 2: Usuario selecciona "Terreno"

**Diagnósticos visibles:**
```
❌ Diagnóstico "Hipertensión" con tipo = 'Consultorio'
✅ Diagnóstico "Diabetes" con tipo = 'Ambos'
✅ Diagnóstico "Paludismo" con tipo = 'Terreno'
```

**Categorías visibles:**
```
❌ Categoría "Enfermedades Crónicas" con tipo = 'Consultorio'
✅ Categoría "Comunes" con tipo = 'Ambos'
✅ Categoría "Tropicales" con tipo = 'Terreno'
```

## 🔄 Cambios técnicos

### En diagnosticosUtils.js

**Función:** `getDiagnosticosParaTipo(userId, tipoConsulta)`

```javascript
// 1. Obtiene todos los diagnósticos del usuario
const { data: diagnosticosPersonalizados } = await supabase
  .from('diagnosticos_personalizados')
  .select(...)
  .eq('user_id', userId)
  .eq('activo', true);

// 2. Filtra en JavaScript (lado del cliente)
diagnosticosPersonalizados.forEach(diagnostico => {
  // Verificar compatibilidad del diagnóstico
  const compatible = 
    diagnostico.tipo === tipoConsulta || 
    diagnostico.tipo === 'Ambos';
  
  if (!compatible) return; // Saltear si no es compatible
  
  // Verificar compatibilidad de la categoría (si existe)
  if (diagnostico.categoria) {
    const categoriaCompatible = 
      diagnostico.categoria.tipo === tipoConsulta || 
      diagnostico.categoria.tipo === 'Ambos';
    
    if (categoriaCompatible) {
      // Agregar a porCategoria
    }
  } else {
    // Agregar a sinCategoria
  }
});
```

### En NuevaConsulta.jsx

**useEffect nuevo:**
```javascript
// Actualizar tipoConsulta cuando cambia tipo_paciente
useEffect(() => {
  if (modoRegistro === 'nuevo') {
    setTipoConsulta(formData.tipo_paciente);
  }
}, [formData.tipo_paciente, modoRegistro]);
```

Este useEffect se dispara **inmediatamente** cuando el usuario hace clic en el selector visual.

## ✅ Verificación

Para verificar que el filtrado funciona:

1. **Abre Nueva Consulta**
2. **Haz clic en "Consultorio"**
   - Verifica que solo ves diagnósticos de Consultorio + Ambos
   - Verifica que solo ves categorías de Consultorio + Ambos
3. **Haz clic en "Terreno"**
   - Verifica que solo ves diagnósticos de Terreno + Ambos
   - Verifica que solo ves categorías de Terreno + Ambos
4. **Vuelve a "Consultorio"**
   - Verifica que los diagnósticos cambian nuevamente

## 🐛 Si no funciona

**Problema:** Los diagnósticos no cambian cuando selecciono tipo

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa que no haya errores en la consola
3. Verifica que `tipoConsulta` está cambiando
4. Verifica que `getDiagnosticosParaTipo` está siendo llamado

**Para debuggear:**
```javascript
// En NuevaConsulta.jsx, agrega logs temporales:
useEffect(() => {
  console.log('Tipo consulta cambió a:', tipoConsulta);
  console.log('Cargando diagnósticos para tipo:', tipoConsulta);
  if (user && tipoConsulta) {
    loadDiagnosticosDisponibles();
  }
}, [user, tipoConsulta]);
```

## 📝 Checklist

- ✅ Los diagnósticos se filtran por tipo
- ✅ Las categorías se filtran por tipo
- ✅ Solo aparecen diagnósticos compatibles
- ✅ Los cambios son inmediatos (sin recargar página)
- ✅ Funciona en ambos tipos (Consultorio y Terreno)

## 📚 Archivos modificados

- `src/utils/diagnosticosUtils.js` - Lógica de filtrado mejorada
- `src/pages/NuevaConsulta.jsx` - useEffect adicional para recargar diagnósticos

---

**El filtrado de diagnósticos por tipo ahora funciona correctamente.** ✅
