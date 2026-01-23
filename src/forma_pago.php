<?php
include 'Database.php';
session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: login.php');
    exit();
}

// Crear nuevo método de pago
if (isset($_POST['crear'])) {
    $nombre = $_POST['nombre'];

    try {
        $stmt = $conn->prepare('INSERT INTO forma_pago (nombre) VALUES (?)');
        $stmt->execute([$nombre]);
        $mensaje = 'Método de pago creado correctamente';
    } catch (PDOException $e) {
        $error = 'Error al crear método de pago: ' . $e->getMessage();
    }
}

// Eliminar método de pago
if (isset($_GET['eliminar'])) {
    $id = $_GET['eliminar'];
    try {
        $stmt = $conn->prepare('DELETE FROM forma_pago WHERE id_forma_pago = ?');
        $stmt->execute([$id]);
        $mensaje = 'Método de pago eliminado correctamente';
    } catch (PDOException $e) {
        $error = 'Error al eliminar método de pago: ' . $e->getMessage();
    }
}

// Obtener todos los métodos de pago
$stmt = $conn->query('SELECT * FROM forma_pago');
$formas_pago = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Forma de Pago</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1>Gestión de Métodos de Pago</h1>
</header>
<nav>
    <a href="index.php">Inicio</a>
    <a href="auth/logout.php">Cerrar sesión</a>
</nav>
<main>
    <h2>Agregar Método de Pago</h2>
    <?php
    if (isset($mensaje)) echo "<p style='color:green;'>$mensaje</p>";
    if (isset($error)) echo "<p style='color:red;'>$error</p>";
    ?>
    <form method="POST" style="margin-bottom:20px;">
        <input type="text" name="nombre" placeholder="Nombre del método de pago" required>
        <button type="submit" name="crear">Agregar</button>
    </form>

    <h2>Métodos de Pago Registrados</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
        </tr>
        <?php foreach ($formas_pago as $fp): ?>
            <tr>
                <td><?php echo $fp['id_forma_pago']; ?></td>
                <td><?php echo $fp['nombre']; ?></td>
                <td>
                    <a href="forma_pago.php?eliminar=<?php echo $fp['id_forma_pago']; ?>" style="color:red;">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
</main>
</body>
</html>
