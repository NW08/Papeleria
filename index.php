<?php
session_start();
if (!isset($_SESSION['usuario'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Administrador</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1>Panel Administrador Papelería</h1>
</header>
<nav>
    <a href="src/FRONTEND/ventas.php">Ventas</a>
    <a href="src/FRONTEND/productos.php">Productos</a>
    <a href="src/clientes.php">Clientes</a>
    <a href="src/proveedores.php">Proveedores</a>
    <a href="src/compras.php">Compras</a>
    <a href="src/empleados.php">Empleados</a>
    <a href="src/categorias.php">Categorías</a>
    <a href="src/FRONTEND/usuarios.php">Usuarios</a>
    <a href="src/FRONTEND/forma_pago.php">Forma de Pago</a>
    <a href="src/estado_venta.php">Estado de Venta</a>
    <a href="src/logout.php">Cerrar sesión</a>
</nav>
<main>
    <h2>Bienvenido, <?php echo $_SESSION['usuario']; ?>!</h2>
    <p>Selecciona una opción del menú para administrar la papelería.</p>
</main>
</body>
</html>
