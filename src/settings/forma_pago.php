<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Dependencias
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad de Sesión
if (!isset($_SESSION['usuario'])) {
    header('Location: ../auth/login.php');
    exit();
}

// 3. Cargar entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

$mensaje = null;
$error = null;
$formas_pago = [];

try {
    $pdo = Database::getConnection();

    // ---------------------------------------------------------
    // A. LÓGICA: CREAR MÉTODO DE PAGO
    // ---------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crear'])) {
        $nombre = trim($_POST['nombre']);

        if (!empty($nombre)) {
            try {
                // Verificamos duplicados con una restricción UNIQUE en BDD,
                // pero capturamos el error aquí.
                $stmt = $pdo->prepare('INSERT INTO forma_pago (nombre) VALUES (:nom)');
                $stmt->execute([':nom' => $nombre]);
                $mensaje = 'Método de pago agregado exitosamente.';
            } catch (PDOException $e) {
                // Código SQLSTATE 23000 suele ser violación de restricción (Duplicado)
                if ($e->getCode() == '23000') {
                    $error = "Error: El método de pago '$nombre' ya existe.";
                } else {
                    $error = 'Error al guardar: ' . $e->getMessage();
                }
            }
        } else {
            $error = 'El nombre no puede estar vacío.';
        }
    }

    // ---------------------------------------------------------
    // B. LÓGICA: ELIMINAR (Con protección de FK)
    // ---------------------------------------------------------
    if (isset($_GET['eliminar'])) {
        $idEliminar = $_GET['eliminar'];
        try {
            $stmt = $pdo->prepare('DELETE FROM forma_pago WHERE id_forma_pago = :id');
            $stmt->execute([':id' => $idEliminar]);
            $mensaje = 'Método de pago eliminado correctamente.';
        } catch (PDOException $e) {
            // Si el error contiene "REFERENCE constraint", es porque está en uso en Ventas
            if (str_contains($e->getMessage(), 'REFERENCE') || $e->getCode() == '23000') {
                $error = 'No se puede eliminar: Este método de pago ya ha sido usado en ventas registradas.';
            } else {
                $error = 'Error al eliminar: ' . $e->getMessage();
            }
        }
    }

    // ---------------------------------------------------------
    // C. LÓGICA: LISTAR
    // ---------------------------------------------------------
    $stmt = $pdo->query('SELECT id_forma_pago, nombre FROM forma_pago ORDER BY nombre ');
    $formas_pago = $stmt->fetchAll();

} catch (Exception $e) {
    $error = 'Error de conexión: ' . $e->getMessage();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formas de Pago</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../style.css">
</head>
<body class="dashboard-body">

<div class="dashboard-container">

    <aside class="sidebar">
        <div class="sidebar-header">
            <a href="../../index.php" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:10px;">
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
                <li><a href="../management/ventas/ventas.php"><span class="icon">🛒</span> Ventas</a></li>
                <li><a href="../management/productos.php"><span class="icon">📦</span> Productos</a></li>
                <li><a href="../management/clientes.php"><span class="icon">👥</span> Clientes</a></li>

                <li class="nav-label">Inventario y Compras</li>
                <li><a href="proveedores.php"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="users/usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="users/employees.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="forma_pago.php" class="active"><span class="icon">💳</span> Forma de Pago</a></li>
                <li><a href="estado_venta.php"><span class="icon">📊</span> Estado Venta</a></li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <a href="../auth/logout.php" class="logout-btn">
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
                <h2>Métodos de Pago</h2>
                <p class="date-display">Configuración de opciones de cobro</p>
            </div>
            <div>
                <button onclick="abrirModalPago()" class="btn-primary">
                    + Nueva Forma de Pago
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
                    <th style="width: 80px;">ID</th>
                    <th>Nombre del Método</th>
                    <th style="width: 150px;">Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($formas_pago as $fp): ?>
                    <tr>
                        <td class="text-mono"><?php echo htmlspecialchars((string)$fp['id_forma_pago']); ?></td>

                        <td style="font-weight: 600; color: var(--text-main);">
                            <?php if (stripos($fp['nombre'], 'Efectivo') !== false): ?> 💵 <?php endif; ?>
                            <?php if (stripos($fp['nombre'], 'Tarjeta') !== false): ?> 💳 <?php endif; ?>
                            <?php echo htmlspecialchars($fp['nombre']); ?>
                        </td>

                        <td>
                            <a href="forma_pago.php?eliminar=<?php echo $fp['id_forma_pago']; ?>"
                               class="btn-danger-ghost"
                               onclick="return confirm('¿Seguro que deseas eliminar \'<?php echo $fp['nombre']; ?>\'?');">
                                Eliminar
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>

                <?php if (empty($formas_pago)): ?>
                    <tr>
                        <td colspan="3" style="text-align:center; padding:30px;">No hay formas de pago registradas.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalPago" class="modal-overlay">
    <div class="modal-content" style="width: 400px;">
        <div class="modal-header">
            <h3>Nueva Forma de Pago</h3>
            <span class="close-btn" onclick="cerrarModalPago()">&times;</span>
        </div>

        <form method="POST">
            <div class="modal-body">
                <div class="form-group">
                    <label for="nombre">Nombre del Método</label>
                    <input type="text" name="nombre" id="nombre" required placeholder="Ej. Yape, DeUna, Transferencia..."
                           autocomplete="off">
                </div>
                <p class="form-help-text">Este nombre aparecerá en el punto de venta.</p>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalPago()">Cancelar</button>
                <button type="submit" name="crear" class="btn-primary" style="width: auto;">Agregar</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalPago');
    const inputNombre = document.getElementById('nombre');

    function abrirModalPago() {
        modal.style.display = 'flex';
        // Pequeño timeout para la animación
        setTimeout(() => {
            modal.classList.add('active');
            inputNombre.focus(); // Enfocar el input automáticamente
        }, 10);
    }

    function cerrarModalPago() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Cerrar con clic fuera
    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModalPago();
        }
    }
</script>

</body>
</html>