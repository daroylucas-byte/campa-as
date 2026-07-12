import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

interface LoginProps {
  onBackClick?: () => void;
  initialIsSignUp?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onBackClick, initialIsSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const toastId = toast.loading(isSignUp ? 'Registrando cuenta...' : 'Iniciando sesión...');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('¡Registro completado! Revisa tu correo de confirmación.', { id: toastId });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('¡Sesión iniciada!', { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ocurrió un error en la autenticación', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-md shadow-2xl border border-outline-variant/30 flex flex-col gap-md">
        {/* Title */}
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-5xl font-extrabold animate-pulse">
            auto_awesome
          </span>
          <h2 className="text-headline-md font-display text-on-surface mt-xs">
            {isSignUp ? 'Crear cuenta' : 'Campañas IA'}
          </h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {isSignUp 
              ? 'Regístrate para comenzar a crear campañas con IA B2B' 
              : 'Gestión automatizada de marketing para tus clientes'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-xs">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@agencia.com"
              required
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-xs">
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-semibold text-body-md shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-xs"
          >
            {loading 
              ? 'Procesando...' 
              : isSignUp ? 'Registrarse' : 'Iniciar Sesión'
            }
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center text-body-sm text-on-surface-variant mt-xs flex flex-col gap-xs">
          <div>
            <span>{isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}</span>
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold ml-1 hover:underline cursor-pointer focus:outline-none"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </div>

          {onBackClick && (
            <button
              type="button"
              onClick={onBackClick}
              className="text-on-surface-variant hover:text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1 mt-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Volver al inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
