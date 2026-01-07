use papeleria;
-- SUBCONSULTAS 
select nombre from producto
where precio > (select avg(precio) from producto);

--Clientes que han realizado al menos una compra
select nombre from cliente where id_cliente in(select id_cliente from venta);

-- Productos que han sido vendidos
select nombre from producto where id_producto in (select id_producto from detalle_venta);

--Empleado que han realizado ventas
select nombre from empleado where id_empleado in (select id_empleado from venta);

--ventas con total mayor al promedio
select id_venta, total from venta where total >(select avg(total) from venta);

--Promedio con precio mayor al precio promedio
select nombre, precio from producto where precio >(select avg(precio) from producto);

-- Cliente que no han relaizado compras
select nombre from cliente where id_cliente not in(select id_cliente from venta);

--Productos que no se han vendido
select nombre from producto where id_producto not in(select id_producto from detalle_venta);

--VISTAS

create view vw_ventas_general as 
select v.id_venta, v.fecha, c.nombre as cliente, e.nombre as empleado,
v.subtotal, v.iva, v.total
from venta v
inner join cliente c on v.id_cliente= c.id_cliente
inner join empleado e on v.id_empleado = e.id_empleado;
select * from vw_ventas_general;

-- vista de detalle
create view vw_detalle_ventas as 
select v.id_venta, p.nombre as producto, dv.cantidad, dv.precio_unitario,
(dv.cantidad* dv.precio_unitario) as total_producto
from detalle_venta dv
inner join venta v on dv.id_venta = v.id_venta
inner join producto p on dv.id_producto = p.id_producto;
select*from vw_detalle_ventas;

-- vista de prodcutos con categoria y proovedor
create view vw_producto_info as 
select p.nombre as producto, c.nombre as categoria, pr.nombre as proveedor,
p.precio, p.stock
from producto p
inner join categoria c on p.id_categoria = c.id_categoria
inner join proovedor pr on p.id_proveedor = pr.id_proveedor;
select*from vw_producto_info;

-- vistas de clientes con numeros de compras 
create view vw_clientes_compras as
select c.nombre as cliente, count(v.id_venta) as total_compras
from cliente c
left join venta v
on c.id_cliente = v.id_cliente group by c.nombre;
select*from vw_clientes_compras;

-- vistas de venta por dia
create view vw_ventas_diarias as 
select cast(fecha as date) as fecha, 
sum(total) as total_dia
from venta 
group by cast(fecha as date);
select*from vw_ventas_diarias;

-- vistas de prodcutos con stock bajo 
create view vw_productos_stock_bajo as
select nombre, stock
from producto where stock <10;

select*from vw_productos_stock_bajo;
