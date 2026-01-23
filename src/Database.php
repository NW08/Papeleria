<?php

declare(strict_types=1);

namespace Jossu\Bdd;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
   private static ?PDO $instance = null;

   private function __construct()
   {
   }

   public static function getConnection(): PDO
   {
      if (self::$instance === null) {
         self::$instance = self::createConnection();
      }

      return self::$instance;
   }

   private static function createConnection(): PDO
   {
      // Aseguramos que las variables de entorno estén cargadas

      $host = $_ENV['DB_HOST'] ?? 'localhost';
      $database = $_ENV['DB_NAME'] ?? '';
      $username = $_ENV['DB_USER'] ?? '';
      $password = $_ENV['DB_PASS'] ?? '';

      // Configuraciones específicas para SQL Server en la nube
      $encrypt = $_ENV['DB_ENCRYPT'] ?? 'false';
      $trustServerCert = $_ENV['DB_TRUST_CERT'] ?? 'true';

      // Construcción del DSN (Data Source Name)
      // sqlsrv:Server=localhost,1433;Database=papeleria;Encrypt=true;TrustServerCertificate=true
      $dsn = sprintf(
         'sqlsrv:Server=%s;Database=%s;Encrypt=%s;TrustServerCertificate=%s',
         $host,
         $database,
         $encrypt,
         $trustServerCert
      );

      $options = [
         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
         PDO::SQLSRV_ATTR_ENCODING => PDO::SQLSRV_ENCODING_UTF8,
      ];

      try {
         return new PDO($dsn, $username, $password, $options);
      } catch (PDOException $e) {
         error_log('Database Connection Error: ' . $e->getMessage());
         throw new RuntimeException('Error al conectar con la base de datos.');
      }
   }
}