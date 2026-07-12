import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { crearNegocio } from '../services/negocios';
import type { Negocio } from '../types/database.types';
import toast from 'react-hot-toast';

interface NegocioSelectorProps {
  negocios: Negocio[];
  onCargarNegocios: () => Promise<void>;
}

export const NegocioSelector: React.FC<NegocioSelectorProps> = ({ negocios, onCargarNegocios }) => {
  const { user, setNegocioActivo, cerrarSesion } = useApp();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrearNegocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nombre.trim()) return;

    setLoading(true);
    const toastId = toast.loading('Creando negocio...');
    try {
      await crearNegocio(nombre, user.id);
      toast.success('Negocio creado con éxito', { id: toastId });
      setNombre('');
      await onCargarNegocios();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear el negocio', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile relative overflow-hidden text-left">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-md shadow-2xl border border-outline-variant/30 flex flex-col gap-md">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
          <div>
            <h2 className="text-headline-md font-display text-on-surface">Selecciona tu Agencia</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">Elige un espacio de trabajo para continuar</p>
          </div>
          <button 
            onClick={cerrarSesion}
            className="p-2 hover:bg-error-container/20 text-error rounded-full transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>

        {/* Existing Businesses List */}
        {negocios.length > 0 ? (
          <div className="flex flex-col gap-sm">
            <p className="text-label-sm font-semibold text-on-surface-variant uppercase">Tus Agencias / Negocios:</p>
            <div className="flex flex-col gap-xs max-h-56 overflow-y-auto pr-1">
              {negocios.map((neg) => (
                <button
                  key={neg.id}
                  onClick={() => setNegocioActivo(neg)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-label-md text-on-surface group-hover:text-primary transition-colors">
                      {neg.nombre}
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-sans">ID de Agencia</p>
                  </div>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-sm bg-surface-container-low border border-dashed border-outline-variant/40 rounded-xl text-on-surface-variant text-body-sm">
            No tienes agencias registradas aún. ¡Crea tu primera agencia abajo!
          </div>
        )}

        {/* Create Business Form */}
        <div className="border-t border-outline-variant/20 pt-sm mt-xs">
          <p className="text-label-sm font-semibold text-on-surface-variant uppercase mb-xs">Crear nueva Agencia:</p>
          <form onSubmit={handleCrearNegocio} className="flex flex-col gap-sm">
            <div>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la nueva agencia..."
                required
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-lg font-semibold text-body-sm shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              {loading ? 'Creando...' : 'Crear Agencia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
