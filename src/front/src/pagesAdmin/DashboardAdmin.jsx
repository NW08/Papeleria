import React, { useState } from 'react';
// IMPORTACIONES DE TUS COMPONENTES (Asegúrate que los archivos existan)
import Productos from './Productos'; 
import Usuarios from './Usuarios'; 
import Empleados from './Empleados';
import Clientes from './Clientes';
import Proveedores from './Proveedor';
import Compras from './Compra';
import VentasReportes from './VentasReportes';
import FormasPago from './FormasPago';

const DashboardAdmin = ({ user, onLogout }) => {
  // Estado para controlar qué tabla se muestra
  const [activeTab, setActiveTab] = useState('resumen');

  // Definición del menú basada estrictamente en tu script de SQL
  const menu = [
    { id: 'resumen', label: 'Dashboard General', icon: '📊' },    // Vista de Ventas (tabla venta)
    { id: 'productos', label: 'Productos (Inventario)', icon: '📦' }, // Tabla producto
    { id: 'empleados', label: 'Empleados (RRHH)', icon: '👔' },      // Tabla empleado + cargo
    { id: 'usuarios', label: 'Cuentas de Usuario', icon: '🔐' },    // Tabla usuario + rol
    { id: 'compras', label: 'Compras a Proveedores', icon: '🛒' },   // Tabla compra
    { id: 'clientes', label: 'Gestión de Clientes', icon: '👥' },     // Tabla cliente
    { id: 'proveedores', label: 'Proveedores', icon: '🚚' },        // Tabla proveedor
    { id: 'pagos', label: 'Métodos de Pago', icon: '💳' },         // Tabla forma_pago
  ];

  const adminInitial = user?.usuario?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* SIDEBAR PROFESIONAL */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl z-50">
        
        {/* LOGO */}
        <div className="p-8 flex items-center justify-center border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xs">D</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              DANIELITA<span className="text-indigo-400">.</span>SYS
            </h1>
          </div>
        </div>

        {/* PERFIL ADMIN */}
        <div className="m-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-slate-700 shadow-xl">
             {adminInitial}
          </div>
          <p className="text-white font-semibold text-sm tracking-tight">{user?.usuario || 'Admin'}</p>
          <div className="mt-1 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Administrador</p>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN (TODAS LAS TABLAS) */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-lg transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span> 
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* BOTÓN SALIR */}
        <div className="p-6">
          <button 
            onClick={onLogout} 
            className="w-full py-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-900/50"
          >
            Log Out Session
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-24 flex items-center justify-between px-12 bg-white/40 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-1">Administrative Center</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          
          <div className="flex gap-3">
             <div className="h-10 px-4 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Status:</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase italic">Online</span>
             </div>
          </div>
        </header>

        {/* RENDERIZADO DE COMPONENTES SEGÚN TABLA SELECCIONADA */}
        <div className="px-10 py-10 flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] h-full shadow-2xl shadow-slate-200/60 p-10 border border-white overflow-auto no-scrollbar">
            
            {activeTab === 'resumen' && <VentasReportes />}
            {activeTab === 'productos' && <Productos />}
            {activeTab === 'empleados' && <Empleados />}
            {activeTab === 'usuarios' && <Usuarios />}
            {activeTab === 'compras' && <Compras />}
            {activeTab === 'clientes' && <Clientes />}
            {activeTab === 'proveedores' && <Proveedores />}
            {activeTab === 'pagos' && <FormasPago />}

          </div>
        </div>
      </main>

      {/* ESTILOS PARA OCULTAR SCROLLBAR */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DashboardAdmin;