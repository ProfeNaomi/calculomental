-- 1. Crear tabla de perfiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de puntajes máximos si no existe
CREATE TABLE IF NOT EXISTS public.high_scores (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, game_type)
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.high_scores ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para perfiles (Borramos las anteriores si existen para evitar errores)
DROP POLICY IF EXISTS "Usuarios pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden crear/actualizar su perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden modificar su perfil" ON public.profiles;

CREATE POLICY "Usuarios pueden ver todos los perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear/actualizar su perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuarios pueden modificar su perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Políticas para puntajes (Borramos las anteriores si existen para evitar errores)
DROP POLICY IF EXISTS "Usuarios pueden ver todos los puntajes" ON public.high_scores;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios puntajes" ON public.high_scores;
DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios puntajes" ON public.high_scores;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios puntajes" ON public.high_scores;

CREATE POLICY "Usuarios pueden ver todos los puntajes" ON public.high_scores FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden insertar sus propios puntajes" ON public.high_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus propios puntajes" ON public.high_scores FOR UPDATE USING (auth.uid() = user_id);

-- Función para actualizar 'updated_at' automáticamente (opcional)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_high_scores_modtime ON public.high_scores;
CREATE TRIGGER update_high_scores_modtime
BEFORE UPDATE ON public.high_scores
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

