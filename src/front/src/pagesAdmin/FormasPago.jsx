import React, { useState, useEffect } from 'react';

const FormasPago = () => {
  const [metodos, setMetodos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // ESTADOS PARA ACTUALIZAR
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/metodo_pago.php";

  const cargarMetodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) setMetodos(data);
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    }
  };

  useEffect(() => {
    cargarMetodos();
  }, []);

  // --- FUNCIÓN PARA CREAR O ACTUALIZAR (CREATE / UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    // Si hay un editandoId, usamos PUT, si no, POST
    const metodoHttp = editandoId ? 'PUT' : 'POST';
    const bodyPayload = editandoId 
      ? { id: editandoId, nombre: nombre } 
      : { nombre: nombre };

    try {
      const res = await fetch(API_URL, {
        method: metodoHttp,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      
      const result = await res.json();

      if (result.status === 'success') {
        setNombre('');
        setEditandoId(null); // Resetear modo edición
        setMensaje({ 
          texto: editandoId ? '✨ Método actualizado' : '✅ Método creado', 
          tipo: 'success' 
        });
        cargarMetodos();
      } else {
        setMensaje({ texto: '❌ Error: ' + result.message, tipo: 'error' });
      }
    } catch (error) {
      setMensaje({ texto: '❌ Error de comunicación', tipo: 'error' });
    }

    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // --- PREPARAR EDICIÓN ---
  const prepararEdicion = (fp) => {
    setEditandoId(fp.id_forma_pago);
    setNombre(fp.nombre);
    // Hacemos scroll hacia arriba para que el usuario vea el input
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Deseas eliminar este método de pago?")) {
      try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.status === 'success') {
          setMensaje({ texto: '🗑️ Método eliminado', tipo: 'error' });
          cargarMetodos();
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn font-sans p-4">
      
      <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white mb-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            {editandoId ? 'Editando Forma de Pago' : 'Formas de Pago'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            {editandoId ? `Modificando ID #${editandoId}` : 'Configura las opciones de cobro'}
          </p>
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Ej. Mercado Pago, PayPal..." 
            className="flex-1 bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <button 
            type="submit"
            className={`${editandoId ? 'bg-cyan-500' : 'bg-[#0F172A]'} text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95`}
          >
            {editandoId ? 'Guardar Cambios' : 'Agregar'}
          </button>
          
          {editandoId && (
            <button 
              type="button"
              onClick={cancelarEdicion}
              className="bg-slate-200 text-slate-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</th>
                <th className="px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {metodos.map((fp) => (
                <tr key={fp.id_forma_pago} className="hover:bg-white/60 transition-colors group">
                  <td className="px-10 py-5 text-xs font-bold text-slate-300">#{fp.id_forma_pago}</td>
                  <td className="px-10 py-5">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{fp.nombre}</span>
                  </td>
                  <td className="px-10 py-5 text-right space-x-4">
                    <button 
                      onClick={() => prepararEdicion(fp)}
                      className="text-cyan-500 hover:text-cyan-700 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleEliminar(fp.id_forma_pago)}
                      className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {metodos.length === 0 && (
            <div className="p-20 text-center">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No hay métodos registrados</span>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FormasPago;