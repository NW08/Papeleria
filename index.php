<?php
declare(strict_types=1);

// 1. Cargar el autoloader de Composer
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;


// 2. Cargar variables de entorno
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// 3. Invocar la base de datos (para verificar conexión al cargar la página)
try {
    $pdo = Database::getConnection();
} catch (Exception $e) {
    die('Error de conexión al sistema: ' . $e->getMessage());
}

// 4. Lógica de sesión original
session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: src/auth/login.php');
    exit();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Administrador</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/png" sizes="48x48" href="src/media/icon.png">
</head>
<body class="dashboard-body">

<div class="dashboard-container">

    <aside class="sidebar">
        <div class="sidebar-header">
            <svg class="brand-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            <h3>PANEL</h3>
        </div>

        <nav class="sidebar-nav">
            <ul>
                <li class="nav-label">Gestión Principal</li>
                <li><a href="src/management/ventas/ventas.php"><span class="icon">🛒</span> Ventas</a></li>
                <li><a href="src/management/productos.php"><span class="icon">📦</span> Productos</a></li>
                <li><a href="src/management/clientes.php"><span class="icon">👥</span> Clientes</a></li>

                <li class="nav-label">Inventario y Compras</li>
                <li><a href="src/proveedores.php"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="src/compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="src/categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="src/settings/users/usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="src/settings/users/employees.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="src/settings/forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
                <li><a href="src/settings/estado_venta.php"><span class="icon">📊</span> Estado Venta</a></li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <a href="src/auth/logout.php" class="logout-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Cerrar Sesión
            </a>
        </div>
    </aside>

    <main class="main-content">

        <header class="top-bar">
            <div class="user-welcome">
                <h2>Hola, <?php echo htmlspecialchars($_SESSION['usuario']); ?></h2>
                <p class="date-display"><?php echo date('d \d\e F, Y'); ?></p>
            </div>

            <div class="status-badge connected">
                <div class="status-dot-container">
                    <span class="status-dot"></span>
                    <span class="status-ping"></span>
                </div>
                <div class="status-text">
                    <span class="status-label">Base de Datos</span>
                    <span class="status-value">Conectada</span>
                </div>
            </div>
        </header>

        <div class="content-panel">
            <div class="welcome-card">
                <h3>Panel de Control</h3>
                <p>Selecciona una opción del menú lateral para comenzar a administrar la papelería.</p>
            </div>
        </div>

    </main>
</div>

</body>
</html>