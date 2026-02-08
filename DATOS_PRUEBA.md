# Datos de Prueba para CPT Sistema

Este documento contiene datos de ejemplo para probar la aplicación.

## Usuarios de Prueba

Puedes crear usuarios de prueba con estos correos:

```
doctor1@cpt.com
doctor2@cpt.com
admin@cpt.com
```

Contraseña sugerida para pruebas: `Test123456!`

## Configuración CPT de Ejemplo

```
Nombre: CPT Los Rosales
Tipo: Urbano
```

```
Nombre: CPT Rural El Valle
Tipo: Rural
```

## Médicos de Ejemplo

### Médico 1
- Nombre: Juan
- Apellido: Pérez
- MPPS: 12345678
- Especialidad: Medicina General

### Médico 2
- Nombre: María
- Apellido: González
- MPPS: 87654321
- Especialidad: Pediatría

### Médico 3
- Nombre: Carlos
- Apellido: Rodríguez
- MPPS: 11223344
- Especialidad: Medicina Interna

## Consultas de Ejemplo

### Consulta 1 - Paciente Adulto con HTA
- Nacionalidad: V
- Cédula: 12345678
- Sexo: M
- Fecha de Nacimiento: 1975-05-15 (Rango: 45-59)
- Etnia: Mestizo
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 09:30 (Consultorio)
- Médico: Juan Pérez
- Diagnóstico: HTA

### Consulta 2 - Paciente Pediátrico con Asma
- Nacionalidad: V
- Cédula: 98765432
- Sexo: F
- Fecha de Nacimiento: 2018-03-20 (Rango: 5-6)
- Etnia: -
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 10:15 (Consultorio)
- Médico: María González
- Diagnóstico: Asma

### Consulta 3 - Paciente con Diabetes
- Nacionalidad: V
- Cédula: 11223344
- Sexo: F
- Fecha de Nacimiento: 1960-08-10 (Rango: 60-64)
- Etnia: -
- Discapacidad: Sí
- Fecha/Hora Consulta: 2026-02-08 11:00 (Consultorio)
- Médico: Carlos Rodríguez
- Diagnóstico: Diabetes, HTA

### Consulta 4 - Consulta de Terreno
- Nacionalidad: V
- Cédula: 55667788
- Sexo: M
- Fecha de Nacimiento: 2010-12-05 (Rango: 12-14)
- Etnia: -
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 14:30 (Terreno)
- Médico: Juan Pérez
- Diagnóstico: Síndrome Febril

### Consulta 5 - Paciente con Parasitismo
- Nacionalidad: V
- Cédula: 99887766
- Sexo: M
- Fecha de Nacimiento: 2020-01-15 (Rango: 5-6)
- Etnia: -
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 08:45 (Consultorio)
- Médico: María González
- Diagnóstico: Parasitismo

### Consulta 6 - Adulto Mayor
- Nacionalidad: V
- Cédula: 33445566
- Sexo: F
- Fecha de Nacimiento: 1950-06-20 (Rango: 65+)
- Etnia: -
- Discapacidad: Sí
- Fecha/Hora Consulta: 2026-02-08 09:00 (Consultorio)
- Médico: Carlos Rodríguez
- Diagnóstico: HTA, Diabetes

### Consulta 7 - Bebé
- Nacionalidad: V
- Cédula: 77889900
- Sexo: M
- Fecha de Nacimiento: 2025-08-10 (Rango: <1)
- Etnia: -
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 10:30 (Consultorio)
- Médico: María González
- Diagnóstico: Control de niño sano

### Consulta 8 - Joven con Asma
- Nacionalidad: V
- Cédula: 22334455
- Sexo: F
- Fecha de Nacimiento: 2005-04-12 (Rango: 20-24)
- Etnia: -
- Discapacidad: No
- Fecha/Hora Consulta: 2026-02-08 15:00 (Terreno)
- Médico: Juan Pérez
- Diagnóstico: Asma

## Script SQL para Insertar Datos de Prueba

```sql
-- Insertar médicos de prueba (reemplaza USER_ID con tu ID de usuario)
INSERT INTO medicos (user_id, nombre, apellido, mpps, especialidad) VALUES
('USER_ID', 'Juan', 'Pérez', '12345678', 'Medicina General'),
('USER_ID', 'María', 'González', '87654321', 'Pediatría'),
('USER_ID', 'Carlos', 'Rodríguez', '11223344', 'Medicina Interna');

-- Insertar consultas de prueba (reemplaza USER_ID y MEDICO_ID)
INSERT INTO consultas (
  user_id, medico_id, cedula_paciente, nacionalidad, sexo, 
  fecha_nacimiento, rango_edad, etnia, discapacidad, 
  fecha_consulta, tipo_consulta, diagnostico
) VALUES
('USER_ID', 'MEDICO_ID_1', '12345678', 'V', 'M', '1975-05-15', '45-59', 'Mestizo', 'No', '2026-02-08 09:30:00', 'Consultorio', 'HTA'),
('USER_ID', 'MEDICO_ID_2', '98765432', 'V', 'F', '2018-03-20', '5-6', '', 'No', '2026-02-08 10:15:00', 'Consultorio', 'Asma'),
('USER_ID', 'MEDICO_ID_3', '11223344', 'V', 'F', '1960-08-10', '60-64', '', 'Sí', '2026-02-08 11:00:00', 'Consultorio', 'Diabetes, HTA'),
('USER_ID', 'MEDICO_ID_1', '55667788', 'V', 'M', '2010-12-05', '12-14', '', 'No', '2026-02-08 14:30:00', 'Terreno', 'Síndrome Febril'),
('USER_ID', 'MEDICO_ID_2', '99887766', 'V', 'M', '2020-01-15', '5-6', '', 'No', '2026-02-08 08:45:00', 'Consultorio', 'Parasitismo'),
('USER_ID', 'MEDICO_ID_3', '33445566', 'V', 'F', '1950-06-20', '65+', '', 'Sí', '2026-02-08 09:00:00', 'Consultorio', 'HTA, Diabetes'),
('USER_ID', 'MEDICO_ID_2', '77889900', 'V', 'M', '2025-08-10', '<1', '', 'No', '2026-02-08 10:30:00', 'Consultorio', 'Control de niño sano'),
('USER_ID', 'MEDICO_ID_1', '22334455', 'V', 'F', '2005-04-12', '20-24', '', 'No', '2026-02-08 15:00:00', 'Terreno', 'Asma');
```

## Cómo Usar los Datos de Prueba

### Opción 1: Insertar Manualmente desde la Aplicación

1. Inicia sesión en la aplicación
2. Ve a la sección "Médicos"
3. Agrega los médicos de ejemplo uno por uno
4. Ve a "Consultas" > "Nueva"
5. Registra las consultas de ejemplo

### Opción 2: Insertar desde SQL Editor

1. Ve a Supabase > SQL Editor
2. Copia el script SQL de arriba
3. Reemplaza `USER_ID` con tu ID de usuario (puedes obtenerlo desde Auth > Users)
4. Reemplaza `MEDICO_ID_1`, `MEDICO_ID_2`, `MEDICO_ID_3` con los IDs de los médicos creados
5. Ejecuta el script

### Opción 3: Usar la API de Supabase

Puedes usar la consola del navegador para insertar datos:

```javascript
// Obtener el cliente de Supabase
const { supabase } = window;

// Insertar médico
await supabase.from('medicos').insert({
  nombre: 'Juan',
  apellido: 'Pérez',
  mpps: '12345678',
  especialidad: 'Medicina General'
});

// Insertar consulta
await supabase.from('consultas').insert({
  cedula_paciente: '12345678',
  nacionalidad: 'V',
  sexo: 'M',
  fecha_nacimiento: '1975-05-15',
  rango_edad: '45-59',
  discapacidad: 'No',
  fecha_consulta: '2026-02-08T09:30:00',
  tipo_consulta: 'Consultorio',
  diagnostico: 'HTA'
});
```

## Verificar los Datos

Después de insertar los datos de prueba:

1. **Dashboard**: Deberías ver gráficos con datos
2. **Consultas**: Deberías ver la lista de consultas
3. **Médicos**: Deberías ver los médicos registrados
4. **Filtros**: Prueba buscar por cédula y filtrar por fechas

## Datos para Probar Filtros

### Búsqueda por Cédula
- Busca: `12345678` → Debería encontrar 1 consulta
- Busca: `9876` → Debería encontrar consultas que contengan estos dígitos

### Filtro por Fechas
- Desde: 2026-02-08, Hasta: 2026-02-08 → Todas las consultas de ejemplo
- Desde: 2026-02-07, Hasta: 2026-02-07 → Sin resultados

### Vista de Gráficos
- Por Día: Deberías ver todas las consultas en el día 08/02
- Por Semana: Deberías ver las consultas agrupadas por semana
- Por Mes: Deberías ver las consultas agrupadas por mes

## Datos para Tabla de Morbilidad

Con los datos de ejemplo, la tabla de morbilidad debería mostrar:

- **HTA**: 3 casos (2F en 60-64 y 65+, 1M en 45-59)
- **Diabetes**: 2 casos (2F en 60-64 y 65+)
- **Asma**: 2 casos (1F en 5-6, 1F en 20-24)
- **Síndrome Febril**: 1 caso (1M en 12-14)
- **Parasitismo**: 1 caso (1M en 5-6)

---

**Nota**: Estos son datos ficticios para pruebas. No uses datos reales de pacientes en ambientes de desarrollo.
