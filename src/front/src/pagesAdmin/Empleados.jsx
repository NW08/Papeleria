import React, { useState, useEffect } from 'react';

const Empleados = () => {
  const [listaEmpleados, setListaEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [empleadoAEditar, setEmpleadoAEditar] = useState(null);

  const [formEmp, setFormEmp] = useState({
    nombre: '', apellido: '', email: '', id_cargo: '', id_usuario: ''
  });

  const API_URL = 'https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/empleados.php';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resEmp, resCar] = await Promise.all([
        fetch(`${API_URL}?accion=listar`),
        fetch(`${API_URL}?accion=cargos`)
      ]);
      setListaEmpleados(await resEmp.json());
      setCargos(await resCar.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    const accion = empleadoAEditar ? 'actualizar' : 'insertar';
    const body = empleadoAEditar ? { ...formEmp, id_empleado: empleadoAEditar } : formEmp;

    const res = await fetch(`${API_URL}?accion=${accion}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.status === "success") {
      cerrarModal();
      cargarDatos();
    } else {
      alert("Error: " + (data.errors ? data.errors[0].message : "No se pudo guardar"));
    }
  };

  const eliminarEmpleado = async (id) => {
    if (window.confirm("¿Eliminar empleado?")) {
      await fetch(`${API_URL}?accion=eliminar&id=${id}`);
      cargarDatos();
    }
  };

  const abrirModalEditar = (emp) => {
    setEmpleadoAEditar(emp.id_empleado);
    setFormEmp({ 
        nombre: emp.nombre, 
        apellido: emp.apellido, 
        email: emp.email, 
        id_cargo: emp.id_cargo, 
        id_usuario: emp.id_usuario || '' 
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEmpleadoAEditar(null);
    setFormEmp({ nombre: '', apellido: '', email: '', id_cargo: '', id_usuario: '' });
  };

  const filtrados = listaEmpleados.filter(emp => 
    (emp.nombre + " " + emp.apellido).toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-slate-800">Personal</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Fuerza de trabajo</p>
        </div>
        <div className="flex gap-2">
          <input 
            className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none w-64 shadow-sm"
            placeholder="Buscar..." onChange={(e) => setBusqueda(e.target.value)}
          />
          <button onClick={() => setShowModal(true)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-emerald-100">
            + Nuevo
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[9px] font-black text-slate-400 uppercase">Empleado</th>
              <th className="p-5 text-[9px] font-black text-slate-400 uppercase">Email</th>
              <th className="p-5 text-[9px] font-black text-slate-400 uppercase">Cargo</th>
              <th className="p-5 text-[9px] font-black text-slate-400 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(emp => (
              <tr key={emp.id_empleado} className="border-b border-slate-50 hover:bg-slate-50/50 group">
                <td className="p-5">
                  <div className="text-xs font-black text-slate-700 uppercase">{emp.nombre} {emp.apellido}</div>
                  <div className="text-[9px] text-slate-400 font-bold">ID: #{emp.id_empleado}</div>
                </td>
                <td className="p-5 text-xs font-bold text-indigo-500">{emp.email}</td>
                <td className="p-5">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">
                    {emp.cargo_nombre}
                  </span>
                </td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(emp)} className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">Editar</button>
                  <button onClick={() => eliminarEmpleado(emp.id_empleado)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white">
            <h3 className="text-xl font-black text-slate-800 mb-6 uppercase italic">Ficha Empleado</h3>
            <form onSubmit={guardarEmpleado} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nombre" className="bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" value={formEmp.nombre} onChange={e => setFormEmp({...formEmp, nombre: e.target.value})} required />
                <input placeholder="Apellido" className="bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" value={formEmp.apellido} onChange={e => setFormEmp({...formEmp, apellido: e.target.value})} required />
              </div>
              <input type="email" placeholder="Correo Electrónico" className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" value={formEmp.email} onChange={e => setFormEmp({...formEmp, email: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" value={formEmp.id_cargo} onChange={e => setFormEmp({...formEmp, id_cargo: e.target.value})} required>
                  <option value="">Cargo...</option>
                  {cargos.map(c => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre}</option>)}
                </select>
                <input type="number" placeholder="ID Usuario Link" className="bg-slate-50 p-3 rounded-xl text-xs font-bold outline-none" value={formEmp.id_usuario} onChange={e => setFormEmp({...formEmp, id_usuario: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={cerrarModal} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">Cerrar</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;