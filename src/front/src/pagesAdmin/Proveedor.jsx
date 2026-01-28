import React, { useState, useEffect } from 'react';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({ 
    nombre_empresa: '', 
    nombre_contacto: '', 
    telefono: '', 
    email_contacto: '' 
  });

  const API_URL = 'https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/proveedor.php';

  const cargarProveedores = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al conectar con la base de datos:", error);
    }
  };

  useEffect(() => { cargarProveedores(); }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = editandoId ? { ...formData, id_proveedor: editandoId } : formData;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await response.json();

      if (res.status === 'success') {
        setMensaje(editandoId ? '✅ Actualizado' : '✨ Guardado');
        setFormData({ nombre_empresa: '', nombre_contacto: '', telefono: '', email_contacto: '' });
        setEditandoId(null);
        cargarProveedores();
      }
    } catch (err) {
      alert("Error en la solicitud");
    }
    setTimeout(() => setMensaje(''), 2000);
  };

  const prepararEdicion = (prov) => {
    setEditandoId(prov.id_proveedor);
    setFormData({ 
      nombre_empresa: prov.nombre_empresa, 
      nombre_contacto: prov.nombre_contacto || '', 
      telefono: prov.telefono || '', 
      email_contacto: prov.email_contacto || '' 
    });
  };

  const eliminarProveedor = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      cargarProveedores();
    }
  };

  const listaFiltrada = proveedores.filter(p => 
    p.nombre_empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombre_contacto?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 bg-white min-h-screen font-sans">
      
      {/* FORMULARIO COMPACTO */}
      <div className={`p-5 rounded-2xl border mb-6 transition-all ${
        editandoId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            {editandoId ? 'Modificar Proveedor' : 'Nuevo Registro'}
          </h2>
          {mensaje && <span className="text-[10px] text-blue-600 font-bold animate-pulse">{mensaje}</span>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="nombre_empresa" placeholder="Empresa" className="bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.nombre_empresa} onChange={handleInputChange} required />
          
          <input name="nombre_contacto" placeholder="Contacto" className="bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.nombre_contacto} onChange={handleInputChange} />
          
          <input name="telefono" placeholder="Teléfono" className="bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.telefono} onChange={handleInputChange} />

          <input name="email_contacto" type="email" placeholder="Email" className="bg-gray-50 rounded-lg px-3 py-2 text-xs border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.email_contacto} onChange={handleInputChange} />
          
          <button type="submit" className={`rounded-lg text-[10px] font-bold uppercase text-white py-2 transition-all ${
            editandoId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-black'
          }`}>
            {editandoId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </div>

      {/* BÚSQUEDA */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="🔎 Buscar proveedor..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-blue-500"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA REDUCIDA */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[10px] font-bold text-gray-500 uppercase">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listaFiltrada.map((p) => (
              <tr key={p.id_proveedor} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-400 font-medium">#{p.id_proveedor}</td>
                <td className="px-4 py-3">
                  <div className="text-xs font-bold text-gray-800 uppercase">{p.nombre_empresa}</div>
                  <div className="text-[9px] text-gray-400 font-normal">{p.email_contacto}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.nombre_contacto || '---'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.telefono || 'N/A'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => prepararEdicion(p)} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 mr-3">EDITAR</button>
                  <button onClick={() => eliminarProveedor(p.id_proveedor)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {listaFiltrada.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
            Sin resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default Proveedores;