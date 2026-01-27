<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Dependencias
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad
if (!isset($_SESSION['usuario'])) {
   header('Location: ../auth/login.php');
   exit();
}

// 3. Cargar entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

$mensaje = null;
$error = null;
$estados = [];

try {
   $pdo = Database::getConnection();

   // ---------------------------------------------------------
   // A. LÓGICA: CREAR ESTADO
   // ---------------------------------------------------------
   if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crear'])) {
      $nombre = trim($_POST['nombre']);

      if (!empty($nombre)) {
         try {
            $stmt = $pdo->prepare('INSERT INTO estado_venta (nombre) VALUES (:nom)');
            $stmt->execute([':nom' => $nombre]);
            $mensaje = 'Nuevo estado registrado correctamente.';
         } catch (PDOException $e) {
            // Validación de duplicados (Unique Constraint)
            if ($e->getCode() == '23000') {
               $error = "Error: El estado '$nombre' ya existe en el sistema.";
            } else {
               $error = 'Error al guardar: ' . $e->getMessage();
            }
         }
      } else {
         $error = 'El nombre del estado no puede estar vacío.';
      }
   }

   // ---------------------------------------------------------
   // B. LÓGICA: ELIMINAR ESTADO (Protegido)
   // ---------------------------------------------------------
   if (isset($_GET['eliminar'])) {
      $idEliminar = $_GET['eliminar'];
      try {
         // Intentamos borrar. Si el estado se usa en alguna venta, SQL Server lanzará error.
         $stmt = $pdo->prepare('DELETE FROM estado_venta WHERE id_estado = :id');
         $stmt->execute([':id' => $idEliminar]);
         $mensaje = 'Estado eliminado correctamente.';
      } catch (PDOException $e) {
         // Captura de error de Integridad Referencial (FK)
         if (str_contains($e->getMessage(), 'REFERENCE') || $e->getCode() == '23000') {
            $error = 'BLOQUEADO: No puedes eliminar este estado porque hay Ventas registradas con él.';
         } else {
            $error = 'Error al eliminar: ' . $e->getMessage();
         }
      }
   }

   // ---------------------------------------------------------
   // C. LÓGICA: LISTAR
   // ---------------------------------------------------------
   $stmt = $pdo->query('SELECT id_estado, nombre FROM estado_venta ORDER BY id_estado ');
   $estados = $stmt->fetchAll();

} catch (Exception $e) {
   $error = 'Error de conexión: ' . $e->getMessage();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estados de Venta</title>
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
                <li><a href="forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
                <li><a href="estado_venta.php" class="active"><span class="icon">📊</span> Estado Venta</a></li>
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
                <h2>Estados de Venta</h2>
                <p class="date-display">Flujo de trabajo de transacciones</p>
            </div>
            <div>
                <button onclick="abrirModalEstado()" class="btn-primary">
                    + Nuevo Estado
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
                    <th>Nombre del Estado</th>
                    <th style="width: 150px;">Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($estados as $est): ?>
                    <tr>
                        <td class="text-mono"><?php echo htmlspecialchars((string)$est['id_estado']); ?></td>

                        <td style="font-weight: 500;">
                            <span style="display:inline-block; width:8px; height:8px; background-color:var(--primary); border-radius:50%; margin-right:8px; opacity:0.6;"></span>
                           <?php echo htmlspecialchars($est['nombre']); ?>
                        </td>

                        <td>
                            <a href="estado_venta.php?eliminar=<?php echo $est['id_estado']; ?>"
                               class="btn-danger-ghost"
                               onclick="return confirm('¿Seguro que deseas eliminar el estado \'<?php echo $est['nombre']; ?>\'?');">
                                Eliminar
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>

                <?php if (empty($estados)): ?>
                    <tr>
                        <td colspan="3" style="text-align:center; padding:30px;">No hay estados definidos.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalEstado" class="modal-overlay">
    <div class="modal-content" style="width: 400px;">
        <div class="modal-header">
            <h3>Registrar Nuevo Estado</h3>
            <span class="close-btn" onclick="cerrarModalEstado()">&times;</span>
        </div>

        <form method="POST">
            <div class="modal-body">
                <div class="form-group">
                    <label for="nombre">Nombre del Estado</label>
                    <input type="text" name="nombre" id="nombre" required placeholder="Ej. Cancelada, En Revisión..." autocomplete="off">
                </div>
                <p class="form-help-text">Define cómo se etiquetarán las ventas en el sistema.</p>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalEstado()">Cancelar</button>
                <button type="submit" name="crear" class="btn-primary" style="width: auto;">Agregar</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalEstado');
    const inputNombre = document.getElementById('nombre');

    function abrirModalEstado() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            inputNombre.focus();
        }, 10);
    }

    function cerrarModalEstado() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModalEstado();
        }
    }
</script>

</body>
</html>