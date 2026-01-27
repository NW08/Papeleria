<?php
declare(strict_types=1);

require_once __DIR__ . '/../../../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

header('Content-Type: application/json');
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->safeLoad();

if (!isset($_GET['id'])) {
   echo json_encode([]);
   exit;
}

try {
   $pdo = Database::getConnection();

   $sql = '
        SELECT 
            p.nombre AS producto,
            d.cantidad,
            d.costo_unitario
        FROM detalle_compra d
        INNER JOIN producto p ON d.id_producto = p.id_producto
        WHERE d.id_compra = :id
    ';

   $stmt = $pdo->prepare($sql);
   $stmt->execute([':id' => $_GET['id']]);

   echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
   echo json_encode(['error' => $e->getMessage()]);
}