import React, { useState, useEffect } from 'react';

const AlertasReabastecimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost/BaseDatos/papeleria-api/phpProveedor/getAlertasStock.php")
      .then(res => res.json())
      .then(data => {
        // Validamos que data sea un array antes de guardar
        setAlertas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error en alertas:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-red-600 uppercase text-[10px] tracking-widest">Escaneando niveles de inventario...</p>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Encabezado de la sección */}
      <div className="flex items-center gap-4 mb-8 bg-red-50 p-6 rounded-[2rem] border border-red-100">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-red-100">
          🚨
        </div>
        <div>
          <h2 className="text-red-900 font-black uppercase text-sm tracking-tighter">Prioridades de Reabastecimiento</h2>
          <p className="text-red-600/60 text-[10px] font-bold uppercase tracking-widest">Acción inmediata requerida</p>
        </div>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertas.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
            <span className="text-4xl block mb-4">🎉</span>
            <p className="text-emerald-800 font-black uppercase text-xs">Inventario Óptimo</p>
            <p className="text-emerald-600/60 text-[10px] font-bold uppercase mt-1">Todos los productos superan el stock mínimo</p>
          </div>
        ) : (
          alertas.map((item) => {
            // Calculamos qué tan grave es la situación
            const porcentaje = Math.min((item.stock_actual / item.stock_min) * 100, 100);
            const esCritico = item.stock_actual <= (item.stock_min * 0.5);

            return (
              <div 
                key={item.id} 
                className={`p-6 rounded-[2.2rem] border transition-all duration-300 bg-white hover:shadow-2xl group ${
                  esCritico ? 'border-red-200 hover:border-red-400' : 'border-orange-100 hover:border-orange-300'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-sm leading-tight group-hover:text-red-600 transition-colors">
                      {item.nombre}
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">SKU: PRD-{item.id}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    esCritico 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                    {esCritico ? 'Nivel Crítico' : 'Stock Bajo'}
                  </div>
                </div>

                {/* Barra de progreso estilizada */}
                <div className="relative h-4 bg-slate-100 rounded-full p-1 mb-4 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      esCritico ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-orange-500 to-orange-300'
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  >
                    {porcentaje > 20 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-widest">
                        {Math.round(porcentaje)}% Capacidad
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Estado Actual</span>
                    <span className="text-xl font-black text-slate-800">
                      {item.stock_actual} <span className="text-xs text-slate-400">/ {item.stock_min}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Pedido Sugerido</span>
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20">
                      +{item.faltante} <span className="text-[10px]">UND</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertasReabastecimiento;