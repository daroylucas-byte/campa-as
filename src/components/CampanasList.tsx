import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { obtenerCampanasCliente } from '../services/campanas';
import type { CampanaCliente } from '../types/database.types';
import toast from 'react-hot-toast';

interface CampanasListProps {
  onNuevaCampanaClick: () => void;
}

export const CampanasList: React.FC<CampanasListProps> = ({
  onNuevaCampanaClick
}) => {
  const { clienteActivo, campanaActiva, setCampanaActiva } = useApp();
  const [campanas, setCampanas] = useState<CampanaCliente[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarCampanas = async () => {
    if (!clienteActivo) return;
    setLoading(true);
    try {
      const data = await obtenerCampanasCliente(clienteActivo.id);
      setCampanas(data);
      
      // Auto-seleccionar la primera campaña si no hay ninguna seleccionada activa
      if (data.length > 0 && !campanaActiva) {
        setCampanaActiva(data[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCampanas();
  }, [clienteActivo]);

  if (!clienteActivo) return null;

  return (
    <section className="glass-card rounded-xl p-md flex flex-col gap-md shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">campaign</span>
          <h3 className="font-display text-headline-md text-on-surface">Campañas</h3>
        </div>
        <button 
          onClick={onNuevaCampanaClick}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 cursor-pointer focus:outline-none"
          title="Crear Nueva Campaña"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-sm">
        {loading ? (
          <div className="text-center py-4 text-body-sm text-on-surface-variant animate-pulse">
            Cargando campañas...
          </div>
        ) : campanas.length === 0 ? (
          <div className="text-center py-4 text-body-sm text-on-surface-variant">
            No hay campañas creadas
          </div>
        ) : (
          campanas.map((campana) => {
            const isSelected = campanaActiva?.id === campana.id;
            
            return (
              <div 
                key={campana.id}
                onClick={() => setCampanaActiva(campana)}
                className={`p-3 rounded-lg hover:bg-surface-container transition-all cursor-pointer flex justify-between items-center group border ${
                  isSelected 
                    ? 'bg-surface-container border-primary/40 shadow-sm' 
                    : 'bg-surface-container-low border-transparent'
                }`}
              >
                <div className="truncate pr-2">
                  <p className={`font-semibold text-label-md truncate group-hover:text-primary transition-colors ${
                    isSelected ? 'text-primary' : 'text-on-surface'
                  }`}>
                    {campana.nombre_campana}
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-sans">
                    Creada {new Date(campana.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Status Badges */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  campana.estado === 'activa' 
                    ? 'bg-secondary-fixed text-on-secondary-fixed' 
                    : campana.estado === 'archivada'
                    ? 'bg-surface-container-highest text-on-surface-variant'
                    : 'bg-primary-fixed text-on-primary-fixed'
                }`}>
                  {campana.estado === 'borrador' ? 'Borrador' : campana.estado}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
