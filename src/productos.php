<?php
include "conexion.php";
session_start();
if(!isset($_SESSION['usuario'])){
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Productos</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1>Productos</h1>
</header>
<nav>
    <a href="index.php">Inicio</a>
    <a href="logout.php">Cerrar sesión</a>
</nav>
<main>
    <h2>Lista de Productos</h2>
    <?php
    $stmt = $conn->query("
        SELECT p.id_producto, p.nombre, p.precio, p.stock, c.nombre AS categoria, pr.nombre AS proveedor
        FROM producto p
        INNER JOIN categoria c ON p.id_categoria = c.id_categoria
        INNER JOIN proovedor pr ON p.id_proveedor = pr.id_proveedor
    ");
    echo "<table>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Proveedor</th></tr>";
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        echo "<tr>
                <td>{$row['id_producto']}</td>
                <td>{$row['nombre']}</td>
                <td>{$row['precio']}</td>
                <td>{$row['stock']}</td>
                <td>{$row['categoria']}</td>
                <td>{$row['proveedor']}</td>
              </tr>";
    }
    echo "</table>";
    ?>
</main>
</body>
</html>
