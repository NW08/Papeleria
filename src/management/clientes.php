<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Autoload
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad
if (!isset($_SESSION['usuario'])) {
   header('Location: auth/login.php');
   exit();
}

// 3. Configuración
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

$clientes = [];
$error = null;

// 4. Lógica de Datos
try {
   $pdo = Database::getConnection();

   $sql = '
        SELECT 
            id_cliente, 
            nombre, 
            apellido, 
            email, 
            telefono
        FROM cliente
        ORDER BY apellido, nombre
    ';

   $stmt = $pdo->query($sql);
   $clientes = $stmt->fetchAll();

} catch (Exception $e) {
   error_log('Error Clientes: ' . $e->getMessage());
   $error = 'Error al cargar la lista de clientes.';
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Clientes</title>
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
                <li><a href="ventas/ventas.php"><span class="icon">🛒</span> Ventas</a></li>
                <li><a href="productos.php"><span class="icon">📦</span> Productos</a></li>
                <li><a href="clientes.php" class="active"><span class="icon">👥</span> Clientes</a></li>

                <li class="nav-label">Inventario y Compras</li>
                <li><a href="proveedores.php"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="empleados.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
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
                <h2>Directorio de Clientes</h2>
                <p class="date-display">Gestión de cartera y contactos</p>
            </div>
            <div>
                <button onclick="abrirModalCliente()" class="btn-primary">
                    + Nuevo Cliente
                </button>
            </div>
        </header>

       <?php if (isset($error) && $error): ?>
           <div class="alert alert-error">
              <?php echo htmlspecialchars($error); ?>
           </div>
       <?php endif; ?>

        <div class="table-container">
            <table class="styled-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php if (!empty($clientes)): ?>
                   <?php foreach ($clientes as $c): ?>
                        <tr>
                            <td class="text-mono"><?php echo htmlspecialchars((string)$c['id_cliente']); ?></td>

                            <td style="font-weight: 500; color: var(--primary);">
                               <?php echo htmlspecialchars($c['nombre'] . ' ' . $c['apellido']); ?>
                            </td>

                            <td>
                               <?php if (!empty($c['email'])): ?>
                                   <span style="color: var(--text-main);"><?php echo htmlspecialchars($c['email']); ?></span>
                               <?php else: ?>
                                   <span style="background:#f0f2f5; color:#999; padding:2px 6px; border-radius:4px; font-size:0.8rem;">
                                        No disponible / Cifrado
                                    </span>
                               <?php endif; ?>
                            </td>

                            <td><?php echo htmlspecialchars($c['telefono'] ?? '---'); ?></td>

                            <td>
                                <button class="btn-table-action" onclick="editarCliente(<?php echo $c['id_cliente']; ?>)">
                                    Editar
                                </button>
                            </td>
                        </tr>
                   <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="5" style="text-align:center; padding:30px;">No hay clientes registrados.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </main>
</div>

<div id="modalCliente" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitulo">Nuevo Cliente</h3>
            <span class="close-btn" onclick="cerrarModalCliente()">&times;</span>
        </div>

        <form id="formCliente" onsubmit="guardarCliente(event)">
            <input type="hidden" id="idCliente" name="id_cliente">

            <div class="modal-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" required placeholder="Ej. Juan">
                    </div>
                    <div class="form-group">
                        <label for="apellido">Apellido</label>
                        <input type="text" id="apellido" name="apellido" required placeholder="Ej. Pérez">
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" required placeholder="cliente@email.com">
                </div>

                <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input type="text" id="telefono" name="telefono" placeholder="Ej. 55 1234 5678">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModalCliente()">Cancelar</button>
                <button type="submit" class="btn-primary" style="width: auto;">Guardar Cliente</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalCliente');

    function abrirModalCliente() {
        // Limpiar formulario
        document.getElementById('formCliente').reset();
        document.getElementById('idCliente').value = '';
        document.getElementById('modalTitulo').innerText = 'Nuevo Cliente';

        // Animación de entrada
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function cerrarModalCliente() {
        // Animación de salida
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    function editarCliente(id) {
        // Aquí mantendrías tu lógica de Fetch para obtener datos
        // Simulación visual:
        document.getElementById('modalTitulo').innerText = 'Editar Cliente';
        alert('Simulación: Cargando datos del cliente ID: ' + id);

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    // Tu lógica AJAX original (Intacta)
    async function guardarCliente(e) {
        e.preventDefault();

        // Pequeño feedback visual en el botón
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "Guardando...";
        btnSubmit.disabled = true;

        const formData = new FormData(document.getElementById('formCliente'));
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('../api/guardar_cliente.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            // Verificamos si la respuesta es JSON válido antes de parsear
            const text = await response.text();
            try {
                const result = JSON.parse(text);

                if (result.success) {
                    // Cerrar modal suavemente y recargar
                    cerrarModalCliente();
                    setTimeout(() => {
                        location.reload();
                    }, 300);
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (err) {
                console.error("Respuesta no JSON:", text);
                alert("Error del servidor (Ver consola)");
            }

        } catch (error) {
            console.error(error);
            alert('Error de conexión al procesar la solicitud');
        } finally {
            // Restaurar botón
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    }
</script>

</body>
</html>