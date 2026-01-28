import React, { useState, useEffect } from 'react';

const ProductosProveedor = () => {
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [loading, setLoading] = useState(true);

  // Usamos el mismo API_URL que ya tienes funcionando
  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/getProductos.php";

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!data.error) setProductos(data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  // LÓGICA DE FILTRADO (Igual a la tuya pero adaptada)
  const productosFiltrados = productos.filter(p => {
    const coincideProducto = 
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo_barras?.includes(busquedaProducto);
    
    const coincideCategoria = 
      p.categoria_nombre.toLowerCase().includes(busquedaCategoria.toLowerCase());

    return coincideProducto && coincideCategoria;
  });

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      
      {/* PANEL DE BUSQUEDA COLOR VERDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        <div className="relative">
          <p className="text-[9px] font-black text-emerald-600/60 uppercase mb-2 ml-2 tracking-widest">Nombre o SKU</p>
          <span className="absolute left-4 top-[38px] text-emerald-500">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar en el catálogo..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium shadow-sm"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>

        <div className="relative">
          <p className="text-[9px] font-black text-emerald-600/60 uppercase mb-2 ml-2 tracking-widest">Filtrar por Categoría</p>
          <span className="absolute left-4 top-[38px] text-emerald-500">🏷️</span>
          <input 
            type="text" 
            placeholder="Ej: Oficina, Papel..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium shadow-sm"
            value={busquedaCategoria}
            onChange={(e) => setBusquedaCategoria(e.target.value)}
          />
        </div>
      </div>

      {/* CONTADOR EN VERDE */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase">Inventario de Suministros</h3>
        <span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-black shadow-lg shadow-emerald-200">
          {productosFiltrados.length} ARTÍCULOS EN LISTA
        </span>
      </div>

      {/* TABLA CON TEMA VERDE */}
      <div className="overflow-x-auto rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-50/80">
              <th className="px-6 py-5 text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Producto / SKU</th>
              <th className="px-6 py-5 text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Categoría</th>
              <th className="px-6 py-5 text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] text-center">Stock Disponible</th>
              <th className="px-6 py-5 text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] text-right">Costo Unit.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {loading ? (
              <tr><td colSpan="4" className="py-20 text-center text-xs font-bold text-emerald-400 animate-pulse">SINCRONIZANDO ALMACÉN...</td></tr>
            ) : productosFiltrados.map((p) => (
              <tr key={p.id_producto} className="group hover:bg-emerald-50/40 transition-all">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-600/50 mb-1">{p.codigo_barras || 'SIN SKU'}</span>
                    <span className="text-sm font-bold text-slate-800 uppercase leading-none group-hover:text-emerald-700">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {p.categoria_nombre}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`text-sm font-black p-2 rounded-xl inline-block min-w-[40px] ${p.stock_actual <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {p.stock_actual}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                  ${parseFloat(p.precio_actual || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductosProveedor;