<?php
declare(strict_types=1);

// 1. CORRECCIÓN DE RUTAS
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

header('Content-Type: application/json');

// 2. Cargar variables de entorno desde la RAÍZ
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

if (!isset($_GET['id'])) {
   echo json_encode(['error' => 'ID no proporcionado']);
   exit;
}

try {
   // Ahora sí se conectará a 'papeleria'
   $pdo = Database::getConnection();

   // Consulta segura
   $sql = '
        SELECT 
            p.nombre AS producto,
            d.cantidad,
            d.precio_historico,
            (d.cantidad * d.precio_historico) AS subtotal
        FROM detalle_venta d
        INNER JOIN producto p ON d.id_producto = p.id_producto
        WHERE d.id_venta = :id
    ';

   $stmt = $pdo->prepare($sql);
   $stmt->execute([':id' => $_GET['id']]);
   $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

   echo json_encode($detalles);

} catch (Exception $e) {
   // Tip: Si hay error, enviamos un JSON con el error para verlo en el alert
   http_response_code(500);
   echo json_encode(['error' => 'Error SQL: ' . $e->getMessage()]);
}