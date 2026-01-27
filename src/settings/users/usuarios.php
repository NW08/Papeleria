<?php
declare(strict_types=1);
session_start();

// 1. Cargar dependencias y entorno
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Validación de Sesión
if (!isset($_SESSION['usuario'])) {
    header('Location: ../../auth/login.php');
    exit();
}

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

$mensaje = null;
$error = null;

try {
    $pdo = Database::getConnection();

    // ---------------------------------------------------------
    // A. LÓGICA: CREAR USUARIO
    // ---------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crear'])) {
        $username = trim($_POST['username']);
        $password = $_POST['contrasena'];
        $id_rol = $_POST['id_rol'];

        if (!empty($username) && !empty($password) && !empty($id_rol)) {
            // Verificar si ya existe
            $stmtCheck = $pdo->prepare('SELECT COUNT(*) FROM usuario WHERE username = ?');
            $stmtCheck->execute([$username]);

            if ($stmtCheck->fetchColumn() > 0) {
                $error = "El nombre de usuario '$username' ya existe.";
            } else {
                $sqlInsert = "
                    INSERT INTO usuario (username, contrasena_hash, id_rol, fecha_registro) 
                    VALUES (:user, HASHBYTES('SHA2_256', :pass), :rol, GETDATE())
                ";

                $stmt = $pdo->prepare($sqlInsert);
                $stmt->execute([
                        ':user' => $username,
                        ':pass' => $password, // SQL Server lo encriptará al recibirlo
                        ':rol' => $id_rol
                ]);

                $mensaje = 'Usuario creado correctamente.';
            }
        } else {
            $error = 'Todos los campos son obligatorios.';
        }
    }

    // ---------------------------------------------------------
    // B. LÓGICA: ELIMINAR USUARIO
    // ---------------------------------------------------------
    if (isset($_GET['eliminar'])) {
        $idEliminar = $_GET['eliminar'];

        // Evitar que el usuario se elimine a sí mismo (opcional pero recomendado)
        if (isset($_SESSION['id_usuario']) && $_SESSION['id_usuario'] == $idEliminar) {
            $error = 'No puedes eliminar tu propio usuario mientras estás conectado.';
        } else {
            // Eliminar dependencias primero si es necesario, o confiar en ON DELETE CASCADE si existe.
            // Por seguridad, un DELETE simple:
            $stmtDel = $pdo->prepare('DELETE FROM usuario WHERE id_usuario = ?');
            $stmtDel->execute([$idEliminar]);
            $mensaje = 'Usuario eliminado.';
        }
    }

    // ---------------------------------------------------------
    // C. LÓGICA: LEER DATOS (SELECT)
    // ---------------------------------------------------------

    // 1. Obtener usuarios (SIN LA CONTRASEÑA)
    $sqlUsuarios = '
        SELECT u.id_usuario, u.username, u.fecha_registro, r.nombre AS rol
        FROM usuario u
        INNER JOIN rol r ON u.id_rol = r.id_rol
        ORDER BY u.fecha_registro DESC
    ';
    $usuarios = $pdo->query($sqlUsuarios)->fetchAll();

    // 2. Obtener roles para el formulario
    $roles = $pdo->query('SELECT id_rol, nombre FROM rol')->fetchAll();

} catch (Exception $e) {
    $error = 'Error del sistema: ' . $e->getMessage();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../style.css">
    <link rel="icon" type="image/png" sizes="48x48" href="../../media/icon.png">
</head>
<body class="dashboard-body">

<div class="dashboard-container">

    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="../../../index.php" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:10px;">
                <svg class="brand-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                <h3>Papelería <span style="font-weight:400">Control</span></h3>
            </a>
        </div>

        <nav class="sidebar-nav">
            <ul>
                <li class="nav-label">Gestión Principal</li>
                <li><a href="../../management/ventas/ventas.php"><span class="icon">🛒</span> Ventas</a></li>
                <li><a href="../../management/productos.php"><span class="icon">📦</span> Productos</a></li>
                <li><a href="../../management/clientes.php"><span class="icon">👥</span> Clientes</a></li>

                <li class="nav-label">Inventario y Compras</li>
                <li><a href="proveedores.php"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="usuarios.php" class="active"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="empleados.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
                <li><a href="estado_venta.php"><span class="icon">📊</span> Estado Venta</a></li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <a href="../../auth/logout.php" class="logout-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                <h2>Gestión de Usuarios</h2>
                <p class="date-display">Control de acceso y roles del sistema</p>
            </div>
            <div>
                <button onclick="abrirModalUsuario()" class="btn-primary">
                    + Nuevo Usuario
                </button>
            </div>
        </header>

        <?php if ($mensaje): ?>
            <div class="alert" style="background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; margin-bottom:20px;">
                ✅ <?php echo htmlspecialchars($mensaje); ?>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-error" style="margin-bottom:20px;">
                ⚠ <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <div class="table-container">
            <table class="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol Asignado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($usuarios as $user): ?>
                    <tr>
                        <td class="text-mono"><?php echo htmlspecialchars((string)$user['id_usuario']); ?></td>

                        <td style="font-weight: 500;">
                            <?php echo htmlspecialchars($user['username']); ?>
                        </td>

                        <td>
                            <?php
                            $rol = strtolower($user['rol']);
                            if (str_contains($rol, 'admin')) {
                                echo '<span class="role-badge role-admin">Administrador</span>';
                            } else {
                                echo '<span class="role-badge role-staff">' . htmlspecialchars($user['rol']) . '</span>';
                            }
                            ?>
                        </td>

                        <td style="color: var(--text-muted); font-size: 0.9em;">
                            <?php echo $user['fecha_registro'] ? date('d/m/Y', strtotime($user['fecha_registro'])) : '-'; ?>
                        </td>

                        <td>
                            <a href="usuarios.php?eliminar=<?php echo $user['id_usuario']; ?>"
                               class="btn-danger-ghost"
                               onclick="return confirm('¿Estás seguro de eliminar a este usuario? Esta acción es irreversible.');">
                                Eliminar
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalUsuario" class="modal-overlay">
    <div class="modal-content" style="width: 450px;">
        <div class="modal-header">
            <h3>Registrar Nuevo Usuario</h3>
            <span class="close-btn" onclick="cerrarModalUsuario()">&times;</span>
        </div>

        <form method="POST">
            <div class="modal-body">

                <div class="form-group">
                    <label for="username">Nombre de Usuario</label>
                    <input type="text" name="username" id="username" required placeholder="Ej. Perez" autocomplete="off">
                </div>

                <div class="form-group">
                    <label for="contrasena">Contraseña</label>
                    <input type="password" name="contrasena" id="contrasena" required placeholder="••••••••">
                </div>

                <div class="form-group">
                    <label for="id_rol">Rol del Sistema</label>
                    <select name="id_rol" id="id_rol" required
                            style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius: var(--radius); background: #fff;">
                        <option value="">-- Seleccionar Rol --</option>
                        <?php foreach ($roles as $rol): ?>
                            <option value="<?php echo $rol['id_rol']; ?>">
                                <?php echo htmlspecialchars($rol['nombre']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px;">
                    <p>Nota: Asegúrate de asignar el rol correcto para limitar el acceso.</p>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalUsuario()">Cancelar</button>
                <button type="submit" name="crear" class="btn-primary" style="width: auto;">Crear Usuario</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalUsuario');

    function abrirModalUsuario() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function cerrarModalUsuario() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Cerrar si clic fuera
    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModalUsuario();
        }
    }
</script>

</body>
</html>