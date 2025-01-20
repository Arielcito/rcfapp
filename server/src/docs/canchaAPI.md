# API de Canchas

## Endpoints

### Crear Cancha
- **Método:** POST
- **Ruta:** `/api/canchas`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Body:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "predioId": "string",
  "precio": "number"
}
```
- **Respuesta exitosa:** 201 Created
```json
{
  "id": "string",
  "nombre": "string",
  "descripcion": "string",
  "predioId": "string",
  "precio": "number"
}
```

### Obtener todas las Canchas
- **Método:** GET
- **Ruta:** `/api/canchas`
- **Autenticación:** No requerida
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "nombre": "string",
    "descripcion": "string",
    "predioId": "string",
    "precio": "number"
  }
]
```

### Obtener Cancha por ID
- **Método:** GET
- **Ruta:** `/api/canchas/:id`
- **Autenticación:** No requerida
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "nombre": "string",
  "descripcion": "string",
  "predioId": "string",
  "precio": "number"
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "Cancha not found"
}
```

### Obtener Canchas por Predio
- **Método:** GET
- **Ruta:** `/api/canchas/predio/:predioId`
- **Autenticación:** No requerida
- **Parámetros URL:** predioId (string)
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "nombre": "string",
    "descripcion": "string",
    "predioId": "string",
    "precio": "number"
  }
]
```

### Actualizar Cancha
- **Método:** PUT
- **Ruta:** `/api/canchas/:id`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Parámetros URL:** id (string)
- **Body:**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "precio": "number"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "nombre": "string",
  "descripcion": "string",
  "predioId": "string",
  "precio": "number"
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "Cancha not found"
}
```

### Eliminar Cancha
- **Método:** DELETE
- **Ruta:** `/api/canchas/:id`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 204 No Content

# API de Reservas

## Endpoints

### Obtener Todas las Reservas
- **Método:** GET
- **Ruta:** `/api/reservas`
- **Autenticación:** Requerida (Token)
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "fechaHora": "string",
      "duracion": "number",
      "canchaId": "string",
      "userId": "string",
      "estadoPago": "string",
      "metodoPago": "string"
    }
  ]
}
```

### Crear Reserva
- **Método:** POST
- **Ruta:** `/api/reservas`
- **Autenticación:** Requerida (Token)
- **Body:**
```json
{
  "fechaHora": "string",
  "duracion": "number",
  "canchaId": "string",
  "userId": "string"
}
```
- **Respuesta exitosa:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fechaHora": "string",
    "duracion": "number",
    "canchaId": "string",
    "userId": "string",
    "estadoPago": "string",
    "metodoPago": "string"
  }
}
```

### Verificar Disponibilidad
- **Método:** POST
- **Ruta:** `/api/reservas/check`
- **Autenticación:** Requerida (Token)
- **Body:**
```json
{
  "canchaId": "string",
  "fechaHora": "string",
  "duracion": "number"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": {
    "disponible": "boolean"
  }
}
```

### Obtener Horarios Disponibles
- **Método:** POST
- **Ruta:** `/api/reservas/available-times`
- **Autenticación:** Requerida (Token)
- **Body:**
```json
{
  "fecha": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": {
    "reservedTimes": ["string"]
  }
}
```

### Obtener Reservas por Usuario
- **Método:** GET
- **Ruta:** `/api/reservas/user/bookings`
- **Autenticación:** Requerida (Token)
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "appointmentId": "string",
    "place": {
      "name": "string",
      "description": "string",
      "imageUrl": "string",
      "telefono": "string"
    },
    "appointmentDate": "string",
    "appointmentTime": "string",
    "estado": "string",
    "metodoPago": "string"
  }
]
```

### Obtener Reservas por Dueño
- **Método:** GET
- **Ruta:** `/api/reservas/owner/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": "string",
      "place": {
        "name": "string",
        "description": "string",
        "imageUrl": "string",
        "telefono": "string"
      },
      "appointmentDate": "string",
      "appointmentTime": "string",
      "estado": "string",
      "metodoPago": "string"
    }
  ]
}
```

### Obtener Reservas por Fecha y Dueño
- **Método:** GET
- **Ruta:** `/api/reservas/owner/:date/:ownerId`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** 
  - date (string)
  - ownerId (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "fechaHora": "string",
      "duracion": "number",
      "canchaId": "string",
      "userId": "string"
    }
  ]
}
```

### Obtener Reserva por ID
- **Método:** GET
- **Ruta:** `/api/reservas/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fechaHora": "string",
    "duracion": "number",
    "canchaId": "string",
    "userId": "string"
  }
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "success": false,
  "error": "Reserva no encontrada"
}
```

### Actualizar Reserva
- **Método:** PUT
- **Ruta:** `/api/reservas/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Body:**
```json
{
  "fechaHora": "string",
  "duracion": "number",
  "estadoPago": "string",
  "metodoPago": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "string",
    "fechaHora": "string",
    "duracion": "number",
    "canchaId": "string",
    "userId": "string",
    "estadoPago": "string",
    "metodoPago": "string"
  }
}
```

# API de Usuarios

## Endpoints

### Registro de Usuario
- **Método:** POST
- **Ruta:** `/api/users/register`
- **Autenticación:** No requerida
- **Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```
- **Respuesta exitosa:** 201 Created
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Inicio de Sesión
- **Método:** POST
- **Ruta:** `/api/users/login`
- **Autenticación:** No requerida
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  },
  "token": "string"
}
```

### Cerrar Sesión
- **Método:** POST
- **Ruta:** `/api/users/logout`
- **Autenticación:** No requerida
- **Respuesta exitosa:** 200 OK
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

### Verificar Email
- **Método:** POST
- **Ruta:** `/api/users/check-email`
- **Autenticación:** No requerida
- **Body:**
```json
{
  "email": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "message": "Email disponible"
}
```
- **Respuesta error:** 400 Bad Request
```json
{
  "message": "Este email ya está registrado"
}
```

### Obtener Usuario Actual
- **Método:** GET
- **Ruta:** `/api/users/me`
- **Autenticación:** Requerida (Token)
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string"
}
```

### Crear Usuario (Admin)
- **Método:** POST
- **Ruta:** `/api/users`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "string"
}
```
- **Respuesta exitosa:** 201 Created
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string"
}
```

### Obtener Todos los Usuarios
- **Método:** GET
- **Ruta:** `/api/users`
- **Autenticación:** Requerida (Token)
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
]
```

### Obtener Usuario por ID
- **Método:** GET
- **Ruta:** `/api/users/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string"
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "User not found"
}
```

### Actualizar Usuario
- **Método:** PUT
- **Ruta:** `/api/users/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Body:**
```json
{
  "email": "string",
  "name": "string",
  "role": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string"
}
```

### Eliminar Usuario
- **Método:** DELETE
- **Ruta:** `/api/users/:id`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 204 No Content

### Obtener Predios por Usuario
- **Método:** GET
- **Ruta:** `/api/users/:id/predio`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "nombre": "string",
    "direccion": "string",
    "telefono": "string",
    "userId": "string"
  }
]
```

# API de Predios

## Endpoints

### Crear Predio
- **Método:** POST
- **Ruta:** `/api/predios`
- **Autenticación:** Requerida (Token)
- **Body:**
```json
{
  "nombre": "string",
  "direccion": "string",
  "telefono": "string",
  "userId": "string"
}
```
- **Respuesta exitosa:** 201 Created
```json
{
  "id": "string",
  "nombre": "string",
  "direccion": "string",
  "telefono": "string",
  "userId": "string"
}
```

### Obtener Todos los Predios
- **Método:** GET
- **Ruta:** `/api/predios`
- **Autenticación:** No requerida
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "nombre": "string",
    "direccion": "string",
    "telefono": "string",
    "userId": "string"
  }
]
```

### Obtener Predio por ID
- **Método:** GET
- **Ruta:** `/api/predios/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "nombre": "string",
  "direccion": "string",
  "telefono": "string",
  "userId": "string"
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "Predio not found"
}
```

### Obtener Predios por Usuario
- **Método:** GET
- **Ruta:** `/api/predios/usuario/:id`
- **Autenticación:** Requerida (Token)
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 200 OK
```json
[
  {
    "id": "string",
    "nombre": "string",
    "direccion": "string",
    "telefono": "string",
    "userId": "string"
  }
]
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "No se encontraron predios para este usuario"
}
```

### Actualizar Predio
- **Método:** PUT
- **Ruta:** `/api/predios/:id`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Parámetros URL:** id (string)
- **Body:**
```json
{
  "nombre": "string",
  "direccion": "string",
  "telefono": "string"
}
```
- **Respuesta exitosa:** 200 OK
```json
{
  "id": "string",
  "nombre": "string",
  "direccion": "string",
  "telefono": "string",
  "userId": "string"
}
```
- **Respuesta error:** 404 Not Found
```json
{
  "message": "Predio not found"
}
```

### Eliminar Predio
- **Método:** DELETE
- **Ruta:** `/api/predios/:id`
- **Autenticación:** Requerida (Token)
- **Roles permitidos:** ADMIN, OWNER
- **Parámetros URL:** id (string)
- **Respuesta exitosa:** 204 No Content