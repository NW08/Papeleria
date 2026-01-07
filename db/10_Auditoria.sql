use papeleria;
-- creacion de la tabla auditoria
create table auditoria(
id_auditoria int identity(1,1) primary key,
table_afectada varchar(50) not null,
id_registro int,
operacion varchar(10) not null,
usuario varchar(50),
fecha datetime default getdate(),
detalle varchar(500)
);

-- TRIGGERS PARA PRODUCTOS
-- Trigger para insertar en Productos
go

create trigger trg_productos_insert
on producto
after insert
as
begin
		insert into auditoria (table_afectada,operacion, id_registro, usuario, detalle)
		select 'Producto', 'Insert', id_producto, SYSTEM_USER,
				'Producto agregado:' + nombre + ', Precio: ' + cast(precio as varchar(20))
		from inserted;
end;
go
go
--Trigger para update en Productos
create trigger trg_productos_update
on producto
after update
as 
begin
		insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
		select 'producto', 'update', i.id_producto, SYSTEM_USER,
		'Precio anterior:', cast(d.precio as varchar(20)) + 
		', Precio nuevo: ' + cast(i.precio as varchar(20))
		from inserted i
		join deleted d on i.id_producto = d.id_producto;
end;
go
-- Trigger para delete en productos
go
create trigger trg_prodcutos_delete
on producto after delete as
begin
insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'producto', 'DELETE', id_producto, SYSTEM_USER,
           'producto eliminado: ' + nombre
    from deleted;
end;
go
-- TRUGGERS PARA CLIENTES
-- Trigger para insert en Clientes
go
create trigger trg_clientes_insert
on cliente
after insert
as
begin
    insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'cliente', 'INSERT', id_cliente, SYSTEM_USER,
           'cliente agregado: ' + nombre + ', Email: ' + email
    from inserted;
end;
go

-- Trigger para UPDATE en Clientes
go
create trigger trg_clientes_update
on cliente
after update
as
begin
    insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'cliente', 'UPDATE', i.id_cliente, SYSTEM_USER,
           'Email anterior: ' + d.email + ', Email nuevo: ' + i.email
    from inserted i
    join deleted d on i.id_cliente = d.id_cliente;
end;
go
-- Trigger para DELETE en Clientes
create trigger trg_clientes_delete
on cliente
after delete
as
begin
    insert into Auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'Cliente', 'DELETE', id_cliente, SYSTEM_USER,
           'Cliente eliminado: ' + nombre
    from deleted;
end;
go

-- TRIGGERS PARA VENTAS
-- Trigger para INSERT en Ventas
go
create trigger trg_ventas_insert
on venta
after insert
as
begin
    insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'venta', 'INSERT', id_venta, SYSTEM_USER,
           'Venta registrada: ClienteID=' + CAST(id_cliente as varchar(10)) + 
           ', Total=' + CAST(total as varchar(20))
    from inserted;
end;
go
-- Trigger para UPDATE en Ventas
go
create trigger trg_ventas_update
on venta
after UPDATE
as
begin
    insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'venta', 'UPDATE', i.id_venta, SYSTEM_USER,
           'Total anterior: ' + CAST(d.total as varchar(20)) +
           ', Total nuevo: ' + CAST(i.total as varchar(20))
    from inserted i
    join deleted d on i.id_venta = d.id_venta;
end;
GO

-- Trigger para DELETE en Ventas
go
create trigger trg_ventas_delete
on venta
after delete
as
begin
    insert into auditoria (table_afectada, operacion, id_registro, usuario, detalle)
    select 'venta', 'DELETE', id_venta, SYSTEM_USER,
           'Venta eliminada: ClienteID=' + CAST(id_cliente as varchar(10)) +
           ', Total=' + CAST(total as varchar(20))
    from deleted;
end;
go