# logF-auth_service

Servicio de identidad para LogFood, enfocado exclusivamente en autenticación y autorización.

## Alcance implementado

- Registro de usuarios con contraseñas hasheadas con `bcrypt`.
- Verificación de correo previa al login.
- Login y emisión de JWT de acceso.
- Refresh tokens con rotación y revocación.
- Logout mediante revocación de refresh token.
- Roles y permisos (RBAC) con guards (`authGuard` y `rbacGuard`).
- Recuperación de contraseña por token temporal.
- Auditoría de accesos en memoria.

## Roles iniciales

- ADMIN
- GERENTE
- ENCARGADO
- ALMACEN
- COCINA
- CAJERO

## Seguridad aplicada (OWASP)

- `helmet` para cabeceras seguras.
- Rate limit en rutas de autenticación.
- Validación básica de fortaleza de contraseña.
- Errores de autenticación genéricos para credenciales inválidas.
- Tokens de verificación y reset almacenados como hash SHA-256.

## Ejecución

```bash
npm install
npm test
node src/server.js
```

## Base de datos

Se incluye esquema de referencia en `db/auth_db.schema.sql` para `auth_db` con entidades:

- User
- Role
- Permission
- RefreshToken

## Fuera de alcance

Este servicio no implementa inventario, ventas, productos ni reportes.
