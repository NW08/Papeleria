-- CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE papeleria;
GO

USE papeleria;
GO

-- TABLAS DE SEGURIDAD Y USUARIOS
-- Tabla para almacenar los tipos de roles
CREATE TABLE rol
(
    id_rol INT IDENTITY (1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Tabla de usuarios para el acceso al sistema
CREATE TABLE usuario
(
    id_usuario INT IDENTITY (1,1) PRIMARY KEY,
    username   VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(50) NOT NULL,
    id_rol     INT         NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol (id_rol)
);
GO

-- Tabla con la información personal de los empleados
CREATE TABLE empleado
(
    id_empleado INT IDENTITY (1,1) PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    cargo       VARCHAR(50)  NOT NULL,
    id_usuario  INT UNIQUE,
    CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);
GO

-- TABLAS DE PERSONAS EXTERNAS
-- Tabla de clientes que compran en la papelería
CREATE TABLE cliente
(
    id_cliente INT IDENTITY (1,1) PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    email      VARCHAR(100) UNIQUE,
    telefono   VARCHAR(10)
);
GO

-- Tabla de proveedores que surten los productos
CREATE TABLE proveedor
(
    id_proveedor INT IDENTITY (1,1) PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    telefono     VARCHAR(20)
);
GO

-- TABLAS DE INVENTARIO
-- Categorías de los productos
CREATE TABLE categoria
(
    id_categoria INT IDENTITY (1,1) PRIMARY KEY,
    nombre       VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Tabla principal de productos
CREATE TABLE producto
(
    id_producto  INT IDENTITY (1,1) PRIMARY KEY,
    nombre       VARCHAR(100)  NOT NULL,
    precio       DECIMAL(5, 2) NOT NULL CHECK (precio > 0),
    stock        INT           NOT NULL CHECK (stock >= 0),
    id_categoria INT           NOT NULL,
    id_proveedor INT           NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria),
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor)
);
GO

-- TABLAS TRANSACCIONALES (VENTAS)
-- Catálogo de formas de pago
CREATE TABLE forma_pago
(
    id_forma_pago INT IDENTITY (1,1) PRIMARY KEY,
    nombre        VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Estados posibles de una venta
CREATE TABLE estado_venta
(
    id_estado INT IDENTITY (1,1) PRIMARY KEY,
    nombre    VARCHAR(30) NOT NULL UNIQUE
);
GO

-- Tabla para guardas las ventas realizadas
CREATE TABLE venta
(
    id_venta      INT IDENTITY (1,1) PRIMARY KEY,
    fecha         DATETIME      NOT NULL DEFAULT GETDATE(),
    id_cliente    INT           NOT NULL,
    id_empleado   INT           NOT NULL,
    id_forma_pago INT           NOT NULL,
    id_estado     INT           NOT NULL,
    subtotal      DECIMAL(5, 2) NOT NULL DEFAULT 0,
    iva           DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total         DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
    CONSTRAINT fk_venta_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado),
    CONSTRAINT fk_venta_forma_pago FOREIGN KEY (id_forma_pago) REFERENCES forma_pago (id_forma_pago),
    CONSTRAINT fk_venta_estado FOREIGN KEY (id_estado) REFERENCES estado_venta (id_estado)
);
GO

-- Detalle de los productos incluidos en cada venta
CREATE TABLE detalle_venta
(
    id_detalle      INT IDENTITY (1,1) PRIMARY KEY,
    id_venta        INT           NOT NULL,
    id_producto     INT           NOT NULL,
    cantidad        INT           NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(5, 2) NOT NULL CHECK (precio_unitario > 0),
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES venta (id_venta),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);
GO

-- TABLAS TRANSACCIONALES (COMPRAS)
-- Cabecera de compras a proveedores
CREATE TABLE compra
(
    id_compra    INT IDENTITY (1,1) PRIMARY KEY,
    fecha        DATETIME      NOT NULL DEFAULT GETDATE(),
    id_proveedor INT           NOT NULL,
    id_empleado  INT           NOT NULL,
    total        DECIMAL(6, 2) NOT NULL,
    CONSTRAINT fk_compra_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor (id_proveedor),
    CONSTRAINT fk_compra_empleado FOREIGN KEY (id_empleado) REFERENCES empleado (id_empleado)
);
GO

-- Detalle de los productos comprados al proveedor
CREATE TABLE detalle_compra
(
    id_detalle_compra INT IDENTITY (1,1) PRIMARY KEY,
    id_compra         INT           NOT NULL,
    id_producto       INT           NOT NULL,
    cantidad          INT           NOT NULL CHECK (cantidad > 0),
    precio_unitario   DECIMAL(6, 2) NOT NULL,
    CONSTRAINT fk_detalle_compra FOREIGN KEY (id_compra) REFERENCES compra (id_compra),
    CONSTRAINT fk_detalle_compra_producto FOREIGN KEY (id_producto) REFERENCES producto (id_producto)
);
GO