import React, { useState, useEffect } from 'react';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  // Añadimos 'email' al estado inicial
  const [formData, setFormData] = useState({ username: '', id_rol: '', email: '' });
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = 'https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/usuarios.php';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${API_URL}?accion=usuarios&t=${Date.now()}`),
        fetch(`${API_URL}?accion=roles`)
      ]);
      const dataUsers = await resUsers.json();
      const dataRoles = await resRoles.json();
      
      setUsuarios(dataUsers);
      setRoles(dataRoles);
    } catch (e) { console.error("Error cargando:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rolSeleccionado = roles.find(r => r.id_rol === formData.id_rol);
    const nombreRol = rolSeleccionado ? rolSeleccionado.nombre.toLowerCase() : 'usuario';
    const passwordGenerada = `${nombreRol}2`; 

    const accion = editandoId ? 'actualizar' : 'insertar';
    
    const datosEnviar = {
      ...formData,
      id_usuario: editandoId,
      password: passwordGenerada 
    };

    try {
      const response = await fetch(`${API_URL}?accion=${accion}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      const res = await response.json();
      if (res.status === "success") {
        setMensaje({ 
          texto: editandoId ? '✅ Actualizado' : `✅ ¡Registrado! Correo enviado a ${formData.email}`, 
          tipo: 'success' 
        });
        cancelarEdicion();
        cargarDatos();
      }
    } catch (error) {
      setMensaje({ texto: '❌ Error en el servidor', tipo: 'error' });
    }
  };

  const eliminarUsuario = async (id) => {
    if(window.confirm("¿Eliminar usuario?")) {
      await fetch(`${API_URL}?accion=eliminar&id=${id}`);
      cargarDatos();
    }
  };

  const prepararEdicion = (user) => {
    setEditandoId(user.id_usuario);
    // Nota: El email solo se usa para el registro nuevo en este ejemplo
    setFormData({ username: user.username, id_rol: user.id_rol, email: '' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ username: '', id_rol: '', email: '' });
  };

  if (loading) return <div className="p-6 text-xs font-bold">Cargando...</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className={`p-6 rounded-3xl border mb-6 ${editandoId ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
        <h3 className="text-xs font-black uppercase mb-4">
            {editandoId ? 'Actualizar Usuario' : 'Nuevo Usuario - Papelería Danielita'}
        </h3>
        
        {mensaje.texto && (
          <div className={`mb-4 text-[10px] font-bold uppercase italic ${mensaje.tipo === 'error' ? 'text-rose-500' : 'text-emerald-600'}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input 
            className="flex-1 min-w-[150px] p-3 rounded-xl text-xs border-none shadow-sm outline-none" 
            placeholder="Username" required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
          
          {/* NUEVO CAMPO DE CORREO */}
          {!editandoId && (
            <input 
              type="email"
              className="flex-1 min-w-[200px] p-3 rounded-xl text-xs border-none shadow-sm outline-none" 
              placeholder="Correo electrónico del usuario" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          )}

          <select 
            className="flex-1 min-w-[150px] p-3 rounded-xl text-xs border-none shadow-sm outline-none"
            value={formData.id_rol} required
            onChange={(e) => setFormData({...formData, id_rol: e.target.value})}
          >
            <option value="">Seleccionar Rol</option>
            {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
          </select>

          <button className="bg-slate-900 text-white px-6 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-800 transition-colors">
            {editandoId ? 'Guardar Cambios' : 'Registrar y Enviar Clave'}
          </button>
          
          {editandoId && <button type="button" onClick={cancelarEdicion} className="text-xs">✕</button>}
        </form>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[9px] text-slate-400 uppercase font-black">
              <th className="p-4">ID</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id_usuario} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all group">
                <td className="p-4 text-xs text-slate-300 font-bold">#{u.id_usuario}</td>
                <td className="p-4 text-xs font-black text-slate-700">{u.username}</td>
                <td className="p-4">
                    <span className="text-[9px] font-bold bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full uppercase italic">
                        {u.rol_nombre}
                    </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => prepararEdicion(u)} className="text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 uppercase">Editar</button>
                  <button onClick={() => eliminarUsuario(u.id_usuario)} className="text-[10px] font-bold text-rose-400 opacity-0 group-hover:opacity-100 uppercase">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;