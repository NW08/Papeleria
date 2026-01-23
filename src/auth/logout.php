<?php

declare(strict_types=1);

session_start();

// 1. Vaciar el array de sesión
$_SESSION = [];

// 2. Invalidar la cookie de sesión (si existe)
if (ini_get('session.use_cookies')) {
   $params = session_get_cookie_params();
   setcookie(session_name(), '', time() - 42000,
      $params['path'], $params['domain'],
      $params['secure'], $params['httponly']
   );
}

// 3. Destruir la sesión en el servidor
session_destroy();

// 4. Redirigir al login (usamos ruta relativa porque estamos en la carpeta src)
header('Location: login.php');
exit();