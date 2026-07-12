import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Negocio } from '../types/database.types';

interface HeaderProps {
  negocios: Negocio[];
  onCargarCreditosClick: () => void;
  onCrearNegocioClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  negocios, 
  onCargarCreditosClick,
  onCrearNegocioClick
}) => {
  const { user, negocioActivo, setNegocioActivo, saldo, cerrarSesion } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
      <div className="flex justify-between items-center px-margin-desktop py-4 max-w-max-width mx-auto">
        
        {/* Logo y Selector de Negocio */}
        <div className="flex items-center gap-md">
          <span className="text-headline-md font-extrabold text-primary tracking-tight font-display">
            Campañas IA
          </span>
          <div className="h-6 w-[1px] bg-outline-variant/60 mx-2"></div>
          
          {/* Tenant Selector Dropdown */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-xs px-3 py-1.5 rounded-lg hover:bg-surface-container-low border border-outline-variant/30 text-body-sm font-semibold transition-all"
              >
                <span>{negocioActivo ? negocioActivo.nombre : 'Seleccionar Negocio'}</span>
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-lg bg-surface border border-outline-variant/50 shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant border-b border-outline-variant/20">
                    Mis Negocios / Agencias
                  </div>
                  {negocios.map((neg) => (
                    <button
                      key={neg.id}
                      onClick={() => {
                        setNegocioActivo(neg);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-body-sm hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                        negocioActivo?.id === neg.id ? 'text-primary font-bold bg-primary/5' : 'text-on-surface'
                      }`}
                    >
                      <span>{neg.nombre}</span>
                      {negocioActivo?.id === neg.id && (
                        <span className="material-symbols-outlined text-sm text-primary">check</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-outline-variant/20 mt-1"></div>
                  <button
                    onClick={() => {
                      onCrearNegocioClick();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-body-sm text-primary hover:bg-surface-container-low font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Nuevo Negocio</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones y Perfil */}
        {user && (
          <div className="flex items-center gap-sm">
            {/* Wallet Credits Indicator */}
            {negocioActivo && (
              <button 
                onClick={onCargarCreditosClick}
                className="flex items-center gap-xs px-3 py-1.5 rounded-full bg-secondary-container/10 border border-secondary/20 hover:bg-secondary-container/20 transition-all cursor-pointer group active:scale-95"
                title="Haga clic para cargar créditos"
              >
                <span className="material-symbols-outlined text-secondary text-sm group-hover:scale-110 transition-transform">
                  auto_awesome
                </span>
                <span className="text-label-sm font-semibold text-secondary">
                  {saldo.toLocaleString()} Créditos
                </span>
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 hover:bg-surface-variant rounded-full transition-all active:scale-95 text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors focus:outline-none ml-2"
              >
                <img 
                  className="w-full h-full object-cover" 
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} 
                  alt="Avatar"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface border border-outline-variant/50 shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-outline-variant/20">
                    <p className="text-xs font-semibold text-on-surface truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={cerrarSesion}
                    className="w-full text-left px-3 py-2 text-body-sm text-error hover:bg-error-container/20 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
