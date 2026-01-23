<?php
include 'Database.php';
session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: login.php');
    exit();
}

// Crear nuevo usuario
if (isset($_POST['crear'])) {
    $username = $_POST['username'];
    $password = $_POST['contraseña'];
    $id_rol = $_POST['id_rol'];

    try {
        $stmt = $conn->prepare('INSERT INTO usuario (username, contraseña, id_rol) VALUES (?, ?, ?)');
        $stmt->execute([$username, $password, $id_rol]);
        $mensaje = 'Usuario creado correctamente';
    } catch (PDOException $e) {
        $error = 'Error al crear usuario: ' . $e->getMessage();
    }
}

// Eliminar usuario
if (isset($_GET['eliminar'])) {
    $id = $_GET['eliminar'];
    try {
        $stmt = $conn->prepare('DELETE FROM usuario WHERE id_usuario = ?');
        $stmt->execute([$id]);
        $mensaje = 'Usuario eliminado correctamente';
    } catch (PDOException $e) {
        $error = 'Error al eliminar usuario: ' . $e->getMessage();
    }
}

// Obtener todos los usuarios
$stmt = $conn->query('
    SELECT u.id_usuario, u.username, u.contraseña, r.nombre AS rol
    FROM usuario u
    INNER JOIN rol r ON u.id_rol = r.id_rol
');

$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Obtener roles para el select
$roles_stmt = $conn->query('SELECT * FROM rol');
$roles = $roles_stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Usuarios</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header>
    <h1>Gestión de Usuarios</h1>
</header>
<nav>
    <a href="index.php">Inicio</a>
    <a href="logout.php">Cerrar sesión</a>
</nav>
<main>
    <h2>Registrar Usuario</h2>
    <?php
    if (isset($mensaje)) echo "<p style='color:green;'>$mensaje</p>";
    if (isset($error)) echo "<p style='color:red;'>$error</p>";
    ?>
    <form method="POST" style="margin-bottom:20px;">
        <input type="text" name="username" placeholder="Usuario" required>
        <input type="password" name="contraseña" placeholder="Contraseña" required>
        <select name="id_rol" required>
            <option value="">Selecciona un rol</option>
            <?php foreach ($roles as $rol): ?>
                <option value="<?php echo $rol['id_rol']; ?>"><?php echo $rol['nombre']; ?></option>
            <?php endforeach; ?>
        </select>
        <button type="submit" name="crear">Crear Usuario</button>
    </form>

    <h2>Usuarios Registrados</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Contraseña</th>
            <th>Rol</th>
            <th>Acciones</th>
        </tr>
        <?php foreach ($usuarios as $user): ?>
            <tr>
                <td><?php echo $user['id_usuario']; ?></td>
                <td><?php echo $user['username']; ?></td>
                <td><?php echo $user['contraseña']; ?></td>
                <td><?php echo $user['rol']; ?></td>
                <td>
                    <a href="usuarios.php?eliminar=<?php echo $user['id_usuario']; ?>" style="color:red;">Eliminar</a>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
</main>
</body>
</html>
