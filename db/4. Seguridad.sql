USE papeleria;
GO

-- 1. SEGURIDAD A NIVEL DE BASE DE DATOS (Roles SQL)
CREATE ROLE rol_administrador;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_proveedor;
CREATE ROLE rol_asistente;
CREATE ROLE rol_cliente;
GO

-- 2. ASIGNACIÓN DE PERMISOS (GRANT)
-- A. ROL ADMINISTRADOR: Control Total
GRANT CONTROL ON DATABASE::papeleria TO rol_administrador;

-- B. ROL VENDEDOR: Operativa diaria de ventas
GRANT SELECT ON producto TO rol_vendedor;
GRANT SELECT ON categoria TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON cliente TO rol_vendedor;
GRANT SELECT, INSERT ON venta TO rol_vendedor;
GRANT SELECT, INSERT ON detalle_venta TO rol_vendedor;
GRANT SELECT ON forma_pago TO rol_vendedor;
GRANT SELECT ON estado_venta TO rol_vendedor;

-- C. ROL PROVEEDOR: Gestión de suministros
GRANT SELECT ON producto TO rol_proveedor;
GRANT SELECT ON categoria TO rol_proveedor;
GRANT SELECT ON compra TO rol_proveedor;
GRANT SELECT ON detalle_compra TO rol_proveedor;

-- D. ROL ASISTENTE: Menos permisos que el vendedor
-- Puede ver inventario y clientes, pero NO puede registrar ventas (solo consulta)
GRANT SELECT ON producto TO rol_asistente;
GRANT SELECT ON cliente TO rol_asistente;
GRANT SELECT ON categoria TO rol_asistente;
-- No le damos permiso de INSERT en ventas por seguridad

-- E. ROL CLIENTE (NUEVO): Solo lectura de catálogo
-- El cliente solo debe poder ver qué productos hay y cuánto cuestan
GRANT SELECT ON producto TO rol_cliente;
GRANT SELECT ON categoria TO rol_cliente;
GO

-- 3. CREACIÓN DE LOGINS Y USUARIOS
-- Creación de Logins (Autenticación del Servidor)
CREATE LOGIN admin_login WITH PASSWORD = 'admin';
CREATE LOGIN vendedor_login WITH PASSWORD = 'vendedor';
CREATE LOGIN proveedor_login WITH PASSWORD = 'proveedor';
CREATE LOGIN asistente_login WITH PASSWORD = 'asistente';
CREATE LOGIN cliente_login WITH PASSWORD = 'cliente';
GO

-- Creación de Usuarios (Acceso a la BD 'papeleria')
CREATE USER admin_user FOR LOGIN admin_login;
CREATE USER vendedor_user FOR LOGIN vendedor_login;
CREATE USER proveedor_user FOR LOGIN proveedor_login;
CREATE USER asistente_user FOR LOGIN asistente_login;
CREATE USER cliente_user FOR LOGIN cliente_login;
GO

-- Asignación de Usuarios a los Roles SQL
ALTER ROLE rol_administrador ADD MEMBER admin_user;
ALTER ROLE rol_vendedor ADD MEMBER vendedor_user;
ALTER ROLE rol_proveedor ADD MEMBER proveedor_user;
ALTER ROLE rol_asistente ADD MEMBER asistente_user;
ALTER ROLE rol_cliente ADD MEMBER cliente_user;
GO

-- 4. CRIPTOGRAFÍA (Ajustada para no fallar si ya existe)
-- Verificamos si la Master Key ya existe para no dar error
IF NOT EXISTS (SELECT *
               FROM sys.symmetric_keys
               WHERE name = '##MS_DatabaseMasterKey##')
    BEGIN
        CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'MasterKeyPassword_paper2026!';
    END
GO

-- Crear certificado si no existe
IF NOT EXISTS (SELECT *
               FROM sys.certificates
               WHERE name = 'CertPaper')
    BEGIN
        CREATE CERTIFICATE CertPaper
            WITH SUBJECT = N'Certificado de cifrado Papelería Datos Sensibles';
    END
GO

-- Crear clave simétrica si no existe
IF NOT EXISTS (SELECT *
               FROM sys.symmetric_keys
               WHERE name = 'ClaveAES_Paper')
    BEGIN
        CREATE SYMMETRIC KEY ClaveAES_Paper
            WITH ALGORITHM = AES_256
            ENCRYPTION BY CERTIFICATE CertPaper;
    END
GO

-- Verificamos si la columna ya existe antes de intentar agregarla
IF NOT EXISTS (SELECT *
               FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_NAME = 'cliente'
                 AND COLUMN_NAME = 'email_cifrado')
    BEGIN
        ALTER TABLE cliente
            ADD email_cifrado VARBINARY(256);
    END
GO

-- Prueba de Encriptación
OPEN SYMMETRIC KEY ClaveAES_Paper DECRYPTION BY CERTIFICATE CertPaper;

-- Insertamos un cliente de prueba cifrado
INSERT INTO cliente (nombre, apellido, email_cifrado, telefono)
VALUES ('Maria', 'Lopez', EncryptByKey(Key_Guid('ClaveAES_Paper'), 'maria.lopez@gmail.com'),
        '0987654321');

CLOSE SYMMETRIC KEY ClaveAES_Paper;
GO

-- 5. SEGURIDAD APLICATIVA (Login y Auditoría)
-- Insertamos usuarios en la tabla 'usuario' (Lógica de App) correspondientes a los 5 roles
INSERT INTO usuario (username, contrasena_hash, id_rol)
VALUES ('vendedor_juan', HASHBYTES('SHA2_256', 'clave123'), 2), -- Rol Vendedor
       ('asistente_ana', HASHBYTES('SHA2_256', 'asistente123'), (SELECT id_rol FROM rol WHERE nombre = 'Asistente')),
       ('cliente_pedro', HASHBYTES('SHA2_256', 'cliente123'), (SELECT id_rol FROM rol WHERE nombre = 'Cliente'));
GO

-- Tabla de Auditoría (Si no existe)
IF OBJECT_ID('auditoria_login', 'U') IS NULL
    BEGIN
        CREATE TABLE auditoria_login
        (
            id_auditoria      INT IDENTITY (1,1) PRIMARY KEY,
            usuario_intentado VARCHAR(50),
            fecha             DATETIME DEFAULT GETDATE(),
            ip_origen         VARCHAR(50),
            mensaje_error     VARCHAR(255)
        );
    END
GO

-- Procedimiento de Login (Sin cambios, solo se recrea)
CREATE OR ALTER PROCEDURE sp_validar_login @input_user VARCHAR(50),
                                           @input_pass VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_usuario INT;
    DECLARE @hash_generado VARBINARY(64);

    SET @hash_generado = HASHBYTES('SHA2_256', @input_pass);

    SELECT @id_usuario = id_usuario
    FROM usuario
    WHERE username = @input_user
      AND contrasena_hash = @hash_generado;

    IF @id_usuario IS NOT NULL
        BEGIN
            SELECT N'ÉXITO' as Estado, id_usuario, username FROM usuario WHERE id_usuario = @id_usuario;
        END
    ELSE
        BEGIN
            INSERT INTO auditoria_login (usuario_intentado, ip_origen, mensaje_error)
            VALUES (@input_user, '192.168.1.XX', 'Credenciales incorrectas');
            SELECT 'ERROR' as Estado, N'Credenciales Inválidas' as Mensaje;
        END
END
GO

-- 6. PRUEBAS FINALES CON LOS NUEVOS ROLES
-- 1. Login Vendedor (Exitoso)
EXEC sp_validar_login 'vendedor_juan', 'clave123';

-- 2. Login Asistente (Exitoso)
EXEC sp_validar_login 'asistente_ana', 'asistente123';

-- 3. Login Fallido
EXEC sp_validar_login 'cliente_pedro', 'clave_incorrecta';

SELECT *
FROM auditoria_login;
GO