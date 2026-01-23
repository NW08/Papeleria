<?php
declare(strict_types=1);

session_start();

// 1. Configuración y Dependencias
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// Verificación de sesión
if (!isset($_SESSION['usuario'])) {
    header('Location: login.php');
    exit();
}

// Carga de variables de entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

// Inicialización de variables para la vista
$ventas = [];
$error = null;

// 2. Lógica de Datos
try {
    $pdo = Database::getConnection();

    // Consulta optimizada para SQL Server
    $sql = '
        SELECT 
            v.id_venta, 
            v.codigo_factura,
            v.fecha,
            c.nombre AS cliente_nombre,
            c.apellido AS cliente_apellido,
            e.nombre AS empleado_nombre,
            e.apellido AS empleado_apellido,
            fp.nombre AS forma_pago,
            ev.nombre AS estado,
            ISNULL((SELECT SUM(d.cantidad * d.precio_historico) 
                    FROM detalle_venta d 
                    WHERE d.id_venta = v.id_venta), 0) as total_calculado
        FROM venta v
        INNER JOIN cliente c ON v.id_cliente = c.id_cliente
        INNER JOIN empleado e ON v.id_empleado = e.id_empleado
        INNER JOIN forma_pago fp ON v.id_forma_pago = fp.id_forma_pago
        INNER JOIN estado_venta ev ON v.id_estado = ev.id_estado
        ORDER BY v.fecha DESC
    ';

    $stmt = $pdo->query($sql);
    $ventas = $stmt->fetchAll();

} catch (Exception $e) {
    // En producción, usa error_log($e->getMessage());
    $error = 'Error al obtener el historial de ventas: ' . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Listado de Ventas</title>
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
                <h3>PANEL</h3>
            </a>
        </div>

        <nav class="sidebar-nav">
            <ul>
                <li class="nav-label">Gestión Principal</li>
                <li><a href="ventas.php" class="active"><span class="icon">🛒</span> Ventas</a></li>
                <li><a href="../productos.php"><span class="icon">📦</span> Productos</a></li>
                <li><a href="../clientes.php"><span class="icon">👥</span> Clientes</a></li>

                <li class="nav-label">Inventario y Compras</li>
                <li><a href="proveedores.php"><span class="icon">🚚</span> Proveedores</a></li>
                <li><a href="compras.php"><span class="icon">📄</span> Compras</a></li>
                <li><a href="categorias.php"><span class="icon">🏷️</span> Categorías</a></li>

                <li class="nav-label">Configuración</li>
                <li><a href="../../usuarios.php"><span class="icon">🔐</span> Usuarios</a></li>
                <li><a href="empleados.php"><span class="icon">👔</span> Empleados</a></li>
                <li><a href="../../forma_pago.php"><span class="icon">💳</span> Forma de Pago</a></li>
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
                <h2>Ventas Realizadas</h2>
                <p class="date-display">Historial completo de transacciones</p>
            </div>
            <div>
                <a href="crear_venta.php" class="btn-primary" style="text-decoration:none; display:inline-block;">+ Nueva Venta</a>
            </div>
        </header>

        <?php if (isset($error) && $error): ?>
            <div class="alert alert-error" style="margin-bottom: 20px;">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <div class="table-container">
            <table class="styled-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Empleado</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php if (!empty($ventas)): ?>
                    <?php foreach ($ventas as $venta): ?>
                        <tr>
                            <td><?php echo htmlspecialchars((string)$venta['id_venta']); ?></td>
                            <td style="font-family: monospace; font-weight: 600; color: var(--primary);">
                                <?php echo htmlspecialchars($venta['codigo_factura'] ?? 'N/A'); ?>
                            </td>
                            <td><?php echo htmlspecialchars($venta['fecha']); ?></td>
                            <td><?php echo htmlspecialchars($venta['cliente_nombre'] . ' ' . $venta['cliente_apellido']); ?></td>
                            <td><?php echo htmlspecialchars($venta['empleado_nombre'] . ' ' . $venta['empleado_apellido']); ?></td>
                            <td><?php echo htmlspecialchars($venta['forma_pago']); ?></td>
                            <td>
                                    <span class="status-badge-text">
                                        <?php echo htmlspecialchars($venta['estado']); ?>
                                    </span>
                            </td>
                            <td style="font-weight:bold;">$<?php echo number_format((float)$venta['total_calculado'], 2); ?></td>
                            <td>
                                <button type="button" class="btn-table-action" onclick="abrirModal(<?php echo $venta['id_venta']; ?>)">
                                    Ver Detalle
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">
                            No hay ventas registradas todavía.
                        </td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>

    </main>
</div>

<div id="modalDetalle" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Detalle de la Venta</h3>
            <span class="close-btn" onclick="cerrarModal()">&times;</span>
        </div>

        <div class="modal-body">
            <p id="loadingMessage" style="color: var(--text-muted); text-align: center;">Cargando productos...</p>

            <table id="tablaDetalle" class="styled-table" style="display:none;">
                <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
                </thead>
                <tbody id="cuerpoDetalle">
                </tbody>
            </table>
        </div>

        <div class="modal-footer">
            <button class="btn-secondary" onclick="cerrarModal()">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function abrirModal(idVenta) {
        const modal = document.getElementById('modalDetalle');
        const loading = document.getElementById('loadingMessage');
        const tabla = document.getElementById('tablaDetalle');
        const tbody = document.getElementById('cuerpoDetalle');

        // 1. Mostrar el contenedor (display flex)
        modal.style.display = 'flex';

        // 2. Pequeño timeout para permitir que el navegador procese el display antes de añadir la opacidad
        // Esto activa la transición CSS
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        loading.style.display = 'block';
        tabla.style.display = 'none';
        tbody.innerHTML = '';

        fetch(`detalle_venta.php?id=${idVenta}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }

                let html = '';
                data.forEach(item => {
                    html += `
                    <tr>
                        <td style="font-weight:500">${item.producto}</td>
                        <td style="color: var(--text-main)">${item.cantidad}</td>
                        <td>$${parseFloat(item.precio_historico).toFixed(2)}</td>
                        <td style="text-align: right; font-weight:bold">$${parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                `;
                });

                tbody.innerHTML = html;
                loading.style.display = 'none';
                tabla.style.display = 'table';
            })
            .catch(error => {
                console.error('Error:', error);
                loading.innerText = 'Error al cargar los datos.';
            });
    }

    function cerrarModal() {
        const modal = document.getElementById('modalDetalle');
        // 1. Quitar opacidad
        modal.classList.remove('active');


        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    window.onclick = function (event) {
        const modal = document.getElementById('modalDetalle');
        if (event.target === modal) {
            cerrarModal();
        }
    }
</script>

<div id="modalNuevaVenta" class="modal-overlay" style="display: none;">
    <div class="modal-content" style="width: 700px;">
        <div class="modal-header">
            <h3>Registrar Nueva Venta</h3>
            <span class="close-btn" onclick="cerrarModalVenta()">&times;</span>
        </div>

        <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                <label for="selectCliente"></label><select id="selectCliente" required style="padding: 8px;">
                    <option value="">-- Seleccionar Cliente --</option>
                    <?php foreach ($clientes as $c): ?>
                        <option value="<?= $c['id_cliente'] ?>"><?= $c['nombre'] . ' ' . $c['apellido'] ?></option>
                    <?php endforeach; ?>
                </select>

                <label for="selectFormaPago"></label><select id="selectFormaPago" required style="padding: 8px;">
                    <?php foreach ($formasPago as $fp): ?>
                        <option value="<?= $fp['id_forma_pago'] ?>"><?= $fp['nombre'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <table style="width:100%; margin-bottom: 10px;">
                <thead>
                <tr>
                    <th>Producto</th>
                    <th style="width: 80px;">Cant.</th>
                    <th style="width: 50px;"></th>
                </tr>
                </thead>
                <tbody id="listaProductosVenta">
                </tbody>
            </table>

            <button type="button" onclick="agregarFilaProducto()" style="background:#eee; border:1px solid #ccc; width:100%;">+ Agregar
                Producto
            </button>
        </div>

        <div class="modal-footer">
            <button onclick="guardarVenta()" style="background: green; color: white;">Finalizar Venta</button>
            <button onclick="cerrarModalVenta()">Cancelar</button>
        </div>
    </div>
</div>

<label for="templateProductos"></label><select id="templateProductos" style="display:none;">
    <option value="">Producto...</option>
    <?php foreach ($productos as $p): ?>
        <option value="<?= $p['id_producto'] ?>"><?= $p['nombre'] ?> (Stock: <?= $p['stock_actual'] ?>)</option>
    <?php endforeach; ?>
</select>

<script>
    // Abrir/Cerrar
    function abrirModalVenta() {
        document.getElementById('modalNuevaVenta').style.display = 'flex';
        // Agregar una fila inicial si está vacío
        if (document.getElementById('listaProductosVenta').children.length === 0) {
            agregarFilaProducto();
        }
    }

    function cerrarModalVenta() {
        document.getElementById('modalNuevaVenta').style.display = 'none';
        // Opcional: Limpiar formulario
    }

    // Agregar fila dinámica
    function agregarFilaProducto() {
        const tbody = document.getElementById('listaProductosVenta');
        const templateSelect = document.getElementById('templateProductos').innerHTML;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <select class="prod-select" style="width:100%">${templateSelect}</select>
            </td>
            <td>
                <input type="number" class="prod-cant" value="1" min="1" style="width:100%">
            </td>
            <td>
                <button onclick="this.closest('tr').remove()" style="color:red;">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    // ENVIAR VENTA AL BACKEND
    async function guardarVenta() {
        const idCliente = document.getElementById('selectCliente').value;
        const idPago = document.getElementById('selectFormaPago').value;

        if (!idCliente) return alert("Seleccione un cliente");

        // Recolectar productos de la tabla
        const filas = document.querySelectorAll('#listaProductosVenta tr');
        const productos = [];

        filas.forEach(tr => {
            const idProd = tr.querySelector('.prod-select').value;
            const cant = tr.querySelector('.prod-cant').value;

            if (idProd && cant > 0) {
                productos.push({id: idProd, cantidad: cant});
            }
        });

        if (productos.length === 0) return alert("Agregue al menos un producto");

        // Preparar JSON
        const datos = {
            id_cliente: idCliente,
            id_forma_pago: idPago,
            productos: productos
        };

        try {
            const respuesta = await fetch('crear_venta.php', { // Ajusta la ruta a tu API
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (resultado.success) {
                alert('Venta Creada! ID: ' + resultado.id_venta);
                location.reload(); // Recargar para ver la nueva venta en la tabla
            } else {
                alert('Error: ' + resultado.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    }
</script>
</body>
</html>