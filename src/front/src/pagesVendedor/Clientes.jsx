import React, { useState, useEffect } from 'react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  // Estado para el formulario (Agregar/Actualizar)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '' });
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/clientes.php";

  useEffect(() => {
    fetchClientes();
  }, []);

  // 1. VER (SELECT)
  const fetchClientes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. AGREGAR E INSERTAR (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const metodo = editandoId ? 'PUT' : 'POST';
    const body = editandoId ? { ...form, id_cliente: editandoId } : form;

    try {
      const res = await fetch(API_URL, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setForm({ nombre: '', apellido: '', email: '', telefono: '' });
        setEditandoId(null);
        fetchClientes(); // Recargar la lista
        alert(editandoId ? "Cliente actualizado" : "Cliente registrado");
      }
    } catch (error) {
      console.error("Error en la operación:", error);
    }
  };

  // Preparar edición
  const prepararEdicion = (cliente) => {
    setEditandoId(cliente.id_cliente);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtro para búsqueda en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      
      {/* SECCIÓN 1: FORMULARIO (AGREGAR Y ACTUALIZAR) */}
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${editandoId ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-white shadow-xl shadow-slate-200/50'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${editandoId ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
            {editandoId ? '📝' : '👤'}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
              {editandoId ? 'Actualizar Datos del Cliente' : 'Registrar Nuevo Cliente'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              {editandoId ? `Editando ID: #${editandoId}` : 'Completa la información del cliente'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Nombre</label>
            <input type="text" required placeholder="Ej: Juan" className="p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
              value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Apellido</label>
            <input type="text" required placeholder="Ej: Pérez" className="p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
              value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input type="email" placeholder="cliente@correo.com" className="p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
              value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Teléfono</label>
            <input type="text" placeholder="0987654321" className="p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-all"
              value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
          </div>
          
          <div className="lg:col-span-4 flex gap-2 mt-2">
            <button type="submit" className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${editandoId ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-orange-600'}`}>
              {editandoId ? 'Confirmar Actualización' : 'Guardar Cliente Nuevo'}
            </button>
            {editandoId && (
              <button type="button" onClick={() => {setEditandoId(null); setForm({nombre:'', apellido:'', email:'', telefono:''})}} className="px-6 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: BUSCADOR Y LISTADO (VER) */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input type="text" placeholder="Filtrar clientes por nombre o teléfono..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none shadow-sm text-sm"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="3" className="py-20 text-center text-xs font-bold text-slate-400 animate-pulse">CARGANDO BASE DE DATOS...</td></tr>
              ) : clientesFiltrados.map(c => (
                <tr key={c.id_cliente} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 text-sm font-bold text-slate-800 uppercase">{c.nombre} {c.apellido}</td>
                  <td className="px-8 py-5 text-xs text-slate-500 font-medium">{c.email} | {c.telefono}</td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => prepararEdicion(c)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition-all">
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;