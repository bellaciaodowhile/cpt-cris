import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (isLogin) {
      // Iniciar sesión
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        navigate('/');
      }
    } else {
      // Registrarse
      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess('¡Cuenta creada exitosamente! Iniciando sesión...');
        // Esperar un momento y luego iniciar sesión automáticamente
        setTimeout(async () => {
          const { error: signInError } = await signIn(email, password);
          if (!signInError) {
            navigate('/');
          } else {
            setSuccess('Cuenta creada. Por favor inicia sesión.');
            setIsLogin(true);
            setLoading(false);
          }
        }, 1500);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            {isLogin ? (
              <LogIn className="text-white" size={32} />
            ) : (
              <UserPlus className="text-white" size={32} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-secondary">CPT Sistema</h1>
          <p className="text-gray-600 mt-2">Consultorios Populares</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </>
            ) : (
              <>
                {isLogin ? (
                  <>
                    <LogIn className="mr-2" size={20} />
                    Iniciar Sesión
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2" size={20} />
                    Crear Cuenta
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-primary hover:text-opacity-80 font-medium transition-colors"
          >
            {isLogin ? (
              <>
                ¿No tienes cuenta? <span className="underline">Regístrate aquí</span>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
