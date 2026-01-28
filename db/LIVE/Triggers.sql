USE papeleria;
GO

-- 1. REPLICACIÓN DE CLIENTES
CREATE OR ALTER TRIGGER trg_repl_cliente_insert_update
    ON cliente
    AFTER INSERT, UPDATE
    AS
BEGIN
    SET NOCOUNT ON;

    -- A. SI ES UNA INSERCIÓN
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
        BEGIN
            -- Permitir insertar IDs manuales en la backup
            SET IDENTITY_INSERT papeleria_backup_live.dbo.cliente ON;

            INSERT INTO papeleria_backup_live.dbo.cliente (id_cliente, nombre, apellido, email, telefono)
            SELECT id_cliente, nombre, apellido, email, telefono
            FROM inserted;

            SET IDENTITY_INSERT papeleria_backup_live.dbo.cliente OFF;
        END

    -- B. SI ES UNA ACTUALIZACIÓN
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
        BEGIN
            UPDATE b
            SET b.nombre   = i.nombre,
                b.apellido = i.apellido,
                b.email    = i.email,
                b.telefono = i.telefono
            FROM papeleria_backup_live.dbo.cliente b
                     INNER JOIN inserted i ON b.id_cliente = i.id_cliente;
        END
END;
GO

-- 2. REPLICACIÓN DE PRODUCTOS (Inventario)
CREATE OR ALTER TRIGGER trg_repl_producto_insert_update
    ON producto
    AFTER INSERT, UPDATE
    AS
BEGIN
    SET NOCOUNT ON;

    -- A. INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
        BEGIN
            SET IDENTITY_INSERT papeleria_backup_live.dbo.producto ON;

            INSERT INTO papeleria_backup_live.dbo.producto
            (id_producto, codigo_barras, nombre, precio_actual, stock_actual, id_categoria, id_proveedor)
            SELECT id_producto, codigo_barras, nombre, precio_actual, stock_actual, id_categoria, id_proveedor
            FROM inserted;

            SET IDENTITY_INSERT papeleria_backup_live.dbo.producto OFF;
        END

    -- B. UPDATE (Ej: Cuando baja el stock por una venta)
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
        BEGIN
            UPDATE b
            SET b.stock_actual  = i.stock_actual,
                b.precio_actual = i.precio_actual,
                b.nombre        = i.nombre
            FROM papeleria_backup_live.dbo.producto b
                     INNER JOIN inserted i ON b.id_producto = i.id_producto;
        END
END;
GO

-- 3. REPLICACIÓN DE VENTA (Cabecera)
CREATE OR ALTER TRIGGER trg_repl_venta_insert_update
    ON venta
    AFTER INSERT, UPDATE
    AS
BEGIN
    SET NOCOUNT ON;

    -- A. INSERT (Nueva venta)
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
        BEGIN
            SET IDENTITY_INSERT papeleria_backup_live.dbo.venta ON;

            INSERT INTO papeleria_backup_live.dbo.venta
            (id_venta, codigo_factura, fecha, id_cliente, id_empleado, id_forma_pago, id_estado)
            SELECT id_venta, codigo_factura, fecha, id_cliente, id_empleado, id_forma_pago, id_estado
            FROM inserted;

            SET IDENTITY_INSERT papeleria_backup_live.dbo.venta OFF;
        END

    -- B. UPDATE (Cambio de estado)
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
        BEGIN
            UPDATE b
            SET b.id_estado = i.id_estado
            FROM papeleria_backup_live.dbo.venta b
                     INNER JOIN inserted i ON b.id_venta = i.id_venta;
        END
END;
GO

-- 4. REPLICACIÓN DE DETALLE_VENTA
CREATE OR ALTER TRIGGER trg_repl_detalle_insert
    ON detalle_venta
    AFTER INSERT
    AS
BEGIN
    SET NOCOUNT ON;

    -- Solo nos interesa el INSERT (rara vez se actualiza un detalle, se borra y se crea)
    SET IDENTITY_INSERT papeleria_backup_live.dbo.detalle_venta ON;

    INSERT INTO papeleria_backup_live.dbo.detalle_venta
        (id_detalle, id_venta, id_producto, cantidad, precio_historico)
    SELECT id_detalle, id_venta, id_producto, cantidad, precio_historico
    FROM inserted;

    SET IDENTITY_INSERT papeleria_backup_live.dbo.detalle_venta OFF;
END;
GO