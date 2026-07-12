import React from 'react';
import toast from 'react-hot-toast';

interface SidebarProps {
  onDashboardClick: () => void;
  onNuevaCampanaClick: () => void;
  onCambiarClienteClick: () => void;
  onCargarCreditosClick: () => void;
  clienteActivoNombre?: string;
  negocioActivoNombre?: string;
  vistaCalendario: boolean;
  onToggleCalendario: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onDashboardClick,
  onNuevaCampanaClick,
  onCambiarClienteClick,
  onCargarCreditosClick,
  clienteActivoNombre,
  negocioActivoNombre,
  vistaCalendario,
  onToggleCalendario
}) => {
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant z-50 text-left">
      <div className="p-md flex flex-col gap-base h-full justify-between">
        {/* Brand header */}
        <div>
          <div className="mb-lg px-2">
            <h1 className="font-display text-headline-md text-primary tracking-tight">Campañas IA</h1>
            <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-widest mt-1 font-sans">
              {negocioActivoNombre || 'Agencia de Marketing'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {/* Dashboard tab (global overview) */}
            <button 
              onClick={onDashboardClick}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                !clienteActivoNombre 
                  ? 'text-primary bg-primary-fixed-dim font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: !clienteActivoNombre ? "'FILL' 1" : undefined }}>dashboard</span>
              <span className="font-semibold text-body-sm font-sans">Dashboard</span>
            </button>

            {/* Clients selector tab */}
            <button 
              onClick={onCambiarClienteClick}
              className="w-full flex items-center justify-between p-3 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-semibold text-body-sm font-sans">Clientes</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                Buscar
              </span>
            </button>

            {/* Campaign List View Option */}
            <button 
              onClick={() => {
                if (!clienteActivoNombre) {
                  toast.error('Por favor, selecciona un cliente primero');
                  onCambiarClienteClick();
                } else {
                  onToggleCalendario(false);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                clienteActivoNombre && !vistaCalendario 
                  ? 'text-primary bg-primary-fixed-dim font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: (clienteActivoNombre && !vistaCalendario) ? "'FILL' 1" : undefined }}>campaign</span>
              <span className="font-semibold text-body-sm font-sans">Campañas</span>
            </button>

            {/* Campaign Calendar View Option */}
            <button 
              onClick={() => {
                if (!clienteActivoNombre) {
                  toast.error('Por favor, selecciona un cliente primero');
                  onCambiarClienteClick();
                } else {
                  onToggleCalendario(true);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                clienteActivoNombre && vistaCalendario 
                  ? 'text-primary bg-primary-fixed-dim font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: (clienteActivoNombre && vistaCalendario) ? "'FILL' 1" : undefined }}>calendar_month</span>
              <span className="font-semibold text-body-sm font-sans">Calendario</span>
            </button>

            {/* Resources tab */}
            <button 
              onClick={() => toast.success('Biblioteca de Recursos en desarrollo')}
              className="w-full flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">folder_shared</span>
              <span className="font-semibold text-body-sm font-sans">Recursos</span>
            </button>
          </nav>
        </div>

        {/* Action Button & Bottom Section */}
        <div className="space-y-base mt-auto">
          {clienteActivoNombre && (
            <div className="px-3 py-2 bg-surface-container rounded-xl border border-outline-variant/30 text-left mb-2">
              <p className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider font-sans">Cliente Activo</p>
              <p className="font-bold text-body-sm text-on-surface truncate font-sans">{clienteActivoNombre}</p>
            </div>
          )}

          <button 
            onClick={onNuevaCampanaClick}
            className="w-full ai-shimmer text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-body-sm font-sans">Nueva Campaña</span>
          </button>

          <div className="pt-4 border-t border-outline-variant space-y-1">
            <button 
              onClick={() => toast.success('Soporte 24/7 disponible en soporte@campanasia.com')}
              className="w-full flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
              <span className="font-semibold text-body-sm font-sans">Ayuda</span>
            </button>
            <button 
              onClick={onCargarCreditosClick}
              className="w-full flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span className="font-semibold text-body-sm font-sans">Billetera</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
