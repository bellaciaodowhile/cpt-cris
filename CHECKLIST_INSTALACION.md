# ✅ Checklist de Instalación: Enfermedades Predeterminadas

## 📋 Instalación paso a paso

### Paso 1: Preparar Supabase
- [ ] Abre tu proyecto en https://app.supabase.com
- [ ] Verifica que estés logueado como admin
- [ ] Ve a la sección **SQL Editor** del menú izquierdo

### Paso 2: Ejecutar script base
- [ ] Abre el archivo `diagnosticos-schema.sql` (si aún no lo has ejecutado)
- [ ] Copia TODO el contenido
- [ ] En Supabase, haz clic en **New Query**
- [ ] Pega el contenido
- [ ] Presiona **Run** (o Ctrl+Enter)
- [ ] Verifica que se ejecutó sin errores

### Paso 3: Ejecutar script de enfermedades
- [ ] Abre el archivo `enfermedades-insertar-simple.sql`
- [ ] Copia TODO el contenido
- [ ] En Supabase, haz clic en **New Query**
- [ ] Pega el contenido
- [ ] Presiona **Run**
- [ ] Espera a que termine (aprox 5-10 segundos)
- [ ] Verifica que se ejecutó sin errores

### Paso 4: Verificar instalación
Copia y ejecuta esta query en Supabase:

```sql
SELECT 
  'Categorías creadas' as verificacion,
  COUNT(*) as total
FROM categorias_diagnosticos 
WHERE nombre = 'Enfermedades Predeterminadas'
UNION ALL
SELECT 
  'Enfermedades insertadas',
  COUNT(*)
FROM diagnosticos_personalizados 
WHERE categoria_id IN (
  SELECT id FROM categorias_diagnosticos 
  WHERE nombre = 'Enfermedades Predeterminadas'
);
```

**Resultado esperado:**
```
verificacion                    | total
Categorías creadas              | X (número de usuarios)
Enfermedades insertadas         | 11 * X (11 por usuario)
```

- [ ] Verificación completada exitosamente

### Paso 5: Probar en la aplicación

#### En el módulo de Diagnósticos:
- [ ] Abre la aplicación
- [ ] Ve al menú y haz clic en **Diagnósticos**
- [ ] Busca la categoría **"Enfermedades Predeterminadas"** (color púrpura)
- [ ] Verifica que contiene las 11 enfermedades
- [ ] Haz clic en una para editar y verifica que se abre el formulario

#### En Nueva Consulta:
- [ ] Ve a **Consultas** → **Nueva Consulta**
- [ ] Selecciona un paciente (existente o crea uno)
- [ ] En la sección **Diagnóstico**, desplázate
- [ ] Verifica que aparecen las enfermedades bajo **"Diagnósticos Personalizados"**
- [ ] Agrupa las enfermedades por categoría **"Enfermedades Predeterminadas"**
- [ ] Intenta seleccionar una enfermedad (debe funcionar el checkbox)
- [ ] Guarda la consulta

### Paso 6: Prueba de funcionamiento
- [ ] Crea una nueva consulta
- [ ] Selecciona 2-3 enfermedades de la categoría
- [ ] Agrega un diagnóstico adicional
- [ ] Guarda la consulta
- [ ] Ve a **Consultas** y verifica que aparecen las enfermedades seleccionadas
- [ ] Abre la consulta nuevamente y verifica que están seleccionadas

### Paso 7: Personalización (opcional)
- [ ] Ve a **Diagnósticos**
- [ ] Haz clic en **Editar** en una enfermedad
- [ ] Cambia el tipo de "Ambos" a "Solo Consultorio"
- [ ] Guarda
- [ ] Verifica que el cambio aparece inmediatamente

## 🎯 Validación final

### Base de datos
- [ ] Las tablas `categorias_diagnosticos` y `diagnosticos_personalizados` existen
- [ ] La tabla `enfermedades_base` contiene 11 registros
- [ ] Todos los usuarios tienen la categoría "Enfermedades Predeterminadas"

### Aplicación
- [ ] El módulo **Diagnósticos** es accesible desde el menú
- [ ] Se ve la categoría con las 11 enfermedades
- [ ] Las enfermedades aparecen en **Nueva Consulta**
- [ ] Se pueden seleccionar las enfermedades
- [ ] Se pueden editar las enfermedades
- [ ] Se pueden eliminar si es necesario

### Nuevos usuarios
- [ ] Crea un nuevo usuario (registra uno nuevo)
- [ ] Inicia sesión con ese usuario
- [ ] Ve a **Diagnósticos**
- [ ] Verifica que ya tiene la categoría con las 11 enfermedades

## 🔄 Si algo no funciona

### Las enfermedades no aparecen en Diagnósticos
- [ ] Recarga la página (F5)
- [ ] Verifica que iniciaste sesión
- [ ] Revisa la query de verificación en Supabase
- [ ] Ejecuta el script nuevamente

### Error "permission denied" al ejecutar script
- [ ] Verifica que estés logueado como admin
- [ ] Intenta en una ventana de incógnito
- [ ] Verifica que tienes acceso a Supabase

### Las enfermedades aparecen pero con tipo incorrecto
- [ ] Edita cada enfermedad en **Diagnósticos**
- [ ] Cambia el tipo al deseado
- [ ] Guarda

### Las enfermedades no aparecen al crear Nueva Consulta
- [ ] Recarga la página
- [ ] Verifica que el tipo de consulta sea compatible
- [ ] Revisa que la categoría tenga diagnósticos

## 📊 Resumen de archivos

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `diagnosticos-schema.sql` | ✅ Usar primero | Schema base de diagnósticos |
| `enfermedades-insertar-simple.sql` | ✅ Usar después | Inserta las 11 enfermedades |
| `ENFERMEDADES_SETUP_GUIDE.md` | 📖 Referencia | Guía completa |
| `INSTRUCCIONES_ENFERMEDADES.md` | 📖 Referencia | Opciones detalladas |
| `RESUMEN_ENFERMEDADES_CREADO.md` | 📖 Referencia | Resumen rápido |

## ⏱️ Tiempo estimado

- Ejecutar `diagnosticos-schema.sql`: 1-2 minutos
- Ejecutar `enfermedades-insertar-simple.sql`: 1-2 minutos
- Verificar en base de datos: 1 minuto
- Probar en aplicación: 5 minutos
- **Total: ~10 minutos**

## 🎉 Listo para usar

Cuando hayas completado todos los checks, estará listo para:

✅ Crear diagnósticos personalizados  
✅ Categorizar diagnósticos  
✅ Filtrar diagnósticos por tipo  
✅ Usar diagnósticos en nuevas consultas  
✅ Editar diagnósticos desde la interfaz  
✅ Agregar más diagnósticos personalizados  

## 📞 Ayuda rápida

Si necesitas ayuda, consulta:
- `ENFERMEDADES_SETUP_GUIDE.md` - Guía general
- `INSTRUCCIONES_ENFERMEDADES.md` - Opciones y troubleshooting
- `MODULO_DIAGNOSTICOS.md` - Uso del módulo

---

**¿Listo para comenzar? ¡Comienza con el Paso 1!** 🚀
