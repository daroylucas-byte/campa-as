import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  obtenerPostsCampana, 
  ejecutarGenerarCampana, 
  ejecutarGenerarSemanaCampana, 
  ejecutarGenerarImagenCampana, 
  actualizarPost, 
  eliminarPostsDeSemana,
  obtenerCampanaPorId
} from '../services/campanas';
import type { CampanaPost, PilarSemanal } from '../types/database.types';
import toast from 'react-hot-toast';

interface CampaignCanvasProps {
  onNuevaCampanaClick: () => void;
  vistaCalendario: boolean;
  onToggleCalendario: (val: boolean) => void;
}

export const CampaignCanvas: React.FC<CampaignCanvasProps> = ({
  onNuevaCampanaClick,
  vistaCalendario,
  onToggleCalendario
}) => {
  const { campanaActiva, setCampanaActiva, user, actualizarSaldo } = useApp();
  const [posts, setPosts] = useState<CampanaPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [semanasGenerando, setSemanasGenerando] = useState<Record<number, boolean>>({});
  const [imagenesGenerando, setImagenesGenerando] = useState<Record<string, boolean>>({});
  const [semanaActiva, setSemanaActiva] = useState(1);

  // States para la edición de posts
  const [editingPost, setEditingPost] = useState<CampanaPost | null>(null);
  const [editCopy, setEditCopy] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editHora, setEditHora] = useState('');
  const [editHook, setEditHook] = useState('');
  const [editCTA, setEditCTA] = useState('');
  const [editHashtagsStr, setEditHashtagsStr] = useState('');

  // Sugerencias de texto libre para regenerar imágenes
  const [sugerenciasRegeneracion, setSugerenciasRegeneracion] = useState<Record<string, string>>({});

  const [activeSlideIndices, setActiveSlideIndices] = useState<Record<string, number>>({});
  const [activeDropdownPostId, setActiveDropdownPostId] = useState<string | null>(null);
  const [progresoGeneracion, setProgresoGeneracion] = useState<Record<string, string>>({});
  const [formatosSeleccionados, setFormatosSeleccionados] = useState<Record<string, 'simple' | 'feed' | 'carrusel'>>({});

  const cargarPosts = async () => {
    if (!campanaActiva) return;
    setLoadingPosts(true);
    try {
      const data = await obtenerPostsCampana(campanaActiva.id);
      setPosts(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar los posts de la campaña');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    cargarPosts();
    setSemanaActiva(1);
  }, [campanaActiva]);

  // Generar pilares de campaña (plan de 30 días)
  const handleGenerarPlan = async () => {
    if (!campanaActiva) return;
    setLoadingPlan(true);
    const toastId = toast.loading('Generando plan de pilares semanales con IA...');
    try {
      await ejecutarGenerarCampana(campanaActiva.id, user?.id);
      toast.success('¡Plan de campaña generado con éxito!', { id: toastId });
      
      // Actualizar saldo de créditos
      await actualizarSaldo();

      // Obtener la campaña actualizada directamente de la base de datos
      const campanaActualizada = await obtenerCampanaPorId(campanaActiva.id);
      setCampanaActiva(campanaActualizada);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al generar el plan de campaña', { id: toastId });
    } finally {
      setLoadingPlan(false);
    }
  };

  // Generar los posts de una semana específica
  const handleGenerarSemana = async (semanaNum: number) => {
    if (!campanaActiva) return;
    setSemanasGenerando(prev => ({ ...prev, [semanaNum]: true }));
    const toastId = toast.loading(`Generando posts de la Semana ${semanaNum}...`);
    try {
      await ejecutarGenerarSemanaCampana(campanaActiva.id, semanaNum, user?.id);
      toast.success(`Semana ${semanaNum} generada con éxito`, { id: toastId });
      
      await actualizarSaldo();
      await cargarPosts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Error al generar posts de la Semana ${semanaNum}`, { id: toastId });
    } finally {
      setSemanasGenerando(prev => ({ ...prev, [semanaNum]: false }));
    }
  };

  // Regenerar / Limpiar semana para volver a crearla
  const handleLimpiarSemana = async (semanaNum: number) => {
    if (!campanaActiva) return;
    if (!confirm(`¿Estás seguro de que quieres borrar todos los posts de la Semana ${semanaNum}?\nEsta acción no se puede deshacer.`)) return;
    
    const toastId = toast.loading(`Limpiando posts de la Semana ${semanaNum}...`);
    try {
      await eliminarPostsDeSemana(campanaActiva.id, semanaNum);
      toast.success(`Semana ${semanaNum} restablecida`, { id: toastId });
      await cargarPosts();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al restablecer la semana', { id: toastId });
    }
  };

  // Generar la imagen para un post específico
  const handleGenerarImagen = async (
    postId: string, 
    sugerencia?: string, 
    formato: 'simple' | 'feed' | 'carrusel' = 'simple'
  ) => {
    setImagenesGenerando(prev => ({ ...prev, [postId]: true }));
    
    // Configurar y arrancar progreso dinámico
    let seconds = 0;
    const progressToastPrefix = formato === 'carrusel' 
      ? 'Generando carrusel de 5 imágenes' 
      : formato === 'feed' 
      ? 'Generando feed de 3 imágenes' 
      : 'Generando imagen';
    
    setProgresoGeneracion(prev => ({ ...prev, [postId]: 'Iniciando generación...' }));
    const toastId = toast.loading(`${progressToastPrefix}...`);
    
    const interval = setInterval(() => {
      seconds++;
      let text = 'Generando...';
      if (formato === 'simple') {
        if (seconds < 3) text = 'Planificando escena...';
        else if (seconds < 10) text = 'Generando imagen...';
        else text = 'Finalizando...';
      } else if (formato === 'feed') {
        if (seconds < 4) text = 'Planificando guión de escenas...';
        else if (seconds < 12) text = 'Generando imagen 1 de 3...';
        else if (seconds < 20) text = 'Generando imagen 2 de 3...';
        else if (seconds < 28) text = 'Generando imagen 3 de 3...';
        else text = 'Finalizando...';
      } else if (formato === 'carrusel') {
        if (seconds < 5) text = 'Planificando guión narrativo...';
        else if (seconds < 14) text = 'Generando imagen 1 de 5...';
        else if (seconds < 23) text = 'Generando imagen 2 de 5...';
        else if (seconds < 32) text = 'Generando imagen 3 de 5...';
        else if (seconds < 41) text = 'Generando imagen 4 de 5...';
        else if (seconds < 50) text = 'Generando imagen 5 de 5...';
        else text = 'Finalizando...';
      }
      setProgresoGeneracion(prev => ({ ...prev, [postId]: text }));
      toast.loading(`${progressToastPrefix} (${text})...`, { id: toastId });
    }, 1000);

    try {
      const res = await ejecutarGenerarImagenCampana(postId, user?.id, sugerencia, formato);
      clearInterval(interval);
      toast.success('Imágenes generadas e incorporadas', { id: toastId });
      
      await actualizarSaldo();
      
      // Actualizar lista local de posts con la URL de la imagen generada
      setPosts(prev => prev.map(p => p.id === postId ? { 
        ...p, 
        imagen_url: res.imagen_url,
        imagenes_urls: res.imagenes_urls,
        formato_imagen: res.formato as 'simple' | 'feed' | 'carrusel'
      } : p));

      // Resetear índice de slide al primer elemento
      setActiveSlideIndices(prev => ({ ...prev, [postId]: 0 }));

      // Limpiar la sugerencia de este post
      setSugerenciasRegeneracion(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      toast.error(err.message || 'Error al generar la imagen', { id: toastId });
    } finally {
      clearInterval(interval);
      setImagenesGenerando(prev => ({ ...prev, [postId]: false }));
      setProgresoGeneracion(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }
  };

  const handleNextSlide = (postId: string, total: number) => {
    setActiveSlideIndices(prev => ({
      ...prev,
      [postId]: (prev[postId] !== undefined ? prev[postId] + 1 : 1) % total
    }));
  };

  const handlePrevSlide = (postId: string, total: number) => {
    setActiveSlideIndices(prev => ({
      ...prev,
      [postId]: (prev[postId] !== undefined ? prev[postId] - 1 + total : total - 1) % total
    }));
  };

  const handleDescargarImagen = async (url: string, filename: string) => {
    const toastId = toast.loading('Preparando descarga de imagen...');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error de red');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Descarga iniciada', { id: toastId });
    } catch (err) {
      console.error('Error al descargar la imagen:', err);
      window.open(url, '_blank');
      toast.success('Imagen abierta en nueva pestaña para descargar', { id: toastId });
    }
  };

  // Cambiar estado de aprobación del post
  const handleCambiarEstadoPost = async (postId: string, nuevoEstado: 'pendiente' | 'aprobada' | 'rechazada') => {
    try {
      const postActualizado = await actualizarPost(postId, { estado: nuevoEstado });
      setPosts(prev => prev.map(p => p.id === postId ? postActualizado : p));
      toast.success(`Post marcado como ${nuevoEstado}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cambiar el estado del post');
    }
  };

  const handleOpenEditModal = (post: CampanaPost) => {
    setEditingPost(post);
    setEditCopy(post.copy || '');
    setEditFecha(post.fecha || '');
    setEditHora(post.hora_sugerida || '12:00 PM');
    setEditHook(post.hook || '');
    setEditCTA(post.cta || '');
    setEditHashtagsStr(post.hashtags ? post.hashtags.join(', ') : '');
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    const toastId = toast.loading('Guardando cambios del post...');
    try {
      const hashtagsArray = editHashtagsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const updated = await actualizarPost(editingPost.id, {
        hook: editHook,
        copy: editCopy,
        fecha: editFecha || null,
        hora_sugerida: editHora,
        cta: editCTA,
        hashtags: hashtagsArray
      });

      // Actualizar el estado local de posts
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      
      toast.success('Post actualizado con éxito', { id: toastId });
      setEditingPost(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar los cambios del post', { id: toastId });
    }
  };

  // --- RENDERS ---

  // 1. Estado vacío: Sin campaña activa
  if (!campanaActiva) {
    return (
      <section className="relative h-full min-h-[600px] flex items-center justify-center overflow-hidden w-full bg-surface-container-lowest/50 border border-outline-variant/30 rounded-2xl p-lg">
        {/* Background Decorative Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[80px]"></div>
        </div>
        
        {/* Empty State Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in gap-sm">
          <div className="w-24 h-24 rounded-3xl bg-surface-container flex items-center justify-center mb-4 shadow-sm border border-outline-variant/60 relative">
            <span className="material-symbols-outlined text-primary text-5xl">rocket_launch</span>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm shadow-lg">
              <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
            </div>
          </div>
          
          <h2 className="font-display text-headline-lg text-on-surface">
            ¿Listo para despegar?
          </h2>
          
          <p className="text-body-lg text-on-surface-variant mb-4">
            Crea o selecciona una campaña de marketing de 30 días. Utilizaremos el análisis de identidad visual de tu cliente para generar contenidos perfectamente alineados.
          </p>
          
          <button 
            onClick={onNuevaCampanaClick}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 px-lg rounded-xl font-semibold text-lg flex items-center justify-center gap-md shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Crear Nueva Campaña
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </div>
      </section>
    );
  }

  const pilares: PilarSemanal[] = campanaActiva.pilares_semanales || [];

  // 2. Campaña activa pero SIN plan de pilares
  if (pilares.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-md text-left w-full">
        {/* Campaign Info Card */}
        <div className="glass-card p-md rounded-xl shadow-sm border-l-4 border-l-primary flex flex-col gap-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-semibold uppercase">
                Borrador
              </span>
              <h2 className="text-headline-lg font-display mt-2 text-on-surface">
                {campanaActiva.nombre_campana}
              </h2>
            </div>
            <div className="text-right text-body-sm text-on-surface-variant">
              <p>Inicio: {new Date(campanaActiva.fecha_inicio).toLocaleDateString()}</p>
              <p>Fin: {new Date(campanaActiva.fecha_fin).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm border-t border-outline-variant/20 pt-sm mt-xs">
            <div>
              <p className="text-label-sm font-semibold text-on-surface-variant uppercase">Objetivo:</p>
              <p className="text-body-md text-on-surface capitalize font-medium">{campanaActiva.objetivo}</p>
            </div>
            <div>
              <p className="text-label-sm font-semibold text-on-surface-variant uppercase">Meta Cuantificable:</p>
              <p className="text-body-md text-on-surface font-medium">{campanaActiva.meta_cuantificable || 'No especificada'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-label-sm font-semibold text-on-surface-variant uppercase">Público Objetivo:</p>
              <p className="text-body-sm text-on-surface">{campanaActiva.publico_objetivo}</p>
            </div>
          </div>
        </div>

        {/* Generate Plan CTA */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-lg text-center flex flex-col items-center gap-md py-xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              schema
            </span>
          </div>
          <div>
            <h3 className="text-headline-md text-on-surface font-bold">Planificación Estratégica Pendiente</h3>
            <p className="text-body-md text-on-surface-variant mt-2 max-w-xl mx-auto">
              Para generar las piezas publicitarias individuales, primero la inteligencia artificial debe elaborar la matriz estratégica de 4 pilares semanales basada en la identidad visual del cliente.
            </p>
          </div>
          <button
            onClick={handleGenerarPlan}
            disabled={loadingPlan}
            className={`px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all ${
              loadingPlan 
                ? 'bg-primary/60 cursor-not-allowed animate-pulse' 
                : 'bg-primary hover:bg-primary-container shadow-primary/20'
            }`}
          >
            {loadingPlan ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                Estructurando pilares con IA...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Generar Plan de Campaña
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs">-1200 Cr</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

// 3. Campaña activa CON plan de pilares
  return (
    <div className="flex-1 flex flex-col gap-lg text-left w-full">
      {/* Campaign Header Section */}
      <section className="mb-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-md">
          <div>
            <nav className="flex items-center gap-xs text-on-surface-variant font-semibold text-label-md mb-base">
              <span>Campañas</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary">{campanaActiva.nombre_campana}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-md">
              <h1 className="font-display text-headline-lg text-on-surface">{campanaActiva.nombre_campana}</h1>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest text-primary border border-primary/20 font-semibold text-label-sm flex items-center gap-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Strategic Planning Phase
              </span>
            </div>
          </div>
          <div className="flex gap-sm">
            <button 
              onClick={onNuevaCampanaClick}
              className="px-6 py-3 rounded-xl border border-outline font-semibold text-label-md text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Nuevo Brief
            </button>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-label-md shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-sm cursor-pointer">
              <span className="material-symbols-outlined">share</span>
              Export Strategy
            </button>
          </div>
        </div>

        {/* Campaign Metadata Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="glass-card p-md rounded-2xl flex items-center gap-md bg-white/70">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">target</span>
            </div>
            <div>
              <p className="font-semibold text-label-sm text-on-surface-variant uppercase tracking-wider">Objetivo</p>
              <p className="font-display text-body-lg text-on-surface capitalize">{campanaActiva.objetivo}</p>
            </div>
          </div>
          <div className="glass-card p-md rounded-2xl flex items-center gap-md bg-white/70">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
            </div>
            <div>
              <p className="font-semibold text-label-sm text-on-surface-variant uppercase tracking-wider">Timeline</p>
              <p className="font-display text-body-lg text-on-surface">
                {new Date(campanaActiva.fecha_inicio).toLocaleDateString()} - {new Date(campanaActiva.fecha_fin).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="glass-card p-md rounded-2xl flex items-center gap-md bg-white/70">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">ads_click</span>
            </div>
            <div>
              <p className="font-semibold text-label-sm text-on-surface-variant uppercase tracking-wider">Canales</p>
              <p className="font-display text-body-lg text-on-surface capitalize">
                {campanaActiva.plataformas ? campanaActiva.plataformas.join(', ') : 'Omnicanal'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Resumen Ejecutivo */}
      <section className="mb-lg">
        <div className="relative overflow-hidden p-8 rounded-[32px] bg-tertiary-fixed-dim/30 border border-tertiary/20 shadow-md">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-tertiary/10 blur-[100px] rounded-full"></div>
          <div className="absolute top-1/2 -left-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full"></div>
          <div className="relative z-10 flex flex-col lg:flex-row gap-lg">
            <div className="lg:w-2/3 text-left">
              <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h2 className="font-display text-headline-md text-tertiary">Resumen Ejecutivo</h2>
              </div>
              <div className="space-y-md text-on-surface/90 leading-relaxed font-sans text-body-md">
                <p>
                  Esta campaña estratégica está diseñada para potenciar a la marca mediante pilares orientados a su público objetivo: <strong>{campanaActiva.publico_objetivo}</strong>.
                </p>
                <p>
                  {campanaActiva.contexto_extra || 'El plan de marketing abarcará una narrativa dinámica de 30 días, articulando mensajes clave optimizados para los canales seleccionados, asegurando coherencia e impacto visual.'}
                </p>
              </div>
            </div>
            <div className="lg:w-1/3 flex flex-col justify-center">
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-md border border-white/50 text-left">
                <h3 className="font-semibold text-label-md text-tertiary mb-sm uppercase tracking-widest text-[11px]">Key Insights</h3>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm text-body-sm font-sans">
                    <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
                    <span>Público: {campanaActiva.publico_objetivo.slice(0, 45)}...</span>
                  </li>
                  <li className="flex items-start gap-sm text-body-sm font-sans">
                    <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
                    <span>Canales: {campanaActiva.plataformas ? campanaActiva.plataformas.join(', ') : 'Instagram'}</span>
                  </li>
                  <li className="flex items-start gap-sm text-body-sm font-sans">
                    <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
                    <span>Tono: Autoritativo, Seguro, Innovador</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Timeline Tabs */}
      <section className="mb-xl text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-md gap-md">
          <h2 className="font-display text-headline-md text-on-surface">Planificación Semanal</h2>
          <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant">
            {pilares.map((pilar) => (
              <button
                key={pilar.semana}
                onClick={() => setSemanaActiva(pilar.semana)}
                className={`px-6 py-2 rounded-lg font-semibold text-label-md transition-all duration-200 cursor-pointer ${
                  semanaActiva === pilar.semana
                    ? 'bg-white shadow-sm text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semana {pilar.semana}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab Content Card */}
        {(() => {
          const pilarSeleccionado = pilares.find(p => p.semana === semanaActiva) || pilares[0];
          if (!pilarSeleccionado) return null;
          const postsSemana = posts.filter(p => p.semana === semanaActiva);
          const isGeneratingSemana = semanasGenerando[semanaActiva] || false;

          return (
            <div className="transition-all duration-300 opacity-100">
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-md">
                <div className="xl:col-span-3 space-y-md">
                  <div className="glass-card p-xl rounded-[24px] border-l-4 border-l-primary relative overflow-hidden bg-white/70">
                    <div className="absolute top-0 right-0 p-md opacity-5">
                      <span className="material-symbols-outlined text-[120px]">explore</span>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-sm mb-base flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-primary-fixed-dim text-primary text-[10px] font-bold uppercase tracking-widest">
                          Activo Principal
                        </span>
                        <h3 className="font-display text-headline-md text-on-surface">
                          Eje Temático: {pilarSeleccionado.eje}
                        </h3>
                      </div>
                      <p className="text-body-lg font-sans text-on-surface-variant mb-lg leading-relaxed mt-2">
                        {pilarSeleccionado.enfoque}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                        <div className="bg-surface-container/50 p-md rounded-xl">
                          <p className="font-semibold text-label-sm text-on-surface-variant mb-xs">MÉTRICA OBJETIVO</p>
                          <p className="font-display text-headline-md text-primary">15% Engagement Rate</p>
                        </div>
                        <div className="bg-surface-container/50 p-md rounded-xl">
                          <p className="font-semibold text-label-sm text-on-surface-variant mb-xs">FORMATOS RECOMENDADOS</p>
                          <p className="font-display text-headline-md text-on-surface">Reels &amp; Carousel Ads</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generator Sidebar */}
                <div className="xl:col-span-2">
                  {postsSemana.length > 0 ? (
                    <div className="bg-surface-container-high rounded-[24px] p-xl flex flex-col items-center justify-center text-center h-full relative overflow-hidden group border border-outline-variant/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-emerald-500 mb-md relative z-10">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                      </div>
                      <h4 className="font-display text-headline-md text-on-surface mb-sm relative z-10">Semana Planificada</h4>
                      <p className="text-body-md font-sans text-on-surface-variant mb-lg max-w-xs relative z-10">
                        ¡Los copys y assets visuales optimizados para esta semana ya están listos!
                      </p>
                      <button 
                        onClick={() => handleLimpiarSemana(semanaActiva)}
                        className="w-full bg-error-container/20 border border-error/20 hover:bg-error-container/40 text-error py-4 rounded-xl font-semibold text-label-md shadow-sm flex items-center justify-center gap-sm transition-all active:scale-95 relative z-10 cursor-pointer"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        Limpiar semana
                      </button>
                    </div>
                  ) : (
                    <div className="bg-surface-container-high rounded-[24px] p-xl flex flex-col items-center justify-center text-center h-full relative overflow-hidden group border border-outline-variant/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center text-tertiary mb-md relative z-10">
                        <span className="material-symbols-outlined text-4xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                          auto_awesome
                        </span>
                      </div>
                      <h4 className="font-display text-headline-md text-on-surface mb-sm relative z-10">Listos para Crear</h4>
                      <p className="text-body-md font-sans text-on-surface-variant mb-lg max-w-xs relative z-10">
                        Genera automáticamente todos los copys y assets visuales optimizados para esta semana.
                      </p>
                      <button 
                        onClick={() => handleGenerarSemana(semanaActiva)}
                        disabled={isGeneratingSemana}
                        className="w-full bg-tertiary hover:bg-tertiary-container text-white py-4 rounded-xl font-semibold text-label-md shadow-lg shadow-tertiary/20 flex items-center justify-center gap-sm transition-all active:scale-95 relative z-10 cursor-pointer disabled:opacity-50"
                      >
                        {isGeneratingSemana ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                            Generando posts...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">magic_button</span>
                            Generar Posts de esta Semana
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold ml-1">-1200 créditos</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Posts Content Grid */}
              <div className="mt-lg">
                <div className="flex justify-between items-center mb-md flex-wrap gap-sm">
                  <h3 className="font-display text-headline-md text-on-surface">Posts Generados</h3>
                  <div className="flex items-center gap-sm">
                    <button 
                      onClick={() => onToggleCalendario(false)}
                      className={`px-4 py-2 rounded-xl border font-semibold text-body-sm flex items-center gap-1 transition-all cursor-pointer ${
                        !vistaCalendario 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'border-outline-variant hover:bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                      Lista
                    </button>
                    <button 
                      onClick={() => onToggleCalendario(true)}
                      className={`px-4 py-2 rounded-xl border font-semibold text-body-sm flex items-center gap-1 transition-all cursor-pointer ${
                        vistaCalendario 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'border-outline-variant hover:bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      Calendario
                    </button>
                  </div>
                </div>

                {loadingPosts ? (
                  <div className="text-center py-6 text-body-sm text-on-surface-variant animate-pulse font-sans">
                    Cargando posts de la semana...
                  </div>
                ) : postsSemana.length === 0 ? (
                  <div className="text-center py-12 bg-surface-container rounded-lg border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-on-surface-variant text-body-sm min-h-[200px]">
                    <span className="material-symbols-outlined text-4xl mb-2 text-outline/60">post_add</span>
                    Aún no has generado las piezas editoriales de esta semana. Haz clic en "Generar Posts de esta Semana" arriba.
                  </div>
                ) : vistaCalendario ? (
                  <div className="overflow-x-auto pb-4">
                    <div className="grid grid-cols-7 gap-md min-w-[1150px]">
                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((diaNombre, idx) => {
                        // fecha_inicio es el día 1 real de la campaña (sea cual sea el día de la
                        // semana calendario en que caiga), y "Lunes"/"Martes"/etc. es la posición
                        // secuencial dentro de la semana (1º, 2º día...), no el día calendario real.
                        // Por eso agrupamos por offset en días desde el inicio de ESA semana
                        // ((semana-1)*7 días después de fecha_inicio), módulo 7 — no por getUTCDay().
                        const postsConFecha = postsSemana.filter((p) => !!p.fecha);
                        const postsDelDia = postsConFecha.length > 0
                          ? postsSemana.filter((p) => {
                              if (!p.fecha || !campanaActiva?.fecha_inicio) return false;
                              const inicio = new Date(`${campanaActiva.fecha_inicio}T00:00:00Z`);
                              const fechaPost = new Date(`${p.fecha}T00:00:00Z`);
                              const diasDesdeInicio = Math.round(
                                (fechaPost.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
                              );
                              return ((diasDesdeInicio % 7) + 7) % 7 === idx;
                            })
                          : postsSemana.filter((_, postIndex) => postIndex % 7 === idx);

                        const primerPostConFecha = postsDelDia.find((p) => !!p.fecha);
                        const numeroDia = primerPostConFecha?.fecha
                          ? new Date(`${primerPostConFecha.fecha}T00:00:00Z`).getUTCDate()
                          : idx + 1;

                        return (
                          <div key={idx} className="flex flex-col gap-sm">
                            {/* Day Header */}
                            <div className="flex flex-col items-center py-sm rounded-2xl glass-card bg-surface-container border-b-4 border-primary">
                              <span className="font-semibold text-on-surface-variant uppercase tracking-widest text-[10px] font-sans">
                                {diaNombre.substring(0, 3)}
                              </span>
                              <span className="font-display text-headline-md text-primary mt-0.5">
                                {numeroDia}
                              </span>
                            </div>

                            {/* Posts Container */}
                            <div className="flex-1 flex flex-col gap-sm p-2 rounded-2xl bg-surface-container/20 border border-dashed border-outline-variant min-h-[400px]">
                              {postsDelDia.map((post) => {
                                let platformIcon = "share";
                                let platformColor = "bg-primary/10 text-primary border-primary/20";
                                if (post.plataforma.toLowerCase() === 'linkedin') {
                                  platformIcon = "brand_family";
                                  platformColor = "bg-secondary/10 text-secondary border-secondary/20";
                                } else if (post.plataforma.toLowerCase() === 'facebook') {
                                  platformIcon = "groups";
                                  platformColor = "bg-tertiary/10 text-tertiary border-tertiary/20";
                                }

                                return (
                                  <div 
                                    key={post.id} 
                                    className={`p-2.5 rounded-xl glass-card bg-white hover:shadow-lg transition-all duration-300 border-l-4 text-left ${
                                      post.estado === 'aprobada' 
                                        ? 'border-l-emerald-500' 
                                        : post.estado === 'rechazada' 
                                        ? 'border-l-error' 
                                        : 'border-l-amber-500'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center gap-xs mb-xs">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-0.5 ${platformColor}`}>
                                        <span className="material-symbols-outlined text-[10px]">{platformIcon}</span>
                                        {post.plataforma}
                                      </span>
                                      <span className={`flex items-center justify-center w-5 h-5 rounded-full ${
                                        post.estado === 'aprobada' 
                                          ? 'bg-green-50 text-green-600' 
                                          : post.estado === 'rechazada' 
                                          ? 'bg-red-50 text-red-600' 
                                          : 'bg-amber-50 text-amber-600'
                                      }`} title={post.estado.toUpperCase()}>
                                        <span className="material-symbols-outlined text-[12px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                          {post.estado === 'aprobada' ? 'check_circle' : post.estado === 'rechazada' ? 'cancel' : 'pending'}
                                        </span>
                                      </span>
                                    </div>
                                    <p className="text-[12px] font-medium text-on-surface line-clamp-3 mb-xs font-sans leading-snug">
                                      "{post.hook}"
                                    </p>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                                      <span className="text-[9px] text-on-surface-variant font-medium font-sans flex flex-col">
                                        <span>{post.hora_sugerida || '12:00 PM'}</span>
                                        {post.fecha && (
                                          <span className="text-[8px] opacity-75">
                                            {new Date(post.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' })}
                                          </span>
                                        )}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleOpenEditModal(post)}
                                          className="text-on-surface-variant hover:text-primary hover:scale-110 transition-transform cursor-pointer"
                                          title="Editar publicación"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">edit</span>
                                        </button>
                                        <button 
                                          onClick={() => handleCambiarEstadoPost(post.id, post.estado === 'aprobada' ? 'pendiente' : 'aprobada')}
                                          className="text-primary hover:scale-110 transition-transform cursor-pointer"
                                          title={post.estado === 'aprobada' ? 'Revertir a Pendiente' : 'Aprobar Post'}
                                        >
                                          <span className="material-symbols-outlined text-[14px]">
                                            {post.estado === 'aprobada' ? 'undo' : 'check_circle'}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-md">
                    {postsSemana.map((post, index) => {
                      const isGeneratingImg = imagenesGenerando[post.id] || false;
                      const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                      const diaNombre = diasSemana[index % 7] || `Día ${index + 1}`;

                      const hasImages = !!post.imagen_url;
                      const imagesList = post.imagenes_urls && post.imagenes_urls.length > 0
                        ? post.imagenes_urls
                        : (post.imagen_url ? [post.imagen_url] : []);
                      const activeSlideIdx = activeSlideIndices[post.id] || 0;
                      const currentIdx = activeSlideIdx >= imagesList.length ? 0 : activeSlideIdx;
                      const currentImage = imagesList[currentIdx] || '';
                      // Si el usuario ya eligió un formato manualmente en esta sesión, respetarlo.
                      // Si no, partir del formato que el post ya tiene generado (para que
                      // "Regenerar" no vuelva silenciosamente a 'simple' en un post que es
                      // feed/carrusel). Solo cae a 'simple' si el post no tiene nada generado aún.
                      const selectedFormat = formatosSeleccionados[post.id] || post.formato_imagen || 'simple';

                      // Get icon based on platform
                      let platformIcon = "share";
                      let platformColor = "bg-primary/10 text-primary";
                      if (post.plataforma.toLowerCase() === 'linkedin') {
                        platformIcon = "brand_family";
                        platformColor = "bg-secondary/10 text-secondary";
                      } else if (post.plataforma.toLowerCase() === 'facebook') {
                        platformIcon = "groups";
                        platformColor = "bg-tertiary/10 text-tertiary";
                      }

                      return (
                        <article 
                          key={post.id}
                          className={`bg-surface-container-lowest border rounded-[24px] p-md shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 ${
                            post.estado === 'aprobada' 
                              ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' 
                              : post.estado === 'rechazada' 
                              ? 'border-error/20 bg-error/5' 
                              : 'border-outline-variant'
                          }`}
                        >
                          {/* Top Row */}
                          <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
                            <div className="flex items-center gap-xs">
                              <span className="px-sm py-1 bg-surface-container text-on-surface font-semibold text-[12px] rounded-full font-sans">
                                {diaNombre} (Día {index + 1})
                              </span>
                              <span className={`px-sm py-1 ${platformColor} font-semibold text-[12px] rounded-full flex items-center gap-1 font-sans`}>
                                <span className="material-symbols-outlined text-[14px]">{platformIcon}</span>
                                {post.plataforma}
                              </span>
                              <span className="px-sm py-1 bg-surface-container-high text-on-surface-variant font-semibold text-[12px] rounded-full capitalize font-sans">
                                {post.tipo_contenido}
                              </span>
                            </div>

                            {post.estado === 'aprobada' ? (
                              <span className="px-md py-1 bg-green-100 text-green-800 font-semibold text-[12px] rounded-full flex items-center gap-1 font-sans">
                                <span className="material-symbols-outlined text-[16px]">verified</span> Aprobado
                              </span>
                            ) : post.estado === 'rechazada' ? (
                              <span className="px-md py-1 bg-red-100 text-red-800 font-semibold text-[12px] rounded-full flex items-center gap-1 font-sans">
                                <span className="material-symbols-outlined text-[16px]">cancel</span> Rechazado
                              </span>
                            ) : (
                              <span className="px-md py-1 bg-amber-100 text-amber-800 font-semibold text-[12px] rounded-full flex items-center gap-1 font-sans">
                                <span className="material-symbols-outlined text-[16px]">hourglass_empty</span> Pendiente
                              </span>
                            )}
                          </div>

                          {/* Post Content Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                            <div className="flex flex-col gap-md">
                              {/* Hook */}
                              <div className="p-md bg-surface-container-low rounded-xl border-l-4 border-primary">
                                <p className="text-body-lg font-bold italic text-on-surface">"{post.hook}"</p>
                              </div>

                              {/* Copy */}
                              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap font-sans">
                                {post.copy}
                              </p>

                              {/* CTA */}
                              {post.cta && (
                                <div className="p-sm bg-white border border-outline-variant rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-primary">link</span>
                                    <span className="text-label-md font-bold text-on-surface">CTA: {post.cta}</span>
                                  </div>
                                  <span className="text-label-sm text-outline font-sans">Sugerido</span>
                                </div>
                              )}

                              {/* Hashtags */}
                              {post.hashtags && post.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-xs">
                                  {post.hashtags.map((tag, idx) => (
                                    <span key={idx} className="px-xs py-1 text-label-sm text-outline font-sans">
                                      #{tag.replace('#', '')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Image Preview Area */}
                            <div className="relative group">
                              {/* Loading Overlay */}
                              {isGeneratingImg && (
                                <div className="absolute inset-0 bg-surface-container-high/90 backdrop-blur-sm z-30 rounded-2xl flex flex-col items-center justify-center text-center p-md gap-xs">
                                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-sm"></div>
                                  <span className="text-body-md font-semibold text-primary font-sans leading-tight">
                                    {progresoGeneracion[post.id] || 'Generando imágenes...'}
                                  </span>
                                  <span className="text-body-xs text-on-surface-variant font-sans animate-pulse">
                                    Esto puede tomar de 30 a 60 segundos
                                  </span>
                                </div>
                              )}

                              {hasImages && currentImage ? (
                                <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant">
                                  {/* Carousel Format Badge */}
                                  <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-white/10 shadow-lg">
                                    <span className="material-symbols-outlined text-[13px] text-tertiary">
                                      {post.formato_imagen === 'carrusel' ? 'photo_library' : post.formato_imagen === 'feed' ? 'grid_view' : 'image'}
                                    </span>
                                    <span>{post.formato_imagen || 'simple'}</span>
                                  </div>

                                  {/* Active Image */}
                                  <img 
                                    className="w-full h-full object-cover" 
                                    src={currentImage} 
                                    alt={`${post.hook} - imagen ${currentIdx + 1}`} 
                                  />

                                  {/* Overlay Buttons */}
                                  <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-md z-10">
                                    <a 
                                      href={currentImage} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="bg-white text-on-surface px-md py-2 rounded-full font-semibold text-body-sm flex items-center gap-1 hover:scale-105 transition-all shadow-md"
                                    >
                                      <span className="material-symbols-outlined text-sm">visibility</span> Ver
                                    </a>
                                    <button 
                                      onClick={() => handleDescargarImagen(currentImage, `${post.plataforma}-post-${post.id}-${currentIdx + 1}.png`)}
                                      className="bg-white text-on-surface px-md py-2 rounded-full font-semibold text-body-sm flex items-center gap-1 hover:scale-105 transition-all cursor-pointer shadow-md"
                                    >
                                      <span className="material-symbols-outlined text-sm">download</span> Descargar
                                    </button>
                                  </div>

                                  {/* Carousel Navigation Arrows */}
                                  {imagesList.length > 1 && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handlePrevSlide(post.id, imagesList.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-md"
                                        title="Anterior"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleNextSlide(post.id, imagesList.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-md"
                                        title="Siguiente"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                      </button>
                                      
                                      {/* Counter Indicator */}
                                      <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white tracking-widest border border-white/10 shadow-lg font-sans">
                                        {currentIdx + 1} / {imagesList.length}
                                      </div>

                                      {/* Pagination dots */}
                                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/40 backdrop-blur-sm py-1 px-2.5 rounded-full border border-white/5">
                                        {imagesList.map((_, dotIdx) => (
                                          <button
                                            key={dotIdx}
                                            onClick={() => setActiveSlideIndices(prev => ({ ...prev, [post.id]: dotIdx }))}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                              currentIdx === dotIdx ? 'bg-primary w-3' : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </>
                                  )}

                                  {/* Magic Button Overlay */}
                                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-xs bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-20 shadow-xl font-sans">
                                    <input 
                                      type="text"
                                      value={sugerenciasRegeneracion[post.id] || ''}
                                      onChange={(e) => setSugerenciasRegeneracion(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      placeholder="Sugerencia de regeneración (opcional)..."
                                      className="flex-1 bg-transparent text-white placeholder-white/40 text-[11px] px-2.5 py-1 focus:outline-none border-none font-sans"
                                    />
                                    
                                    {/* Selector de Formato para regeneración */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setActiveDropdownPostId(prev => prev === post.id ? null : post.id)}
                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                        title="Seleccionar formato de imagen"
                                      >
                                        <span className="material-symbols-outlined text-[16px] text-tertiary-container">
                                          {selectedFormat === 'simple' ? 'image' : selectedFormat === 'feed' ? 'grid_view' : 'photo_library'}
                                        </span>
                                      </button>
                                      
                                      {activeDropdownPostId === post.id && (
                                        <div className="absolute bottom-full right-0 mb-3 w-48 bg-surface-container rounded-xl shadow-2xl border border-outline-variant p-1 z-[99] flex flex-col gap-0.5 animate-fade-in text-on-surface">
                                          <p className="text-[10px] text-on-surface-variant font-bold px-2 py-1 uppercase tracking-wider">Formato Regeneración</p>
                                          {(['simple', 'feed', 'carrusel'] as const).map((fmt) => {
                                            const isFmtSelected = selectedFormat === fmt;
                                            const costStr = fmt === 'simple' ? '1300 Cr' : fmt === 'feed' ? '3200 Cr' : '5500 Cr';
                                            const nameStr = fmt === 'simple' ? 'Simple (1 img)' : fmt === 'feed' ? 'Feed (3 img)' : 'Carrusel (5 img)';
                                            
                                            return (
                                              <button
                                                key={fmt}
                                                type="button"
                                                onClick={() => {
                                                  setFormatosSeleccionados(prev => ({ ...prev, [post.id]: fmt }));
                                                  setActiveDropdownPostId(null);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-body-sm font-medium flex flex-col hover:bg-primary/10 transition-colors cursor-pointer ${
                                                  isFmtSelected ? 'bg-primary/15 text-primary font-bold' : 'text-on-surface font-sans'
                                                }`}
                                              >
                                                <span>{nameStr}</span>
                                                <span className="text-[9px] opacity-75 font-normal font-sans">{costStr}</span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    <button 
                                      onClick={() => handleGenerarImagen(post.id, sugerenciasRegeneracion[post.id], selectedFormat)}
                                      disabled={isGeneratingImg}
                                      className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                                      title="Regenerar Imagen IA"
                                    >
                                      <span className={`material-symbols-outlined text-[16px] ${isGeneratingImg ? 'animate-spin' : ''}`}>edit_square</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-sm w-full font-sans">
                                  {/* Selection Interface for Format */}
                                  <div className="flex p-1 bg-surface-container-high rounded-xl border border-outline-variant/60">
                                    {(['simple', 'feed', 'carrusel'] as const).map((fmt) => {
                                      const label = fmt === 'simple' ? 'Simple' : fmt === 'feed' ? 'Feed' : 'Carrusel';
                                      const cost = fmt === 'simple' ? '1.3k' : fmt === 'feed' ? '3.2k' : '5.5k';
                                      const isSelected = selectedFormat === fmt;
                                      return (
                                        <button
                                          key={fmt}
                                          type="button"
                                          onClick={() => setFormatosSeleccionados(prev => ({ ...prev, [post.id]: fmt }))}
                                          disabled={isGeneratingImg}
                                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer text-center ${
                                            isSelected
                                              ? 'bg-primary text-white shadow-sm font-bold'
                                              : 'text-on-surface-variant hover:text-on-surface'
                                          }`}
                                        >
                                          {label} <span className="opacity-75 font-normal">({cost})</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleGenerarImagen(post.id, undefined, selectedFormat)}
                                    disabled={isGeneratingImg}
                                    className={`w-full h-[260px] border border-dashed border-outline-variant hover:bg-surface-container-low rounded-2xl flex flex-col items-center justify-center text-center p-md gap-sm cursor-pointer active:scale-95 transition-all ${
                                      isGeneratingImg ? 'bg-primary/5 border-primary/30 animate-pulse' : ''
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-4xl text-primary-container">image</span>
                                    <span className="text-body-md font-semibold text-on-surface font-sans">Generar Imagen IA</span>
                                    <span className="text-body-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-sans">
                                      -{selectedFormat === 'simple' ? '1300' : selectedFormat === 'feed' ? '3200' : '5500'} Créditos
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-lg pt-md border-t border-outline-variant flex flex-wrap justify-end gap-sm">
                            <button
                              onClick={() => handleOpenEditModal(post)}
                              className="px-md py-2 rounded-xl border border-outline text-on-surface font-semibold text-body-sm flex items-center gap-1 hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer font-sans"
                            >
                              <span className="material-symbols-outlined text-sm font-sans">edit</span> Editar
                            </button>
                            {post.estado === 'pendiente' ? (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoPost(post.id, 'rechazada')}
                                  className="px-md py-2 rounded-xl border border-error text-error font-semibold text-body-sm flex items-center gap-1 hover:bg-error-container/20 transition-all active:scale-95 cursor-pointer font-sans"
                                >
                                  <span className="material-symbols-outlined">close</span> Rechazar
                                </button>
                                {!post.imagen_url && (
                                  <button
                                    onClick={() => handleGenerarImagen(post.id, undefined, selectedFormat)}
                                    disabled={isGeneratingImg}
                                    className="px-md py-2 rounded-xl bg-tertiary-container hover:bg-tertiary-container/80 text-white font-semibold text-body-sm flex items-center gap-1 hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 font-sans"
                                  >
                                    <span className="material-symbols-outlined">auto_awesome</span> Generar Imagen
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCambiarEstadoPost(post.id, 'aprobada')}
                                  className="px-lg py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-body-sm flex items-center gap-1 transition-all active:scale-95 shadow-lg cursor-pointer font-sans"
                                >
                                  <span className="material-symbols-outlined">check_circle</span> Aprobar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCambiarEstadoPost(post.id, 'pendiente')}
                                  className="px-md py-2 rounded-xl border border-outline text-on-surface-variant font-semibold text-body-sm flex items-center gap-1 hover:bg-surface-variant transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined">undo</span> Deshacer
                                </button>
                                <button
                                  onClick={() => {
                                    toast.success(`Post programado para las ${post.hora_sugerida || '12:00 PM'}`);
                                  }}
                                  className="px-md py-2 rounded-xl bg-tertiary-container hover:bg-tertiary-container/80 text-white font-semibold text-body-sm flex items-center gap-1 hover:shadow-md transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined">schedule</span> Programar Post
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Bottom Dashboard Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-left">
        <div className="p-md bg-white rounded-2xl border border-outline-variant hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">inventory</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
          </div>
          <p className="font-semibold text-label-md text-on-surface">Asset Library</p>
          <p className="text-body-sm font-sans text-on-surface-variant">42 Media Assets Ready</p>
        </div>
        <div className="p-md bg-white rounded-2xl border border-outline-variant hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">psychology</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
          </div>
          <p className="font-semibold text-label-md text-on-surface">Audience Insights</p>
          <p className="text-body-sm font-sans text-on-surface-variant">3 AI Segments Active</p>
        </div>
        <div className="p-md bg-white rounded-2xl border border-outline-variant hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">payments</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
          </div>
          <p className="font-semibold text-label-md text-on-surface">Budget Allocation</p>
          <p className="text-body-sm font-sans text-on-surface-variant">$12,400 Estimated</p>
        </div>
        <div className="p-md bg-white rounded-2xl border border-outline-variant hover:shadow-md transition-shadow group cursor-pointer">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">history</span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
          </div>
          <p className="font-semibold text-label-md text-on-surface">Audit Log</p>
          <p className="text-body-sm font-sans text-on-surface-variant">Strategy updated 2h ago</p>
        </div>
      </section>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md text-left">
          <div className="bg-white dark:bg-surface-container rounded-[28px] max-w-lg w-full p-lg shadow-2xl border border-outline-variant/30 flex flex-col gap-md text-left animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <h3 className="font-display text-headline-md text-on-surface">Editar Publicación</h3>
              </div>
              <button 
                onClick={() => setEditingPost(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-sm overflow-y-auto max-h-[60vh] pr-1">
              
              {/* Hook */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-on-surface-variant font-semibold">Hook (Gancho inicial)</label>
                <input 
                  type="text" 
                  value={editHook}
                  onChange={(e) => setEditHook(e.target.value)}
                  className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans"
                  placeholder="Gancho de la publicación..."
                />
              </div>

              {/* Copy */}
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-on-surface-variant font-semibold">Texto / Copy del Post</label>
                <textarea 
                  rows={5}
                  value={editCopy}
                  onChange={(e) => setEditCopy(e.target.value)}
                  className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans resize-none"
                  placeholder="Contenido principal..."
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface-variant font-semibold">Fecha de Publicación</label>
                  <input 
                    type="date" 
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface-variant font-semibold">Hora Sugerida</label>
                  <input 
                    type="text" 
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                    className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans"
                    placeholder="Ej: 12:00 PM o 18:30"
                  />
                </div>
              </div>

              {/* CTA & Hashtags Row */}
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface-variant font-semibold">Llamado a la Acción (CTA)</label>
                  <input 
                    type="text" 
                    value={editCTA}
                    onChange={(e) => setEditCTA(e.target.value)}
                    className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans"
                    placeholder="Ej: Registrate gratis"
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="text-label-sm text-on-surface-variant font-semibold">Hashtags (separados por coma)</label>
                  <input 
                    type="text" 
                    value={editHashtagsStr}
                    onChange={(e) => setEditHashtagsStr(e.target.value)}
                    className="px-sm py-2 rounded-xl border border-outline-variant focus:outline-none focus:border-primary text-body-sm font-sans"
                    placeholder="Ej: marketing, saas, ia"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-sm border-t border-outline-variant/30 pt-sm">
              <button
                onClick={() => setEditingPost(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-variant font-semibold text-body-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePost}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-body-sm flex items-center justify-center gap-xs cursor-pointer shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
