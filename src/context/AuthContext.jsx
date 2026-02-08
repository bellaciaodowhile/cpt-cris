import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { hashPassword, verifyPassword, saveUser, getUser, removeUser } from '../utils/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      // Buscar usuario por email
      const { data: usuarios, error: fetchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !usuarios) {
        return { error: { message: 'Usuario o contraseña incorrectos' } };
      }

      // Verificar contraseña
      const isValid = await verifyPassword(password, usuarios.password_hash);
      
      if (!isValid) {
        return { error: { message: 'Usuario o contraseña incorrectos' } };
      }

      // Guardar usuario (sin el hash de contraseña)
      const userData = {
        id: usuarios.id,
        email: usuarios.email,
        nombre: usuarios.nombre,
      };

      setUser(userData);
      saveUser(userData);

      return { data: userData, error: null };
    } catch (error) {
      console.error('Error en signIn:', error);
      return { error: { message: 'Error al iniciar sesión' } };
    }
  };

  const signUp = async (email, password, nombre = '') => {
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: { message: 'Este correo ya está registrado' } };
      }

      // Hash de la contraseña
      const passwordHash = await hashPassword(password);

      // Crear usuario
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email,
          password_hash: passwordHash,
          nombre,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error insertando usuario:', insertError);
        return { error: { message: 'Error al crear la cuenta' } };
      }

      // Guardar usuario
      const userData = {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
      };

      setUser(userData);
      saveUser(userData);

      return { data: userData, error: null };
    } catch (error) {
      console.error('Error en signUp:', error);
      return { error: { message: 'Error al crear la cuenta' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    removeUser();
    return { error: null };
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
