# logf-auth-service

Identity and security management service for the LogFood platform.

## Description

NestJS-based authentication service responsible for managing users, roles, permissions, and refresh tokens. This service **does not implement login or JWT** yet — it provides the clean technical foundation for future authentication features.

## Tech Stack

- **NestJS** + **TypeScript**
- **PostgreSQL** via **TypeORM**
- **Swagger** for API documentation
- **class-validator** / **class-transformer** for validation
- **Jest** for testing
- **ESLint** + **Prettier** for code quality

## Project Structure

```
src/
├── common/              # Shared filters, interceptors
├── config/              # App and database configuration
├── database/            # TypeORM data source & migrations
└── modules/
    ├── auth/            # Auth module (placeholder for login/JWT)
    ├── users/           # User management
    ├── roles/           # Role management
    ├── permissions/     # Permission management
    └── refresh-tokens/  # Refresh token management
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create the database

```sql
CREATE DATABASE logf_auth;
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the service

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Swagger UI is available at:

```
http://localhost:3001/api/docs
```

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Database Migrations

```bash
# Generate a new migration (after modifying entities)
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## Entities

| Entity         | Table            | Description                          |
|----------------|------------------|--------------------------------------|
| `User`         | `users`          | Platform user accounts               |
| `Role`         | `roles`          | Access roles (e.g., ADMIN, MANAGER)  |
| `Permission`   | `permissions`    | Fine-grained access actions          |
| `RefreshToken` | `refresh_tokens` | Token rotation tracking              |

## Scope

This service **only** manages identity and security:

- ✅ User CRUD
- ✅ Role CRUD
- ✅ Permission CRUD
- ✅ Refresh token lifecycle
- ❌ Login / JWT (not yet implemented)
- ❌ Inventory, sales, or gastronomy features
