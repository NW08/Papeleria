<?php
declare(strict_types=1);

session_start();

// 1. Rutas y Dependencias
// Asumimos que este archivo está en src/productos.php
require_once __DIR__ . '/../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Seguridad de Sesión
if (!isset($_SESSION['usuario'])) {
    header('Location: ../auth/login.php');
    exit();
}

// 3. Carga de entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

$productos = [];
$error = null;

// 4. Lógica de Negocio
try {
    $pdo = Database::getConnection();

    // Consulta ajustada a tu esquema REAL (precio_actual, nombre_empresa, etc.)
    $sql = '
        SELECT 
            p.id_producto,
            p.codigo_barras,
            p.nombre,
            p.descripcion,
            p.precio_actual,
            p.stock_actual,
            c.nombre AS categoria,
            pr.nombre_empresa AS proveedor
        FROM producto p
        INNER JOIN categoria c ON p.id_categoria = c.id_categoria
        INNER JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
        ORDER BY p.nombre
    ';

    $stmt = $pdo->query($sql);
    $productos = $stmt->fetchAll();

} catch (Exception $e) {
    // Loguear error real y mostrar mensaje amigable
    error_log('Error en Productos: ' . $e->getMessage());
    $error = 'No se pudo cargar el inventario.';
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventario de Productos</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../style.css">
    <link rel="icon" type="image/png" sizes="48x48" href="../media/icon.png">

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
                <li><a href="productos.php" class="active"><span class="icon">📦</span> Productos</a></li>
                <li><a href="clientes.php"><span class="icon">👥</span> Clientes</a></li>

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
                <h2>Inventario de Productos</h2>
                <p class="date-display">Gestión de stock y catálogo</p>
            </div>
            <div>
                <button onclick="abrirModalProducto()" class="btn-primary">
                    + Nuevo Producto
                </button>
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
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                <?php if (!empty($productos)): ?>
                    <?php foreach ($productos as $p): ?>
                        <tr>
                            <td class="text-mono"><?php echo htmlspecialchars($p['codigo_barras'] ?? '---'); ?></td>

                            <td>
                                <div style="font-weight: 500;"><?php echo htmlspecialchars($p['nombre']); ?></div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">
                                    <?php echo htmlspecialchars(substr($p['descripcion'] ?? '', 0, 30)) . '...'; ?>
                                </div>
                            </td>

                            <td><?php echo htmlspecialchars($p['categoria']); ?></td>
                            <td><?php echo htmlspecialchars($p['proveedor']); ?></td>
                            <td style="font-weight: bold;">$<?php echo number_format((float)$p['precio_actual'], 2); ?></td>

                            <td>
                                <?php if ($p['stock_actual'] < 5): ?>
                                    <span class="stock-badge stock-low">⚠ <?php echo $p['stock_actual']; ?> u.</span>
                                <?php else: ?>
                                    <span class="stock-badge stock-ok"><?php echo $p['stock_actual']; ?> u.</span>
                                <?php endif; ?>
                            </td>

                            <td>
                                <button class="btn-table-action" onclick="editarProducto(<?php echo $p['id_producto']; ?>)">
                                    Editar
                                </button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="7" style="text-align:center; padding:30px;">No hay productos registrados.</td>
                    </tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
    </main>
</div>

<div id="modalProducto" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modalTitle">Nuevo Producto</h3>
            <span class="close-btn" onclick="cerrarModal()">&times;</span>
        </div>

        <form method="POST" action="guardar_producto.php">
            <input type="hidden" name="id_producto" id="input_id">

            <div class="modal-body">

                <div class="form-grid">
                    <div class="form-group">
                        <label for="codigo">Código de Barras</label>
                        <label for="input_codigo"></label><input type="text" name="codigo" id="input_codigo" placeholder="Ej. 75012345">
                    </div>

                    <div class="form-group">
                        <label for="nombre">Nombre del Producto</label>
                        <label for="input_nombre"></label><input type="text" name="nombre" id="input_nombre" required
                                                                 placeholder="Ej. Cuaderno A4">
                    </div>
                </div>

                <div class="form-group">
                    <label for="descripcion">Descripción</label>
                    <label for="input_descripcion"></label><input type="text" name="descripcion" id="input_descripcion"
                                                                  placeholder="Detalles del producto...">
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="categoria">Categoría</label>
                        <label for="input_categoria"></label><select name="categoria" id="input_categoria"
                                                                     style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius: var(--radius);">
                            <option value="">Seleccionar...</option>
                            <option value="1">Papel</option>
                            <option value="2">Escritura</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="proveedor">Proveedor</label>
                        <label for="input_proveedor"></label><select name="proveedor" id="input_proveedor"
                                                                     style="width:100%; padding:10px; border:1px solid var(--border-color); border-radius: var(--radius);">
                            <option value="">Seleccionar...</option>
                            <option value="1">Bic</option>
                            <option value="2">Norma</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="precio">Precio Venta ($)</label>
                        <label for="input_precio"></label><input type="number" step="0.01" name="precio" id="input_precio" required>
                    </div>

                    <div class="form-group">
                        <label for="stock">Stock Inicial</label>
                        <label for="input_stock"></label><input type="number" name="stock" id="input_stock" required>
                    </div>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
                <button type="submit" class="btn-primary" style="width: auto;">Guardar Producto</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('modalProducto');
    const modalTitle = document.getElementById('modalTitle');

    function abrirModalProducto() {
        // Limpiar formulario para uno nuevo
        document.getElementById('input_id').value = '';
        document.getElementById('input_nombre').value = '';
        // ... limpiar el resto ...

        modalTitle.innerText = "Nuevo Producto";

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function editarProducto(id) {
        modalTitle.innerText = "Editar Producto";
        alert("Simulación: Cargando datos del ID " + id);

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function cerrarModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
</script>

</body>
</html>