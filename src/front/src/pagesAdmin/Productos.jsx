import React, { useState, useEffect } from 'react';

const Productos = () => {
  const [listaProductos, setListaProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCat, setFiltroCat] = useState(''); 
  const [mostrandoInputCat, setMostrandoInputCat] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');

  const [formProd, setFormProd] = useState({
    id_producto: '', codigo_barras: '', nombre: '', descripcion: '',
    precio_actual: '', stock_actual: '', id_categoria: '', id_proveedor: '1'
  });

  // URL LIMPIA: Sin parámetros fijos para evitar errores de concatenación
  const API_BASE = 'https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/productos.php';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch(`${API_BASE}?accion=productos`),
        fetch(`${API_BASE}?accion=categorias`)
      ]);
      
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      setListaProductos(Array.isArray(dataProd) ? dataProd : []);
      setCategorias(Array.isArray(dataCat) ? dataCat : []);
    } catch (error) { 
      console.error("Error al conectar con la API:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarNuevaCategoria = async () => {
    if (!nuevaCatNombre.trim()) return;
    try {
      const res = await fetch(`${API_BASE}?accion=insertar_categoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaCatNombre })
      });
      const data = await res.json();
      if (data.status === "success") {
        setNuevaCatNombre('');
        setMostrandoInputCat(false);
        const resCat = await fetch(`${API_BASE}?accion=categorias`);
        setCategorias(await resCat.json());
      }
    } catch (e) { alert("Error al guardar categoría"); }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!formProd.id_categoria) return alert("Selecciona una categoría");

    const accion = editando ? 'actualizar' : 'insertar';
    try {
      const response = await fetch(`${API_BASE}?accion=${accion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProd)
      });
      const res = await response.json();
      if (res.status === "success") { 
        cerrarModal(); 
        cargarDatos(); 
      } else {
        alert("Error: " + (res.details?.[0]?.message || "No se pudo guardar"));
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar este artículo?")) return;
    await fetch(`${API_BASE}?accion=eliminar&id=${id}`);
    cargarDatos();
  };

  const abrirEditar = (prod) => {
    setEditando(true);
    setFormProd(prod);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditando(false);
    setMostrandoInputCat(false);
    setFormProd({ id_producto: '', codigo_barras: '', nombre: '', descripcion: '', precio_actual: '', stock_actual: '', id_categoria: '', id_proveedor: '1' });
  };

  const filtrados = listaProductos.filter(p => {
    const matchNombre = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCat === '' || String(p.id_categoria) === String(filtroCat);
    return matchNombre && matchCat;
  });

  return (
    <div className="min-h-screen flex flex-col p-6 bg-slate-50">
      {/* HEADER Y FILTROS */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <input 
            type="text" placeholder="Buscar producto..." 
            className="flex-1 max-w-sm bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select 
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 outline-none"
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
          + Nuevo Producto
        </button>
      </div>

      {/* VISTA DE PRODUCTOS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando Inventario...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filtrados.map((prod) => (
            <div key={prod.id_producto} className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => abrirEditar(prod)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">✏️</button>
                <button onClick={() => eliminarProducto(prod.id_producto)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-colors">🗑️</button>
              </div>

              <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.15em]">{prod.categoria_nombre || 'Sin Categoría'}</span>
              <h3 className="text-sm font-bold text-slate-800 truncate mt-1 pr-10">{prod.nombre}</h3>
              
              <div className="flex items-center justify-between border-t border-slate-50 mt-4 pt-4">
                <span className="text-lg font-black text-slate-900">${parseFloat(prod.precio_actual).toFixed(2)}</span>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${prod.stock_actual < 5 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {prod.stock_actual} ud.
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase text-[10px]">No se encontraron productos</div>
          )}
        </div>
      )}

      {/* MODAL DE FORMULARIO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-8 uppercase italic tracking-tighter">
              {editando ? 'Actualizar' : 'Nuevo'} <span className="text-indigo-600">Registro</span>
            </h3>
            
            <form onSubmit={manejarEnvio} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre del producto</label>
                <input required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-200" value={formProd.nombre} onChange={(e) => setFormProd({...formProd, nombre: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Categoría</label>
                <div className="flex gap-2">
                  <select 
                    required
                    className="flex-1 bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-200"
                    value={formProd.id_categoria}
                    onChange={(e) => setFormProd({...formProd, id_categoria: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setMostrandoInputCat(!mostrandoInputCat)} className="bg-indigo-50 text-indigo-600 w-12 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all text-xl">
                    {mostrandoInputCat ? '×' : '+'}
                  </button>
                </div>
                {mostrandoInputCat && (
                  <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                    <input type="text" placeholder="Nueva categoría..." className="flex-1 bg-indigo-50/50 rounded-2xl p-4 text-xs font-bold outline-none border border-indigo-100" value={nuevaCatNombre} onChange={(e) => setNuevaCatNombre(e.target.value)} />
                    <button type="button" onClick={guardarNuevaCategoria} className="bg-emerald-500 text-white px-5 rounded-2xl text-[10px] font-black uppercase">Crear</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Precio Venta</label>
                   <input type="number" step="0.01" required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-200" value={formProd.precio_actual} onChange={(e) => setFormProd({...formProd, precio_actual: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Stock Inicial</label>
                   <input type="number" required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-200" value={formProd.stock_actual} onChange={(e) => setFormProd({...formProd, stock_actual: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Código de Barras</label>
                <input required className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold outline-none border border-transparent focus:border-indigo-200" value={formProd.codigo_barras} onChange={(e) => setFormProd({...formProd, codigo_barras: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={cerrarModal} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Descartar</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all">
                  {editando ? 'Actualizar' : 'Finalizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;