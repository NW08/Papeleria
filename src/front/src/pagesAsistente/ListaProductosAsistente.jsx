import React, { useState, useEffect } from 'react';

const ListaProductosAsistente = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpAsistente/getProductosAsistente.php")
      .then(res => res.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtro de búsqueda
  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* Barra de búsqueda interna */}
      <div className="mb-6 flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-full max-w-md border border-slate-200">
        <span className="mr-2 opacity-50">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar por nombre o código..."
          className="bg-transparent border-none outline-none text-xs font-bold w-full uppercase"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
        <table className="w-full text-left bg-white">
          <thead>
            <tr className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-4">Información del Producto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-center">Precio Unit.</th>
              <th className="px-6 py-4 text-center">Stock Disponible</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center animate-pulse font-bold text-slate-400">CARGANDO CATÁLOGO...</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-black text-slate-700 uppercase text-xs">{p.nombre}</div>
                  <div className="text-[9px] text-slate-400 font-bold">COD: {p.codigo}</div>
                  <div className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">{p.descripcion}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">
                    {p.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-600">
                  ${p.precio.toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-center font-black text-lg ${p.stock <= 10 ? 'text-rose-500' : 'text-slate-800'}`}>
                  {p.stock}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`w-3 h-3 rounded-full inline-block shadow-sm ${p.stock <= 10 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && !loading && (
          <div className="py-20 text-center bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            No se encontraron productos coincidentes
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaProductosAsistente;