use papeleria;
-- CREACIÓN DE ROLES
create role rol_administrador;
create role rol_vendedor;
create role rol_proveedor;
SELECT name FROM sys.sql_logins WHERE name = 'admin_login';

-- ASIGNACION DE PERMISOS A LOS ROLES
-- Administrador 
grant control on database::papeleria to rol_administrador;
-- Vendedor 
grant select on producto to rol_vendedor;
grant select, insert on cliente to rol_vendedor;
grant select, insert on venta to rol_vendedor;
grant select, insert on detalle_venta to rol_vendedor;
-- proveedor
grant select on producto to rol_proveedor;
grant select on compra to rol_proveedor;
grant select on detalle_compra to rol_proveedor;
-- CREAR LOGINS
create login admin_login with password = 'Admin123*';
create login vendedor_login with password = 'Vendedor123*';
create login proveedor_login with password = 'Proveedor123*';
-- CREAR USUARIOS EN LA BASE DE DATOS
create user admin_user for login admin_login;
create user vendedor_user for login vendedor_login;
create user proveedor_user for login proveedor_login;
-- ASIGNAR USUARIOS A LOS ROLES
alter role rol_administrador add member admin_user;
alter role rol_vendedor add member vendedor_user;
alter role rol_proveedor add member proveedor_user;

-- SEGURIDAD DEL SISTEMA
-- Encriptar de contraseñas
-- Inserción segura de usuario con contraseña cifrada usando HASH SHA2_256
insert into usuario(username, contraseña, id_rol)
values('vendedor_user',HASHBYTES('SHA2_256','Vendedor123*'),2);
-- La contraseña no se almacena en texto plano, protegiendo la seguridad de los usuarios
-- ENCRIPTACIÓN Y DESENCRIPTACIÓN CON AES
-- Crear clave maestra de la base de datos requerida para AES
create master key encryption by password = 'PapeleriaClaveMaestra123!';
-- crear certificado para encriptación
create certificate CertPapeleria
with subject = 'Certificado de cifrado Papelería';
-- crear clave simetríca usando AES_256
create symmetric key ClaveAES_Papeleria
with algorithm = AES_256
encryption by certificate CertPapeleria;

-- Encriptar datos sensibles (ejemplo: email del cliente)
open symmetric key ClaveAES_Papeleria decryption by certificate CertPapeleria;
update cliente set  email = encryptbykey(key_guid('ClaveAES_Papeleria'), email)
where id_cliente = 1;
-- Desencriptar datos solo para verificar
select id_cliente,
convert(varchar(100), DECRYPTBYKEY(email)) as email_desencriptado
from cliente where id_cliente = 1;
-- Permite visualizar el correo de manera segura solo cuando es necesario
close symmetric key ClaveAES_Papeleria;

-- Registro de intentos fallidos
-- Tabla para registrar intentos de login fallidos
create table IntentosFallidos(
id int identity primary key,
usuario_intento varchar(50),
fecha datetime default getdate(),
ip_origen varchar(50),
resultado varchar(20),
observacion varchar(100)
);
-- Procedimiento seguro de login
go
create procedure LoginPapeleria
	@username varchar(50),
	@clave varchar(50)
as
begin
	declare @existe int;
	-- verificar usuario y contraseña
	select @existe = count(*)
	from usuario
	where username = @username
	and contraseña = HASHBYTES('SHA2_256',@clave);

	if @existe=1
		print 'Inicio de sesión exitoso'
	else
	begin
	-- Registrar intento fallido
			insert  into IntentosFallidos(usuario_intento, ip_origen, resultado, observacion)
			values (@username, '127.0.0.1', 'Fallido', 'Usuario o contraseña incorrecta');
			
			print 'Inicio de sesión fallido';
		end
	end;
go

-- Ejemplo de uso del login seguro
exec LoginPapeleria 'vendedor_user','clave_mal';
exec LoginPapeleria 'vendedor_user','Vendedor123*';

-- Simulación de vulnerabilidad de inyección SQL
-- No usar en producción solo para demostrar riesgo
select*from usuario where username = '' or '1'='1';
-- Esta consulta seria peligrosa si no usamos parametos o procedimientos almacenados



