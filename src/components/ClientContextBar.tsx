import React from 'react';
import { useApp } from '../context/AppContext';
import type { Cliente } from '../types/database.types';

interface ClientContextBarProps {
  clientes: Cliente[];
  onCambiarClienteClick: () => void;
}

export const ClientContextBar: React.FC<ClientContextBarProps> = ({
  clientes,
  onCambiarClienteClick
}) => {
  const { clienteActivo, saldo, loadingSaldo } = useApp();

  return (
    <div className="flex flex-col md:flex-row gap-gutter mb-lg w-full">
      {/* Selected Client Card */}
      <div className="flex-1 glass-card p-md rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-md">
          {/* Client Logo / Thumbnail */}
          <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/60 overflow-hidden">
            {clienteActivo ? (
              <img 
                className="w-full h-full object-cover" 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${clienteActivo.razon_social}&backgroundColor=6366f1`} 
                alt={clienteActivo.razon_social}
              />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-2xl">
                domain
              </span>
            )}
          </div>

          <div>
            <h2 className="font-display text-headline-md leading-tight text-on-surface">
              {clienteActivo ? clienteActivo.razon_social : 'Sin Cliente Activo'}
            </h2>
            <p className="text-on-surface-variant text-body-sm font-sans">
              {clienteActivo ? 'Cliente de Agencia Registrado' : 'Selecciona un cliente para comenzar'}
            </p>
          </div>
        </div>

        {clientes.length > 0 && (
          <button 
            onClick={onCambiarClienteClick}
            className="text-primary font-semibold hover:bg-primary/5 px-4 py-2 rounded-lg transition-all border border-primary/20 flex items-center gap-xs cursor-pointer active:scale-95 text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Cambiar cliente
          </button>
        )}
      </div>

      {/* Wallet Card */}
      <div className="w-full md:w-80 bg-gradient-to-br from-tertiary-container to-secondary p-md rounded-xl text-on-primary-container shadow-lg flex flex-col justify-center relative overflow-hidden">
        {/* Background icon decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
        </div>
        
        <div className="relative z-10">
          <p className="text-label-sm font-semibold uppercase tracking-wider opacity-90 mb-1">
            Balance de Créditos IA
          </p>
          
          <div className="flex items-baseline gap-xs">
            <span className="text-[32px] font-bold">
              {loadingSaldo ? '...' : saldo.toLocaleString()}
            </span>
            <span className="text-label-sm font-normal">créditos</span>
          </div>

          {/* Simple progress bar decoration */}
          <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500" 
              style={{ width: `${Math.min(100, (saldo / 5000) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
