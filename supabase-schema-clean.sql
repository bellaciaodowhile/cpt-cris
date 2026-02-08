-- ============================================
-- SCRIPT DE LIMPIEZA Y CREACIÓN COMPLETA
-- Sistema CPT con Autenticación Personalizada
-- ============================================

-- PASO 1: Eliminar tablas (esto también elimina triggers automáticamente)
-- ============================================

DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS medicos CASCADE;
DROP TABLE IF EXISTS cpt_config CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- PASO 2: Eliminar funciones (si existen)
-- ============================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS set_user_id() CASCADE;

-- PASO 3: Crear nuevas tablas
-- ============================================

-- Tabla de usuarios (autenticación personalizada)
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del CPT
CREATE TABLE cpt_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_cpt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de médicos
CREATE TABLE medicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  mpps TEXT NOT NULL,
  especialidad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  cedula TEXT NOT NULL,
  nacionalidad TEXT NOT NULL DEFAULT 'V',
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F')),
  fecha_nacimiento DATE NOT NULL,
  etnia TEXT,
  discapacidad TEXT DEFAULT 'No',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cedula)
);

-- Tabla de consultas
CREATE TABLE consultas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  
  -- Datos del paciente (desnormalizados para reportes históricos)
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  cedula_paciente TEXT NOT NULL,
  nacionalidad TEXT NOT NULL DEFAULT 'V',
  sexo TEXT NOT NULL CHECK (sexo IN ('M', 'F')),
  fecha_nacimiento DATE NOT NULL,
  rango_edad TEXT NOT NULL,
  etnia TEXT,
  discapacidad TEXT DEFAULT 'No',
  
  -- Datos de la consulta
  fecha_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_consulta TEXT NOT NULL CHECK (tipo_consulta IN ('Consultorio', 'Terreno')),
  diagnostico TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 4: Crear índices
-- ============================================

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_cpt_config_user_id ON cpt_config(user_id);
CREATE INDEX idx_medicos_user_id ON medicos(user_id);
CREATE INDEX idx_pacientes_user_id ON pacientes(user_id);
CREATE INDEX idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX idx_consultas_user_id ON consultas(user_id);
CREATE INDEX idx_consultas_medico_id ON consultas(medico_id);
CREATE INDEX idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX idx_consultas_cedula ON consultas(cedula_paciente);
CREATE INDEX idx_consultas_fecha ON consultas(fecha_consulta);
CREATE INDEX idx_consultas_tipo ON consultas(tipo_consulta);
CREATE INDEX idx_consultas_rango_edad ON consultas(rango_edad);
CREATE INDEX idx_consultas_sexo ON consultas(sexo);

-- PASO 5: Deshabilitar RLS (autenticación personalizada)
-- ============================================

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

-- PASO 6: Crear funciones y triggers
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpt_config_updated_at
  BEFORE UPDATE ON cpt_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicos_updated_at
  BEFORE UPDATE ON medicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultas_updated_at
  BEFORE UPDATE ON consultas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PASO 7: Mensaje de confirmación
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Base de datos creada exitosamente!';
  RAISE NOTICE '📊 Tablas creadas: usuarios, cpt_config, medicos, pacientes, consultas';
  RAISE NOTICE '🔍 Índices creados: 13 índices para optimización';
  RAISE NOTICE '🔒 RLS deshabilitado (autenticación personalizada)';
  RAISE NOTICE '⚡ Triggers creados: 5 triggers para updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Siguiente paso: Registra tu primer usuario en la aplicación';
END $$;
