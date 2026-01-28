import React, { useState, useEffect } from 'react';

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpAsistente/getCategoriasAsistente.php")
      .then(res => res.json())
      .then(data => {
        setCategorias(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Organización de Almacén</h3>
        <p className="text-slate-800 font-black text-xl uppercase tracking-tighter">Clasificación de Inventario</p>
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-indigo-400 font-black uppercase text-xs">
          Organizando etiquetas...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorias.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                  🏷️
                </div>
                
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight mb-2">
                  {cat.nombre}
                </h4>
                
                <div className="bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  <p className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 uppercase">
                    {cat.total} {cat.total === 1 ? 'Producto' : 'Productos'}
                  </p>
                </div>
              </div>

              {/* Decoración lateral discreta */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-indigo-600 italic">#{cat.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Informativo */}
      <div className="mt-12 p-8 bg-indigo-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="text-3xl">📊</div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 opacity-80">Resumen de Clasificación</p>
            <p className="text-sm font-black uppercase">Total: {categorias.length} Categorías Activas</p>
          </div>
        </div>
        <div className="text-[10px] font-black bg-indigo-800 px-4 py-2 rounded-xl uppercase tracking-tighter border border-indigo-700">
          Modo Lectura Activo
        </div>
      </div>
    </div>
  );
};

export default ListaCategorias;