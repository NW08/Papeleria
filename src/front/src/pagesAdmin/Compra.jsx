import React, { useState, useEffect } from 'react';

const GestionCompras = () => {
  const [data, setData] = useState({ proveedores: [], productos: [], empleados: [] });
  const [carrito, setCarrito] = useState([]);
  const [form, setForm] = useState({ id_proveedor: '', id_empleado: '' });
  const [item, setItem] = useState({ id_producto: '', cantidad: 1, costo: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. URL LIMPIA (Sin parámetros fijos)
  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/compras.php";

  // 2. CARGA INICIAL DE DATOS
  useEffect(() => {
    fetch(`${API_URL}?accion=inicializar`)
      .then(res => res.json())
      .then(json => {
        setData({ 
          proveedores: json.proveedores || [], 
          productos: json.productos || [], 
          empleados: json.empleados || [] 
        });
      })
      .catch(err => console.error("Error al inicializar datos de compra:", err));
  }, []);

  const handleAddOrUpdate = () => {
    if (!item.id_producto || !item.costo || item.cantidad <= 0) {
      alert("Por favor completa producto, cantidad y costo válido");
      return;
    }

    const p = data.productos.find(x => String(x.id_producto) === String(item.id_producto));
    const nuevoItem = { 
      ...item, 
      nombre: p?.nombre || 'Producto', 
      cantidad: Number(item.cantidad), 
      costo: Number(item.costo) 
    };

    if (editIndex !== null) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[editIndex] = nuevoItem;
      setCarrito(nuevoCarrito);
      setEditIndex(null);
    } else {
      setCarrito([...carrito, nuevoItem]);
    }
    
    setItem({ id_producto: '', cantidad: 1, costo: '' });
  };

  const prepararEdicion = (index) => {
    const prod = carrito[index];
    setItem({ id_producto: prod.id_producto, cantidad: prod.cantidad, costo: prod.costo });
    setEditIndex(index);
  };

  const guardarCompra = async () => {
    if (!form.id_proveedor || !form.id_empleado) return alert("Selecciona proveedor y empleado");
    if (carrito.length === 0) return alert("El carrito está vacío");

    setLoading(true);
    const proveedor = data.proveedores.find(p => String(p.id_proveedor) === String(form.id_proveedor));
    
    const payload = { 
      ...form, 
      email_p: proveedor?.email_contacto || '', 
      carrito 
    };

    try {
      const res = await fetch(`${API_URL}?accion=guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();

      if (result.status === "success") {
        alert("✨ Compra procesada e inventario actualizado");
        setCarrito([]);
        setForm({ id_proveedor: '', id_empleado: '' });
      } else {
        alert("❌ Error: " + (result.message || "No se pudo guardar"));
      }
    } catch (e) { 
      alert("🚀 Error de conexión con el servidor"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-700">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Compras <span className="text-emerald-500">Stock</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Abastecimiento de Almacén</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Proveedor</span>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
              value={form.id_proveedor}
              onChange={e => setForm({ ...form, id_proveedor: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              {data.proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_empresa}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Responsable</span>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
              value={form.id_empleado}
              onChange={e => setForm({ ...form, id_empleado: e.target.value })}
            >
              <option value="">Empleado...</option>
              {data.empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* AGREGAR PRODUCTO */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 p-5 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="md:col-span-6">
          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Artículo</label>
          <select 
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[12px] font-bold outline-none focus:bg-white transition-all"
            value={item.id_producto}
            onChange={e => setItem({ ...item, id_producto: e.target.value })}
          >
            <option value="">Buscar en catálogo...</option>
            {data.productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Cantidad</label>
          <input className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[12px] font-bold text-center outline-none transition-all" type="number" min="1" value={item.cantidad} onChange={e => setItem({ ...item, cantidad: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Costo Compra</label>
          <input className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[12px] font-bold text-center outline-none transition-all" type="number" placeholder="0.00" value={item.costo} onChange={e => setItem({ ...item, costo: e.target.value })} />
        </div>
        <div className="md:col-span-2 flex items-end">
          <button className={`w-full py-3 rounded-xl font-black text-[10px] uppercase text-white shadow-md transition-all active:scale-95 ${editIndex !== null ? 'bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-600'}`} onClick={handleAddOrUpdate}>
            {editIndex !== null ? 'Listo' : 'Añadir'}
          </button>
        </div>
      </div>

      {/* CARRITO */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black text-slate-400 uppercase">
              <th className="py-4 px-6">Producto</th>
              <th className="py-4 text-center">Cant.</th>
              <th className="py-4 text-center">Costo U.</th>
              <th className="py-4 text-center">Subtotal</th>
              <th className="py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {carrito.map((c, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-4 px-6 font-bold text-slate-700 uppercase">{c.nombre}</td>
                <td className="py-4 text-center font-bold text-slate-500">{c.cantidad}</td>
                <td className="py-4 text-center text-slate-500">${c.costo.toFixed(2)}</td>
                <td className="py-4 text-center font-black text-slate-900">${(c.cantidad * c.costo).toFixed(2)}</td>
                <td className="py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => prepararEdicion(i)} className="p-2 text-indigo-500 bg-indigo-50 rounded-lg">✏️</button>
                    <button onClick={() => setCarrito(carrito.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 bg-rose-50 rounded-lg">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {carrito.length === 0 && <div className="py-10 text-center text-slate-300 font-bold uppercase text-[9px]">Carrito vacío</div>}
      </div>

      {/* TOTAL Y ACCION */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-10 p-6 bg-slate-900 rounded-[2rem] text-white">
        <div>
          <span className="text-[10px] font-black text-emerald-400 uppercase block">Total a Pagar</span>
          <span className="text-3xl font-black italic">${carrito.reduce((acc, curr) => acc + (curr.cantidad * curr.costo), 0).toFixed(2)}</span>
        </div>
        <button disabled={loading} className={`px-12 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${loading ? 'bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-xl'}`} onClick={guardarCompra}>
          {loading ? 'Procesando...' : 'Confirmar Compra'}
        </button>
      </div>

    </div>
  );
};

export default GestionCompras;