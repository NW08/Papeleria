import React, { useState, useEffect } from 'react';

const HistorialCompras = () => {
  const [compras, setCompras] = useState([]);
  const [expandida, setExpandida] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial del JSON unificado (Compras + Items)
  useEffect(() => {
    fetch("https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/phpProveedor/getHistorialCompras.php")
      .then(res => res.json())
      .then(data => {
        setCompras(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando historial:", err);
        setLoading(false);
      });
  }, []);

  const toggleExpandir = (id) => {
    setExpandida(expandida === id ? null : id);
  };

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Cabecera del Módulo */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-emerald-900 font-black uppercase text-xs tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Registro Maestro de Suministros
        </h3>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#064E3B] text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-8 py-6">Orden / Fecha</th>
              <th className="px-8 py-6">Proveedor</th>
              <th className="px-8 py-6 text-right">Monto Total</th>
              <th className="px-8 py-6 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50 text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-black text-emerald-800 uppercase text-[10px] tracking-widest">Sincronizando con Servidor...</span>
                  </div>
                </td>
              </tr>
            ) : compras.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase text-xs">
                  No se registran compras en el sistema
                </td>
              </tr>
            ) : (
              compras.map((c) => (
                <React.Fragment key={c.id}>
                  {/* Fila Principal de Compra */}
                  <tr className={`hover:bg-emerald-50/40 transition-all cursor-pointer ${expandida === c.id ? 'bg-emerald-50/60' : ''}`}
                      onClick={() => toggleExpandir(c.id)}>
                    <td className="px-8 py-5">
                      <span className="block font-black text-emerald-900 text-base">#{c.orden}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.fecha}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 uppercase italic tracking-tighter text-xs">
                          {c.proveedor}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-black uppercase">Suministro Externo</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="font-black text-slate-900 text-lg">
                        ${parseFloat(c.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          expandida === c.id ? 'bg-slate-800 text-white rotate-180' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {expandida === c.id ? '✕' : '↓'}
                      </button>
                    </td>
                  </tr>

                  {/* Fila de Productos Detallados */}
                  {expandida === c.id && (
                    <tr className="bg-slate-100/50 animate-slideDown">
                      <td colSpan="4" className="px-8 py-8">
                        <div className="bg-white rounded-3xl border border-emerald-200 shadow-inner overflow-hidden">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-slate-800 text-white uppercase text-[9px] font-black tracking-widest">
                                <th className="px-6 py-3 text-left">Descripción del Producto</th>
                                <th className="px-6 py-3 text-center">Cant.</th>
                                <th className="px-6 py-3 text-right">Precio Unitario</th>
                                <th className="px-6 py-3 text-right">Subtotal Neto</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {c.items && c.items.length > 0 ? (
                                c.items.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700 uppercase">
                                      {item.producto}
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-slate-900">
                                      {item.cantidad}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 font-medium italic">
                                      ${parseFloat(item.costo).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-emerald-600 bg-emerald-50/20">
                                      ${parseFloat(item.subtotal).toFixed(2)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="p-6 text-center text-slate-400 italic">
                                    Esta orden no registra desglose de productos.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-emerald-600 text-white">
                                    <td colSpan="3" className="px-6 py-3 text-right font-bold uppercase text-[9px] tracking-widest">Inversión Final de Orden:</td>
                                    <td className="px-6 py-3 text-right font-black text-sm">${parseFloat(c.total).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialCompras;