<?php
session_start();

if (isset($_POST['usuario']) && isset($_POST['password'])) {
    $usuario = $_POST['usuario'];
    $password = $_POST['password'];
    $serverName = "DESKTOP-TC02VK7\\SQLEXPRESS01";
    $database = "papeleria";

    try {
        $conn = new PDO(
            "sqlsrv:Server=$serverName;Database=$database",
            $usuario,
            $password
        );
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $_SESSION['usuario'] = $usuario;
        header("Location: index.php");
        exit();
    } catch (PDOException $e) {
        $error = "Usuario o contraseña incorrectos";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Papelería</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div style="width:300px;margin:100px auto;padding:20px;background:white;border-radius:5px;box-shadow:0 0 10px #aaa;">
        <h2 style="text-align:center;">Login Papelería</h2>
        <?php if(isset($error)) echo "<p style='color:red;text-align:center;'>$error</p>"; ?>
        <form method="POST">
            <input type="text" name="usuario" placeholder="Usuario" required style="width:100%;padding:10px;margin:5px 0;">
            <input type="password" name="password" placeholder="Contraseña" required style="width:100%;padding:10px;margin:5px 0;">
            <button type="submit" style="width:100%;padding:10px;">Ingresar</button>
        </form>
    </div>
</body>
</html>
