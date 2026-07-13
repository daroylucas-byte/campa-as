import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  obtenerIdentidadVisual, 
  subirImagenIdentidad, 
  obtenerAnalisisIdentidad, 
  ejecutarAnalizarIdentidad,
  eliminarImagenIdentidad,
  actualizarCategoriaIdentidad
} from '../services/clientes';
import type { IdentidadVisualCliente, AnalisisIdentidadCliente, CategoriaIdentidad } from '../types/database.types';
import toast from 'react-hot-toast';

const CATEGORIAS_LISTA: { value: CategoriaIdentidad; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'post', label: 'Post' },
  { value: 'foto_producto', label: 'Foto de producto' },
  { value: 'otro', label: 'Otro' }
];

export const IdentidadVisual: React.FC = () => {
  const { clienteActivo, user, actualizarSaldo } = useApp();
  const [imagenes, setImagenes] = useState<IdentidadVisualCliente[]>([]);
  const [analisis, setAnalisis] = useState<AnalisisIdentidadCliente | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States para modal de categorización previa al upload
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [chosenCategory, setChosenCategory] = useState<CategoriaIdentidad>('logo');

  const cargarDatos = async () => {
    if (!clienteActivo) return;
    try {
      const [imgs, ans] = await Promise.all([
        obtenerIdentidadVisual(clienteActivo.id),
        obtenerAnalisisIdentidad(clienteActivo.id)
      ]);
      setImagenes(imgs);
      setAnalisis(ans);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar la identidad visual');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [clienteActivo]);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clienteActivo || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Crear preview de la imagen elegida y mostrar modal/formulario
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setChosenCategory('logo'); // Categoria por defecto recomendada
  };

  const handleConfirmUpload = async () => {
    if (!clienteActivo || !pendingFile) return;

    setLoadingUpload(true);
    const toastId = toast.loading('Subiendo imagen categorizada...');
    try {
      await subirImagenIdentidad(clienteActivo.id, pendingFile, `Referencia: ${pendingFile.name}`, chosenCategory);
      toast.success('Imagen subida con éxito', { id: toastId });
      
      // Limpiar estados de pre-upload
      cancelPendingUpload();
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al subir la imagen', { id: toastId });
      setLoadingUpload(false);
    }
  };

  const cancelPendingUpload = () => {
    setPendingFile(null);
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
      setPendingPreview(null);
    }
    setLoadingUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCambiarCategoria = async (imgId: string, nuevaCategoria: CategoriaIdentidad) => {
    try {
      await actualizarCategoriaIdentidad(imgId, nuevaCategoria);
      toast.success('Categoría actualizada');
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al actualizar la categoría');
    }
  };

  const handleAnalizarClick = async () => {
    if (!clienteActivo) return;
    if (imagenes.length === 0) {
      toast.error('Sube al menos una imagen de referencia para analizar la identidad visual');
      return;
    }

    setLoadingAnalisis(true);
    const toastId = toast.loading('Analizando identidad visual con IA...');
    try {
      await ejecutarAnalizarIdentidad(clienteActivo.id, user?.id);
      toast.success('Análisis completado', { id: toastId });
      
      // Forzar actualización del saldo de créditos
      await actualizarSaldo();
      
      // Recargar datos para ver el nuevo análisis
      await cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al analizar la identidad', { id: toastId });
    } finally {
      setLoadingAnalisis(false);
    }
  };

  const handleEliminarImagen = async (imgId: string, imgUrl: string) => {
    if (!clienteActivo) return;
    if (!window.confirm('¿Estás seguro de eliminar esta imagen de referencia?')) return;

    const toastId = toast.loading('Eliminando imagen...');
    try {
      await eliminarImagenIdentidad(imgId, clienteActivo.id, imgUrl);
      toast.success('Imagen eliminada', { id: toastId });
      cargarDatos();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al eliminar la imagen', { id: toastId });
    }
  };

  if (!clienteActivo) return null;

  return (
    <section className="glass-card rounded-xl p-md flex flex-col gap-md shadow-sm border-t-4 border-t-tertiary text-left relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-tertiary">palette</span>
        <h3 className="font-display text-headline-md text-on-surface">Identidad Visual</h3>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Category selector view overlay (pre-upload) */}
      {pendingFile && pendingPreview && (
        <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm z-30 p-md flex flex-col gap-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-xs">
            <h4 className="font-display font-semibold text-body-lg text-on-surface">Categorizar Imagen</h4>
            <button 
              onClick={cancelPendingUpload}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-md">close</span>
            </button>
          </div>

          <div className="flex gap-md flex-1 min-h-0 items-center">
            {/* Image Preview */}
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/50 relative flex-shrink-0 bg-surface-container">
              <img src={pendingPreview} className="w-full h-full object-cover" alt="Preview" />
            </div>

            {/* Chips Category Selector */}
            <div className="flex-1 flex flex-col gap-xs overflow-y-auto max-h-full py-1">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tipo de imagen</p>
              <div className="flex flex-wrap gap-xs">
                {CATEGORIAS_LISTA.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setChosenCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all cursor-pointer ${
                      chosenCategory === cat.value
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-sm border-t border-outline-variant/30 pt-xs">
            <button
              onClick={cancelPendingUpload}
              disabled={loadingUpload}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-variant font-semibold text-body-sm cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={loadingUpload}
              className="flex-1 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-container text-white font-semibold text-body-sm flex items-center justify-center gap-xs cursor-pointer disabled:opacity-50"
            >
              {loadingUpload ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  Subiendo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  Subir e iniciar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div 
        onClick={handleDropzoneClick}
        className="border-2 border-dashed border-outline-variant/60 rounded-xl p-md flex flex-col items-center justify-center text-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2 group-hover:scale-110 transition-transform">
          cloud_upload
        </span>
        <p className="font-semibold text-label-md text-on-surface">
          Arrastra o haz clic aquí
        </p>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Logos, paletas de colores e imágenes de referencia
        </p>
      </div>

      {/* Thumbnails Grid */}
      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 gap-xs">
          {imagenes.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg border border-outline-variant/50 overflow-hidden group">
              <img 
                className="w-full h-full object-cover" 
                src={img.imagen_url} 
                alt={img.descripcion} 
              />
              
              {/* Delete Icon (Top Right) */}
              <button 
                onClick={() => handleEliminarImagen(img.id, img.imagen_url)}
                className="absolute top-1 right-1 z-10 w-6 h-6 bg-error/90 hover:bg-error rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow"
                title="Eliminar imagen"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>

              {/* Category Select Badge/Dropdown (Bottom) */}
              <div className="absolute bottom-1 left-1 right-1 z-10">
                <select
                  value={img.categoria || 'otro'}
                  onChange={(e) => handleCambiarCategoria(img.id, e.target.value as CategoriaIdentidad)}
                  className="w-full text-[9px] bg-black/75 hover:bg-black/90 text-white font-bold py-1 px-1 rounded-md border-none focus:ring-0 cursor-pointer text-center appearance-none"
                  style={{ textAlignLast: 'center' }}
                  title="Cambiar categoría"
                >
                  <option value="logo">🏷️ Logo</option>
                  <option value="flyer">🏷️ Flyer</option>
                  <option value="post">🏷️ Post</option>
                  <option value="foto_producto">🏷️ Producto</option>
                  <option value="otro">🏷️ Otro</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Display */}
      {analisis && (
        <div className="bg-tertiary/5 border border-tertiary/20 rounded-xl p-sm text-left animate-fade-in">
          <div className="flex items-center gap-1.5 text-tertiary font-display font-semibold text-body-sm mb-xs">
            <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
            <span>Estilo e Identidad IA</span>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer" title="Haga clic para expandir">
            {analisis.estilo_descripcion}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 text-right mt-1">
            Actualizado el {new Date(analisis.updated_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Action Button */}
      <button 
        onClick={handleAnalizarClick}
        disabled={loadingAnalisis || imagenes.length === 0}
        className={`w-full text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-xs shadow-md active:scale-95 transition-all cursor-pointer ${
          loadingAnalisis 
            ? 'bg-tertiary/60 cursor-not-allowed animate-pulse' 
            : 'bg-tertiary hover:bg-tertiary-container shadow-tertiary/20'
        }`}
      >
        {loadingAnalisis ? (
          <>
            <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
            Analizando marca...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Analizar Identidad
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-bold">
              -1500 Cr
            </span>
          </>
        )}
      </button>
    </section>
  );
};
