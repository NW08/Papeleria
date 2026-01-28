# 📚 Sistema Integral de Gestión de Papelería

![Estado](https://img.shields.io/badge/Estado-Producción-2c3e50?style=flat-square)
![PHP](https://img.shields.io/badge/Backend-PHP_8.2-777BB4?style=flat-square)
![SQL Server](https://img.shields.io/badge/Database-SQL_Server-CC2927?style=flat-square)

Un sistema robusto y escalable diseñado para la administración completa de una papelería. El proyecto combina una arquitectura de base de
datos de alta seguridad con una aplicación web, garantizando integridad transaccional, auditoría y una experiencia de usuario fluida.

---

## 📺 Demo del Proyecto

Mira el funcionamiento del sistema, la arquitectura de seguridad y el flujo de ventas en el siguiente video:

[![Video Demo del Sistema](https://img.youtube.com/vi/CN9VLUE0Tww/maxresdefault.jpg)](https://www.youtube.com/watch?v=CN9VLUE0Tww)

> *Haz clic en la imagen para ver la demostración.*

---

## 🚀 Características Principales

### 🛡️ Base de Datos & Seguridad (SQL Server)

* **Modelo Normalizado (3NF):** Esquema relacional optimizado para eliminar redundancias y garantizar integridad referencial.
* **Seguridad RBAC:** Control de acceso basado en roles (`Administrador`, `Vendedor`, `Asistente`, `Cliente`) con principio de mínimo
  privilegio.
* **Criptografía Avanzada:**
    * **Datos Sensibles:** Cifrado de emails de clientes con **AES-256** (Symmetric Keys & Certificates).
    * **Contraseñas:** Hashing criptográfico con **SHA-256**.
* **Auditoría y Trazabilidad:** Triggers automáticos para monitorear cambios en precios, stock y logins fallidos.
* **Alta Disponibilidad (Live Mirror):** Sistema de replicación en tiempo real resistente a borrados accidentales.

### 💻 Aplicación Web (PHP Moderno)

* **Arquitectura Limpia:** Uso de POO, Patrón Singleton para DB y estructura modular.
* **Interactividad AJAX:** Carga de detalles de venta, búsqueda de productos y actualizaciones de inventario sin recargar la página (
  Fetch
  API).
* **Ventas Transaccionales:** Procesamiento atómico de facturas complejas.

---

## 🛠️ Stack Tecnológico

| Capa              | Tecnología              | Detalles                                            |
|:------------------|:------------------------|:----------------------------------------------------|
| **Backend**       | PHP 8.2+                | Strict Types, PDO Driver, Composer                  |
| **Base de Datos** | SQL Server 2019/2022    | T-SQL, Stored Procedures, Triggers, Encryption      |
| **Frontend**      | HTML5, CSS3, JS Vanilla | Variables CSS, Flexbox/Grid, sin frameworks pesados |
| **Herramientas**  | Git, Composer           | Control de versiones y gestión de dependencias      |

---

## 📂 Estructura del Proyecto

```text
/
├── src/
│   ├── api/                 # Endpoints JSON para consumo AJAX
│   ├── auth/                # Lógica de Login/Logout y Sesiones
│   ├── config/              # Configuración de base de datos (Singleton)
│   ├── modules/             # Módulos: Ventas, Compras, Inventario
│   └── templates/           # Componentes reutilizables (Sidebar, Modals)
├── sql/
│   ├── 1. Estructura_Base.sql
│   ├── 2. Esquema_Normalizado_3NF.sql
│   ├── 3. Seguridad_Roles_y_Usuarios.sql
│   └── 4. Auditoria_y_Triggers.sql
├── public/                  # Assets (CSS, JS, Imágenes)
├── vendor/                  # Dependencias de Composer
├── .env.example             # Plantilla de variables de entorno
└── index.php                # Punto de entrada

```

---

## ⚙️ Instalación y Despliegue

### 1. Requisitos Previos

* PHP 8.0 o superior (con extensión `pdo_sqlsrv` habilitada).
* SQL Server 2019+.
* Composer.

### 2. Configuración de Base de Datos

Ejecuta los scripts ubicados en la carpeta `/sql` en el siguiente **orden estricto** para evitar errores de dependencia:

1. `2. Esquema_Normalizado_3NF.sql` (Crea tablas y relaciones).
2. `3. Seguridad_Roles_y_Usuarios.sql` (Configura encriptación y logins).
3. `4. Auditoria_y_Triggers.sql` (Activa el monitoreo).

### 3. Instalación del Aplicativo

```bash
# Clonar el repositorio
git clone [https://github.com/NW08/Papeleria.git](https://github.com/NW08/Papeleria.git)

# Instalar dependencias
composer install

# Configurar entorno
cp .env.example .env

```

### 4. Variables de Entorno (.env)

Configura tu conexión. Para producción, asegúrate de activar la encriptación SSL.

```ini
DB_HOST = localhost,1433
DB_NAME = papeleria_db
DB_USER = sa
DB_PASS = TuPasswordSeguro
DB_ENCRYPT = false  # Cambiar a true en producción

```

---

## 🔗 Enlaces de Producción

* **Sitio Web:** [Papeleria Web](https://proyectopapeleria.netlify.app/)
* **Servidor BD:** `https://backendpa-fberakfyghggddhk.westus3-01.azurewebsites.net/` (BDD - Azure)
* **BACKEND:** [Backend - PHP](https://github.com/Josselyn-Ayo/backend-papeleria.git)

---

## 🔐 Usuarios de Prueba (Seed Data)

Si has ejecutado los scripts de 'Datos Semilla', puedes acceder con:

| Rol               | Usuario         | Contraseña   | Permisos                     |
|-------------------|-----------------|--------------|------------------------------|
| **Administrador** | `admin_total`   | `Admin123!`  | Control Total + Auditoría    |
| **Vendedor**      | `vendedor_juan` | `Ventas2026` | Facturación y Clientes       |
| **Asistente**     | `asistente_ana` | `StockSafe`  | Solo Inventario (Sin ventas) |

> **Nota:** El sistema bloqueará el acceso tras 3 intentos fallidos (auditado en `auditoria_login`).

---

## ✒️ Autores

Este proyecto ha sido diseñado, desarrollado e implementado por:

* **Josué Ortiz** - *Arquitectura de Software & Backend*
* **Josselyn Ayo** - *Base de Datos & Seguridad*

---

### 🗝️ Credenciales - Acceso

| Rol                   | Usuario         | Contraseña   |
|-----------------------|-----------------|--------------|
| **🛡️ Administrador** | `administrador` | `hash_admin` |
| **💼 Vendedor**       | `vendedor`      | `hash_vend1` |
| **📁 Asistente**      | `asistente1`    | `hash_alm1`  |
| **👤 Cliente**        | `Daniela`       | `cliente3`   |

---
