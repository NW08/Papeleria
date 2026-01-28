import React, { useState } from 'react';
import ProductosVendedor from './ProductosVendedor'; 
import Clientes from './Clientes'; 
import NuevaVenta from './NuevaVenta';
import VentasDia from './VentasDia'; // Importación correcta

const DashboardVendedor = ({ user, onLogout }) => {
  // Estado inicial en 'facturacion' para abrir el Punto de Venta
  const [activeTab, setActiveTab] = useState('facturacion');

  const menu = [
    { id: 'facturacion', label: 'Punto de Venta', icon: '⚡' },
    { id: 'ventas_dia', label: 'Ventas del Día', icon: '📝' }, // ID corregido para coincidir con el estado
    { id: 'stock', label: 'Consultar Stock', icon: '📦' },
    { id: 'clientes', label: 'Gestión Clientes', icon: '👥' },
  ];

  const userInitial = user?.usuario?.charAt(0).toUpperCase() || 'V';

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-2xl z-50">
        <div className="p-8 flex items-center justify-center border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xs">D</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">
              Danielita<span className="text-orange-400">.</span>
            </h1>
          </div>
        </div>

        {/* PERFIL DEL VENDEDOR */}
        <div className="m-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-slate-700 shadow-xl">
              {userInitial}
          </div>
          <p className="text-white font-semibold text-sm tracking-tight truncate w-full px-2">
            {user?.usuario || 'Vendedor'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Caja Activa</p>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' 
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

        {/* SALIDA */}
        <div className="p-6">
          <button 
            onClick={onLogout} 
            className="w-full py-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-900/50"
          >
            Cerrar Turno 🚪
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 flex items-center justify-between px-12 bg-white/40 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-1">Panel de Control</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'facturacion' ? 'Nueva Venta' : 
               activeTab === 'ventas_dia' ? 'Ventas del Día' : 
               activeTab === 'stock' ? 'Consultar Stock' : 'Gestión Clientes'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 px-4 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Estado:</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase italic underline decoration-2">Conectado</span>
            </div>
          </div>
        </header>

        {/* ÁREA DE TRABAJO */}
        <div className="px-10 py-10 flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] h-full shadow-2xl shadow-slate-200/60 p-10 border border-white overflow-auto no-scrollbar">
            
            {/* Renderizado de Componentes */}
            {activeTab === 'facturacion' && <NuevaVenta user={user} />}
            {activeTab === 'ventas_dia' && <VentasDia />}
            {activeTab === 'stock' && <ProductosVendedor />}
            {activeTab === 'clientes' && <Clientes />}

          </div>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DashboardVendedor;