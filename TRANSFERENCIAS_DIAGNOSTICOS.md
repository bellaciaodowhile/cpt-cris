# Transferencias de Diagnósticos

## Descripción

Se ha mejorado el módulo de Diagnósticos con nuevas funcionalidades para una mejor organización:

### 1. **TreeView - Visualización Jerárquica**
- Vista en árbol de todas las categorías y sus diagnósticos
- Expandir/contraer categorías para ver los diagnósticos que contienen
- Muestra el número de diagnósticos en cada categoría
- Interfaz intuitiva y fácil de navegar
- **Botones de edición y eliminación de categorías** directamente en el TreeView

### 2. **Modo Selección en TreeView**
- Botón "Modo Selección" en el TreeView para activar/desactivar
- Cuando está activado, puedes seleccionar diagnósticos mediante checkboxes
- **Característica importante**: Si seleccionas una categoría (padre), se seleccionan automáticamente todos los diagnósticos dentro de ella
- Si deseleccionas una categoría, se deseleccionan todos sus diagnósticos
- Indicador visual de selecciones parciales (algunos diagnósticos seleccionados)
- Los botones de edición/eliminación se ocultan en modo selección

### 3. **Transferencias de Diagnósticos**
- Botón "Transferir" aparece **SOLO cuando hay diagnósticos seleccionados**
- Muestra el contador de diagnósticos seleccionados
- Efecto visual con animación pulse para llamar la atención
- Permite transferir diagnósticos seleccionados a otra categoría
- Puedes transferir a una categoría existente o remover de categoría ("Sin categoría")
- Ideal para reorganizar tus diagnósticos sin necesidad de editarlos uno a uno

### 4. **Gestión de Categorías Mejorada**
- **Editar categorías**: Botón lápiz en el TreeView. Permite cambiar nombre, descripción, color y tipo
- **Eliminar categorías**: Botón papelera en el TreeView. Con confirmación de seguridad
- Los botones aparecen en la fila de cada categoría (en modo Vista, no en modo Selección)
- Acceso rápido sin necesidad de ir a un listado separado

### 5. **Edición y Eliminación de Diagnósticos**
- Editar diagnósticos: Cambia nombre, descripción, categoría y tipo
- Eliminar diagnósticos: Confirmación antes de eliminar

## Cómo Usar

### Transferir Diagnósticos (Nueva Característica)

1. **Activar Modo Selección**:
   - En el TreeView, haz clic en el botón "Modo Selección"
   - Los checkboxes aparecerán al lado de cada categoría y diagnóstico

2. **Seleccionar Diagnósticos**:
   - Haz clic en el checkbox de una categoría para seleccionar TODOS sus diagnósticos
   - O selecciona diagnósticos individuales
   - Los diagnósticos seleccionados se resaltarán en azul

3. **Transferir** (el botón aparece automáticamente):
   - El botón "Transferir" aparece en la barra superior una vez hayas seleccionado diagnósticos
   - Muestra el número de diagnósticos seleccionados: "Transferir (5)"
   - Haz clic en él
   - Se abrirá un modal mostrando los diagnósticos seleccionados
   - Selecciona la categoría de destino
   - Haz clic en "Transferir" para confirmar

4. **Ver Cambios**:
   - Los diagnósticos se reorganizarán automáticamente
   - El TreeView se actualizará inmediatamente

### Editar o Eliminar Categorías

1. **Modo Vista** (no modo selección)
2. **En el TreeView**, cada categoría tiene dos botones pequeños a la derecha:
   - **Lápiz azul**: Editar categoría
   - **Papelera roja**: Eliminar categoría
3. Haz clic en editar para cambiar nombre, descripción, color o tipo
4. Haz clic en eliminar para remover la categoría (con confirmación)

### Ejemplo Práctico

Si tienes:
```
Categoría A
  ├─ Enfermedad 1
  ├─ Enfermedad 2
  └─ Enfermedad 3

Categoría B
  └─ Enfermedad 4
```

Y seleccionas la Categoría A (en modo selección) y haces clic en "Transferir (3)" a "Categoría B":

```
Categoría A
  (vacía)

Categoría B
  ├─ Enfermedad 1
  ├─ Enfermedad 2
  ├─ Enfermedad 3
  └─ Enfermedad 4
```

## Características del TreeView

### Vista Normal
- Expandir/contraer categorías
- Ver diagnósticos dentro de cada categoría
- Descripción de cada categoría y diagnóstico
- Número de diagnósticos en cada categoría
- **Botones de edición y eliminación rápida**

### Modo Selección
- Checkboxes aparecen en todas las opciones
- Seleccionar categoría = seleccionar todos sus diagnósticos
- Indicadores visuales de selección parcial
- Cambio de color de fondo para elementos seleccionados
- Los botones de acción se ocultan

## Gestión de Categorías

### Crear Nueva Categoría
1. Haz clic en "Nueva Categoría"
2. Rellena nombre, descripción (opcional), color y tipo
3. Haz clic en "Guardar"

### Editar Categoría (Directo desde TreeView)
1. En el TreeView, haz clic en el botón lápiz azul de la categoría
2. Cambia los datos necesarios en el modal que aparece
3. Haz clic en "Actualizar"

### Eliminar Categoría (Directo desde TreeView)
1. En el TreeView, haz clic en el botón papelera roja de la categoría
2. Confirma la eliminación
3. La categoría se eliminará (los diagnósticos quedarán sin categoría)

## Notas Importantes

- Las transferencias no afectan el tipo (Consultorio/Terreno/Ambos) de los diagnósticos
- Puedes trasladar diagnósticos entre categorías de diferentes tipos
- Los diagnósticos siempre mantienen su información original
- La operación es instantánea (se sincroniza con la base de datos)
- El botón "Transferir" solo aparece cuando hay selecciones activas
- Los botones de edición/eliminación de categorías desaparecen en modo selección

## Archivos Modificados

- `src/pages/Diagnosticos.jsx` - Interfaz principal con transferencias y gestión
- `src/components/DiagnosticosTreeView.jsx` - Componente TreeView mejorado
- `diagnosticos-schema.sql` - Schema sin cambios (compatible)
