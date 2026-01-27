<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Dependencias
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad
if (!isset($_SESSION['usuario'])) {
    header('Location: auth/login.php');
    exit();
}

// 3. Cargar entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

$mensaje = null;
$error = null;
$proveedores = [];

try {
    $pdo = Database::getConnection();

    // ---------------------------------------------------------
    // A. LÓGICA: CREAR PROVEEDOR
    // ---------------------------------------------------------
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crear'])) {
        // Sanitizamos entradas básicas
        $empresa = trim($_POST['nombre_empresa']);
        $contacto = trim($_POST['nombre_contacto']);
        $telefono = trim($_POST['telefono']);
        $email = trim($_POST['email_contacto']);

        if (!empty($empresa)) {
            try {
                $sqlInsert = '
                    INSERT INTO proveedor (nombre_empresa, nombre_contacto, telefono, email_contacto) 
                    VALUES (:empresa, :contacto, :tel, :email)
                ';
                $stmt = $pdo->prepare($sqlInsert);
                $stmt->execute([
                        ':empresa' => $empresa,
                        ':contacto' => $contacto, // Puede ser vacío/null según tu tabla
                        ':tel' => $telefono,
                        ':email' => $email
                ]);
                $mensaje = "Proveedor '$empresa' registrado correctamente.";
            } catch (PDOException $e) {
                $error = 'Error al guardar: ' . $e->getMessage();
            }
        } else {
            $error = 'El nombre de la empresa es obligatorio.';
        }
    }

    // ---------------------------------------------------------
    // B. LÓGICA: ELIMINAR PROVEEDOR (Con protección FK)
    // ---------------------------------------------------------
    if (isset($_GET['eliminar'])) {
        $idEliminar = $_GET['eliminar'];
        try {
            $stmt = $pdo->prepare('DELETE FROM proveedor WHERE id_proveedor = :id');
            $stmt->execute([':id' => $idEliminar]);
            $mensaje = 'Proveedor eliminado correctamente.';
        } catch (PDOException $e) {
            // Código 23000 o mensaje 'REFERENCE' indica que hay productos o compras ligadas
            if ($e->getCode() == '23000' || str_contains($e->getMessage(), 'REFERENCE')) {
                $error = 'BLOQUEADO: No puedes eliminar este proveedor porque tiene productos o compras asociadas.';
            } else {
                $error = 'Error al eliminar: ' . $e->getMessage();
            }
        }
    }

    // ---------------------------------------------------------
    // C. LÓGICA: LISTAR
    // ---------------------------------------------------------
    $sql = 'SELECT id_proveedor, nombre_empresa, nombre_contacto, telefono, email_contacto 
            FROM proveedor 
            ORDER BY nombre_empresa ';
    $proveedores = $pdo->query($sql)->fetchAll();

} catch (Exception $e) {
    $error = 'Error de conexión: ' . $e->getMessage();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Proveedores</title>
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
                <li><a href="proveedores.php" class="active"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="compras/compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="../settings/users/usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="../settings/users/employees.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="../settings/forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
                <li><a href="../settings/estado_venta.php"><span class="icon">📊</span> Estado Venta</a></li>
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
                <h2>Directorio de Proveedores</h2>
                <p class="date-display">Gestión de la cadena de suministro</p>
            </div>
            <div>
                <button onclick="abrirModalProveedor()" class="btn-primary">
                    + Nuevo Proveedor
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
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($proveedores as $prov): ?>
                    <tr>
                        <td style="font-weight: 600; color: var(--primary); font-size: 1rem;">
                            <?php echo htmlspecialchars($prov['nombre_empresa']); ?>
                        </td>

                        <td style="color: var(--text-main);">
                            <?php echo htmlspecialchars($prov['nombre_contacto'] ?? '---'); ?>
                        </td>

                        <td class="text-mono" style="font-size: 0.9em;">
                            <?php echo htmlspecialchars($prov['telefono'] ?? '---'); ?>
                        </td>

                        <td>
                            <?php if (!empty($prov['email_contacto'])): ?>
                                <a href="mailto:<?php echo htmlspecialchars($prov['email_contacto']); ?>"
                                   style="color: var(--accent); text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                    <?php echo htmlspecialchars($prov['email_contacto']); ?>
                                </a>
                            <?php else: ?>
                                <span style="color: var(--text-muted);">-</span>
                            <?php endif; ?>
                        </td>

                        <td>
                            <a href="proveedores.php?eliminar=<?php echo $prov['id_proveedor']; ?>"
                               class="btn-danger-ghost"
                               onclick="return confirm('¿Seguro que deseas eliminar al proveedor <?php echo $prov['nombre_empresa']; ?>?');">
                                Eliminar
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>

                <?php if (empty($proveedores)): ?>
                    <tr>
                        <td colspan="5" style="text-align:center; padding:30px;">No hay proveedores registrados.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalProveedor" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Registrar Nuevo Proveedor</h3>
            <span class="close-btn" onclick="cerrarModalProveedor()">&times;</span>
        </div>

        <form method="POST">
            <div class="modal-body">

                <div class="form-group">
                    <label for="nombre_empresa">Nombre de la Empresa <span style="color:red">*</span></label>
                    <input type="text" name="nombre_empresa" id="nombre_empresa" required
                           placeholder="Ej. Bic Stationery, Distribuidora Central..." autocomplete="off">
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="nombre_contacto">Nombre de Contacto</label>
                        <input type="text" name="nombre_contacto" id="nombre_contacto" placeholder="Ej. Juan Pérez">
                    </div>

                    <div class="form-group">
                        <label for="telefono">Teléfono</label>
                        <input type="text" name="telefono" id="telefono" placeholder="Ej. 55 1234 5678">
                    </div>
                </div>

                <div class="form-group">
                    <label for="email_contacto">Correo Electrónico</label>
                    <input type="email" name="email_contacto" id="email_contacto" placeholder="contacto@proveedor.com">
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalProveedor()">Cancelar</button>
                <button type="submit" name="crear" class="btn-primary" style="width: auto;">Guardar Proveedor</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalProveedor');

    function abrirModalProveedor() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function cerrarModalProveedor() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModalProveedor();
        }
    }
</script>

</body>
</html>