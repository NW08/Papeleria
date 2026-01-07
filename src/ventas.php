<?php
include "conexion.php";

echo "<h2>Ventas</h2>";
echo "<a href='logout.php'>Cerrar sesión</a><br><br>";

try {
    $stmt = $conn->query("
        SELECT v.id_venta, v.fecha, c.nombre AS cliente, e.nombre AS empleado,
               fp.nombre AS forma_pago, ev.nombre AS estado, v.total
        FROM venta v
        INNER JOIN cliente c ON v.id_cliente = c.id_cliente
        INNER JOIN empleado e ON v.id_empleado = e.id_empleado
        INNER JOIN forma_pago fp ON v.id_forma_pago = fp.id_forma_pago
        INNER JOIN estado_venta ev ON v.id_estado = ev.id_estado
    ");

    echo "<table border='1' cellpadding='5'>";
    echo "<tr>
            <th>ID</th><th>Fecha</th><th>Cliente</th><th>Empleado</th>
            <th>Forma Pago</th><th>Estado</th><th>Total</th>
          </tr>";

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>
                <td>{$row['id_venta']}</td>
                <td>{$row['fecha']}</td>
                <td>{$row['cliente']}</td>
                <td>{$row['empleado']}</td>
                <td>{$row['forma_pago']}</td>
                <td>{$row['estado']}</td>
                <td>{$row['total']}</td>
              </tr>";
    }
    echo "</table>";
} catch (PDOException $e) {
    echo "Error al mostrar ventas: " . $e->getMessage();
}
?>
