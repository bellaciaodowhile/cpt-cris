-- Tabla de categorías de diagnósticos
CREATE TABLE categorias_diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6',
  tipo TEXT NOT NULL DEFAULT 'Ambos' CHECK (tipo IN ('Consultorio', 'Terreno', 'Ambos')),
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
CREATE INDEX idx_categorias_diagnosticos_tipo ON categorias_diagnosticos(tipo);
CREATE INDEX idx_diagnosticos_personalizados_user_id ON diagnosticos_personalizados(user_id);
CREATE INDEX idx_diagnosticos_personalizados_categoria_id ON diagnosticos_personalizados(categoria_id);
CREATE INDEX idx_diagnosticos_personalizados_tipo ON diagnosticos_personalizados(tipo);