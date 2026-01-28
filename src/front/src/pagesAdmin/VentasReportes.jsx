import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';

const ReportesGeneral = () => {
  const [data, setData] = useState({ mensuales: [], estados: [], topProductos: [], vendedores: [], stats: [] });
  const [loading, setLoading] = useState(true);

  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/reportes.php";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // --- FUNCIÓN PARA EXPORTAR A CSV ---
  const exportarCSV = () => {
    if (data.mensuales.length === 0) return alert("No hay datos para exportar");

    // Cabeceras del CSV
    let csvContent = "data:text/csv;charset=utf-8,Dia/Mes,Venta Total\n";
    
    // Filas de datos
    data.mensuales.forEach(row => {
      csvContent += `${row.mes},${row.total}\n`;
    });

    // Crear link de descarga
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center text-[10px] font-black uppercase text-slate-400">Cargando...</div>;

  return (
    <div className="h-full flex flex-col space-y-4 p-4 bg-slate-50/50 overflow-y-auto no-scrollbar font-sans">
      
      {/* HEADER CON BOTÓN CSV */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Resumen Ejecutivo</h2>
          <p className="text-[8px] font-bold text-slate-400 uppercase">Reporte de Actividad Semanal</p>
        </div>
        <button 
          onClick={exportarCSV}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
        >
          📊 Descargar CSV
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.stats.map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
            <span className="text-[7px] font-black text-slate-400 uppercase block mb-1">{stat.label}</span>
            <span className={`text-xs font-black ${stat.col}`}>{stat.val}</span>
          </div>
        ))}
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* GRÁFICO DE LÍNEAS (VENTA DIARIA) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-[220px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase mb-3">Ventas por Día ($)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data.mensuales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TOP PRODUCTOS */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-[220px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase mb-3">Top 5 Artículos</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.topProductos}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 'bold', fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ESTADOS PIE */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-[220px]">
          <h3 className="text-[9px] font-black text-slate-400 uppercase mb-2">Estado de Ventas</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={data.estados} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                {data.estados.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{fontSize: '9px', fontWeight: 'bold'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* VENDEDORES */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 h-[220px] overflow-hidden">
          <h3 className="text-[9px] font-black text-slate-400 uppercase mb-3">Ventas por Empleado</h3>
          <div className="space-y-3 overflow-y-auto h-[160px] no-scrollbar pr-2">
            {data.vendedores.map((v, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold text-slate-700">{v.name}</span>
                <span className="text-[10px] font-black text-indigo-600">${v.monto.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportesGeneral;