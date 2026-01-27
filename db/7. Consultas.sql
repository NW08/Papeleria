-- Selecciones Simples / Condiciones
-- A. Listar productos con stock crítico (menos de 10 unidades)
SELECT nombre, codigo_barras, stock_actual
FROM producto
WHERE stock_actual < 10;


-- B. Listar empleados que son del cargo 'Vendedor' (Asumiendo que id_cargo 2 es Vendedor)
-- O filtrando por salario si no sabemos el ID exacto
SELECT nombre, apellido, email
FROM empleado
WHERE id_cargo = 2;
-- Ajusta el ID según tus datos


-- JOIN entre tablas
-- Catálogo de productos
SELECT p.codigo_barras,
       p.nombre            AS Producto,
       c.nombre            AS Categoria,
       prov.nombre_empresa AS Proveedor,
       p.precio_actual
FROM producto p
         INNER JOIN categoria c ON p.id_categoria = c.id_categoria
         INNER JOIN proveedor prov ON p.id_proveedor = prov.id_proveedor;


-- Detalle de ventas
SELECT v.codigo_factura,
       v.fecha,
       CONCAT(cli.nombre, ' ', cli.apellido) AS Cliente,
       emp.nombre                            AS Vendedor,
       est.nombre                            AS Estado_Venta
FROM venta v
         INNER JOIN cliente cli ON v.id_cliente = cli.id_cliente
         INNER JOIN empleado emp ON v.id_empleado = emp.id_empleado
         INNER JOIN estado_venta est ON v.id_estado = est.id_estado;


-- Factura Detallada
SELECT v.codigo_factura,
       p.nombre                            AS Producto,
       dv.cantidad,
       dv.precio_historico,
       (dv.cantidad * dv.precio_historico) AS Subtotal_Linea
FROM detalle_venta dv
         INNER JOIN venta v ON dv.id_venta = v.id_venta
         INNER JOIN producto p ON dv.id_producto = p.id_producto
WHERE v.codigo_factura = 'FAC-20260127-1234';
-- Ejemplo de filtro


-- Empleados / Credenciales
SELECT e.nombre,
       e.apellido,
       c.nombre AS Cargo,
       u.username
FROM empleado e
         INNER JOIN cargo c ON e.id_cargo = c.id_cargo
         LEFT JOIN usuario u ON e.id_usuario = u.id_usuario;


-- Compras / Proveedores
SELECT c.numero_orden,
       c.fecha,
       p.nombre_empresa AS Proveedor,
       e.nombre         AS Comprador_Empleado
FROM compra c
         INNER JOIN proveedor p ON c.id_proveedor = p.id_proveedor
         INNER JOIN empleado e ON c.id_empleado = e.id_empleado;


-- Auditoría Seguridad
SELECT u.username,
       u.fecha_registro,
       r.nombre AS Rol_Asignado,
       r.descripcion
FROM usuario u
         INNER JOIN rol r ON u.id_rol = r.id_rol;


-- Funciones de agregación
-- A. Calcular el total vendido por cada Venta (SUM)
SELECT v.codigo_factura,
       SUM(dv.cantidad * dv.precio_historico) AS Total_Venta
FROM venta v
         JOIN detalle_venta dv ON v.id_venta = dv.id_venta
GROUP BY v.codigo_factura, v.id_venta;


-- B. Contar cuántos productos tenemos por Categoría (COUNT)
SELECT c.nombre             AS Categoria,
       COUNT(p.id_producto) AS Cantidad_Productos
FROM categoria c
         LEFT JOIN producto p ON c.id_categoria = p.id_categoria
GROUP BY c.nombre;

-- C. Precio promedio de los productos en inventario (AVG)
SELECT AVG(precio_actual) AS Precio_Promedio_Global
FROM producto;


-- Función de Cadena
SELECT
    -- 1. CONCAT: Unir nombre y apellido
    CONCAT(nombre, ' ', apellido)                           AS Nombre_Completo,

    -- 2. UPPER: Convertir email a mayúsculas
    UPPER(email)                                            AS Email_Mayusculas,

    -- 3. LEFT/SUBSTRING: Obtener solo la inicial del nombre para un código
    CONCAT(LEFT(nombre, 1), LEFT(apellido, 1), id_empleado) AS Codigo_Interno
FROM empleado;


-- Sub consultas & Vistas
-- Productos > Promedio
SELECT nombre, precio_actual
FROM producto
WHERE precio_actual > (SELECT AVG(precio_actual) FROM producto);


-- Clientes sin comprar algo aún
SELECT nombre, apellido
FROM cliente c
WHERE NOT EXISTS (SELECT 1 FROM venta v WHERE v.id_cliente = c.id_cliente);


-- Reporte General
CREATE VIEW vw_ventas_resumen AS
SELECT v.codigo_factura,
       v.fecha,
       c.nombre                               AS Cliente,
       SUM(dv.cantidad * dv.precio_historico) AS Monto_Total
FROM venta v
         JOIN cliente c ON v.id_cliente = c.id_cliente
         JOIN detalle_venta dv ON v.id_venta = dv.id_venta
GROUP BY v.codigo_factura, v.fecha, c.nombre;
GO

-- Uso de la vista:
SELECT *
FROM vw_ventas_resumen
WHERE Monto_Total > 500;

