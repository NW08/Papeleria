import React, { useState } from 'react';
import ListaProductosAsistente from './ListaProductosAsistente'; 
import DirectorioClientes from './DirectorioClientes';
import ListaCategorias from './ListaCategorias';

const DashboardAsistente = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('productos');

  const menu = [
    { id: 'productos', label: 'Inventario', icon: '📦' },
    { id: 'clientes', label: 'Directorio Clientes', icon: '👥' },
    { id: 'categorias', label: 'Categorías', icon: '🏷️' },
  ];

  const userInitial = user?.usuario?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR AZUL ÍNDIGO PROFUNDO */}
      <aside className="w-72 bg-[#1E1B4B] text-indigo-100 flex flex-col shadow-2xl z-50">
        <div className="p-8 flex items-center justify-center border-b border-indigo-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="font-black text-xs">A</span>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight uppercase">
              Danielita<span className="text-indigo-400">.</span>
            </h1>
          </div>
        </div>

        {/* Perfil del Asistente */}
        <div className="m-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-indigo-700 shadow-xl">
              {userInitial}
          </div>
          <p className="text-white font-semibold text-sm tracking-tight truncate w-full px-2">
            {user?.usuario || 'Asistente'}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
             <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest">Rol: Asistente</p>
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
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1' 
                : 'hover:bg-indigo-900 hover:text-white'
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
            className="w-full py-3 bg-indigo-950/50 hover:bg-rose-900/30 text-indigo-300 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-900"
          >
            Cerrar Sesión 🚪
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 flex items-center justify-between px-12 bg-white/40 backdrop-blur-md border-b border-slate-200/60 z-40">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-1">Módulo de Consulta</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'productos' && 'Gestión de Inventario'}
              {activeTab === 'clientes' && 'Base de Datos de Clientes'}
              {activeTab === 'categorias' && 'Clasificación de Productos'}
            </h2>
          </div>
          
          {/* Badge de Solo Lectura */}
          <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
             <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest">⚠️ Modo Consulta</p>
          </div>
        </header>

        <div className="px-10 py-10 flex-1 overflow-hidden bg-gradient-to-br from-indigo-50/30 to-slate-100">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] h-full shadow-2xl p-10 border border-white overflow-auto no-scrollbar">
            
            {/* Renderizado Condicional de Componentes */}
            {activeTab === 'productos' && <ListaProductosAsistente />}
            {activeTab === 'clientes' && <DirectorioClientes />}
            {activeTab === 'categorias' && <ListaCategorias />}

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

export default DashboardAsistente;