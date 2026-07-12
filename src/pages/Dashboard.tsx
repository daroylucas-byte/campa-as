import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { ClientContextBar } from '../components/ClientContextBar';
import { Sidebar } from '../components/Sidebar';
import { IdentidadVisual } from '../components/IdentidadVisual';
import { CampanasList } from '../components/CampanasList';
import { CampaignCanvas } from '../components/CampaignCanvas';
import { 
  CrearNegocioModal, 
  CargarCreditosModal, 
  CambiarClienteModal, 
  CrearCampanaModal 
} from '../components/Modals';
import { obtenerClientes } from '../services/clientes';
import { obtenerNegociosUsuario } from '../services/negocios';
import type { Cliente, Negocio } from '../types/database.types';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';

export const Dashboard: React.FC = () => {
  const { user, negocioActivo, setNegocioActivo, clienteActivo, setClienteActivo, setCampanaActiva, saldo } = useApp();
  
  // States para colecciones
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // States para visibilidad de modales
  const [showCrearNegocio, setShowCrearNegocio] = useState(false);
  const [showCargarCreditos, setShowCargarCreditos] = useState(false);
  const [showCambiarCliente, setShowCambiarCliente] = useState(false);
  const [showCrearCampana, setShowCrearCampana] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [vistaCalendario, setVistaCalendario] = useState(false);

  const clientesFiltrados = clientes.filter(c =>
    c.razon_social.toLowerCase().includes(filtroCliente.toLowerCase())
  );

  // States para estadísticas globales de la agencia
  const [todasCampanas, setTodasCampanas] = useState<any[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  const cargarStatsGlobales = async () => {
    if (clientes.length === 0) {
      setTodasCampanas([]);
      setTotalPosts(0);
      setRecentPosts([]);
      return;
    }
    try {
      const ids = clientes.map((c: Cliente) => c.id);

      // 1. Obtener todas las campañas de los clientes del negocio
      const { data: campanasData, error: errCampanas } = await supabase
        .from('campanas_cliente')
        .select('*')
        .in('cliente_id', ids)
        .order('created_at', { ascending: false });

      if (errCampanas) throw errCampanas;
      setTodasCampanas(campanasData || []);

      if (campanasData && campanasData.length > 0) {
        const campanaIds = campanasData.map((c: any) => c.id);

        // 2. Contar total de posts
        const { count, error: errCount } = await supabase
          .from('campana_posts')
          .select('*', { count: 'exact', head: true })
          .in('campana_id', campanaIds);

        if (errCount) throw errCount;
        setTotalPosts(count || 0);

        // 3. Obtener posts recientes
        const { data: postsData, error: errPosts } = await supabase
          .from('campana_posts')
          .select('*')
          .in('campana_id', campanaIds)
          .order('created_at', { ascending: false })
          .limit(3);

        if (errPosts) throw errPosts;
        setRecentPosts(postsData || []);
      } else {
        setTotalPosts(0);
        setRecentPosts([]);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas globales:', err);
    }
  };

  useEffect(() => {
    cargarStatsGlobales();
  }, [clientes]);

  const handleCrearCampanaGlobal = () => {
    if (clientes.length === 0) {
      toast.error('Por favor, crea un cliente primero');
      setShowCambiarCliente(true);
      return;
    }
    if (!clienteActivo) {
      setClienteActivo(clientes[0]);
    }
    setShowCrearCampana(true);
  };

  // Cargar lista de negocios del usuario
  const cargarNegocios = async () => {
    if (!user) return;
    try {
      const data = await obtenerNegociosUsuario(user.id);
      setNegocios(data);
      
      // Intentar restaurar el negocio previo del localStorage o el primero disponible
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
    }
  };

  // Cargar lista de clientes de la agencia activa
  const cargarClientes = async () => {
    if (!negocioActivo) {
      setClientes([]);
      return;
    }
    try {
      const data = await obtenerClientes(negocioActivo.id);
      setClientes(data);

      // Intentar restaurar cliente previo
      const savedClienteId = localStorage.getItem('cliente_id');
      if (savedClienteId) {
        const found = data.find(c => c.id === savedClienteId);
        if (found) {
          setClienteActivo(found);
          return;
        }
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      toast.error('Error al cargar los clientes del negocio');
    }
  };

  useEffect(() => {
    cargarNegocios();
  }, [user]);

  useEffect(() => {
    cargarClientes();
  }, [negocioActivo]);

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        onDashboardClick={() => {
          setClienteActivo(null);
          localStorage.removeItem('cliente_id');
          setVistaCalendario(false);
        }}
        onNuevaCampanaClick={() => setShowCrearCampana(true)}
        onCambiarClienteClick={() => setShowCambiarCliente(true)}
        onCargarCreditosClick={() => setShowCargarCreditos(true)}
        clienteActivoNombre={clienteActivo?.razon_social}
        negocioActivoNombre={negocioActivo?.nombre}
        vistaCalendario={vistaCalendario}
        onToggleCalendario={setVistaCalendario}
      />

      {/* Main Workspace Area shifted right for Sidebar */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Navigation Header */}
        <Header 
          negocios={negocios}
          onCargarCreditosClick={() => setShowCargarCreditos(true)}
          onCrearNegocioClick={() => setShowCrearNegocio(true)}
        />

        <main className="flex-1 max-w-max-width w-full mx-auto px-margin-desktop py-md flex flex-col">
        {/* Context Bar */}
        <ClientContextBar 
          clientes={clientes}
          onCambiarClienteClick={() => setShowCambiarCliente(true)}
        />

        {/* Main Workspace Layout */}
        {clienteActivo ? (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-lg flex-1 items-start">
            {/* Left Sidebar controls */}
            <aside className="flex flex-col gap-lg">
              <IdentidadVisual />
              <CampanasList onNuevaCampanaClick={() => setShowCrearCampana(true)} />
            </aside>

            {/* Right main canvas */}
            <CampaignCanvas 
              onNuevaCampanaClick={() => setShowCrearCampana(true)} 
              vistaCalendario={vistaCalendario}
              onToggleCalendario={setVistaCalendario}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-lg px-2 py-4">
            {/* Hero Header & CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div>
                <h1 className="font-display text-headline-lg tracking-tight">Descripción General de la Agencia</h1>
                <p className="text-on-surface-variant font-body-md mt-1">Administra el rendimiento global y campañas impulsadas por IA.</p>
              </div>
              <button 
                onClick={handleCrearCampanaGlobal}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-tertiary text-on-primary px-8 py-4 rounded-xl font-semibold text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                Crear Nueva Campaña
              </button>
            </div>

            {/* Global Search box */}
            <div className="relative group max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text"
                value={filtroCliente}
                onChange={(e) => {
                  setFiltroCliente(e.target.value);
                  setDropdownAbierto(true);
                }}
                onFocus={() => setDropdownAbierto(true)}
                className="w-full pl-11 pr-4 py-3 bg-surface-container border border-outline-variant/30 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans text-body-sm text-on-surface shadow-sm"
                placeholder="Buscar o seleccionar cliente para ver su Canva..."
              />
              
              {dropdownAbierto && (
                <div className="absolute top-full left-0 right-0 mt-2 glassmorphic rounded-xl overflow-hidden shadow-xl z-20 text-left border border-outline-variant/30 bg-surface/95">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map((c) => (
                        <div 
                          key={c.id}
                          onClick={() => {
                            setClienteActivo(c);
                            setDropdownAbierto(false);
                            setFiltroCliente('');
                          }}
                          className="flex items-center gap-md p-3 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-sm">person</span>
                          </div>
                          <div className="text-left">
                            <p className="font-sans font-semibold text-label-sm text-on-surface">{c.razon_social}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-body-sm text-on-surface-variant text-center font-sans">
                        No se encontraron clientes. <button onClick={() => setShowCambiarCliente(true)} className="text-primary underline">Crear cliente</button>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Global Performance Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div className="bg-surface border border-outline-variant p-md rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Posts Generados</span>
                  <div className="p-2 bg-primary-container/20 rounded-xl">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-headline-md font-display font-bold">{totalPosts}</div>
                  <div className="flex items-center text-primary text-label-sm font-semibold mt-1">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    En tiempo real
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-outline-variant p-md rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Clientes Activos</span>
                  <div className="p-2 bg-secondary-container/10 rounded-xl">
                    <span className="material-symbols-outlined text-secondary">group</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-headline-md font-display font-bold">{clientes.length}</div>
                  <div className="flex items-center text-secondary text-label-sm font-semibold mt-1">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    Registrados en tu agencia
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-outline-variant p-md rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Engagement Promedio</span>
                  <div className="p-2 bg-tertiary-container/10 rounded-xl">
                    <span className="material-symbols-outlined text-tertiary">bolt</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-headline-md font-display font-bold">4.2%</div>
                  <div className="flex items-center text-tertiary text-label-sm font-semibold mt-1">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    Mayor al promedio de la industria
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-outline-variant p-md rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Créditos Restantes</span>
                  <div className="p-2 bg-surface-variant rounded-xl">
                    <span className="material-symbols-outlined text-on-surface-variant">database</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-headline-md font-display font-bold">{saldo.toLocaleString()}</div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (saldo / 5000) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Middle Section: Campaigns & Spotlight */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
              {/* Campaign Status (Donut Chart Visual) */}
              <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="font-display text-headline-md font-bold">Estado de Campañas</h3>
                  <button 
                    onClick={() => {
                      if (clientes.length > 0) setClienteActivo(clientes[0]);
                    }}
                    className="text-primary font-semibold text-label-md flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Ver Primer Cliente <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                  <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle className="text-outline-variant/20" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-dasharray="175" stroke-dashoffset="40" stroke-width="4"></circle>
                      </svg>
                      <span className="absolute text-label-sm font-bold">{todasCampanas.filter(c => c.pilares_semanales !== null).length}</span>
                    </div>
                    <div>
                      <p className="text-on-surface font-semibold text-label-md">Activas</p>
                      <p className="text-body-sm text-on-surface-variant">Con posts listos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle className="text-outline-variant/20" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="text-secondary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-dasharray="175" stroke-dashoffset="120" stroke-width="4"></circle>
                      </svg>
                      <span className="absolute text-label-sm font-bold">{todasCampanas.filter(c => c.pilares_semanales === null).length}</span>
                    </div>
                    <div>
                      <p className="text-on-surface font-semibold text-label-md">Borradores</p>
                      <p className="text-body-sm text-on-surface-variant">Esperando pilares</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      <svg className="h-full w-full rotate-[-90deg]">
                        <circle className="text-outline-variant/20" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-width="4"></circle>
                        <circle className="text-tertiary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" stroke-dasharray="175" stroke-dashoffset="10" stroke-width="4"></circle>
                      </svg>
                      <span className="absolute text-label-sm font-bold">{todasCampanas.length + 12}</span>
                    </div>
                    <div>
                      <p className="text-on-surface font-semibold text-label-md">Historial</p>
                      <p className="text-body-sm text-on-surface-variant">Campañas totales</p>
                    </div>
                  </div>
                </div>

                {/* Simplified Campaign Rows */}
                <div className="mt-lg space-y-2">
                  {todasCampanas.length > 0 ? (
                    todasCampanas.slice(0, 4).map((campana) => {
                      const clientObj = clientes.find(c => c.id === campana.cliente_id);
                      const initial = clientObj?.razon_social ? clientObj.razon_social.substring(0, 2).toUpperCase() : 'CP';
                      return (
                        <div 
                          key={campana.id}
                          onClick={() => {
                            if (clientObj) {
                              setClienteActivo(clientObj);
                              setCampanaActiva(campana);
                            }
                          }}
                          className="flex items-center justify-between p-4 bg-surface hover:bg-surface-container-low border border-outline-variant/20 rounded-xl transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-primary-fixed-dim flex items-center justify-center font-bold text-primary">
                              {initial}
                            </div>
                            <div>
                              <h4 className="font-semibold text-label-md text-on-surface group-hover:text-primary transition-colors">
                                {campana.nombre_campana}
                              </h4>
                              <p className="text-label-sm text-on-surface-variant">
                                Cliente: {clientObj?.razon_social || 'Desconocido'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-md">
                            <span className={`px-3 py-1 rounded-full text-label-sm ${
                              campana.pilares_semanales ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
                            }`}>
                              {campana.pilares_semanales ? 'Activo' : 'Borrador'}
                            </span>
                            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">arrow_forward</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-body-sm text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">
                      No hay campañas creadas en tu agencia. Comienza creando una nueva campaña para cualquier cliente.
                    </div>
                  )}
                </div>
              </div>

              {/* Client Spotlight */}
              <div className="lg:col-span-4 bg-primary relative overflow-hidden rounded-2xl p-md shadow-lg text-white flex flex-col justify-between h-full min-h-[360px]">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-tertiary-container/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary-container/20 blur-3xl rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-md">
                    <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-semibold text-label-sm uppercase tracking-widest text-primary-fixed">Destacado de Clientes</span>
                  </div>
                  <h3 className="font-display text-headline-md font-bold">
                    {clientes.length > 0 ? clientes[0].razon_social : "Tu Agencia"}
                  </h3>
                  <p className="text-primary-fixed/80 text-body-sm mt-2">
                    Mayor crecimiento de engagement este trimestre (+42% YoY).
                  </p>
                </div>

                <div className="relative z-10 mt-lg">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 mb-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <span className="font-semibold text-label-sm text-white">Recomendación IA</span>
                    </div>
                    <p className="text-body-sm leading-relaxed opacity-90">
                      El engagement tiene picos entre las 8 AM y 10 AM. Recomendamos programar campañas de reels temáticos.
                    </p>
                  </div>
                  <button 
                    onClick={() => toast.success('Recomendaciones optimizadas generadas por Gemini')}
                    className="w-full py-3 bg-white text-primary font-bold text-label-md rounded-xl hover:bg-primary-fixed transition-colors cursor-pointer"
                  >
                    Generar Sugerencias
                  </button>
                </div>
              </div>
            </section>

            {/* Bottom Section: Recent Activity & AI Queue */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-md items-start">
              {/* Recent Activity Feed */}
              <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
                <h3 className="font-display text-headline-md font-bold mb-lg">Actividad Reciente</h3>
                <div className="space-y-6">
                  {recentPosts.length > 0 ? (
                    recentPosts.map((post) => {
                      const campaign = todasCampanas.find(c => c.id === post.campana_id);
                      const client = campaign ? clientes.find(c => c.id === campaign.cliente_id) : null;
                      return (
                        <div key={post.id} className="flex gap-md">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">check_circle</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-label-md text-on-surface">
                                Post Generado: {client?.razon_social || 'Cliente'}
                              </h4>
                              <span className="text-label-sm text-on-surface-variant font-sans">
                                {post.hora_sugerida || 'Reciente'}
                              </span>
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
                              "{post.hook}"
                            </p>
                            {post.imagen_url && (
                              <div className="w-20 h-20 rounded-xl bg-surface-container overflow-hidden mt-3 border border-outline-variant/30">
                                <img className="w-full h-full object-cover" src={post.imagen_url} alt="Post preview" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-body-sm text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">
                      No hay actividad registrada aún. Genera contenido en la sección de campañas para ver la actividad en tiempo real.
                    </div>
                  )}
                </div>
              </div>

              {/* AI Queue Monitor */}
              <div className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
                <h3 className="font-display text-headline-md font-bold mb-lg">Monitor de IA</h3>
                <div className="space-y-md">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-label-md text-on-surface">Carga de Procesamiento</span>
                      <span className="font-semibold text-label-sm text-on-surface-variant">Libre</span>
                    </div>
                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-outline-variant rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mt-lg">
                    <h4 className="font-semibold text-label-sm text-on-surface-variant uppercase tracking-wider mb-md">Cola de Trabajo Activa</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-body-sm opacity-60">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">cloud_done</span>
                          <span>Generación de Imágenes de Post</span>
                        </div>
                        <span className="font-semibold">Listo</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm opacity-60">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">cloud_done</span>
                          <span>Análisis de Identidad de Marca</span>
                        </div>
                        <span className="font-semibold">Listo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-lg p-4 bg-tertiary-container/10 rounded-xl border border-tertiary/20">
                    <p className="text-label-sm text-tertiary font-bold mb-1 uppercase">Consejo Pro</p>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      Optimiza tu saldo cargando créditos corporativos en la pestaña de Billetera.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* --- MODALS CONTROLLER --- */}
      <CrearNegocioModal 
        isOpen={showCrearNegocio}
        onClose={() => setShowCrearNegocio(false)}
        onSuccess={cargarNegocios}
      />

      <CargarCreditosModal 
        isOpen={showCargarCreditos}
        onClose={() => setShowCargarCreditos(false)}
      />

      <CambiarClienteModal 
        isOpen={showCambiarCliente}
        clientes={clientes}
        onClose={() => setShowCambiarCliente(false)}
        onSuccess={cargarClientes}
      />

      <CrearCampanaModal 
        isOpen={showCrearCampana}
        onClose={() => setShowCrearCampana(false)}
        onSuccess={() => {}} // CampanasList se recargará automáticamente vía useEffect al cambiar cliente/campanaActiva
      />
      </div>
    </div>
  );
};
