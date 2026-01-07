-- usar la base de datos
use papeleria;
-- insertar registros en la tabla de rol 
insert into rol(nombre)
values ('administrador'), ('vendedor');
-- insertat registros en la tabla de usuario
insert into usuario (username, contraseña, id_rol) values 
('admin', 'hash_admin', 1),
('vendedor1', 'hash_vend', 2);
-- Insertar registros en la tabla de empleado
insert into empleado (nombre, cargo, id_usuario) values
('carlos pérez', 'administrador', 1),
('ana lópez', 'vendedor', 2);
-- Insertar registros en la tabla de cliente
insert into cliente (nombre, email, telefono) values
('Juan Torres','juan@email.com','0989227790'),
('María Ruiz','maria@email.com','0936412507'),
('Pedro Gómez','pedro@email.com','0921564789'),
('Emily Ayo','lucia@email.com','0989205590'),
('Antony Benavides','antony@email.com','0979429257');
-- Insertar registros en la tabla de proovedore
insert into proovedor(nombre, telefono) values
('Proveedor Escolar', '022222222'),
('Papeles S.A.', '023333333'),
('Útiles Express', '024444444'),
('Distribuidora Central', '025555555'),
('OfiMarket', '026666666');
-- Insertar registros en la tabla de categoria
insert into categoria (nombre) values
('Cuadernos'),
('Forros'),
('Esferos'),
('Crayones'),
('Pinturas');
-- Insertar registros en la tabla de producto
insert into producto (nombre, precio, stock, id_categoria, id_proveedor) values
('Cuaderno A4', 2.50, 100, 1, 1),
('Esfero Azul', 0.50, 200, 2, 2),
('Resma A4', 6.75, 50, 4, 3),
('Colores 12u', 4.20, 40, 5, 4),
('Carpeta Plástica', 1.80, 80, 3, 5);
-- Insertar registro de la tabla de forma_pago
insert into forma_pago (nombre) values
('Efectivo'),
('Tarjeta'),
('Transferencia');
-- Insertar registro de la tabla de estado_venta
insert into estado_venta (nombre) values
('Pagada'),
('Pendiente'),
('Anulada'),
('En proceso'),
('Facturada');
-- Insertar registro de la tabla de venta
insert into venta(id_cliente, id_empleado, id_forma_pago, id_estado, subtotal, iva, total) values
(1, 2, 5, 1, 5.00, 0.60, 5.60),
(2, 2, 6, 1, 8.00, 0.96, 8.96),
(3, 2, 7, 2, 12.50, 1.50, 14.00),
(4, 2, 5, 1, 3.60, 0.43, 4.03),
(5, 2, 6, 1, 10.00, 1.20, 11.20);

-- Insertar registro de la tabla de detalle_venta
insert into detalle_venta (id_venta, cantidad, precio_unitario, id_producto) values
(4, 2, 2.50, 1),
(5, 4, 0.50, 2),
(6, 2, 6.75, 3),
(7, 2, 1.80, 5),
(8, 1, 4.20, 4);
-- Insertar registro de la tabla de compra
insert into compra (id_proveedor, id_empleado, total) values
(1, 1, 50.00),
(2, 1, 75.50),
(3, 1, 120.00),
(4, 1, 90.25),
(5, 1, 60.00);
-- Insertar registro de la tabla de detalle_compra
insert into detalle_compra (id_compra, id_producto, cantidad, precio_unitario) values
(1, 1, 20, 2.50),
(2, 2, 50, 0.50),
(3, 3, 10, 6.75),
(4, 4, 15, 4.20),
(5, 5, 30, 1.80);
