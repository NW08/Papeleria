import React, { useState } from 'react';
import Login from './pages/Login.jsx';
import DashboardAdmin from './pagesAdmin/DashboardAdmin.jsx';
import DashboardVendedor from './pagesVendedor/DashboardVendedor.jsx';
import DashboardProveedor from './pagesProveedor/DasboardProveedor.jsx'; 
import DashboardAsistente from './pagesAsistente/DashboardAsistente.jsx'; 
import DashboardCliente from './pagesCliente/DashboardCliente.jsx'; 

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
      
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        /* Lógica de Enrutamiento por ROL */
        <div className="animate-fadeIn">
          {user.rol === 'Administrador' && (
            <DashboardAdmin user={user} onLogout={handleLogout} />
          )}

          {user.rol === 'Vendedor' && (
            <DashboardVendedor user={user} onLogout={handleLogout} />
          )}

          {user.rol === 'Proveedor' && (
            <DashboardProveedor user={user} onLogout={handleLogout} />
          )}

          {user.rol === 'Asistente' && (
            <DashboardAsistente user={user} onLogout={handleLogout} />
          )}

          {/* 2. Nueva validación para el rol Cliente */}
          {user.rol === 'Cliente' && (
            <DashboardCliente user={user} onLogout={handleLogout} />
          )}
        </div>
      )}

    </div>
  );
}

export default App;