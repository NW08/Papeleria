<?php
$serverName = "DESKTOP-TC02VK7\\SQLEXPRESS01";
$database = "papeleria";

$username = "admin_login";
$password = "Admin123*";

try {
    $conn = new PDO(
        "sqlsrv:Server=$serverName;Database=$database",
        $username,
        $password
    );
    echo "🎉 CONEXIÓN OK A SQL SERVER 🎉";
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage();
}
?>
