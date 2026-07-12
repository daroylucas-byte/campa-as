import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { NegocioSelector } from './pages/NegocioSelector';
import { Dashboard } from './pages/Dashboard';
import { obtenerNegociosUsuario } from './services/negocios';
import type { Negocio } from './types/database.types';
import { Toaster } from 'react-hot-toast';
import { isConfigured } from './services/supabaseClient';

const AppContent: React.FC = () => {
  const { user, loadingAuth, negocioActivo, setNegocioActivo } = useApp();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loadingNegocios, setLoadingNegocios] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);

  const cargarNegocios = async () => {
    if (!user) return;
    setLoadingNegocios(true);
    try {
      const data = await obtenerNegociosUsuario(user.id);
      setNegocios(data);
      
      // Auto-seleccionar primer negocio si ya existe alguno guardado o disponible
      const savedNegocioId = localStorage.getItem('negocio_id');
      if (savedNegocioId) {
        const found = data.find(n => n.id === savedNegocioId);
        if (found) {
          setNegocioActivo(found);
          return;
        }
      }
      if (data.length > 0 && !negocioActivo) {
        setNegocioActivo(data[0]);
      }
    } catch (err) {
      console.error('Error al cargar negocios:', err);
    } finally {
      setLoadingNegocios(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarNegocios();
    }
  }, [user]);

  // 0. Validación de configuración de variables de entorno
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile relative overflow-hidden text-left">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 w-full max-w-lg glass-card rounded-2xl p-md shadow-2xl border border-outline-variant/30 flex flex-col gap-md">
          <div className="text-center">
            <span className="material-symbols-outlined text-amber-500 text-5xl font-extrabold mb-xs">
              warning
            </span>
            <h2 className="text-headline-md font-display text-on-surface">
              Configuración de Supabase Requerida
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-1 text-center">
              Faltan configurar las variables de entorno para establecer conexión con el backend de Supabase.
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-sm flex flex-col gap-xs text-body-sm text-on-surface-variant font-sans">
            <p className="font-semibold text-on-surface">Instrucciones para configurar:</p>
            <ol className="list-decimal pl-4 flex flex-col gap-xs mt-xs">
              <li>Localiza el archivo <code className="bg-surface px-1.5 py-0.5 rounded text-primary font-mono font-semibold text-xs">.env</code> que se ha creado en la raíz de tu proyecto.</li>
              <li>Pega tu clave anónima real en la variable <code className="bg-surface px-1.5 py-0.5 rounded text-secondary font-mono font-semibold text-xs">VITE_SUPABASE_ANON_KEY</code>.</li>
              <li>Guarda el archivo y recarga esta página en tu navegador.</li>
            </ol>
          </div>

          <div className="bg-surface-container/60 rounded-xl p-sm border border-outline-variant/10 font-mono text-[12px] text-on-surface overflow-x-auto leading-relaxed">
            <p className="text-on-surface-variant mb-1 font-sans font-semibold">Tu archivo .env actual:</p>
            <span className="text-primary font-semibold">VITE_SUPABASE_URL</span>=https://puhrwlbgdpdohuhvtvbp.supabase.co<br />
            <span className="text-secondary font-semibold">VITE_SUPABASE_ANON_KEY</span>=<span className="text-error font-bold">REPLACEME_CON_TU_ANON_KEY</span>
          </div>

          <div className="text-center text-xs text-on-surface-variant/80 mt-xs">
            El ID de proyecto asignado es <span className="font-semibold">puhrwlbgdpdohuhvtvbp</span>.
          </div>
        </div>
      </div>
    );
  }

  // 1. Cargando sesión auth
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-md">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
          refresh
        </span>
        <p className="text-body-md text-on-surface-variant font-semibold animate-pulse">
          Iniciando Campañas IA...
        </p>
      </div>
    );
  }

  // 2. Usuario no logueado -> Landing o Login/Registro
  if (!user) {
    if (showLogin) {
      return (
        <Login 
          onBackClick={() => setShowLogin(false)} 
          initialIsSignUp={signUpMode} 
        />
      );
    }
    return (
      <Landing 
        onLoginClick={() => {
          setSignUpMode(false);
          setShowLogin(true);
        }}
        onSignUpClick={() => {
          setSignUpMode(true);
          setShowLogin(true);
        }}
      />
    );
  }

  // 3. Usuario logueado pero cargando agencias
  if (loadingNegocios && negocios.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-md">
        <span className="material-symbols-outlined text-secondary text-5xl animate-spin">
          refresh
        </span>
        <p className="text-body-md text-on-surface-variant animate-pulse">
          Cargando tus agencias de marketing...
        </p>
      </div>
    );
  }

  // 4. Usuario logueado sin negocio seleccionado -> Selector de Negocio
  if (!negocioActivo) {
    return (
      <NegocioSelector 
        negocios={negocios}
        onCargarNegocios={cargarNegocios}
      />
    );
  }

  // 5. Todo listo -> Panel de control principal
  return <Dashboard />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      {/* Toast notifications container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-card border border-outline-variant/30 text-on-surface',
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary)',
              secondary: 'white',
            },
          },
        }}
      />
    </AppProvider>
  );
}
