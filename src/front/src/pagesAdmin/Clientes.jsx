import React, { useState, useEffect } from 'react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', telefono: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Cambia esta URL si tu archivo se llama diferente
  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/clientes.php";

  // --- 1. CARGAR CLIENTES ---
  const cargarClientes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // El backend devuelve el array directamente o un error
      if (Array.isArray(data)) {
        setClientes(data);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 2. GUARDAR O ACTUALIZAR ---
  const guardarCliente = async (e) => {
    e.preventDefault();
    const metodo = editandoId ? 'PUT' : 'POST';
    const body = editandoId ? { ...formData, id_cliente: editandoId } : formData;

    try {
      const res = await fetch(API_URL, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();

      if (result.status === 'success') {
        mostrarNotificacion(editandoId ? '✅ ¡Cliente actualizado!' : '✨ ¡Cliente registrado!', 'success');
        cancelarEdicion();
        cargarClientes();
      } else {
        mostrarNotificacion('❌ Error: ' + (result.message || 'No se pudo guardar'), 'error');
      }
    } catch (error) {
      mostrarNotificacion('🚀 Error de conexión con el servidor', 'error');
    }
  };

  // --- 3. ELIMINAR ---
  const eliminarCliente = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.status === 'success') {
        mostrarNotificacion('🗑️ Cliente eliminado', 'success');
        cargarClientes();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Auxiliares
  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const cancelarEdicion = () => {
    setFormData({ nombre: '', apellido: '', email: '', telefono: '' });
    setEditandoId(null);
  };

  return (
    <div className="flex flex-col h-full font-sans p-4 bg-slate-50">
      {/* NOTIFICACIÓN FLOTANTE */}
      {mensaje.texto && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-lg text-white text-[11px] font-black uppercase animate-bounce ${mensaje.tipo === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* FORMULARIO */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
            {editandoId ? '📝 Editando Cliente' : '👤 Nuevo Cliente'}
          </h2>
          {editandoId && (
            <button onClick={cancelarEdicion} className="text-[10px] font-bold text-rose-500 uppercase">Cancelar</button>
          )}
        </div>
        <form onSubmit={guardarCliente} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="nombre" placeholder="Nombre" className="bg-slate-50 rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-indigo-400 outline-none transition-all" value={formData.nombre} onChange={handleInputChange} required />
          <input name="apellido" placeholder="Apellido" className="bg-slate-50 rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-indigo-400 outline-none transition-all" value={formData.apellido} onChange={handleInputChange} required />
          <input name="email" type="email" placeholder="Correo electrónico" className="bg-slate-50 rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-indigo-400 outline-none transition-all" value={formData.email} onChange={handleInputChange} />
          <input name="telefono" placeholder="Teléfono" className="bg-slate-50 rounded-xl px-4 py-3 text-[11px] font-bold focus:ring-2 focus:ring-indigo-400 outline-none transition-all" value={formData.telefono} onChange={handleInputChange} maxLength="10" />
          <button type="submit" className={`rounded-xl text-[10px] font-black uppercase text-white transition-all ${editandoId ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-slate-900 hover:bg-indigo-600'}`}>
            {editandoId ? 'Guardar Cambios' : 'Registrar Cliente'}
          </button>
        </form>
      </div>

      {/* TABLA */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-y-auto h-full">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr className="text-[9px] font-black text-slate-400 uppercase">
                <th className="p-5">ID</th>
                <th className="p-5">Nombre Completo</th>
                <th className="p-5">Información de Contacto</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map((c) => (
                <tr key={c.id_cliente} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-[11px] font-bold text-slate-300 italic">#{c.id_cliente}</td>
                  <td className="p-5 text-[11px] font-black text-slate-700 uppercase">{c.nombre} {c.apellido}</td>
                  <td className="p-5">
                    <div className="text-[10px] font-bold text-slate-500">{c.email || 'Sin correo'}</div>
                    <div className="text-[9px] font-black text-indigo-400">{c.telefono || 'Sin teléfono'}</div>
                  </td>
                  <td className="p-5 text-right space-x-3">
                    <button onClick={() => { setFormData(c); setEditandoId(c.id_cliente); }} className="text-indigo-500 font-black text-[9px] uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                    <button onClick={() => eliminarCliente(c.id_cliente)} className="text-rose-500 font-black text-[9px] uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {clientes.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <div className="text-[10px] font-black uppercase text-slate-400">No hay clientes en la base de datos</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clientes;