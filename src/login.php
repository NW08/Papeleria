<?php
declare(strict_types=1);
session_start();

// 1. CORRECCIÓN DE RUTAS
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Jossu\Bdd\Database;

// 2. Cargar variables de entorno apuntando a la raíz del proyecto
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

$error = null;

// 3. Procesar el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuarioInput = $_POST['usuario'] ?? '';
    $passwordInput = $_POST['password'] ?? '';

    try {
        $pdo = Database::getConnection();
        $sql = 'EXEC sp_validar_login @input_user = :user, @input_pass = :pass';

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
                ':user' => $usuarioInput,
                ':pass' => $passwordInput
        ]);

        $resultado = $stmt->fetch();

        // Validamos la respuesta del SP
        if ($resultado && isset($resultado['Estado']) && $resultado['Estado'] === 'ÉXITO') {

            // Login Exitoso
            $_SESSION['usuario'] = $resultado['username'];
            $_SESSION['id_usuario'] = $resultado['id_usuario'];

            // Seguridad: Regenerar ID para evitar fijación de sesión
            session_regenerate_id(true);

            // Redirigir al dashboard (ajusta la ruta si index.php está en la raíz)
            header('Location: ../index.php');
            exit();

        } else {
            // El SP ya registró el fallo en 'auditoria_login'
            $error = 'Credenciales incorrectas.';
        }

    } catch (Exception $e) {
        // En producción, usa error_log y no muestres el mensaje técnico
        error_log('Error Login: ' . $e->getMessage());
        $error = 'Error de conexión con el sistema.';
    }
}
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso Papelería</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
</head>
<body>

<div class="login-wrapper">
    <div class="login-card">
        <div class="login-header">
            <svg class="brand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            <h2>¡Que tal!</h2>
            <p>Sistema de Gestión</p>
        </div>

        <?php if (isset($error) && $error): ?>
            <div class="alert alert-error">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="" class="login-form">
            <div class="form-group">
                <label for="usuario">Usuario</label>
                <input type="text" id="usuario" name="usuario" placeholder="Ej. admin" required autocomplete="off">
            </div>

            <div class="form-group">
                <label for="password">Contraseña</label>
                <div class="password-wrapper">
                    <input type="password" id="password" name="password" placeholder="••••••••" required>
                    <button type="button" class="toggle-password" onclick="togglePassword()">
                        <svg id="eye-icon" class="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
                                   0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <svg id="eye-off-icon" class="eye-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0
                                  011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532
                                   7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025
                                   0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <button type="submit" class="btn-primary">Iniciar Sesión</button>
        </form>

        <div class="login-footer">
            <p>&copy; <?php echo date('Y'); ?> Papelería Control</p>
        </div>
    </div>
</div>

<script>
    function togglePassword() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');
        const eyeOffIcon = document.getElementById('eye-off-icon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeOffIcon.classList.add('hidden');
        }
    }
</script>

</body>
</html>