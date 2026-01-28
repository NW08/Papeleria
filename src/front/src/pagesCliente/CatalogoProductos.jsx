import React, { useState, useEffect } from 'react';

const CatalogoProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Asegúrate de que la carpeta en htdocs sea 'phpCliente'
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpClientes/getCatalogoPublico.php")
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: Archivo no encontrado`);
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Consultando Inventario...</p>
    </div>
  );

  if (error) return (
    <div className="py-20 text-center">
      <div className="text-4xl mb-4">📂</div>
      <p className="text-rose-500 font-black uppercase text-xs tracking-widest">{error}</p>
      <p className="text-slate-400 text-[10px] mt-2 italic">Verifica la ruta: BaseDatos/papeleria-api/phpCliente/</p>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productos.map((prod) => (
          <div 
            key={prod.id} 
            className="group bg-white rounded-[2.5rem] border border-cyan-50 p-6 shadow-sm hover:shadow-xl hover:shadow-cyan-100/30 transition-all duration-500 flex flex-col"
          >
            {/* Visualizador de Categoría e Icono */}
            <div className="h-44 bg-gradient-to-tr from-slate-50 to-cyan-50/30 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden shrink-0 border border-cyan-50/50">
              <span className="text-6xl transition-transform duration-700 group-hover:scale-110 select-none">
                {prod.categoria.toLowerCase().includes('cuaderno') ? '📓' : 
                 prod.categoria.toLowerCase().includes('escribir') ? '✒️' : 
                 prod.categoria.toLowerCase().includes('papel') ? '📄' : '📦'}
              </span>
            </div>

            {/* Detalles del Producto */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-50 px-2 py-1 rounded-md">
                  {prod.categoria}
                </span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase">Stock: {prod.stock}</span>
              </div>
              
              <h3 className="text-base font-black text-slate-800 uppercase leading-tight mb-2 group-hover:text-cyan-600 transition-colors">
                {prod.nombre}
              </h3>
              
              <p className="text-[11px] text-slate-400 font-medium italic mb-6 line-clamp-3 h-12">
                {prod.descripcion || 'Producto de papelería de alta calidad disponible.'}
              </p>

              {/* Sección de Precio (Actualizada con Icono de Papelería) */}
              <div className="mt-auto pt-5 border-t border-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Precio Unitario</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                    <span className="text-sm mr-0.5">$</span>{prod.precio.toFixed(2)}
                  </p>
                </div>
                
                {/* Icono referente a tienda/papelería en lugar de la estrella */}
                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white text-lg shadow-lg shadow-cyan-200 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  🏷️
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem]">
           <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">No hay productos disponibles por ahora</p>
        </div>
      )}
    </div>
  );
};

export default CatalogoProductos;