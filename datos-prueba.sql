-- ============================================
-- DATOS DE PRUEBA - SISTEMA CPT
-- 100 Pacientes + 300 Consultas (3 semanas)
-- ============================================

-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu user_id real de la tabla usuarios
-- Puedes obtenerlo ejecutando: SELECT id FROM usuarios WHERE email = 'tu_email@ejemplo.com';

-- Variables para usar en el script
DO $$
DECLARE
  v_user_id UUID := 'TU_USER_ID_AQUI'::UUID; -- REEMPLAZAR CON TU USER_ID
  v_medico_id UUID;
  v_paciente_ids UUID[];
  v_fecha_base DATE := CURRENT_DATE - INTERVAL '21 days';
  v_nombres TEXT[] := ARRAY['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'José', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Laura', 'Antonio', 'Isabel', 'Francisco', 'Marta', 'Manuel', 'Patricia', 'Javier', 'Lucía'];
  v_apellidos TEXT[] := ARRAY['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez', 'Hernández', 'Ruiz', 'Vargas'];
  v_enfermedades TEXT[] := ARRAY['Hipertensión arterial', 'Diabetes mellitus', 'Síndrome febril', 'Asma Bronquial', 'Parasitismo intestinal', 'Cardiopatía isquémica', 'Enfermedad cerebrovascular'];
  v_sexos TEXT[] := ARRAY['M', 'F'];
  v_nacionalidades TEXT[] := ARRAY['V', 'E'];
  v_etnias TEXT[] := ARRAY['Mestizo', 'Indígena', 'Afrodescendiente', 'Blanco', ''];
  i INTEGER;
  j INTEGER;
  v_nombre TEXT;
  v_apellido TEXT;
  v_cedula TEXT;
  v_sexo TEXT;
  v_nacionalidad TEXT;
  v_etnia TEXT;
  v_discapacidad TEXT;
  v_fecha_nac DATE;
  v_edad INTEGER;
  v_rango_edad TEXT;
  v_paciente_id UUID;
  v_fecha_consulta TIMESTAMP;
  v_hora INTEGER;
  v_tipo_consulta TEXT;
  v_diagnostico TEXT;
  v_num_enfermedades INTEGER;
BEGIN
  -- Crear un médico de prueba si no existe
  INSERT INTO medicos (user_id, nombre, apellido, mpps, especialidad)
  VALUES (v_user_id, 'Dr. Carlos', 'Méndez', '12345678', 'Medicina General')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_medico_id;
  
  -- Si ya existía, obtener su ID
  IF v_medico_id IS NULL THEN
    SELECT id INTO v_medico_id FROM medicos WHERE user_id = v_user_id LIMIT 1;
  END IF;

  RAISE NOTICE 'Creando 100 pacientes...';
  
  -- Crear 100 pacientes
  FOR i IN 1..100 LOOP
    v_nombre := v_nombres[1 + floor(random() * array_length(v_nombres, 1))];
    v_apellido := v_apellidos[1 + floor(random() * array_length(v_apellidos, 1))];
    v_cedula := lpad((10000000 + i)::TEXT, 8, '0');
    v_sexo := v_sexos[1 + floor(random() * 2)];
    v_nacionalidad := v_nacionalidades[1 + floor(random() * 2)];
    v_etnia := v_etnias[1 + floor(random() * array_length(v_etnias, 1))];
    
    -- Generar edad aleatoria entre 0 y 80 años
    v_edad := floor(random() * 81);
    v_fecha_nac := CURRENT_DATE - (v_edad * 365 + floor(random() * 365))::INTEGER;
    
    -- Determinar rango de edad
    IF v_edad < 1 THEN
      v_rango_edad := '<1';
    ELSIF v_edad BETWEEN 1 AND 4 THEN
      v_rango_edad := '1-4';
    ELSIF v_edad BETWEEN 5 AND 6 THEN
      v_rango_edad := '5-6';
    ELSIF v_edad BETWEEN 7 AND 9 THEN
      v_rango_edad := '7-9';
    ELSIF v_edad BETWEEN 10 AND 11 THEN
      v_rango_edad := '10-11';
    ELSIF v_edad BETWEEN 12 AND 14 THEN
      v_rango_edad := '12-14';
    ELSIF v_edad BETWEEN 15 AND 19 THEN
      v_rango_edad := '15-19';
    ELSIF v_edad BETWEEN 20 AND 24 THEN
      v_rango_edad := '20-24';
    ELSIF v_edad BETWEEN 25 AND 44 THEN
      v_rango_edad := '25-44';
    ELSIF v_edad BETWEEN 45 AND 59 THEN
      v_rango_edad := '45-59';
    ELSIF v_edad BETWEEN 60 AND 64 THEN
      v_rango_edad := '60-64';
    ELSE
      v_rango_edad := '65+';
    END IF;
    
    INSERT INTO pacientes (
      user_id, nombres, apellidos, cedula, nacionalidad, sexo, 
      fecha_nacimiento, etnia, discapacidad
    )
    VALUES (
      v_user_id,
      v_nombre,
      v_apellido || ' ' || v_apellidos[1 + floor(random() * array_length(v_apellidos, 1))],
      v_cedula,
      v_nacionalidad,
      v_sexo,
      v_fecha_nac,
      v_etnia,
      CASE WHEN random() < 0.1 THEN 'Sí' ELSE 'No' END
    )
    RETURNING id INTO v_paciente_id;
    
    v_paciente_ids := array_append(v_paciente_ids, v_paciente_id);
  END LOOP;

  RAISE NOTICE 'Pacientes creados. Creando 300 consultas...';
  
  -- Crear 300 consultas distribuidas en 3 semanas
  FOR i IN 1..300 LOOP
    -- Seleccionar paciente aleatorio
    v_paciente_id := v_paciente_ids[1 + floor(random() * array_length(v_paciente_ids, 1))];
    
    -- Obtener datos del paciente
    SELECT nombres, apellidos, cedula, nacionalidad, sexo, fecha_nacimiento, etnia, discapacidad
    INTO v_nombre, v_apellido, v_cedula, v_nacionalidad, v_sexo, v_fecha_nac, v_etnia, v_discapacidad
    FROM pacientes WHERE id = v_paciente_id;
    
    -- Calcular edad y rango
    v_edad := EXTRACT(YEAR FROM AGE(v_fecha_nac));
    IF v_edad < 1 THEN v_rango_edad := '<1';
    ELSIF v_edad BETWEEN 1 AND 4 THEN v_rango_edad := '1-4';
    ELSIF v_edad BETWEEN 5 AND 6 THEN v_rango_edad := '5-6';
    ELSIF v_edad BETWEEN 7 AND 9 THEN v_rango_edad := '7-9';
    ELSIF v_edad BETWEEN 10 AND 11 THEN v_rango_edad := '10-11';
    ELSIF v_edad BETWEEN 12 AND 14 THEN v_rango_edad := '12-14';
    ELSIF v_edad BETWEEN 15 AND 19 THEN v_rango_edad := '15-19';
    ELSIF v_edad BETWEEN 20 AND 24 THEN v_rango_edad := '20-24';
    ELSIF v_edad BETWEEN 25 AND 44 THEN v_rango_edad := '25-44';
    ELSIF v_edad BETWEEN 45 AND 59 THEN v_rango_edad := '45-59';
    ELSIF v_edad BETWEEN 60 AND 64 THEN v_rango_edad := '60-64';
    ELSE v_rango_edad := '65+';
    END IF;
    
    -- Generar fecha aleatoria en las últimas 3 semanas
    v_fecha_consulta := v_fecha_base + (floor(random() * 21)::INTEGER || ' days')::INTERVAL;
    
    -- Generar hora según tipo de consulta
    -- 60% Terreno (13:00-16:00), 40% Consultorio (07:00-12:00)
    IF random() < 0.6 THEN
      v_hora := 13 + floor(random() * 3);
      v_tipo_consulta := 'Terreno';
    ELSE
      v_hora := 7 + floor(random() * 5);
      v_tipo_consulta := 'Consultorio';
    END IF;
    
    v_fecha_consulta := v_fecha_consulta + (v_hora || ' hours')::INTERVAL + (floor(random() * 60)::INTEGER || ' minutes')::INTERVAL;
    
    -- Generar diagnóstico (1-3 enfermedades)
    v_num_enfermedades := 1 + floor(random() * 3);
    v_diagnostico := '';
    FOR j IN 1..v_num_enfermedades LOOP
      IF v_diagnostico != '' THEN
        v_diagnostico := v_diagnostico || ', ';
      END IF;
      v_diagnostico := v_diagnostico || v_enfermedades[1 + floor(random() * array_length(v_enfermedades, 1))];
    END LOOP;
    
    INSERT INTO consultas (
      user_id, paciente_id, medico_id,
      nombres, apellidos, cedula_paciente, nacionalidad, sexo,
      fecha_nacimiento, rango_edad, etnia, discapacidad,
      fecha_consulta, tipo_consulta, diagnostico
    )
    VALUES (
      v_user_id,
      v_paciente_id,
      v_medico_id,
      v_nombre,
      v_apellido,
      v_cedula,
      v_nacionalidad,
      v_sexo,
      v_fecha_nac,
      v_rango_edad,
      v_etnia,
      v_discapacidad,
      v_fecha_consulta,
      v_tipo_consulta,
      v_diagnostico
    );
    
    -- Mostrar progreso cada 50 registros
    IF i % 50 = 0 THEN
      RAISE NOTICE 'Consultas creadas: %', i;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Datos de prueba creados exitosamente!';
  RAISE NOTICE '📊 100 pacientes creados';
  RAISE NOTICE '📋 300 consultas creadas';
  RAISE NOTICE '📅 Rango de fechas: % a %', v_fecha_base, v_fecha_base + INTERVAL '21 days';
END $$;

-- Verificar los datos creados
SELECT 
  'Pacientes' as tabla,
  COUNT(*) as total
FROM pacientes
UNION ALL
SELECT 
  'Consultas' as tabla,
  COUNT(*) as total
FROM consultas
UNION ALL
SELECT 
  'Consultas Consultorio' as tabla,
  COUNT(*) as total
FROM consultas WHERE tipo_consulta = 'Consultorio'
UNION ALL
SELECT 
  'Consultas Terreno' as tabla,
  COUNT(*) as total
FROM consultas WHERE tipo_consulta = 'Terreno';
