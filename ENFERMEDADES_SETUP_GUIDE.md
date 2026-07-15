# 🏥 Guía de Instalación: Enfermedades Predeterminadas en Base de Datos

## Resumen rápido

Se han creado las siguientes enfermedades predeterminadas como diagnósticos en la base de datos, organizadas en una categoría especial "Enfermedades Predeterminadas":

| # | Enfermedad |
|---|-----------|
| 1 | Hipertensión arterial |
| 2 | Cardiopatía isquémica |
| 3 | Enfermedad cerebrovascular |
| 4 | Asma bronquial |
| 5 | Diabetes mellitus |
| 6 | Tumores malignos |
| 7 | Epilepsia |
| 8 | Otras crónicas no transmisibles |
| 9 | Síndrome Febril |
| 10 | Parasitismo |
| 11 | Restos de las causas |

## Archivos SQL creados

### 1. `enfermedades-insertar-simple.sql` ⭐ USAR ESTE
**El script más simple y completo. Lo único que necesitas ejecutar.**

- ✅ Inserta todas las enfermedades en tabla base
- ✅ Crea trigger automático para nuevos usuarios
- ✅ Agrega enfermedades a usuarios existentes
- ✅ Listo para ejecutar directamente

### 2. `enfermedades-predeterminadas.sql`
Script completo con múltiples opciones y explicaciones detalladas.

### 3. `diagnosticos-schema.sql`
Schema de las tablas principales (ya ejecutado probablemente).

## Cómo instalar

### Paso 1: Acceder a Supabase SQL

1. Abre tu proyecto en [Supabase](https://app.supabase.com)
2. Ve a la sección **SQL Editor** en el menú izquierdo
3. Haz clic en **New Query**

### Paso 2: Copiar y ejecutar

1. Abre el archivo `enfermedades-insertar-simple.sql`
2. Copia TODO el contenido
3. En Supabase SQL Editor, pega el contenido
4. Presiona el botón **▶ Run** (o usa Ctrl+Enter)

### Paso 3: Verificar

Ejecuta esta consulta para verificar que se insertó correctamente:

```sql
SELECT 
  cd.nombre as categoria,
  COUNT(dp.id) as total_enfermedades
FROM categorias_diagnosticos cd
LEFT JOIN diagnosticos_personalizados dp ON cd.id = dp.categoria_id
WHERE cd.nombre = 'Enfermedades Predeterminadas'
GROUP BY cd.nombre;
```

**Resultado esperado:**
```
categoria                      | total_enfermedades
Enfermedades Predeterminadas   | 11
```

## Qué hace el script

El script `enfermedades-insertar-simple.sql`:

1. **Crea tabla base** (`enfermedades_base`)
   - Almacena las 11 enfermedades como referencia

2. **Inserta enfermedades** en la tabla base
   - Todas configuradas como tipo "Ambos"
   - Con descripciones útiles

3. **Crea función trigger** (`crear_enfermedades_predeterminadas`)
   - Se ejecuta automáticamente cuando se registra un nuevo usuario
   - Crea la categoría "Enfermedades Predeterminadas"
   - Inserta todas las 11 enfermedades para ese usuario

4. **Agrega a usuarios existentes**
   - Verifica cada usuario existente
   - Si no tiene la categoría, la crea
   - Inserta las 11 enfermedades

## Resultado en la aplicación

Después de ejecutar el script:

### En el módulo de Diagnósticos:
- Verás una categoría con nombre **"Enfermedades Predeterminadas"** (color púrpura)
- Dentro contendrá las 11 enfermedades
- Podrás editarlas (cambiar tipo, descripción, etc.)

### En Nueva Consulta:
- Las enfermedades aparecerán bajo la sección **"Diagnósticos Personalizados"**
- Agrupadas por categoría "Enfermedades Predeterminadas"
- Se mostrarán junto con las enfermedades predeterminadas del sistema

## Características

✅ **Automático**: Nuevos usuarios obtienen automáticamente estas enfermedades  
✅ **Editable**: Puedes modificar cualquier enfermedad desde el módulo de Diagnósticos  
✅ **Flexible**: Puedes cambiar el tipo (Consultorio/Terreno/Ambos) de cada una  
✅ **Sincronizado**: Los cambios aparecen inmediatamente en Nueva Consulta  

## Ejemplo de uso

1. **Usuario se registra** → Trigger automático inserta enfermedades
2. **Ir a Diagnósticos** → Ve la categoría "Enfermedades Predeterminadas"
3. **Crear Nueva Consulta** → Las enfermedades están disponibles para seleccionar
4. **Editar si es necesario** → Puedes cambiar tipo o detalles desde Diagnósticos

## Cambios personalizados

Después de la instalación, puedes:

### Cambiar el tipo de una enfermedad

En el módulo de Diagnósticos:
1. Haz clic en "Editar" en la enfermedad
2. Cambia el tipo a "Solo Consultorio", "Solo Terreno" o "Ambos"
3. Guarda

### Agregar descripción más detallada

1. Edita la enfermedad
2. Actualiza el campo "Descripción"
3. Guarda

### Cambiar el color de la categoría

1. En Diagnósticos, haz clic en "Editar Categoría"
2. Selecciona un color diferente
3. Guarda

## Solución de problemas

### El script falla con "permission denied"

Asegúrate de estar logueado como admin en Supabase.

### Las enfermedades no aparecen en Nueva Consulta

1. Recarga la página (F5)
2. Asegúrate de que el usuario actual tiene las enfermedades
3. Ejecuta la query de verificación arriba

### Quiero revertir los cambios

Ejecuta esto para eliminar todo:

```sql
-- Eliminar diagnósticos
DELETE FROM diagnosticos_personalizados
WHERE categoria_id IN (
  SELECT id FROM categorias_diagnosticos
  WHERE nombre = 'Enfermedades Predeterminadas'
);

-- Eliminar categoría
DELETE FROM categorias_diagnosticos
WHERE nombre = 'Enfermedades Predeterminadas';

-- Eliminar tabla base (opcional)
DROP TABLE IF EXISTS enfermedades_base;

-- Eliminar trigger (opcional)
DROP TRIGGER IF EXISTS trigger_crear_enfermedades_predeterminadas ON usuarios;
DROP FUNCTION IF EXISTS crear_enfermedades_predeterminadas();
```

## Archivo de configuración

| Archivo | Propósito | Usar |
|---------|-----------|------|
| `enfermedades-insertar-simple.sql` | Script principal con trigger automático | ⭐ ESTE |
| `enfermedades-predeterminadas.sql` | Versión completa con múltiples opciones | Referencia |
| `INSTRUCCIONES_ENFERMEDADES.md` | Guía paso a paso detallada | Referencia |

## Próximos pasos

1. ✅ Ejecuta `enfermedades-insertar-simple.sql`
2. ✅ Verifica que se insertó correctamente
3. ✅ Accede al módulo de Diagnósticos desde la app
4. ✅ Ve la categoría "Enfermedades Predeterminadas" con las 11 enfermedades
5. ✅ Crea una consulta y selecciona algunas enfermedades
6. ✅ ¡Listo!

---

**Nota**: Las enfermedades se insertan como diagnósticos personalizados, lo que permite que sean editables y que se pueden filtrar por tipo de consulta. Esto es diferente a las "enfermedades predeterminadas" que se cargan desde el código y son solo lectura.
