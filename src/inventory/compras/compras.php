<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

if (!isset($_SESSION['usuario'])) {
    header('Location: ../auth/login.php');
    exit();
}

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

$compras = [];
$proveedores = [];
$productos = [];
$error = null;

try {
    $pdo = Database::getConnection();

    // 1. CARGAR COMPRAS (Con cálculo de total automático)
    $sql = '
        SELECT 
            c.id_compra,
            c.numero_orden,
            c.fecha,
            p.nombre_empresa AS proveedor,
            e.nombre AS empleado,
            -- Subconsulta para sumar el costo total
            ISNULL((SELECT SUM(d.cantidad * d.costo_unitario) 
                    FROM detalle_compra d 
                    WHERE d.id_compra = c.id_compra), 0) as total_compra
        FROM compra c
        INNER JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        INNER JOIN empleado e ON c.id_empleado = e.id_empleado
        ORDER BY c.fecha DESC
    ';
    $compras = $pdo->query($sql)->fetchAll();

    // 2. CARGAR DATOS PARA EL FORMULARIO (Proveedores y Productos)
    $proveedores = $pdo->query('SELECT id_proveedor, nombre_empresa FROM proveedor ORDER BY nombre_empresa ASC')->fetchAll();
    $productos = $pdo->query('SELECT id_producto, nombre FROM producto ORDER BY nombre ASC')->fetchAll();

} catch (Exception $e) {
    $error = 'Error al cargar datos: ' . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Compras</title>
    <link rel="stylesheet" href="../../../style.css">
    <style>
        /* Estilos funcionales para los modales */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 800px;
            max-width: 95%;
            max-height: 90vh;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>

<header>
    <h1>Registro de Compras (Entradas)</h1>
    <nav>
        <a href="../../../index.php">Inicio</a>
        <a href="../proveedores.php">Proveedores</a>
        <a href="../../auth/logout.php">Cerrar sesión</a>
    </nav>
</header>

<main>
    <div style="margin-bottom: 20px;">
        <button onclick="abrirModalNuevaCompra()"
                style="background: #28a745; color: white; padding: 10px 20px; border: none; cursor: pointer;">
            + Registrar Nueva Compra
        </button>
    </div>

    <?php if ($error): ?>
        <p style="color: red;"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>

    <table>
        <thead>
        <tr>
            <th>ID</th>
            <th>Orden #</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Registrado por</th>
            <th>Total Costo</th>
            <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <?php foreach ($compras as $c): ?>
            <tr>
                <td><?php echo $c['id_compra']; ?></td>
                <td><?php echo htmlspecialchars($c['numero_orden'] ?? '-'); ?></td>
                <td><?php echo date('d/m/Y H:i', strtotime($c['fecha'])); ?></td>
                <td><?php echo htmlspecialchars($c['proveedor']); ?></td>
                <td><?php echo htmlspecialchars($c['empleado']); ?></td>
                <td>$<?php echo number_format((float)$c['total_compra'], 2); ?></td>
                <td>
                    <button onclick="verDetalle(<?php echo $c['id_compra']; ?>)">Ver Productos</button>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</main>

<div id="modalNuevaCompra" class="modal-overlay">
    <div class="modal-content">
        <h3>Nueva Entrada de Mercancía</h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
                <label>Proveedor:</label>
                <select id="selectProveedor" style="width: 100%; padding: 5px;">
                    <option value="">-- Seleccionar --</option>
                    <?php foreach ($proveedores as $p): ?>
                        <option value="<?= $p['id_proveedor'] ?>"><?= htmlspecialchars($p['nombre_empresa']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div>
                <label>N° Orden (Opcional):</label>
                <input type="text" id="txtOrden" placeholder="Ej: OC-2026-001" style="width: 100%; padding: 5px;">
            </div>
        </div>

        <h4>Productos</h4>
        <table id="tablaItems">
            <thead>
            <tr>
                <th>Producto</th>
                <th width="80">Cant.</th>
                <th width="100">Costo Unit.</th>
                <th width="50"></th>
            </tr>
            </thead>
            <tbody id="listaItems"></tbody>
        </table>

        <button onclick="agregarFila()" style="margin-top: 10px; cursor: pointer;">+ Agregar Item</button>

        <div style="text-align: right; margin-top: 20px;">
            <button onclick="cerrarModalNuevaCompra()">Cancelar</button>
            <button onclick="guardarCompra()" style="background: green; color: white; padding: 10px;">Finalizar Compra</button>
        </div>
    </div>
</div>

<div id="modalDetalle" class="modal-overlay">
    <div class="modal-content" style="width: 500px;">
        <h3>Detalle de Compra</h3>
        <table id="tablaDetalle">
            <thead>
            <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Costo</th>
                <th>Subtotal</th>
            </tr>
            </thead>
            <tbody id="bodyDetalle"></tbody>
        </table>
        <div style="text-align: right; margin-top: 15px;">
            <button onclick="document.getElementById('modalDetalle').style.display='none'">Cerrar</button>
        </div>
    </div>
</div>

<select id="templateProductos" style="display:none">
    <option value="">-- Producto --</option>
    <?php foreach ($productos as $prod): ?>
        <option value="<?= $prod['id_producto'] ?>"><?= htmlspecialchars($prod['nombre']) ?></option>
    <?php endforeach; ?>
</select>

<script>
    // --- LÓGICA MODAL NUEVA COMPRA ---
    function abrirModalNuevaCompra() {
        document.getElementById('modalNuevaCompra').style.display = 'flex';
        document.getElementById('listaItems').innerHTML = '';
        agregarFila(); // Agregar una fila vacía al iniciar
    }

    function cerrarModalNuevaCompra() {
        document.getElementById('modalNuevaCompra').style.display = 'none';
    }

    function agregarFila() {
        const tbody = document.getElementById('listaItems');
        const tr = document.createElement('tr');
        const options = document.getElementById('templateProductos').innerHTML;

        tr.innerHTML = `
            <td><select class="item-id" style="width:100%">${options}</select></td>
            <td><input type="number" class="item-cant" min="1" value="1" style="width:100%"></td>
            <td><input type="number" class="item-costo" min="0.01" step="0.01" placeholder="0.00" style="width:100%"></td>
            <td><button onclick="this.closest('tr').remove()" style="color:red;">X</button></td>
        `;
        tbody.appendChild(tr);
    }

    async function guardarCompra() {
        const idProv = document.getElementById('selectProveedor').value;
        const orden = document.getElementById('txtOrden').value;

        if (!idProv) return alert("Seleccione un proveedor");

        const items = [];
        document.querySelectorAll('#listaItems tr').forEach(row => {
            const id = row.querySelector('.item-id').value;
            const cant = row.querySelector('.item-cant').value;
            const costo = row.querySelector('.item-costo').value;

            if (id && cant > 0 && costo > 0) {
                items.push({id_producto: id, cantidad: cant, costo_unitario: costo});
            }
        });

        if (items.length === 0) return alert("Agregue al menos un producto válido");

        try {
            const res = await fetch('../api/crear_compra.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id_proveedor: idProv, numero_orden: orden, items: items})
            });
            const data = await res.json();

            if (data.success) {
                alert("Compra registrada. Inventario actualizado.");
                location.reload();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        }
    }

    // --- LÓGICA VER DETALLE ---
    async function verDetalle(id) {
        document.getElementById('modalDetalle').style.display = 'flex';
        const tbody = document.getElementById('bodyDetalle');
        tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

        try {
            const res = await fetch(`../api/obtener_detalle_compra.php?id=${id}`);
            const data = await res.json();

            tbody.innerHTML = '';
            data.forEach(d => {
                tbody.innerHTML += `
                    <tr>
                        <td>${d.producto}</td>
                        <td>${d.cantidad}</td>
                        <td>$${parseFloat(d.costo_unitario).toFixed(2)}</td>
                        <td>$${(d.cantidad * d.costo_unitario).toFixed(2)}</td>
                    </tr>`;
            });
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="4">Error al cargar</td></tr>';
        }
    }
</script>

</body>
</html>