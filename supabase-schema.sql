-- Tabla de usuarios (autenticación personalizada)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del CPT
CREATE TABLE IF NOT EXISTS cpt_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_cpt TEXT NOT NULL,
  tipo_cpt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS medicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  mpps TEXT NOT NULL,
  especialidad TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de consultas
CREATE TABLE IF NOT EXISTS consultas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  
  -- Datos del paciente
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_consultas_user_id ON consultas(user_id);
CREATE INDEX IF NOT EXISTS idx_consultas_medico_id ON consultas(medico_id);
CREATE INDEX IF NOT EXISTS idx_consultas_cedula ON consultas(cedula_paciente);
CREATE INDEX IF NOT EXISTS idx_consultas_fecha ON consultas(fecha_consulta);
CREATE INDEX IF NOT EXISTS idx_consultas_tipo ON consultas(tipo_consulta);
CREATE INDEX IF NOT EXISTS idx_consultas_rango_edad ON consultas(rango_edad);
CREATE INDEX IF NOT EXISTS idx_consultas_sexo ON consultas(sexo);
CREATE INDEX IF NOT EXISTS idx_medicos_user_id ON medicos(user_id);

-- Habilitar Row Level Security (RLS) - DESHABILITADO para autenticación personalizada
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultas DISABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER update_consultas_updated_at
  BEFORE UPDATE ON consultas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
