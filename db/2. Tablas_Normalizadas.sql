-- Cómo ya existe, se debe borrar para recrear con la nueva estructura
DROP DATABASE IF EXISTS papeleria;
CREATE DATABASE papeleria;
GO

USE papeleria;
GO

-- 1. TABLAS DE CATÁLOGO
CREATE TABLE rol
(
    id_rol      INT IDENTITY (1,1) PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
GO

CREATE TABLE cargo
(
    id_cargo     INT IDENTITY (1,1) PRIMARY KEY,
    nombre       VARCHAR(50)    NOT NULL UNIQUE,
    salario_base DECIMAL(10, 2) NOT NULL DEFAULT 0
);
GO

CREATE TABLE categoria
(
    id_categoria INT IDENTITY (1,1) PRIMARY KEY,
    nombre       VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE forma_pago
(
    id_forma_pago INT IDENTITY (1,1) PRIMARY KEY,
    nombre        VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE estado_venta
(
    id_estado INT IDENTITY (1,1) PRIMARY KEY,
    nombre    VARCHAR(30) NOT NULL UNIQUE
);
GO

-- 2. TABLAS DE ENTIDADES PRINCIPALES
CREATE TABLE usuario
(
    id_usuario      INT IDENTITY (1,1) PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    id_rol          INT          NOT NULL,
    fecha_registro  DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
            REFERENCES rol (id_rol)
);
GO

CREATE TABLE empleado
(
    id_empleado INT IDENTITY (1,1) PRIMARY KEY,
    nombre      VARCHAR(50)         NOT NULL,
    apellido    VARCHAR(50)         NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    id_cargo    INT                 NOT NULL,
    id_usuario  INT UNIQUE,

    CONSTRAINT fk_empleado_cargo
        FOREIGN KEY (id_cargo)
            REFERENCES cargo (id_cargo),

    CONSTRAINT fk_empleado_usuario
        FOREIGN KEY (id_usuario)
            REFERENCES usuario (id_usuario)
);
GO

CREATE TABLE cliente
(
    id_cliente INT IDENTITY (1,1) PRIMARY KEY,
    nombre     VARCHAR(50) NOT NULL,
    apellido   VARCHAR(50) NOT NULL,
    email      VARCHAR(100) UNIQUE,
    telefono   VARCHAR(15)
);
GO

CREATE TABLE proveedor
(
    id_proveedor    INT IDENTITY (1,1) PRIMARY KEY,
    nombre_empresa  VARCHAR(100) NOT NULL,
    nombre_contacto VARCHAR(100),
    telefono        VARCHAR(20),
    email_contacto  VARCHAR(100)
);
GO

-- 3. INVENTARIO
CREATE TABLE producto
(
    id_producto   INT IDENTITY (1,1) PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre        VARCHAR(100)   NOT NULL,
    descripcion   VARCHAR(255),
    precio_actual DECIMAL(10, 2) NOT NULL CHECK (precio_actual > 0),
    stock_actual  INT            NOT NULL CHECK (stock_actual >= 0),
    id_categoria  INT            NOT NULL,
    id_proveedor  INT            NOT NULL,

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
            REFERENCES categoria (id_categoria),

    CONSTRAINT fk_producto_proveedor
        FOREIGN KEY (id_proveedor)
            REFERENCES proveedor (id_proveedor)
);
GO

-- 4. TRANSACCIONES (VENTAS Y COMPRAS)
CREATE TABLE venta
(
    id_venta       INT IDENTITY (1,1) PRIMARY KEY,
    codigo_factura VARCHAR(20) UNIQUE,
    fecha          DATETIME NOT NULL DEFAULT GETDATE(),
    id_cliente     INT      NOT NULL,
    id_empleado    INT      NOT NULL,
    id_forma_pago  INT      NOT NULL,
    id_estado      INT      NOT NULL,

    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente)
            REFERENCES cliente (id_cliente),

    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (id_empleado)
            REFERENCES empleado (id_empleado),

    CONSTRAINT fk_venta_forma_pago
        FOREIGN KEY (id_forma_pago)
            REFERENCES forma_pago (id_forma_pago),

    CONSTRAINT fk_venta_estado
        FOREIGN KEY (id_estado)
            REFERENCES estado_venta (id_estado)
);
GO

CREATE TABLE detalle_venta
(
    id_detalle       INT IDENTITY (1,1) PRIMARY KEY,
    id_venta         INT            NOT NULL,
    id_producto      INT            NOT NULL,
    cantidad         INT            NOT NULL CHECK (cantidad > 0),
    precio_historico DECIMAL(10, 2) NOT NULL CHECK (precio_historico > 0),

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta)
            REFERENCES venta (id_venta),

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
            REFERENCES producto (id_producto)
);
GO

CREATE TABLE compra
(
    id_compra    INT IDENTITY (1,1) PRIMARY KEY,
    numero_orden VARCHAR(20),
    fecha        DATETIME NOT NULL DEFAULT GETDATE(),
    id_proveedor INT      NOT NULL,
    id_empleado  INT      NOT NULL,

    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (id_proveedor)
            REFERENCES proveedor (id_proveedor),

    CONSTRAINT fk_compra_empleado
        FOREIGN KEY (id_empleado)
            REFERENCES empleado (id_empleado)
);
GO

CREATE TABLE detalle_compra
(
    id_detalle_compra INT IDENTITY (1,1) PRIMARY KEY,
    id_compra         INT            NOT NULL,
    id_producto       INT            NOT NULL,
    cantidad          INT            NOT NULL CHECK (cantidad > 0),
    costo_unitario    DECIMAL(10, 2) NOT NULL,

    CONSTRAINT fk_detalle_compra
        FOREIGN KEY (id_compra)
            REFERENCES compra (id_compra),

    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_producto)
            REFERENCES producto (id_producto)
);
GO