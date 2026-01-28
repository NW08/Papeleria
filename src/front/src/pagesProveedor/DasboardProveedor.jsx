import React, { useState } from 'react';
import ProductosProveedor from './ProductosProveedor'; 
import HistorialCompras from './HistorialCompras'; 

const DashboardProveedor = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('stock');

  const menu = [
    { id: 'stock', label: 'Inventario Actual', icon: '📦' },
    { id: 'historial', label: 'Historial de Compras', icon: '📊' },
  ];

  const userInitial = user?.usuario?.charAt(0).toUpperCase() || 'P';

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR VERDE ESMERALDA */}
      <aside className="w-72 bg-[#064E3B] text-emerald-100 flex flex-col shadow-2xl z-50">
        <div className="p-8 flex items-center justify-center border-b border-emerald-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xs">P</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">
              Danielita<span className="text-emerald-400">.</span>
            </h1>
          </div>
        </div>

        <div className="m-6 p-4 rounded-2xl bg-emerald-900/40 border border-emerald-700/50 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-emerald-700 shadow-xl">
              {userInitial}
          </div>
          <p className="text-white font-semibold text-sm tracking-tight truncate w-full px-2">
            {user?.usuario || 'Proveedor'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
             <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest">Consulta de Stock</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'hover:bg-emerald-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span> 
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button 
            onClick={onLogout} 
            className="w-full py-3 bg-emerald-900/50 hover:bg-rose-900/30 text-emerald-300 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-800"
          >
            Cerrar Sesión 🚪
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 flex items-center justify-between px-12 bg-white/40 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-1">Visibilidad de Almacén</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'stock' ? 'Estado del Inventario' : 'Historial de Compras'}
            </h2>
          </div>
        </header>

        <div className="px-10 py-10 flex-1 overflow-hidden bg-gradient-to-br from-emerald-50/30 to-slate-100">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] h-full shadow-2xl p-10 border border-white overflow-auto no-scrollbar">
            
            {/* CORRECCIÓN AQUÍ: Se usa ProductosProveedor, que es el nombre que importaste arriba */}
            {activeTab === 'stock' && <ProductosProveedor />}
            {activeTab === 'historial' && <HistorialCompras />}

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

export default DashboardProveedor;