import React, { useState, useEffect } from 'react';

const Login = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [indexImagen, setIndexImagen] = useState(0);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const imagenes = [
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=2000&auto=format&fit=crop",
    "https://img.freepik.com/foto-gratis/decoracion-colegio-goma-sacapuntas-libreta_23-2147665298.jpg?semt=ais_hybrid&w=740&q=80",
    "https://img.freepik.com/vector-gratis/trasfondo-realista-regreso-escuela_52683-68786.jpg?semt=ais_hybrid&w=740&q=80",
    "https://benioffi.es/wp-content/uploads/2021/11/Materiales-escolares-scaled.jpg"
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndexImagen((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  // Función de conexión al Backend PHP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/Login.php',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usuario: usuario, 
          password: password 
        }),
      });

      // Verificamos si la respuesta es un JSON válido
      const data = await response.json();

      if (data.success) {
        // 'data' contiene { success: true, usuario: "...", rol: "..." }
        onLogin(data); 
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError('"Fallo de red: Revisa que la URL de la API sea correcta."');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white overflow-hidden animate-in fade-in duration-700">
      
      {/* LADO IZQUIERDO: Formulario */}
      <div className="w-full md:w-[40%] flex flex-col items-center justify-center p-10 lg:p-20 z-20 bg-white shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center md:text-left">
            <span className="text-4xl inline-block p-4 bg-orange-50 rounded-2xl mb-6 shadow-sm">✏️</span>
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Papelería Danielita</h2>
            <p className="text-gray-400 font-medium text-lg">Inicia sesión en tu panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm font-bold animate-pulse text-center border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">Usuario</label>
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 shadow-inner font-bold"
                placeholder="Nombre de usuario"
                disabled={cargando}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 shadow-inner font-bold"
                placeholder="••••••••"
                disabled={cargando}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={cargando}
              className={`w-full ${cargando ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'} text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-xl mt-4 flex items-center justify-center gap-3`}
            >
              {cargando ? 'Verificando...' : 'Entrar al Sistema →'}
            </button>
          </form>

          <div className="mt-20 text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] text-center">
            © 2026 Papelería Danielita • Dashboard
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Carrusel */}
      <div className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center bg-gray-900">
        {imagenes.map((img, i) => (
          <img 
            key={i}
            src={img} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === indexImagen ? 'opacity-60' : 'opacity-0'}`}
            alt="Slide"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-black/20 z-10"></div>
        <div className="relative z-20 text-center px-10">
          <h1 className="text-7xl font-black text-white mb-6 drop-shadow-2xl leading-none">
            Creatividad <br /> 
            <span className="text-orange-400">sin límites</span>
          </h1>
          <p className="text-white text-xl font-medium max-w-lg mx-auto opacity-90 italic">
            "Donde cada trazo cuenta una historia."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;