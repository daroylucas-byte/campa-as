import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { crearNegocio, cargarSaldo } from '../services/negocios';
import { crearCliente } from '../services/clientes';
import { crearCampana } from '../services/campanas';
import type { Cliente, ObjetivoCampana } from '../types/database.types';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// --- MODAL: CREAR NEGOCIO ---
interface CrearNegocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CrearNegocioModal: React.FC<CrearNegocioModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useApp();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nombre.trim()) return;

    setLoading(true);
    const toastId = toast.loading('Creando negocio...');
    try {
      await crearNegocio(nombre, user.id);
      toast.success('Negocio creado con éxito', { id: toastId });
      setNombre('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear el negocio', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/50 rounded-2xl p-md w-full max-w-md shadow-2xl flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
          <h3 className="text-headline-md text-on-surface font-extrabold flex items-center gap-1">
            <span className="material-symbols-outlined text-primary">domain</span>
            Nuevo Negocio / Agencia
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-xs">
              Nombre de la Agencia o Empresa
            </label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Agencia Marketing Digital"
              required
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-sm justify-end mt-xs">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant/50 hover:bg-surface-container-low rounded-lg font-semibold text-body-sm text-on-surface-variant cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-lg font-semibold text-body-sm shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Negocio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MODAL: CARGAR CREDOTOS / SALDO ---
interface CargarCreditosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CargarCreditosModal: React.FC<CargarCreditosModalProps> = ({ isOpen, onClose }) => {
  const { negocioActivo, user, actualizarSaldo } = useApp();
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negocioActivo || !user || !monto) return;

    setLoading(true);
    const toastId = toast.loading('Cargando saldo...');
    try {
      await cargarSaldo(negocioActivo.id, Number(monto), descripcion || 'Carga manual de créditos', user.id);
      toast.success('Saldo cargado correctamente', { id: toastId });
      setMonto('');
      setDescripcion('');
      await actualizarSaldo();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar el saldo', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/50 rounded-2xl p-md w-full max-w-md shadow-2xl flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
          <h3 className="text-headline-md text-on-surface font-extrabold flex items-center gap-1">
            <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
            Cargar Créditos
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-xs">
              Cantidad de créditos a cargar
            </label>
            <input 
              type="number" 
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 5000"
              required
              min="100"
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-label-md font-semibold text-on-surface-variant mb-xs">
              Descripción / Motivo
            </label>
            <input 
              type="text" 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Carga de cortesía inicial"
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div className="flex gap-sm justify-end mt-xs">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant/50 hover:bg-surface-container-low rounded-lg font-semibold text-body-sm text-on-surface-variant cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-secondary hover:bg-secondary-container text-white rounded-lg font-semibold text-body-sm shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Cargar Saldo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MODAL: CAMBIAR / CREAR CLIENTE ---
interface CambiarClienteModalProps {
  isOpen: boolean;
  clientes: Cliente[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CambiarClienteModal: React.FC<CambiarClienteModalProps> = ({ 
  isOpen, 
  clientes, 
  onClose, 
  onSuccess 
}) => {
  const { negocioActivo, setClienteActivo, clienteActivo } = useApp();
  const [razonSocial, setRazonSocial] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negocioActivo || !razonSocial.trim()) return;

    setLoading(true);
    const toastId = toast.loading('Creando cliente...');
    try {
      const nuevoCliente = await crearCliente(negocioActivo.id, razonSocial);
      toast.success('Cliente creado con éxito', { id: toastId });
      setClienteActivo(nuevoCliente);
      setRazonSocial('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear el cliente', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-outline-variant/50 rounded-2xl p-md w-full max-w-md shadow-2xl flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-xs">
          <h3 className="text-headline-md text-on-surface font-extrabold flex items-center gap-1">
            <span className="material-symbols-outlined text-primary">group</span>
            Seleccionar o Crear Cliente
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Existing Clients List */}
        {clientes.length > 0 && (
          <div className="flex flex-col gap-xs max-h-48 overflow-y-auto pr-1">
            <p className="text-label-sm font-semibold text-on-surface-variant uppercase mb-xs">Clientes existentes:</p>
            {clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setClienteActivo(c);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-body-sm hover:bg-surface-container transition-colors flex items-center justify-between border ${
                  clienteActivo?.id === c.id ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-transparent text-on-surface'
                }`}
              >
                <span>{c.razon_social}</span>
                {clienteActivo?.id === c.id && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-outline-variant/20 pt-sm mt-xs">
          <p className="text-label-sm font-semibold text-on-surface-variant uppercase mb-xs">Crear nuevo cliente:</p>
          <form onSubmit={handleCrear} className="flex gap-sm items-end">
            <div className="flex-1">
              <input 
                type="text" 
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Razón Social del Cliente"
                required
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-lg font-semibold text-body-sm shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


// --- MODAL: CREAR CAMPAÑA ---
interface CrearCampanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CampanaFormInput {
  nombre_campana: string;
  fecha_inicio: string;
  fecha_fin: string;
  objetivo: ObjetivoCampana;
  meta_cuantificable: string;
  publico_objetivo: string;
  contexto_extra: string;
}

export const CrearCampanaModal: React.FC<CrearCampanaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { clienteActivo, setCampanaActiva } = useApp();
  const [loading, setLoading] = useState(false);
  const [plataformasSeleccionadas, setPlataformasSeleccionadas] = useState<string[]>(['Instagram']);

  const { register, handleSubmit, reset } = useForm<CampanaFormInput>();

  const togglePlataforma = (plat: string) => {
    if (plataformasSeleccionadas.includes(plat)) {
      setPlataformasSeleccionadas(prev => prev.filter(p => p !== plat));
    } else {
      setPlataformasSeleccionadas(prev => [...prev, plat]);
    }
  };

  const onSubmit = async (data: CampanaFormInput) => {
    if (!clienteActivo) return;
    if (plataformasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una plataforma de publicación');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creando campaña...');
    try {
      const nuevaCampana = await crearCampana({
        cliente_id: clienteActivo.id,
        nombre_campana: data.nombre_campana,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        objetivo: data.objetivo,
        meta_cuantificable: data.meta_cuantificable,
        plataformas: plataformasSeleccionadas,
        publico_objetivo: data.publico_objetivo,
        contexto_extra: data.contexto_extra,
        estado: 'borrador'
      });

      toast.success('Campaña creada con éxito', { id: toastId });
      setCampanaActiva(nuevaCampana);
      reset();
      setPlataformasSeleccionadas(['Instagram']);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear la campaña', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-surface/95 backdrop-blur-md border border-outline-variant rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden my-8">
        
        {/* Form Header */}
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-white/50">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">New Campaign</h2>
            <p className="text-on-surface-variant text-body-sm mt-1">Configure your AI-powered campaign parameters.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col text-left">
          {/* Scrollable Form Content */}
          <div className="p-md lg:p-lg flex flex-col gap-md overflow-y-auto max-h-[70vh]">
            
            {/* Campaign Name */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block">Campaign Name</label>
              <input 
                type="text" 
                {...register('nombre_campana')}
                className="w-full h-14 bg-surface-container-low border border-outline-variant rounded-xl px-4 text-headline-md font-headline-md text-primary placeholder:text-outline/40" 
                placeholder="e.g. Summer Collection Launch 2024"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant block">Start Date</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                  <input 
                    type="date" 
                    {...register('fecha_inicio')}
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 text-body-md text-on-surface"
                    required
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant block">End Date</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">event</span>
                  <input 
                    type="date" 
                    {...register('fecha_fin')}
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 text-body-md text-on-surface"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Objective & Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant block">Objective</label>
                <select 
                  {...register('objetivo')}
                  required
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 text-body-md text-on-surface"
                >
                  <option value="awareness">Awareness</option>
                  <option value="leads">Leads</option>
                  <option value="ventas">Ventas</option>
                  <option value="engagement">Engagement</option>
                  <option value="trafico">Tráfico</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant block">Goal</label>
                <div className="relative">
                  <input 
                    type="text" 
                    {...register('meta_cuantificable')}
                    className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 pr-10 text-body-md text-on-surface" 
                    placeholder="e.g. 500 conversions"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-help">
                    <span className="material-symbols-outlined text-tertiary text-sm">info</span>
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-on-surface text-surface text-[10px] rounded hidden group-hover:block z-10 shadow-md border border-outline-variant/20 font-sans">
                      you complete this, not the AI
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-sm">
              <label className="font-label-md text-label-md text-on-surface-variant block">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Instagram', icon: 'photo_camera' },
                  { name: 'Facebook', icon: 'face_nod' },
                  { name: 'TikTok', icon: 'music_note' },
                  { name: 'LinkedIn', icon: 'work' },
                  { name: 'Twitter/X', icon: 'close' },
                  { name: 'YouTube', icon: 'play_circle' }
                ].map((plat) => {
                  const isSelected = plataformasSeleccionadas.includes(plat.name);
                  return (
                    <button
                      type="button"
                      key={plat.name}
                      onClick={() => togglePlataforma(plat.name)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-sm transition-all border cursor-pointer ${
                        isSelected 
                          ? 'bg-primary-fixed-dim/30 border-primary text-primary font-bold shadow-sm' 
                          : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container hover:border-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{plat.icon}</span>
                      {plat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block">Target Audience</label>
              <input 
                type="text" 
                {...register('publico_objetivo')}
                className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 text-body-md text-on-surface" 
                placeholder="e.g. Urban professionals, age 25-40, interested in sustainable tech"
                required
              />
            </div>

            {/* Additional Context */}
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant block">Additional Context</label>
              <textarea 
                {...register('contexto_extra')}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-4 text-body-md text-on-surface resize-none" 
                placeholder="Describe specific brand voice guidelines, product USPs, or creative direction for the AI to follow..." 
                rows={4}
              />
            </div>

            {/* Contextual Tip */}
            <div className="mt-md flex items-start gap-4 p-md bg-surface-container rounded-xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                <strong>Tip:</strong> The more detail you provide in the <span className="text-primary font-bold">Additional Context</span> field, the better our generative engine can align the copy and visuals with your client's specific brand identity.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-md border-t border-outline-variant flex items-center justify-end gap-md bg-white/50">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary px-8 py-3 rounded-xl flex items-center gap-3 text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="font-label-md text-label-md">{loading ? 'Creando...' : 'Crear y Generar Campaña'}</span>
              <div className="h-4 w-px bg-white/30 mx-1"></div>
              <span className="font-label-sm text-label-sm opacity-90">Borrador</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
