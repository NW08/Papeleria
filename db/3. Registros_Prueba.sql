-- Se usa la base de datos.
USE papeleria;
GO

-- INSERCIONES DE EJEMPLO
-- Tabla Cargo
INSERT INTO cargo(nombre, salario_base)
VALUES ('Administrador', 100000),
       ('Vendedor', 50000),
       ('Asistente', 20000);
GO

-- Tabla Categoría
INSERT INTO categoria (nombre)
VALUES ('Cuadernos'),
       ('Forros'),
       (N'Bolígrafos'),
       ('Crayones'),
       ('Pinturas');
GO

-- Tabla Cliente
INSERT INTO cliente (nombre, apellido, email, telefono)
VALUES ('Juan', 'Torres', 'juan@email.com', '0989227790'),
       (N'María', 'Ruiz', 'maria@email.com', '0936412507'),
       ('Pedro', N'Gómez', 'pedro@email.com', '0921564789'),
       ('Emily', 'Ayo', 'lucia@email.com', '0989205590'),
       ('Anthony', 'Benavides', 'antony@email.com', '0979429257');
GO

-- Tabla Proveedor
INSERT INTO proveedor (nombre_empresa, nombre_contacto, telefono, email_contacto)
VALUES ('Proveedor Escolar', N'Juan Pérez', '022222222', 'contacto@proveedorescolar.com'),
       ('Papeles S.A.', N'María Gómez', '023333333', 'ventas@papelessa.com'),
       (N'Útiles Express', 'Carlos Ruiz', '024444444', 'info@utilesexpress.com'),
       ('Distribuidora Central', N'Ana López', '025555555', 'contacto@distcentral.com'),
       ('OfiMarket', 'Luis Torres', '026666666', 'ventas@ofimarket.com');
GO

-- Tabla Rol
INSERT INTO rol (nombre, descripcion)
VALUES ('Administrador', 'Puede administrar el sistema'),
       ('Vendedor', 'Puede realizar ventas'),
       ('Asistente', 'Apoya al vendedor en su trabajo'),
       ('Proveedor', 'Puede proveer recursos y material'),
       ('Cliente', 'Puede realizar compras');
GO

-- Tabla Usuario
INSERT INTO usuario (username, contrasena_hash, id_rol)
VALUES ('admin', 'hash_admin', 1),
       ('vendedor1', 'hash_vend1', 2),
       ('vendedor2', 'hash_vend2', 2),
       ('asistente1', 'hash_alm1', 3),
       ('asistente2', 'hash_alm2', 3);
GO

-- Tabla Empleado
INSERT INTO empleado (nombre, apellido, email, id_cargo, id_usuario)
VALUES ('Carlos', N'Pérez', 'carlos.perez@empresa.com', 1, 1), -- admin
       ('Ana', N'López', 'ana.lopez@empresa.com', 2, 2),       -- vendedor1
       ('Luis', N'Gómez', 'luis.gomez@empresa.com', 2, 3),     -- vendedor2
       (N'María', 'Torres', 'maria.torres@empresa.com', 3, 4), -- asistente1
       ('Jorge', N'Ramírez', 'jorge.ramirez@empresa.com', 3, 5); -- asistente2
GO

-- Tabla Compra
INSERT INTO compra (numero_orden, id_proveedor, id_empleado)
VALUES ('ORD-001', 1, 3),
       ('ORD-002', 2, 1),
       ('ORD-003', 3, 2),
       ('ORD-004', 4, 3),
       ('ORD-005', 5, 1);
GO

-- Tabla Producto
INSERT INTO producto(codigo_barras, nombre, descripcion, precio_actual, stock_actual, id_categoria, id_proveedor)
VALUES ('7701234567890', 'Cuaderno A4', N'Cuaderno tamaño A4 de 100 hojas', 2.50, 100, 1, 1),
       ('7701234567891', 'Esfero Azul', 'Esfero tinta azul punta fina', 0.50, 200, 2, 2),
       ('7701234567892', 'Resma A4', 'Resma de papel A4 500 hojas', 6.75, 50, 4, 3),
       ('7701234567893', 'Colores 12u', 'Caja de colores x12 unidades', 4.20, 40, 5, 4),
       ('7701234567894', N'Carpeta Plástica', N'Carpeta plástica tamaño oficio', 1.80, 80, 3, 5);
GO

-- Tabla Forma Pago
INSERT INTO forma_pago(nombre)
VALUES ('Efectivo'),
       ('Tarjeta'),
       ('Transferencia');
GO

-- Tabla Estado - Venta
INSERT INTO estado_venta(nombre)
VALUES ('Pagada'),
       ('Pendiente'),
       ('Anulada'),
       ('En proceso'),
       ('Facturada');
GO

-- Tabla Venta
INSERT INTO venta(codigo_factura, id_cliente, id_empleado, id_forma_pago, id_estado)
VALUES ('FAC-001', 2, 5, 1, 1),
       ('FAC-002', 2, 2, 1, 1),
       ('FAC-003', 2, 3, 2, 2),
       ('FAC-004', 2, 4, 1, 1),
       ('FAC-005', 2, 1, 1, 1);
GO

-- Tabla Detalle - Venta
INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_historico)
VALUES (3, 1, 10, 2.50),
       (4, 2, 20, 0.50),
       (5, 3, 5, 6.75),
       (6, 4, 10, 4.20),
       (7, 5, 20, 1.80);
GO

-- Tabla Detalle - Compra
INSERT INTO detalle_compra(id_compra, id_producto, cantidad, costo_unitario)
VALUES (1, 1, 20, 2.30),
       (1, 2, 50, 0.45),
       (2, 3, 10, 6.50),
       (3, 4, 15, 3.90),
       (3, 5, 25, 1.70);
GO

