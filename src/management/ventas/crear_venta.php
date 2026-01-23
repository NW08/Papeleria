<?php

declare(strict_types=1);

// Rutas: Ajustar según ubicación (src/api/crear_venta.php)
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

session_start();
header('Content-Type: application/json');

// 1. Validar sesión (Seguridad básica)
if (!isset($_SESSION['id_usuario'])) {
   http_response_code(401);
   echo json_encode(['error' => 'No autorizado']);
   exit;
}

// 2. Cargar entorno
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

// 3. Recibir datos JSON del Frontend
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id_cliente']) || empty($input['productos'])) {
   echo json_encode(['error' => 'Datos incompletos']);
   exit;
}

try {
   $pdo = Database::getConnection();

   // === INICIO DE TRANSACCIÓN (Punto Crítico) ===
   $pdo->beginTransaction();

   // A. Insertar Encabezado (Venta)
   // Nota: Generamos un código de factura simple o usamos NULL si es autogenerado por Trigger
   $sqlVenta = "INSERT INTO venta (id_cliente, id_empleado, id_forma_pago, id_estado, fecha) 
                 VALUES (:cliente, :empleado, :pago, (SELECT id_estado FROM estado_venta WHERE nombre = 'Completada'), GETDATE())";

   // Asumimos que id_empleado viene de la sesión (quien está logueado)
   // OJO: Necesitas saber el ID de empleado asociado al usuario logueado.
   // Por simplicidad usaremos 1 o lo que tengas en sesión.
   $idEmpleado = $_SESSION['id_empleado'] ?? 1;

   $stmt = $pdo->prepare($sqlVenta);
   $stmt->execute([
      ':cliente' => $input['id_cliente'],
      ':empleado' => $idEmpleado,
      ':pago' => $input['id_forma_pago']
   ]);

   // Obtener el ID de la venta recién creada
   $idVenta = $pdo->lastInsertId();

   // B. Procesar Productos (Detalles)
   foreach ($input['productos'] as $prod) {
      $idProducto = $prod['id'];
      $cantidad = $prod['cantidad'];

      // 1. Verificar Stock y Precio Actual
      $stmtProd = $pdo->prepare('SELECT stock_actual, precio_actual, nombre FROM producto WHERE id_producto = ?');
      $stmtProd->execute([$idProducto]);
      $datosProd = $stmtProd->fetch(PDO::FETCH_ASSOC);

      if (!$datosProd) {
         throw new Exception("Producto ID $idProducto no encontrado.");
      }

      if ($datosProd['stock_actual'] < $cantidad) {
         throw new Exception('Stock insuficiente para: ' . $datosProd['nombre']);
      }

      // 2. Insertar Detalle
      $sqlDetalle = 'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_historico) 
                       VALUES (:venta, :prod, :cant, :precio)';
      $stmtDet = $pdo->prepare($sqlDetalle);
      $stmtDet->execute([
         ':venta' => $idVenta,
         ':prod' => $idProducto,
         ':cant' => $cantidad,
         ':precio' => $datosProd['precio_actual'] // Guardamos el precio del momento
      ]);

      // 3. Descontar Stock
      $sqlStock = 'UPDATE producto SET stock_actual = stock_actual - :cant WHERE id_producto = :id';
      $stmtStock = $pdo->prepare($sqlStock);
      $stmtStock->execute([':cant' => $cantidad, ':id' => $idProducto]);
   }

   // === COMMIT (Confirmar) ===
   $pdo->commit();
   echo json_encode(['success' => true, 'mensaje' => 'Venta registrada con éxito', 'id_venta' => $idVenta]);

} catch (Exception $e) {
   // === ROLLBACK (Deshacer si algo falla) ===
   if ($pdo->inTransaction()) {
      $pdo->rollBack();
   }
   http_response_code(500);
   echo json_encode(['error' => $e->getMessage()]);
}