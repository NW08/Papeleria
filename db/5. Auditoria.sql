USE papeleria;
GO

-- 1. CREACIÓN DE LA TABLA DE AUDITORÍA
IF OBJECT_ID('auditoria', 'U') IS NOT NULL
    DROP TABLE auditoria;
GO

CREATE TABLE auditoria
(
    id_auditoria   INT IDENTITY (1,1) PRIMARY KEY,
    fecha          DATETIME DEFAULT GETDATE(),
    usuario        VARCHAR(50),          -- Quién hizo la acción (SYSTEM_USER o usuario de app)
    table_afectada VARCHAR(50) NOT NULL,
    operacion      VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    id_registro    INT,                  -- ID del dato modificado
    detalle        VARCHAR(MAX)          -- Descripción detallada del cambio
);
GO

-- 2. TRIGGERS PARA PRODUCTOS
-- A. Trigger INSERT (Producto)
CREATE OR ALTER TRIGGER trg_productos_insert
    ON producto
    AFTER INSERT
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Producto',
           'INSERT',
           id_producto,
           SYSTEM_USER,
           CONCAT('Producto agregado: ', nombre, '. Precio Base: $', precio_actual, '. Stock: ', stock_actual)
    FROM inserted;
END;
GO

-- B. Trigger UPDATE (Producto)
CREATE OR ALTER TRIGGER trg_productos_update
    ON producto
    AFTER UPDATE
    AS
BEGIN
    SET NOCOUNT ON;
    -- Solo auditamos si cambia el precio o el stock (evita llenar la tabla si solo cambian descripciones)
    IF UPDATE(precio_actual) OR UPDATE(stock_actual)
        BEGIN
            INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
            SELECT 'Producto',
                   'UPDATE',
                   i.id_producto,
                   SYSTEM_USER,
                   CONCAT('Cambio detectado. Precio Anterior: $', d.precio_actual, ' -> Nuevo: $', i.precio_actual,
                          '. Stock Anterior: ', d.stock_actual, ' -> Nuevo: ', i.stock_actual)
            FROM inserted i
                     JOIN deleted d ON i.id_producto = d.id_producto;
        END
END;
GO

-- C. Trigger DELETE (Producto)
CREATE OR ALTER TRIGGER trg_productos_delete
    ON producto
    AFTER DELETE
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Producto',
           'DELETE',
           id_producto,
           SYSTEM_USER,
           CONCAT('Producto eliminado: ', nombre, N' (Código: ', codigo_barras, ')')
    FROM deleted;
END;
GO

-- 3. TRIGGERS PARA CLIENTES
-- A. Trigger INSERT (Cliente)
CREATE OR ALTER TRIGGER trg_clientes_insert
    ON cliente
    AFTER INSERT
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Cliente',
           'INSERT',
           id_cliente,
           SYSTEM_USER,
           CONCAT('Cliente registrado: ', nombre, ' ', apellido, '. Tel: ', telefono)
    FROM inserted;
END;
GO

-- B. Trigger UPDATE (Cliente)
CREATE OR ALTER TRIGGER trg_clientes_update
    ON cliente
    AFTER UPDATE
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Cliente',
           'UPDATE',
           i.id_cliente,
           SYSTEM_USER,
           CONCAT('Datos modificados para: ', i.nombre, ' ', i.apellido)
    FROM inserted i
             JOIN deleted d ON i.id_cliente = d.id_cliente;
END;
GO

-- C. Trigger DELETE (Cliente)
CREATE OR ALTER TRIGGER trg_clientes_delete
    ON cliente
    AFTER DELETE
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Cliente',
           'DELETE',
           id_cliente,
           SYSTEM_USER,
           CONCAT('Cliente eliminado: ', nombre, ' ', apellido)
    FROM deleted;
END;
GO

-- 4. TRIGGERS PARA VENTAS
-- El trigger de Venta ahora audita la creación de la factura y cambios de estado.
-- A. Trigger INSERT (Venta)
CREATE OR ALTER TRIGGER trg_ventas_insert
    ON venta
    AFTER INSERT
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Venta',
           'INSERT',
           id_venta,
           SYSTEM_USER,
           CONCAT('Nueva venta iniciada. Cliente ID: ', id_cliente, '. Empleado ID: ', id_empleado)
    FROM inserted;
END;
GO

-- B. Trigger UPDATE (Venta - Cambio de Estado)
-- Como no hay 'total' en la cabecera, lo más importante es auditar si anulan la venta o cambian su estado
CREATE OR ALTER TRIGGER trg_ventas_update
    ON venta
    AFTER UPDATE
    AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(id_estado)
        BEGIN
            INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
            SELECT 'Venta',
                   'UPDATE',
                   i.id_venta,
                   SYSTEM_USER,
                   CONCAT('Estado de venta actualizado. ID Estado anterior: ', d.id_estado, ' -> Nuevo: ', i.id_estado)
            FROM inserted i
                     JOIN deleted d ON i.id_venta = d.id_venta;
        END
END;
GO

-- C. Trigger DELETE (Venta)
CREATE OR ALTER TRIGGER trg_ventas_delete
    ON venta
    AFTER DELETE
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Venta',
           'DELETE',
           id_venta,
           SYSTEM_USER,
           CONCAT('Venta eliminada (Cabecera). Cliente ID: ', id_cliente)
    FROM deleted;
END;
GO

-- 5. TRIGGER EXTRA: DETALLE DE VENTA
CREATE OR ALTER TRIGGER trg_detalle_venta_insert
    ON detalle_venta
    AFTER INSERT
    AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    SELECT 'Detalle_Venta',
           'INSERT',
           id_venta,
           SYSTEM_USER,
           CONCAT('Producto agregado a venta. ID Prod: ', id_producto, '. Cantidad: ', cantidad, N'. Precio Histórico: $',
                  precio_historico)
    FROM inserted;
END;
GO

-- 6. PRUEBA DE FUNCIONAMIENTO
INSERT INTO producto (nombre, precio_actual, stock_actual, id_categoria, id_proveedor)
VALUES ('Prueba Auditoria', 10.50, 100, 1, 1);

-- Actualizamos el producto
UPDATE producto
SET precio_actual = 12.00
WHERE nombre = 'Prueba Auditoria';

-- Verificamos la auditoría
SELECT *
FROM auditoria
ORDER BY fecha DESC;
GO