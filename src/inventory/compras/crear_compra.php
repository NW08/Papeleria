<?php
declare(strict_types=1);

require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

session_start();
header('Content-Type: application/json');

// Validar sesión
if (!isset($_SESSION['usuario'])) {
   echo json_encode(['error' => 'No autorizado']);
   exit;
}

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id_proveedor']) || empty($input['items'])) {
   echo json_encode(['error' => 'Datos incompletos']);
   exit;
}

try {
   $pdo = Database::getConnection();
   $pdo->beginTransaction(); // INICIO TRANSACCIÓN

   // 1. Insertar Cabecera de Compra
   // Asumimos que hay una sesión con id_empleado, si no, usamos 1 por defecto
   $idEmpleado = $_SESSION['id_empleado'] ?? 1; // Ajustar según tu lógica de login

   $sqlCompra = 'INSERT INTO compra (numero_orden, id_proveedor, id_empleado, fecha) 
                  VALUES (:orden, :prov, :emp, GETDATE())';

   $stmt = $pdo->prepare($sqlCompra);
   $stmt->execute([
      ':orden' => $input['numero_orden'] ?? null,
      ':prov' => $input['id_proveedor'],
      ':emp' => $idEmpleado
   ]);

   $idCompra = $pdo->lastInsertId();

   // 2. Insertar Detalles y Actualizar Stock
   $sqlDetalle = 'INSERT INTO detalle_compra (id_compra, id_producto, cantidad, costo_unitario) 
                   VALUES (:compra, :prod, :cant, :costo)';

   // OJO: Aquí sumamos (+), a diferencia de la venta que restaba
   $sqlStock = 'UPDATE producto SET stock_actual = stock_actual + :cant WHERE id_producto = :prod';

   $stmtDetalle = $pdo->prepare($sqlDetalle);
   $stmtStock = $pdo->prepare($sqlStock);

   foreach ($input['items'] as $item) {
      // Validar datos básicos
      if ($item['cantidad'] <= 0 || $item['costo_unitario'] <= 0) continue;

      // A. Guardar detalle
      $stmtDetalle->execute([
         ':compra' => $idCompra,
         ':prod' => $item['id_producto'],
         ':cant' => $item['cantidad'],
         ':costo' => $item['costo_unitario']
      ]);

      // B. Aumentar inventario
      $stmtStock->execute([
         ':cant' => $item['cantidad'],
         ':prod' => $item['id_producto']
      ]);
   }

   $pdo->commit(); // CONFIRMAR TRANSACCIÓN
   echo json_encode(['success' => true]);

} catch (Exception $e) {
   if ($pdo->inTransaction()) {
      $pdo->rollBack(); // REVERTIR SI FALLA
   }
   echo json_encode(['error' => $e->getMessage()]);
}