import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from '../services/supabaseClient';
import type { Negocio, Cliente, CampanaCliente } from '../types/database.types';
import { obtenerSaldoMarketing } from '../services/negocios';

interface AppContextType {
  user: any | null;
  loadingAuth: boolean;
  negocioActivo: Negocio | null;
  setNegocioActivo: (negocio: Negocio | null) => void;
  clienteActivo: Cliente | null;
  setClienteActivo: (cliente: Cliente | null) => void;
  campanaActiva: CampanaCliente | null;
  setCampanaActiva: (campana: CampanaCliente | null) => void;
  saldo: number;
  loadingSaldo: boolean;
  actualizarSaldo: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [negocioActivo, setNegocioActivoState] = useState<Negocio | null>(null);
  const [clienteActivo, setClienteActivoState] = useState<Cliente | null>(null);
  const [campanaActiva, setCampanaActivaState] = useState<CampanaCliente | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  // Al cambiar de negocio, limpiamos cliente y campaña activa, y actualizamos saldo
  const setNegocioActivo = (negocio: Negocio | null) => {
    setNegocioActivoState(negocio);
    setClienteActivoState(null);
    setCampanaActivaState(null);
    if (negocio) {
      localStorage.setItem('negocio_id', negocio.id);
    } else {
      localStorage.removeItem('negocio_id');
    }
  };

  const setClienteActivo = (cliente: Cliente | null) => {
    setClienteActivoState(cliente);
    setCampanaActivaState(null);
    if (cliente) {
      localStorage.setItem('cliente_id', cliente.id);
    } else {
      localStorage.removeItem('cliente_id');
    }
  };

  const setCampanaActiva = (campana: CampanaCliente | null) => {
    setCampanaActivaState(campana);
  };

  const actualizarSaldo = async () => {
    if (!negocioActivo || !isConfigured) {
      setSaldo(0);
      return;
    }
    setLoadingSaldo(true);
    try {
      const wallet = await obtenerSaldoMarketing(negocioActivo.id);
      setSaldo(wallet?.saldo ?? 0);
    } catch (err) {
      console.error('Error al actualizar el saldo:', err);
    } finally {
      setLoadingSaldo(false);
    }
  };

  // Escuchar sesión activa de Supabase Auth
  useEffect(() => {
    if (!isConfigured) {
      setLoadingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: any) => {
      const session = data?.session;
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
      if (!session?.user) {
        setNegocioActivoState(null);
        setClienteActivoState(null);
        setCampanaActivaState(null);
        localStorage.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Actualizar saldo cuando cambia el negocio activo
  useEffect(() => {
    actualizarSaldo();
  }, [negocioActivo]);

  const cerrarSesion = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingAuth,
        negocioActivo,
        setNegocioActivo,
        clienteActivo,
        setClienteActivo,
        campanaActiva,
        setCampanaActiva,
        saldo,
        loadingSaldo,
        actualizarSaldo,
        cerrarSesion
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
