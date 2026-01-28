import React, { useState, useEffect } from 'react';

const EstadoVenta = () => {
  // CONFIGURACIÓN DE URL (Como en los códigos anteriores)
  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/reportes.php";

  // 1. Estados para los datos y la interfaz
  const [estados, setEstados] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  // 2. Función para obtener datos (GET)
  const cargarEstados = async () => {
    setCargando(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.error("Error al conectar con Azure:", error);
      setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Cargar al iniciar el componente
  useEffect(() => {
    cargarEstados();
  }, []);

  // 3. Función para Guardar o Actualizar (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const payload = editandoId ? { id_estado: editandoId, nombre } : { nombre };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMensaje({ 
          texto: editandoId ? '✅ Estado actualizado correctamente' : '✨ Nuevo estado registrado con éxito', 
          tipo: 'success' 
        });
        setNombre('');
        setEditandoId(null);
        cargarEstados(); // Recargar la lista desde la DB
      }
    } catch (error) {
      setMensaje({ texto: 'Error al procesar la solicitud', tipo: 'error' });
    }

    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // 4. Preparar para editar
  const prepararEdicion = (est) => {
    setEditandoId(est.id_estado);
    setNombre(est.nombre);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al formulario
  };

  // 5. Eliminar (DELETE)
  const eliminarEstado = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este estado? Las ventas asociadas podrían verse afectadas.")) {
      try {
        await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        setMensaje({ texto: '🗑️ Estado eliminado del sistema', tipo: 'error' });
        cargarEstados(); // Actualizar tabla
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn font-sans p-2">
      
      {/* SECCIÓN SUPERIOR: FORMULARIO */}
      <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 mb-8 shadow-sm ${
        editandoId ? 'bg-indigo-50 border-indigo-200' : 'bg-white/40 border-white backdrop-blur-md'
      }`}>
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Estados de Venta</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {editandoId ? `Modificando ID #${editandoId}` : 'Gestiona los estados de tus transacciones en Azure'}
          </p>
        </div>

        {/* Alertas de Mensaje */}
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border animate-pulse transition-all ${
            mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
          }`}>
            {mensaje.tipo === 'success' ? '✔ ' : '✖ '} {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-wrap md:flex-nowrap gap-4">
          <input 
            type="text" 
            placeholder="Ej: Pagado, Devuelto, Enviado..." 
            className="flex-1 bg-white/80 border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button 
              type="submit"
              className={`${editandoId ? 'bg-indigo-600' : 'bg-[#0F172A]'} text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95`}
            >
              {editandoId ? 'Actualizar' : 'Guardar Estado'}
            </button>
            
            {editandoId && (
              <button 
                type="button" 
                onClick={() => { setEditandoId(null); setNombre(''); }}
                className="bg-slate-200 text-slate-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECCIÓN INFERIOR: TABLA DE DATOS */}
      <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-y-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-50/50 backdrop-blur-sm border-b border-slate-100">
              <tr>
                <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Etiqueta del Estado</th>
                <th className="px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cargando ? (
                <tr>
                  <td colSpan="3" className="text-center p-10 text-[10px] uppercase font-bold text-slate-400 animate-pulse">Sincronizando con Azure...</td>
                </tr>
              ) : estados.map((est) => (
                <tr key={est.id_estado} className="hover:bg-white/60 transition-colors group">
                  <td className="px-10 py-5 text-xs font-bold text-slate-300 italic">#{est.id_estado}</td>
                  <td className="px-10 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                      est.nombre === 'Completada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      est.nombre === 'Cancelada' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {est.nombre}
                    </span>
                  </td>
                  <td className="px-10 py-5 text-right space-x-6">
                    <button 
                      onClick={() => prepararEdicion(est)}
                      className="text-indigo-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarEstado(est.id_estado)}
                      className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!cargando && estados.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sin estados configurados en la DB</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default EstadoVenta;