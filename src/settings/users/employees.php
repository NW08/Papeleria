<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Dependencias
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad
if (!isset($_SESSION['usuario'])) {
   header('Location: ../../auth/login.php');
   exit();
}

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

$mensaje = null;
$error = null;
$empleados = [];
$cargos = [];
$usuariosDisponibles = [];

try {
   $pdo = Database::getConnection();

   // ---------------------------------------------------------
   // A. LÓGICA: CREAR EMPLEADO
   // ---------------------------------------------------------
   if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['crear_empleado'])) {
      $nombre = trim($_POST['nombre']);
      $apellido = trim($_POST['apellido']);
      $email = trim($_POST['email']);
      $id_cargo = $_POST['id_cargo'];
      // Si viene vacío, lo convertimos a NULL para SQL
      $id_usuario = !empty($_POST['id_usuario']) ? $_POST['id_usuario'] : null;

      if ($nombre && $apellido && $email && $id_cargo) {
         try {
            $sqlInsert = '
                    INSERT INTO empleado (nombre, apellido, email, id_cargo, id_usuario)
                    VALUES (:nom, :ape, :email, :cargo, :user)
                ';
            $stmt = $pdo->prepare($sqlInsert);
            $stmt->execute([
               ':nom' => $nombre,
               ':ape' => $apellido,
               ':email' => $email,
               ':cargo' => $id_cargo,
               ':user' => $id_usuario
            ]);
            $mensaje = 'Empleado registrado con éxito.';
         } catch (PDOException $e) {
            // Código 23000 suele ser violación de restricción (ej. email duplicado)
            if ($e->getCode() == '23000') {
               $error = 'Error: El email o el usuario ya están registrados en otro empleado.';
            } else {
               $error = 'Error al guardar: ' . $e->getMessage();
            }
         }
      } else {
         $error = 'Por favor complete los campos obligatorios (Nombre, Apellido, Email, Cargo).';
      }
   }

   // ---------------------------------------------------------
   // B. LÓGICA: CARGAR DATOS
   // ---------------------------------------------------------

   // 1. Listar Empleados (JOIN con Cargo y Usuario)
   $sqlEmpleados = '
        SELECT 
            e.id_empleado,
            e.nombre,
            e.apellido,
            e.email,
            c.nombre AS cargo,
            u.username AS usuario_sistema
        FROM empleado e
        INNER JOIN cargo c ON e.id_cargo = c.id_cargo
        LEFT JOIN usuario u ON e.id_usuario = u.id_usuario
        ORDER BY e.apellido
    ';
   $empleados = $pdo->query($sqlEmpleados)->fetchAll();

   // 2. Listar Cargos (Para el select)
   $cargos = $pdo->query('SELECT id_cargo, nombre FROM cargo ORDER BY nombre ')->fetchAll();

   // 3. Listar Usuarios DISPONIBLES (Para vincular cuenta)
   $sqlUsers = '
        SELECT id_usuario, username 
        FROM usuario 
        WHERE id_usuario NOT IN (SELECT id_usuario FROM empleado WHERE id_usuario IS NOT NULL)
    ';
   $usuariosDisponibles = $pdo->query($sqlUsers)->fetchAll();

} catch (Exception $e) {
   $error = 'Error de conexión: ' . $e->getMessage();
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Empleados</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../style.css">
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
                <li><a href="usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="employees.php" class="active"><span class="icon">👔</span> Empleados</a></li>
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
                <h2>Directorio de Empleados</h2>
                <p class="date-display">Gestión de personal y accesos</p>
            </div>
            <div>
                <button onclick="abrirModalEmpleado()" class="btn-primary">
                    + Nuevo Empleado
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
                    <th>Nombre Completo</th>
                    <th>Email Corporativo</th>
                    <th>Cargo</th>
                    <th>Acceso al Sistema</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($empleados as $emp): ?>
                    <tr>
                        <td style="font-weight: 600; color: var(--primary);">
                           <?php echo htmlspecialchars($emp['nombre'] . ' ' . $emp['apellido']); ?>
                        </td>

                        <td style="color: var(--text-main);">
                           <?php echo htmlspecialchars($emp['email']); ?>
                        </td>

                        <td>
                            <span style="font-weight: 500;"><?php echo htmlspecialchars($emp['cargo']); ?></span>
                        </td>

                        <td>
                           <?php if ($emp['usuario_sistema']): ?>
                               <div class="user-status-badge status-linked">
                                   <span class="status-dot dot-green"></span>
                                  <?php echo htmlspecialchars($emp['usuario_sistema']); ?>
                               </div>
                           <?php else: ?>
                               <div class="user-status-badge status-unlinked">
                                   <span class="status-dot dot-gray"></span>
                                   Sin acceso
                               </div>
                           <?php endif; ?>
                        </td>

                        <td>
                            <button class="btn-table-action" onclick="alert('Editar pendiente de lógica')">
                                Editar
                            </button>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalEmpleado" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Registrar Empleado</h3>
            <span class="close-btn" onclick="cerrarModalEmpleado()">&times;</span>
        </div>

        <form method="POST">
            <div class="modal-body">

                <div class="form-grid">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" name="nombre" id="nombre" required placeholder="Ej. Ana">
                    </div>
                    <div class="form-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" name="apellido" id="apellido" required placeholder="Ej. López">
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Email Corporativo</label>
                    <input type="email" name="email" id="email" required placeholder="empleado@papeleria.com">
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="id_cargo">Cargo</label>
                        <select name="id_cargo" id="id_cargo" required
                                style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius: var(--radius); background: #fff;">
                            <option value="">-- Seleccionar --</option>
                           <?php foreach ($cargos as $c): ?>
                               <option value="<?php echo $c['id_cargo']; ?>"><?php echo htmlspecialchars($c['nombre']); ?></option>
                           <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="id_usuario">Vincular Usuario</label>
                        <select name="id_usuario" id="id_usuario"
                                style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius: var(--radius); background: #fff;">
                            <option value="">-- Sin Acceso --</option>
                           <?php foreach ($usuariosDisponibles as $u): ?>
                               <option value="<?php echo $u['id_usuario']; ?>"><?php echo htmlspecialchars($u['username']); ?></option>
                           <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                     <span class="form-help-text">
                         Nota: Solo aparecen usuarios disponibles que no tienen un empleado ya asignado.
                     </span>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalEmpleado()">Cancelar</button>
                <button type="submit" name="crear_empleado" class="btn-primary" style="width: auto;">Guardar Empleado</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalEmpleado');

    function abrirModalEmpleado() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function cerrarModalEmpleado() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Cerrar al dar clic fuera
    window.onclick = function (event) {
        if (event.target === modal) {
            cerrarModalEmpleado();
        }
    }
</script>

</body>
</html>