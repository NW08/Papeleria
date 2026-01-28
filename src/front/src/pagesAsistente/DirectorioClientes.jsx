import React, { useState, useEffect } from 'react';

const DirectorioClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpAsistente/getClientesAsistente.php")
      .then(res => res.json())
      .then(data => {
        setClientes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrar por nombre, apellido o email
  const filtrados = clientes.filter(c => 
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* Barra de búsqueda */}
      <div className="mb-8 flex items-center bg-white rounded-2xl px-6 py-4 w-full max-w-lg shadow-sm border border-slate-100">
        <span className="text-xl mr-3">🔍</span>
        <input 
          type="text" 
          placeholder="BUSCAR CLIENTE POR NOMBRE O CORREO..."
          className="bg-transparent border-none outline-none text-[10px] font-black w-full uppercase tracking-widest text-slate-600"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 text-center animate-pulse font-black text-indigo-300 uppercase tracking-[0.3em]">
          Accediendo a la base de clientes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map(cliente => (
            <div key={cliente.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-md hover:shadow-xl transition-all group border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                  {cliente.nombre.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-xs">
                    {cliente.nombre} {cliente.apellido}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: CLI-{cliente.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-sm">📧</span>
                  <span className="text-[10px] font-bold text-slate-600 truncate">{cliente.email}</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  <span className="text-sm">📞</span>
                  <span className="text-[10px] font-bold text-slate-600 tracking-widest">{cliente.telefono}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Solo Lectura</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtrados.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No existen clientes registrados con ese nombre</p>
        </div>
      )}
    </div>
  );
};

export default DirectorioClientes;