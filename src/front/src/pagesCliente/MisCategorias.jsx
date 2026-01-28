import React, { useState, useEffect } from 'react';

const MisCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpClientes/getCategoriasClientes.php")
      .then(res => res.json())
      .then(data => {
        setCategorias(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (nombre) => {
    const n = nombre.toLowerCase();
    if (n.includes('papel')) return '📄';
    if (n.includes('escolar')) return '🎒';
    if (n.includes('arte') || n.includes('pintura')) return '🎨';
    if (n.includes('oficina')) return '🖇️';
    if (n.includes('escritura') || n.includes('lapiz')) return '✒️';
    if (n.includes('cuaderno')) return '📓';
    return '📦';
  };

  return (
    <div className="animate-fadeIn">
      {/* Encabezado más pequeño */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-cyan-600 text-[9px] font-black uppercase tracking-widest mb-0.5">Nuestros Pasillos</h3>
          <p className="text-slate-800 font-black text-xl uppercase tracking-tighter italic">Departamentos</p>
        </div>
        <div className="bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-cyan-100 shadow-sm">
           {categorias.length} Items
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-28 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
          ))}
        </div>
      ) : (
        /* Grid con más columnas (5 en pantallas grandes) y menos espacio entre ellas */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categorias.map((cat) => (
            <button 
              key={cat.id} 
              className="group relative bg-white border border-cyan-50 p-5 rounded-[1.5rem] shadow-sm hover:shadow-lg hover:shadow-cyan-100/30 transition-all duration-300 overflow-hidden text-left"
            >
              {/* Icono de fondo más discreto */}
              <div className="absolute -right-1 -bottom-1 text-5xl opacity-[0.03] group-hover:scale-110 transition-all duration-500">
                {getIcon(cat.nombre)}
              </div>

              <div className="relative z-10">
                {/* Icono Principal más pequeño */}
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center text-xl mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-all duration-300 shadow-inner">
                  {getIcon(cat.nombre)}
                </div>
                
                <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-tight mb-0.5 truncate group-hover:text-cyan-700">
                  {cat.nombre}
                </h4>
                
                <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {cat.cantidad} {cat.cantidad === 1 ? 'Tipo' : 'Tipos'}
                    </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="h-10"></div>
    </div>
  );
};

export default MisCategorias;