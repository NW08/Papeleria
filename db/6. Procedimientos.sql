USE papeleria;
GO

-- 1. REPORTE DE VENTAS (Con cálculo dinámico del Total)
CREATE OR ALTER PROCEDURE sp_reporte_ventas_fechas @fecha_inicio DATETIME,
                                                   @fecha_fin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- CTE para calcular los totales por venta primero
    WITH TotalesVenta AS (SELECT id_venta,
                                 SUM(cantidad * precio_historico) AS total_calculado
                          FROM detalle_venta
                          GROUP BY id_venta)
    SELECT v.codigo_factura,
           v.fecha,
           c.nombre + ' ' + c.apellido   AS cliente,
           e.nombre + ' ' + e.apellido   AS vendedor,
           ev.nombre                     AS estado,
           ISNULL(tv.total_calculado, 0) AS total_venta
    FROM venta v
             LEFT JOIN TotalesVenta tv ON v.id_venta = tv.id_venta
             INNER JOIN cliente c ON v.id_cliente = c.id_cliente
             INNER JOIN empleado e ON v.id_empleado = e.id_empleado
             INNER JOIN estado_venta ev ON v.id_estado = ev.id_estado
    WHERE v.fecha BETWEEN @fecha_inicio AND @fecha_fin
    ORDER BY v.fecha DESC;

    -- Resumen global
    SELECT COUNT(DISTINCT v.id_venta)                      as transacciones,
           ISNULL(SUM(d.cantidad * d.precio_historico), 0) as ingresos_totales
    FROM venta v
             INNER JOIN detalle_venta d ON v.id_venta = d.id_venta
    WHERE v.fecha BETWEEN @fecha_inicio AND @fecha_fin;
END;
GO

-- 2. ALERTA DE STOCK BAJO
CREATE OR ALTER PROCEDURE sp_alerta_stock_bajo @umbral_minimo INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT p.codigo_barras,
           p.nombre            AS producto,
           cat.nombre          AS categoria,
           prov.nombre_empresa AS proveedor,
           prov.telefono       AS contacto_proveedor,
           p.stock_actual,
           p.precio_actual
    FROM producto p
             INNER JOIN categoria cat ON p.id_categoria = cat.id_categoria
             INNER JOIN proveedor prov ON p.id_proveedor = prov.id_proveedor
    WHERE p.stock_actual <= @umbral_minimo
    ORDER BY p.stock_actual;
END;
GO

-- 3. ACTUALIZAR PRECIO
CREATE OR ALTER PROCEDURE sp_actualizar_precio @id_producto INT,
                                               @nuevo_precio DECIMAL(10, 2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM producto WHERE id_producto = @id_producto)
        BEGIN
            SELECT 'ERROR' AS Resultado, 'Producto no encontrado' AS Mensaje;
            RETURN;
        END

    UPDATE producto
    SET precio_actual = @nuevo_precio
    WHERE id_producto = @id_producto;

    SELECT 'EXITO' AS Resultado, 'Precio actualizado' AS Mensaje;
END;
GO

-- 4. INICIAR VENTA (Generación de Factura)
CREATE OR ALTER PROCEDURE sp_iniciar_venta @id_cliente INT,
                                           @id_empleado INT,
                                           @id_forma_pago INT,
                                           @id_venta_generado INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Generar un código de factura simple basado en fecha y un aleatorio para evitar error UNIQUE
    DECLARE @codigo_factura VARCHAR(20);
    SET @codigo_factura = 'FAC-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + RIGHT(CAST(RAND() AS VARCHAR), 4);

    -- Asumimos estado 1 = 'Iniciada' o 'Pendiente'
    DECLARE @id_estado_inicial INT = 1;

    BEGIN TRY
        INSERT INTO venta (codigo_factura, id_cliente, id_empleado, id_forma_pago, id_estado)
        VALUES (@codigo_factura, @id_cliente, @id_empleado, @id_forma_pago,
                @id_estado_inicial);

        SET @id_venta_generado = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        -- Si falla por el UNIQUE del código de factura (muy raro), reintentamos una vez con otro random
        SET @codigo_factura = 'FAC-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + RIGHT(CAST(RAND() AS VARCHAR), 4);
        INSERT INTO venta (codigo_factura, id_cliente, id_empleado, id_forma_pago, id_estado)
        VALUES (@codigo_factura, @id_cliente, @id_empleado, @id_forma_pago,
                @id_estado_inicial);

        SET @id_venta_generado = SCOPE_IDENTITY();
    END CATCH
END;
GO

-- 5. AGREGAR PRODUCTO A VENTA
CREATE OR ALTER PROCEDURE sp_agregar_producto_venta @id_venta INT,
                                                    @id_producto INT,
                                                    @cantidad INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @precio_actual DECIMAL(10, 2);
        DECLARE @stock_actual INT;

        -- 1. Obtener datos actuales del producto
        SELECT @precio_actual = precio_actual, @stock_actual = stock_actual
        FROM producto
        WHERE id_producto = @id_producto;

        -- 2. Validar Stock
        IF @stock_actual < @cantidad
            BEGIN
                ROLLBACK TRANSACTION;
                THROW 51000, 'Stock insuficiente.', 1;
            END

        -- 3. Insertar en detalle_venta usando 'precio_historico'
        INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_historico)
        VALUES (@id_venta, @id_producto, @cantidad, @precio_actual);

        -- 4. Descontar stock
        UPDATE producto
        SET stock_actual = stock_actual - @cantidad
        WHERE id_producto = @id_producto;

        COMMIT TRANSACTION;
        SELECT 'EXITO' as Estado, 'Producto agregado correctamente' as Mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SELECT 'ERROR' as Estado, ERROR_MESSAGE() as Mensaje;
    END CATCH
END;
GO

-- 6. TOP PRODUCTOS MÁS VENDIDOS
CREATE OR ALTER PROCEDURE sp_top_productos_vendidos @top_n INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@top_n) p.nombre                               AS producto,
                        cat.nombre                             AS categoria,
                        SUM(dv.cantidad)                       AS unidades_vendidas,
                        SUM(dv.cantidad * dv.precio_historico) AS total_generado
    FROM detalle_venta dv
             INNER JOIN producto p ON dv.id_producto = p.id_producto
             INNER JOIN categoria cat ON p.id_categoria = cat.id_categoria
    GROUP BY p.nombre, cat.nombre
    ORDER BY unidades_vendidas DESC;
END;
GO