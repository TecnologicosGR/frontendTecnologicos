# Documentación Detallada de la API - Tecnológicos GR

Esta documentación técnica detalla los payloads de entrada y salida para la integración del Frontend.

**Base URL**: `http://localhost:8000/api/v1`

**Nota sobre Seguridad**:

- Casi todos los endpoints requieren Header `Authorization: Bearer <token>`.
- Los roles principales son: **SUPERADMIN**, **ADMIN**, **EMPLEADO**, **CLIENTE**.
- En esta guía se especifica el nivel de acceso requerido para cada módulo.

---

## 1. Módulo de Autenticación y Seguridad (`/auth`, `/roles`)

Gestión de identidades, registro de usuarios y control de acceso (RBAC).

### 1.1 Autenticación (`/auth`)

#### Iniciar Sesión

`POST /auth/login`

- **Acceso**: Público.
- **Body (Form Data/JSON)**:
  - `username` (str): Email del usuario.
  - `password` (str): Contraseña.
- **Response (200 JSON)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer"
  }
  ```

#### Registro de Clientes (Público)

`POST /auth/register/client`

- **Acceso**: Público.
- **Body (JSON)**:
  ```json
  {
    "email": "cliente@example.com",
    "password": "Password123!",
    "documento_identidad": "10203040",
    "nombres": "Juan",
    "apellidos": "Perez",
    "telefono": "3001234567",
    "direccion": "Calle 10 # 5-20"
  }
  ```
- **Response (200 JSON)**:
  ```json
  {
    "id": 5,
    "id_usuario": 12,
    "nombres": "Juan",
    "apellidos": "Perez",
    "email": "cliente@example.com"
  }
  ```

#### Registro de Empleados/Admins (Privado)

`POST /auth/register/employee`

- **Acceso**: Roles ADMIN, SUPERADMIN.
- **Requiere**: Rol ADMIN o SUPERADMIN.
- **Body (JSON)**:
  ```json
  {
    "email": "vendedor@empresa.com",
    "password": "SecurePass_123",
    "activo": true,
    "id_rol": 2 // ID del rol (ej: 2=EMPLEADO, 3=ADMIN)
  }
  ```
- **Response (200 JSON)**: Objeto `UserResponse` con ID y fecha de creación.

---

### 1.2 Gestión de Roles y Permisos (`/roles`)

- **Acceso Global Módulo**: Solo **ADMIN**, **SUPERADMIN**.

_Todas las operaciones requieren Rol ADMIN o SUPERADMIN._

#### Listar Roles

`GET /roles/`

- **Response (200 JSON)**:
  ```json
  [
    {
      "id": 1,
      "nombre": "SUPERADMIN",
      "descripcion": "Acceso total al sistema"
    },
    {
      "id": 2,
      "nombre": "CLIENTE",
      "descripcion": "Usuario comprador"
    }
  ]
  ```

#### Crear Rol

`POST /roles/`

- **Body (JSON)**:
  ```json
  {
    "nombre": "LOGISTICA",
    "descripcion": "Encargado de envíos e inventario"
  }
  ```

#### Detalle de Rol (con Permisos)

`GET /roles/{role_id}`

- **Response (200 JSON)**:
  ```json
  {
    "id": 3,
    "nombre": "LOGISTICA",
    "descripcion": "...",
    "permisos": [
      { "id": 10, "codigo": "VER_PRODUCTOS", "descripcion": "..." },
      { "id": 12, "codigo": "EDITAR_INVENTARIO", "descripcion": "..." }
    ]
  }
  ```

#### Actualizar Rol

`PUT /roles/{role_id}`

- **Body (JSON)**:
  ```json
  {
    "nombre": "LOGISTICA_AVANZADA", // Opcional
    "descripcion": "Nueva descripcion..." // Opcional
  }
  ```

#### Asignar Permiso a Rol

`POST /roles/{role_id}/permissions/{permission_id}`

- **Descripción**: Otorga una capacidad específica a un rol.
- **Response**: `true` o mensaje de éxito.

#### Revocar Permiso de Rol

`DELETE /roles/{role_id}/permissions/{permission_id}`

- **Descripción**: Quita una capacidad específica a un rol.

#### Listar Catálogo de Permisos

`GET /roles/permissions/list`

- **Descripción**: Muestra todos los permisos que _existen_ en el sistema (diccionario de capacidades técnicas).
- **Response**: Lista de permisos `{id, codigo, descripcion}`.

#### Consultar Permisos de un Usuario

`GET /roles/users/{user_id}/effective-permissions`

- **Descripción**: Útil para debugging. Muestra qué puede hacer un usuario específico según su rol actual.

---

## 2. Ventas y Carrito (`/cart`, `/sales`)

Este módulo soporta dos flujos: **Venta Autoservicio (Web)** y **Punto de Venta (POS)**.

### Ver Carrito

`GET /cart/`

- **Acceso**: Cualquier Usuario Autenticado (Usualmente CLIENTE).
- **Response**:
  ```json
  {
    "items": [
      {
        "id_producto": 10,
        "nombre_producto": "Mouse Gamer",
        "precio_unitario": 50.0,
        "cantidad": 2,
        "subtotal": 100.0,
        "stock_actual": 20
      }
    ],
    "total": 100.0
  }
  ```

### Agregar al Carrito

`POST /cart/add`

- **Acceso**: Cualquier Usuario Autenticado.
- **Body**:
  ```json
  {
    "id_producto": 10,
    "cantidad": 1
  }
  ```

### Eliminar Item del Carrito

`DELETE /cart/remove/{product_id}`

- **Descripción**: Elimina un producto específico del carrito del usuario.
- **Response**:
  ```json
  { "message": "Producto eliminado" }
  ```

### Vaciar Carrito

`DELETE /cart/clear`

- **Descripción**: Elimina todos los items del carrito.
- **Response**:
  ```json
  { "message": "Carrito vaciado" }
  ```

### Crear Venta (Facturación)

`POST /sales/`

- **Acceso**:
  - **POS**: Roles EMPLEADO, ADMIN, SUPERADMIN.
  - **Web Checkout**: Rol CLIENTE.
- **Uso POS (Empleado/Admin)**: Debe enviar `items`.
- **Uso Web (Cliente)**: Enviar `items: []`, el backend usará el carrito actual.
- **Body**:
  ```json
  {
    "id_cliente": 5, // Opcional (null para anónimo en POS)
    "metodo_pago": "Efectivo", // "Tarjeta", "Transferencia", "Efectivo"
    "observaciones": "Cliente pide garantía extendida",
    "items": [
      // SOLO REQUERIDO PARA POS
      {
        "id_producto": 10,
        "cantidad": 1,
        "precio_unitario_aplicado": 45.0 // Opcional, permite descuento manual
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "id": 105,
    "total": 45.0,
    "message": "Venta exitosa"
  }
  ```
- **Nota**: El PDF se genera automáticamente y el link se guarda en el historial.

### Historial de Ventas

`GET /sales/history`

- **Acceso**:
  - **ADMIN/EMPLEADO**: Ve ventas globales.
  - **CLIENTE**: Ve solo sus propias compras.
- **Response**: Lista de objetos `SaleResponse`.
  ```json
  [
    {
      "id": 105,
      "fecha_venta": "2023-10-27T10:00:00",
      "monto_total": 45.0,
      "url_factura_pdf": "https://storage.googleapis.com/...",
      "nombre_cliente": "Juan Perez",
      "nombre_empleado": "Admin Sistema"
    }
  ]
  ```

---

## 3. Finanzas (`/finance`)

### Cierre de Caja

`POST /finance/close-day`

- **Acceso**: Roles ADMIN, SUPERADMIN, EMPLEADO.
- **Body**:
  ```json
  {
    "fecha_cierre": "2023-10-27"
  }
  ```
- **Response**:
  ```json
  {
    "id": 12,
    "fecha_cierre": "2023-10-27",
    "total_ventas": 5000.0,
    "total_ganancias": 1200.0, // (Ventas - Costos Históricos)
    "total_efectivo": 3000.0,
    "total_transferencia": 2000.0,
    "total_otros": 0.0
  }
  ```

### Reporte Financiero

`GET /finance/report?start_date=2023-10-01&end_date=2023-10-31`

- **Acceso**: Roles ADMIN, SUPERADMIN.
- **Response**: Objeto `FinancialReport` con totales acumulados y lista de cierres.

---

## 4. Gestión de Inventario y Catálogo

Incluye productos, categorías, subcategorías, proveedores e importación masiva.

### 4.1 Productos (`/products`)

#### Listar Productos (Filtros)

`GET /products/`

- **Acceso**: Cualquier Usuario Autenticado.
- **Parámetros Query**:
  - `search` (str): Nombre o código.
  - `category_id` (int): Filtrar por categoría padre.
  - `subcategory_id` (int): Filtrar por subcategoría exacta.
  - `provider_id` (int): Filtrar por proveedor.
- **Response**: Lista de objetos `ProductoResponse`.
  ```json
  [
    {
      "id": 1,
      "codigo_referencia": "LAP-001",
      "nombre": "Laptop HP Pavilion",
      "precio_venta_normal": 1500.0,
      "existencias": 10,
      "nombre_categoria": "Computadores",
      "nombre_proveedor": "TecnoMayorista S.A."
    }
  ]
  ```

#### Detalle de Producto

`GET /products/{id}`

- **Response**: Objeto `ProductoResponse` completo.

#### Crear Producto

`POST /products/`

- **Acceso**: Roles ADMIN, SUPERADMIN.
- **Requiere**: Rol ADMIN/SUPERADMIN.
- **Body**:
  ```json
  {
    "codigo_referencia": "MOU-LOG-202",
    "nombre": "Mouse Logitech G203",
    "descripcion": "Mouse Gamer rgb",
    "id_subcategoria": 5,
    "id_proveedor": 2,
    "costo_compra": 15.0,
    "precio_venta_normal": 30.0,
    "precio_venta_tecnico": 25.0,
    "stock_minimo": 5,
    "existencias": 50,
    "meses_garantia": 6,
    "ubicacion_fisica": "Estante A2"
  }
  ```

#### Actualizar Producto

`PATCH /products/{id}`

- **Body**: Campos a actualizar (parcial).
  ```json
  {
    "precio_venta_normal": 32.0,
    "existencias": 48
  }
  ```

#### Eliminar Producto

`DELETE /products/{id}`

- **Response**: 204 No Content.

---

### 4.2 Categorías (`/categories`)

- **Crear/Editar/Eliminar**: Solo ADMIN, SUPERADMIN.
- **Listar**: Cualquier Usuario Autenticado.

#### Listar Categorías

`GET /categories/?search=...`

- **Response**:
  ```json
  [{ "id": 1, "nombre": "Computadores", "descripcion": "Laptops y Desktops" }]
  ```

#### Crear Categoría

`POST /categories/`

- **Body**:
  ```json
  { "nombre": "Accesorios", "descripcion": "Cables, mouse, teclados" }
  ```

#### Actualizar/Eliminar

- `PUT /categories/{id}`
- `DELETE /categories/{id}`

---

### 4.3 Subcategorías (`/subcategories`)

- **Crear/Editar/Eliminar**: Solo ADMIN, SUPERADMIN.
- **Listar**: Cualquier Usuario Autenticado.

#### Listar Subcategorías

`GET /subcategories/?search=...`

- **Response**:
  ```json
  [
    {
      "id": 5,
      "nombre": "Mouse",
      "id_categoria": 2,
      "nombre_categoria": "Accesorios"
    }
  ]
  ```

#### Crear Subcategoría

`POST /subcategories/`

- **Body**:
  ```json
  { "nombre": "Mouse", "id_categoria": 2 }
  ```

---

### 4.4 Proveedores (`/providers`)

- **Crear/Editar/Eliminar**: Solo ADMIN, SUPERADMIN.
- **Listar**: Cualquier Usuario Autenticado.

#### Listar Proveedores

`GET /providers/?search=...`

- **Response**:
  ```json
  [
    {
      "id": 1,
      "nombre_empresa": "Mayorista Global",
      "contacto_nombre": "Carlos Ruiz",
      "telefono": "3001112233"
    }
  ]
  ```

#### Crear Proveedor

`POST /providers/`

- **Body**:
  ```json
  {
    "nombre_empresa": "Samsung Colombia",
    "contacto_nombre": "Gerencia Ventas",
    "email": "ventas@samsung.com"
  }
  ```

---

### 4.5 Importación Masiva (`/import`)

- **Acceso Global**: Solo ADMIN, SUPERADMIN.

Endpoints para cargar inventario desde Excel depurado.

#### Validar Archivo (Simulacro)

`POST /import/products/clean-validate`

- **Body (Multipart)**: `file` (Excel .xlsx).
- **Descripción**: Verifica columnas y tipos de datos sin guardar nada.

#### Cargar Archivo (Ejecutar)

`POST /import/products/clean-upload`

- **Body (Multipart)**: `file` (Excel .xlsx).
- **Descripción**: Actualiza precios y sobrescribe stock de productos existentes (por código o nombre exacto) y crea los nuevos.
- **Acción Crítica**: Reemplaza el stock actual con el valor del Excel.

---

## 5. Servicios Técnicos (`/technical-services`)

## 5. Servicios Técnicos (Reparaciones)

Sistema de ticketing para gestionar reparaciones.

### 5.1 Gestión de Tickets (`/technical-services`)

#### Listar Tickets

`GET /technical-services/`

- **Acceso**: Cualquier Usuario Autenticado (ver sus propios tickets o todos según rol).
- **Filtros Query**: `status` (ej: 'Ingresado', 'En Reparación'), `client_id`.
- **Response**: Lista de `TechnicalServiceResponse`.

#### Crear Ticket (Recepción)

`POST /technical-services/`

- **Acceso**: Roles ADMIN, EMPLEADO, SUPERADMIN. (Recepción).
- **Body**:
  ```json
  {
    "id_cliente": 5,
    "tipo_dispositivo": "Smartphone",
    "marca_modelo": "iPhone 11",
    "numero_serie": "XYZ123",
    "contrasena_sistema": "1234",
    "cables_accesorios": "Funda y cargador",
    "estado_fisico_entrada": "Pantalla rota, enciende",
    "fecha_estimada_salida": "2023-10-30"
  }
  ```
- **Response**: Incluye `token_rastreo` y `url_rastreo` pública.

#### Detalle de Ticket

`GET /technical-services/{id}`

- **Response**: Detalle completo del servicio.

#### Subir Evidencia (Fotos)

`POST /technical-services/{id}/evidence`

- **Form Data**:
  - `files`: Lista de archivos (imágenes).
- **Response**: `["https://storage...foto1.jpg", "https://...foto2.jpg"]`

#### Actualizar Estado (Log)

`PATCH /technical-services/{id}/status`

- **Acceso**: Roles ADMIN, EMPLEADO, SUPERADMIN.
- **Body**:
  ```json
  {
    "estado_nuevo": "Terminado",
    "mensaje_cliente": "Su equipo está listo",
    "notas_internas": "Se cambió display y batería"
  }
  ```

---

### 5.2 Rastreo Público (`/technical-services/tracking`)

- **Acceso**: Público (Sin Token).

Endpoints públicos para que el cliente consulte su estado sin login.

#### Consultar por Token

`GET /technical-services/tracking/{token_uuid}`

- **Response**: Estado actual, fechas y detalles básicos (sin datos sensibles).

#### Historial de Cambios Público

`GET /technical-services/tracking/{token_uuid}/logs`

- **Response**: Lista de eventos visibles para cliente.

---

### 5.3 Catálogo de Servicios (`/service-catalog`)

- **Crear/Editar**: Solo ADMIN, SUPERADMIN.
- **Listar**: Todo Autenticado.

Tipos de servicios predefinidos (ej: Formateo, Cambio Pantalla).

#### Listar Catálogo

`GET /service-catalog/?active_only=true`

- **Response**:
  ```json
  [{ "id": 1, "nombre_servicio": "Formateo Windows", "precio_sugerido": 50.0 }]
  ```

#### Crear Item de Catálogo

`POST /service-catalog/`

- **Body**: `{ "nombre_servicio": "Limpieza", "precio_sugerido": 20.0 }`

---

### 5.4 Servicios Aplicados (`/applied-services`)

- **Gestión**: Roles ADMIN, EMPLEADO, SUPERADMIN.

Items de mano de obra agregados a un ticket.

#### Agregar Servicio a Ticket

`POST /applied-services/`

- **Body**:
  ```json
  {
    "id_servicio": 105, // ID del Ticket
    "id_tipo_servicio": 1, // ID del item del catálogo
    "precio_cobrado": 45.0,
    "observacion_tecnica": "Desc. por cliente frecuente"
  }
  ```

#### Listar Servicios de un Ticket

`GET /applied-services/{service_id}`

- **Response**: Lista de items cobrados en esa reparación.

---

### 5.5 Bitácora Interna (`/service-logs`)

`GET /service-logs/{service_id}`

- **Descripcion**: Muestra todo el historial de cambios de estado y notas internas.

---

## 6. Gestión de Personas (`/clients`, `/employees`)

Módulos de CRM (Clientes) y RRHH (Empleados).

### 6.1 Clientes (`/clients`)

#### Listar Clientes (Búsqueda)

`GET /clients/?search=Juan`

- **Acceso**: Todo Usuario Autenticado (Para seleccionar en venta/ticket).
- **Parámetros**: `search` (Opcional, busca por nombre o documento).
- **Response**:
  ```json
  [
    {
      "id": 5,
      "documento_identidad": "1098765432",
      "nombres": "Juan",
      "apellidos": "Perez",
      "email": "juan@example.com"
    }
  ]
  ```

#### Detalle de Cliente

`GET /clients/{id}`

- **Response**: Objeto `ClientResponseFull`.

#### Actualizar Cliente

`PUT /clients/{id}`

- **Acceso**: Roles ADMIN, EMPLEADO, SUPERADMIN. (Y el propio cliente si se implementase perfil).
- **Body**:
  ```json
  {
    "telefono": "3009998877",
    "direccion": "Nueva Dirección 123"
  }
  ```

### 6.2 Empleados (`/employees`)

_Protegido: Solo ADMIN/SUPERADMIN._

#### Listar Empleados

`GET /employees/?active_only=true`

- **Acceso**: Solo ADMIN, SUPERADMIN.
- **Response**:
  ```json
  [
    {
      "id": 2,
      "nombres": "Carlos",
      "apellidos": "Vendedor",
      "cargo": "Asesor Comercial",
      "email": "carlos@empresa.com",
      "nombre_rol": "EMPLEADO"
    }
  ]
  ```

#### Crear Empleado

`POST /employees/`

- **Nota**: Este endpoint crea tanto el registro en `empleados` como su usuario de acceso.
- **Body**:
  ```json
  {
    "documento_identidad": "77889900",
    "nombres": "Ana",
    "apellidos": "Lopez",
    "cargo": "Técnico",
    "email": "ana@empresa.com",
    "password": "Password123",
    "id_rol": 2
  }
  ```

#### Actualizar Empleado

`PUT /employees/{id}`

- **Body**:
  ```json
  {
    "cargo": "Jefe de Taller",
    "activo": true
  }
  ```

---

## 7. Auditoría (`/audit`)

- **Acceso Global**: Solo **ADMIN**, **SUPERADMIN**.

_Protegido: Solo ADMIN/SUPERADMIN._

### Listar Logs de Auditoría

`GET /audit/`

- **Parámetros Query**:
  - `table` (str, opcional): Filtrar por nombre de tabla (ej: `ventas`, `productos`).
  - `user_id` (int, opcional): Filtrar por usuario que realizó la acción.
  - `limit` (int, default=100): Límite de resultados.
- **Response**:
  ```json
  [
    {
      "id": 1500,
      "tabla_afectada": "productos",
      "id_registro": "1",
      "accion": "UPDATE",
      "datos_anteriores": {
        "precio_venta_normal": 1500.0,
        "existencias": 5
      },
      "datos_nuevos": {
        "precio_venta_normal": 1400.0,
        "existencias": 5
      },
      "id_usuario": 2,
      "nombre_usuario": "Carlos Vendedor",
      "fecha_evento": "2023-10-27T14:30:00"
    }
  ]
  ```
