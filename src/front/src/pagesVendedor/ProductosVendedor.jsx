import React, { useState, useEffect } from 'react';

const ProductosVendedor = () => {
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [loading, setLoading] = useState(true);

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
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // LÓGICA DE FILTRADO DOBLE
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
      
      {/* PANEL DE BUSQUEDA DOBLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* BUSCAR POR PRODUCTO */}
        <div className="relative">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Buscar Producto</p>
          <span className="absolute left-4 top-[38px] text-slate-400">📦</span>
          <input 
            type="text" 
            placeholder="Nombre o Código de barras..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium shadow-sm"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>

        {/* BUSCAR POR CATEGORIA */}
        <div className="relative">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Filtrar Categoría</p>
          <span className="absolute left-4 top-[38px] text-slate-400">🏷️</span>
          <input 
            type="text" 
            placeholder="Ej: Cuadernos, Lápices..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium shadow-sm"
            value={busquedaCategoria}
            onChange={(e) => setBusquedaCategoria(e.target.value)}
          />
        </div>
      </div>

      {/* CONTADOR RÁPIDO */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase">Lista de Resultados</h3>
        <span className="bg-slate-800 text-white text-[10px] px-3 py-1 rounded-full font-black">
          {productosFiltrados.length} ENCONTRADOS
        </span>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Info</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Stock</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Precio Unit.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-20 text-center text-xs font-bold text-slate-400 animate-pulse">CARGANDO...</td></tr>
            ) : productosFiltrados.map((p) => (
              <tr key={p.id_producto} className="group hover:bg-slate-50/80 transition-all">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-400 mb-1">{p.codigo_barras || 'SIN CÓDIGO'}</span>
                    <span className="text-sm font-bold text-slate-800 uppercase leading-none">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200">
                    {p.categoria_nombre}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`text-sm font-black p-2 rounded-xl inline-block min-w-[40px] ${p.stock_actual <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
                    {p.stock_actual}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm">
                  ${p.precio_actual.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductosVendedor;