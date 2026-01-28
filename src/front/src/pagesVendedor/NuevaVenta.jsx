import React, { useState, useEffect } from 'react';

const NuevaVenta = ({ user }) => {
  const [productos, setProductos] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [ventaData, setVentaData] = useState({ id_cliente: '', id_forma_pago: '' });

  const API_BASE = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/procesar_venta.php";

  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/getProductos.php").then(r => r.json()).then(setProductos);
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/clientes.php").then(r => r.json()).then(setClientes);
    fetch(`${API_BASE}?accion=inicializar`).then(r => r.json()).then(data => setFormasPago(data.formas_pago || []));
  }, []);

  const agregarAlCarrito = (p) => {
    const ex = carrito.find(i => i.id_producto === p.id_producto);
    setCarrito(ex ? carrito.map(i => i.id_producto === p.id_producto ? {...i, cantidad: i.cantidad + 1} : i) : [...carrito, { ...p, cantidad: 1 }]);
  };

  const finalizarVenta = async () => {
    if (!ventaData.id_cliente || !ventaData.id_forma_pago || carrito.length === 0) {
      alert("⚠️ Completa los datos de la venta"); return;
    }
    const payload = { ...ventaData, id_empleado: user?.id_empleado || 1, carrito };
    try {
      const res = await fetch(`${API_BASE}?accion=guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("✅ Venta Guardada con éxito");
        setCarrito([]);
      } else { alert("❌ Error: " + data.message); }
    } catch (e) { alert("❌ Error de conexión"); }
  };

  const total = carrito.reduce((acc, i) => acc + (i.cantidad * i.precio_actual), 0);

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* IZQUIERDA: CATÁLOGO */}
      <div className="flex-[1.8] bg-[#F9FAFB] p-6 flex flex-col overflow-hidden">
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 Buscar productos..." 
            className="w-full max-w-md px-5 py-3 rounded-xl bg-white shadow-sm border border-slate-100 outline-none text-sm focus:ring-2 focus:ring-orange-500 transition-all"
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map(p => (
            <div 
              key={p.id_producto} 
              onClick={() => agregarAlCarrito(p)}
              className="bg-white p-4 rounded-2xl border border-transparent hover:border-orange-500 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-2xl">📦</div>
              <p className="text-slate-800 font-bold text-xs uppercase h-8 overflow-hidden">{p.nombre}</p>
              <p className="text-orange-600 font-black text-lg mt-1">${p.precio_actual.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA: PANEL DE VENTA (AZUL OSCURO) */}
      <div className="flex-1 bg-[#0F172A] p-8 text-white flex flex-col shadow-2xl">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-tight">Detalle <span className="text-orange-500">Venta</span></h2>
          <div className="text-[10px] text-slate-500 font-mono">ID: {user?.id_empleado || 1}</div>
        </div>

        {/* SELECTORES */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <select 
            className="w-full p-3 rounded-xl bg-white text-slate-900 text-[11px] font-bold outline-none appearance-none"
            onChange={e => setVentaData({...ventaData, id_cliente: e.target.value})}
            value={ventaData.id_cliente}
          >
            <option value="">👤 CLIENTE</option>
            {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>)}
          </select>

          <select 
            className="w-full p-3 rounded-xl bg-white text-slate-900 text-[11px] font-bold outline-none appearance-none"
            onChange={e => setVentaData({...ventaData, id_forma_pago: e.target.value})}
            value={ventaData.id_forma_pago}
          >
            <option value="">💳 PAGO</option>
            {formasPago.map(f => <option key={f.id_forma_pago} value={f.id_forma_pago}>{f.nombre.toUpperCase()}</option>)}
          </select>
        </div>

        {/* CARRITO */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
          {carrito.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="text-orange-500 font-bold text-xs">{item.cantidad}x</span>
                <span className="text-[11px] font-bold uppercase text-slate-200 truncate max-w-[120px]">{item.nombre}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-orange-400 text-xs">${(item.cantidad * item.precio_actual).toFixed(2)}</span>
                <button onClick={() => setCarrito(carrito.filter(i => i.id_producto !== item.id_producto))} className="text-slate-600 hover:text-red-500 transition-colors">✕</button>
              </div>
            </div>
          ))}
          {carrito.length === 0 && <p className="text-center text-slate-600 italic py-10 text-xs">Carrito vacío</p>}
        </div>

        {/* TOTAL Y BOTÓN (MÁS PEQUEÑOS) */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total</p>
            <p className="text-3xl font-black text-white tracking-tighter">${total.toFixed(2)}</p>
          </div>

          <button 
            onClick={finalizarVenta}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white rounded-xl font-bold uppercase text-sm tracking-widest transition-all shadow-lg shadow-orange-900/20"
          >
            Pagar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaVenta;