import React, { useState } from 'react';
import CatalogoProductos from './CatalogoProductos'; 
import MisCategorias from './MisCategorias';

const DashboardCliente = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('catalogo');

  const menu = [
    { id: 'catalogo', label: 'Ver Catálogo', icon: '🛍️' },
    { id: 'categorias', label: 'Categorías', icon: '📂' },
  ];

  const userInitial = user?.usuario?.charAt(0).toUpperCase() || 'C';

  return (
    <div className="flex h-screen bg-[#F0F9FF] overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR AZUL TURQUESA PROFUNDO */}
      <aside className="w-72 bg-[#083344] text-cyan-100 flex flex-col shadow-2xl z-50">
        <div className="p-8 flex items-center justify-center border-b border-cyan-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xs">C</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">
              Danielita<span className="text-cyan-400">.</span>
            </h1>
          </div>
        </div>

        {/* Perfil del Cliente */}
        <div className="m-6 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-cyan-700 shadow-xl">
              {userInitial}
          </div>
          <p className="text-white font-semibold text-sm tracking-tight truncate w-full px-2">
            {user?.usuario || 'Cliente Valioso'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
             <p className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest">Línea de Cliente</p>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-4 space-y-2">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 translate-x-1' 
                : 'hover:bg-cyan-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span> 
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className="p-6">
          <button 
            onClick={onLogout} 
            className="w-full py-3 bg-cyan-950/50 hover:bg-rose-900/30 text-cyan-300 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-cyan-900"
          >
            Cerrar Sesión 🚪
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 flex items-center justify-between px-12 bg-white/60 backdrop-blur-md border-b border-cyan-100 z-40">
          <div>
            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-[0.3em] mb-1">Tu Papelería Online</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'catalogo' ? 'Explorar Productos' : 'Categorías de Venta'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-2xl flex items-center gap-2">
               <span className="text-cyan-600">💎</span>
               <p className="text-[9px] text-cyan-700 font-black uppercase tracking-widest">Catálogo Premium</p>
            </div>
          </div>
        </header>

        <div className="px-10 py-10 flex-1 overflow-hidden bg-gradient-to-br from-white to-cyan-50/50">
          <div className="bg-white/95 backdrop-blur-sm rounded-[3rem] h-full shadow-2xl p-10 border border-white overflow-auto no-scrollbar">
            
            {activeTab === 'catalogo' && <CatalogoProductos />}
            {activeTab === 'categorias' && <MisCategorias />}

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

export default DashboardCliente;