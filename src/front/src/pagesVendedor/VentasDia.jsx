import React, { useState, useEffect } from 'react';

const VentasDia = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpVendedor/ventas_dia.php";

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Verificamos que data sea un array antes de guardar
      if (Array.isArray(data)) {
        setVentas(data);
      } else {
        console.error("Respuesta inesperada:", data);
      }
    } catch (error) {
      console.error("Error cargando ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos para las gráficas
  const stats = ventas.reduce((acc, v) => {
    acc[v.estado] = (acc[v.estado] || 0) + 1;
    return acc;
  }, {});
  const maxVal = Math.max(...Object.values(stats), 1);

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      
      {/* GRÁFICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-6">Resumen por Estado</h3>
          <div className="space-y-4">
            {Object.entries(stats).map(([nombre, cantidad]) => (
              <div key={nombre}>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>{nombre}</span>
                  <span className="text-orange-600">{cantidad}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(cantidad / maxVal) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0F172A] p-8 rounded-[2rem] flex flex-col justify-center items-center text-white shadow-2xl">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Ventas Hoy</p>
          <p className="text-6xl font-black">{ventas.length}</p>
        </div>
      </div>

      {/* TABLA DE REGISTROS */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="3" className="py-20 text-center font-bold text-slate-300 animate-pulse">CARGANDO DATOS...</td></tr>
            ) : ventas.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-8 py-4 font-black text-slate-700">#{v.id}</td>
                <td className="px-8 py-4 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${v.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="px-8 py-4 text-right font-black text-slate-900">
                  {/* El uso de || 0 evita el error de toFixed */}
                  ${(v.total || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VentasDia;