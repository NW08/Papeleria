-- CONSULTAS
use papeleria;
-- Consultas simples y con condicion

-- Listar todos los productos
select*from producto;
-- Listar todos los empleados
select*from empleado;
-- Listar todos los clientes
select*from cliente;
-- Listar todas las ventas 
select*from venta;
-- Listar todos los detalle_venta
select*from detalle_venta;
-- CONDICIÓN
-- Producto con precio mayor a 1
select nombre, precio from producto where precio >1;
-- Productos con stock mayor a 0 
select nombre, stock from producto where stock >0;
-- Clientes que tienen correo registrado
select nombre, email from cliente where email is not null;
-- Empleado con cargo vendedor
select nombre,cargo from empleado where cargo='vendedor';
-- venta con total mayor a $5
select id_venta, total from venta where total >5;
-- ventas realizadas hoy 
select id_venta, fecha from venta where cast(fecha as date) = cast(getdate() as date);

-- 	6 Joins entre múltiples tablas.
-- ventas con nombre del cliente
select c.nombre,v.id_venta, v.total,v.fecha
from venta v
join cliente c on v.id_cliente = c.id_cliente;

-- ventas realizadas por cada empleado
select v.id_venta, e.nombre as empleado, v.total
from venta v
inner join empleado e
on v.id_empleado = e.id_empleado;

--detalle de productos vendidos 
select v.id_venta, p.nombre as prodcuto, dv.cantidad, dv.precio_unitario
from detalle_venta dv
inner join venta v
on dv.id_venta = v.id_venta
inner join producto p 
on dv.id_producto = p.id_producto;

-- Productos con su categoria 
select p.nombre as prodcuto, c.nombre as categoria
from producto p
inner join categoria c
on p.id_categoria = c.id_categoria;

-- Producto con su proveedor
select p.nombre as producto, pr.nombre as proveedor
from producto p
inner join proovedor pr
on p.id_proveedor = pr.id_proveedor;

-- Ventas 
select v.id_venta, c.nombre as Cliente, e.nombre as Empleado, v.total
from venta v
inner join cliente c
on v.id_cliente = c.id_cliente
inner join empleado e
on v.id_empleado =e.id_empleado;

-- FUNCIONES DE AGREGACIÓN
-- Total de clientes
select count(*) as total_clientes from cliente;

--Total de ventas
select sum(total) as total_ventas from venta;

-- Cantidad total de ventas 
select count(id_venta) as numero_ventas from venta;

-- Total vendido por cada cliente
select c.nombre as Cliente, sum(v.total) as total_comprado 
from venta v
inner join cliente c
on v.id_cliente = c.id_cliente
group by c.nombre;

-- Numero de ventas realizas por empleados
select e.nombre as Empleado , count(v.id_venta) as ventas_realizadas
from empleado e
inner join venta v
on e.id_empleado = v.id_empleado
group by e.nombre;

-- precio promedio de los productos
select avg(precio) as precio_promedio
from producto;

-- Cantidad total de productos vendidos
select sum(dv.cantidad) as total_productos_vendidos
from detalle_venta dv;

-- Total vendidos por producto
select p.nombre as producto, sum(dv.cantidad * dv.precio_unitario) as total_vendido
from detalle_venta dv
inner join producto p
on dv.id_producto = p.id_producto
group by p.nombre;


--FUNCIONES DE CADENA
-- convertir nombres de clientes a Mayusculas
select upper(nombre) as cliente from cliente;
-- Convertir nombre de empleados a minusculas
select lower(nombre) as Empleado from empleado; 
-- Logitud del nombre de cada producto
select nombre, len(nombre) as longitud
from producto;
-- Concatenar nombre y telefono del cliente
select nombre + '-' + telefono as cliente_contacto from cliente;
-- Mostrar los primeros 4 caracteres del nombre del producto
select nombre, left(nombre, 4) as abreviatura from producto;
-- Mostrar los ultimos 3 caracteres del correo del cliente
select nombre, right(email,3) as dominio from cliente
where email is not null;
-- Reemplazar texto en el cargo del empleado 
select nombre, replace(cargo, 'Vendedor', 'Asesor') as cargo_modificado
from empleado;

