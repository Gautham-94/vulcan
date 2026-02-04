# Claude Code Context & Guidelines

This document provides context for Claude Code (or any AI assistant) to understand the project architecture, conventions, and guidelines when assisting with development tasks.

---

## Project Overview

**Project Type:** Node.js REST API with layered architecture
**Language:** TypeScript
**Framework:** Express.js
**Database:** PostgreSQL (via Docker)
**ORM:** Prisma 7.x
**Architecture Pattern:** Layered/Clean Architecture with DTOs
**Documentation:** Swagger/OpenAPI

---

## Core Architecture Principles

### 1. Layered Architecture (Strictly Enforced)

The application follows a **strict layered architecture** with clear separation of concerns:

```
Client → Routes → Controllers → DTOs → Services → Repositories → Database
```

**Key Rules:**
- Each layer only communicates with adjacent layers
- Never skip layers (e.g., Controller should NOT call Repository directly)
- Dependencies flow downward only
- Lower layers never depend on higher layers

### 2. Single Responsibility Principle

Each layer/file has ONE clear responsibility:
- **Routes:** Map URLs to controllers
- **Controllers:** Handle HTTP, map DTOs
- **DTOs:** Validate input, format output
- **Services:** Business logic and rules
- **Repositories:** Database access only
- **Models:** Domain entities with behavior (future use)

---

## Directory Structure & Conventions

```
src/
├── routes/              # Route definitions
│   └── *.routes.ts      # Naming: entity.routes.ts
├── controllers/         # HTTP request handlers
│   └── *.controller.ts  # Naming: entity.controller.ts
├── dto/                 # Data Transfer Objects
│   ├── request/         # Input validation & sanitization
│   │   └── *.request.dto.ts
│   ├── response/        # Output formatting & data exposure control
│   │   └── *.response.dto.ts
│   └── mapper/          # DTO ↔ Model conversion
│       └── *.mapper.ts
├── services/            # Business logic layer
│   └── *.service.ts     # Naming: entity.service.ts
├── repositories/        # Data access layer
│   └── *.repository.ts  # Naming: entity.repository.ts
├── models/              # Domain models (future use for rich domain logic)
│   └── *.ts
├── middleware/          # Express middleware
├── types/               # TypeScript types and interfaces
│   └── common.types.ts  # Common type definitions
├── config/              # Configuration files
│   ├── database.ts      # Prisma client setup
│   └── swagger.ts       # API documentation config
├── app.ts               # Express app setup
└── server.ts            # Server entry point

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations (auto-generated)

dist/                    # Compiled JavaScript (generated, not committed)
tsconfig.json            # TypeScript configuration
```

---

## When Creating New Endpoints/Features

Follow this **exact order** when creating new functionality:

### Step 1: Define Database Schema

**File:** `prisma/schema.prisma`

```prisma
model Employee {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  position  String
  department String
  salary    Decimal  @db.Decimal(10, 2)
  hireDate  DateTime @map("hire_date")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("employees")  // Table name in database
}
```

**Conventions:**
- Use PascalCase for model names
- Use camelCase for field names
- Use `@@map()` for custom table names (snake_case)
- Use `@map()` for custom column names (snake_case)
- Always include `createdAt` and `updatedAt` timestamps

**After schema changes, run:**
```bash
npm run db:migrate
```

---

### Step 2: Create Repository Layer

**File:** `src/repositories/entity.repository.ts`

**Template:**
```typescript
import { Entity, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { CreateEntityRequestDto, UpdateEntityRequestDto } from '../dto/request/entity.request.dto';

class EntityRepository {
  async findAll(): Promise<Entity[]> {
    return await prisma.entity.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number | string): Promise<Entity | null> {
    return await prisma.entity.findUnique({
      where: { id: parseInt(id.toString()) },
    });
  }

  async create(data: CreateEntityRequestDto): Promise<Entity> {
    return await prisma.entity.create({
      data: {
        field1: data.field1!,
        field2: data.field2!,
        // Map all required fields
      }
    });
  }

  async update(id: number | string, data: UpdateEntityRequestDto): Promise<Entity> {
    const updateData: Prisma.EntityUpdateInput = {};

    if (data.field1 !== undefined) updateData.field1 = data.field1;
    if (data.field2 !== undefined) updateData.field2 = data.field2;

    return await prisma.entity.update({
      where: { id: parseInt(id.toString()) },
      data: updateData,
    });
  }

  async delete(id: number | string): Promise<Entity> {
    return await prisma.entity.delete({
      where: { id: parseInt(id.toString()) },
    });
  }

  // Add custom query methods as needed
  async findByField(fieldValue: string): Promise<Entity[]> {
    return await prisma.entity.findMany({
      where: { field: fieldValue },
    });
  }
}

export default new EntityRepository();
```

**Repository Rules:**
- ✅ ONLY database operations
- ✅ Use Prisma Client
- ✅ Return raw Prisma models
- ❌ NO business logic
- ❌ NO validation
- ❌ NO HTTP concerns
- ❌ NO DTO mapping

---

### Step 3: Create DTOs

#### 3a. Request DTOs

**File:** `src/dto/request/entity.request.dto.ts`

**Template:**
```typescript
import { IRequestDto, IUpdateDto, ValidationResult } from '../../types/common.types';

/**
 * Interface for creating entity data
 */
interface CreateEntityData {
  field1?: string;
  field2?: string;
  field3?: number;
}

/**
 * CreateEntityRequestDto - Used for creating new entities
 * Contains validation logic and data sanitization
 */
export class CreateEntityRequestDto implements IRequestDto {
  field1?: string;
  field2?: string;
  field3?: number;

  constructor(data: CreateEntityData) {
    // Sanitize and assign
    this.field1 = data.field1?.trim();
    this.field2 = data.field2?.trim().toLowerCase();
    this.field3 = data.field3;
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.field1) {
      errors.push('Field1 is required');
    }

    if (this.field2 && !this.isValidFormat(this.field2)) {
      errors.push('Invalid field2 format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidFormat(value: string): boolean {
    // Validation logic
    return true;
  }
}

/**
 * UpdateEntityRequestDto - Used for updating existing entities
 * All fields are optional
 */
export class UpdateEntityRequestDto implements IUpdateDto {
  field1?: string;
  field2?: string;
  field3?: number;

  constructor(data: CreateEntityData) {
    // All fields optional
    if (data.field1 !== undefined) this.field1 = data.field1?.trim();
    if (data.field2 !== undefined) this.field2 = data.field2?.trim();
    if (data.field3 !== undefined) this.field3 = data.field3;
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    // Validate provided fields
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isEmpty(): boolean {
    return Object.keys(this).length === 0;
  }
}
```

**Request DTO Rules:**
- ✅ Validate all input
- ✅ Sanitize data (trim, lowercase, etc.)
- ✅ Provide meaningful error messages
- ✅ Type checking
- ❌ NO database access
- ❌ NO business logic (only input validation)

#### 3b. Response DTOs

**File:** `src/dto/response/entity.response.dto.ts`

**Template:**
```typescript
import { Entity } from '@prisma/client';

/**
 * EntityResponseDto - Used for returning entity data to clients
 * This DTO excludes internal fields and formats data appropriately
 */
export class EntityResponseDto {
  name: string;
  field1: string;
  field2: string;

  constructor(entity: Entity) {
    this.name = entity.name;
    this.field1 = entity.field1;
    this.field2 = entity.field2;
    // Exclude: id, sensitive fields
  }
}

/**
 * EntityDetailResponseDto - Used when returning detailed entity info (includes ID)
 */
export class EntityDetailResponseDto {
  id: number;
  name: string;
  field1: string;
  field2: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: Entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.field1 = entity.field1;
    this.field2 = entity.field2;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

/**
 * EntityListResponseDto - Minimal response for list views (excludes sensitive data)
 */
export class EntityListResponseDto {
  id: number;
  name: string;
  field1: string;

  constructor(entity: Entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.field1 = entity.field1;
    // Exclude: heavy fields, sensitive data
  }
}
```

**Response DTO Rules:**
- ✅ Control data exposure
- ✅ Hide sensitive information
- ✅ Format data appropriately
- ✅ Multiple DTOs for different use cases
- ✅ Transform types (e.g., Decimal → String)
- ❌ NO business logic

#### 3c. Mapper

**File:** `src/dto/mapper/entity.mapper.ts`

**Template:**
```typescript
import { Entity } from '@prisma/client';
import {
  EntityResponseDto,
  EntityDetailResponseDto,
  EntityListResponseDto,
} from '../response/entity.response.dto';

/**
 * EntityMapper - Utility class for mapping between domain models and DTOs
 * Follows the Single Responsibility Principle
 */
export class EntityMapper {
  static toResponseDto(entity: Entity | null): EntityResponseDto | null {
    if (!entity) return null;
    return new EntityResponseDto(entity);
  }

  static toDetailResponseDto(entity: Entity | null): EntityDetailResponseDto | null {
    if (!entity) return null;
    return new EntityDetailResponseDto(entity);
  }

  static toListResponseDto(entity: Entity | null): EntityListResponseDto | null {
    if (!entity) return null;
    return new EntityListResponseDto(entity);
  }

  static toResponseDtoArray(entities: Entity[]): EntityResponseDto[] {
    if (!Array.isArray(entities)) return [];
    return entities
      .map((entity) => this.toResponseDto(entity))
      .filter((dto): dto is EntityResponseDto => dto !== null);
  }

  static toDetailResponseDtoArray(entities: Entity[]): EntityDetailResponseDto[] {
    if (!Array.isArray(entities)) return [];
    return entities
      .map((entity) => this.toDetailResponseDto(entity))
      .filter((dto): dto is EntityDetailResponseDto => dto !== null);
  }

  static toListResponseDtoArray(entities: Entity[]): EntityListResponseDto[] {
    if (!Array.isArray(entities)) return [];
    return entities
      .map((entity) => this.toListResponseDto(entity))
      .filter((dto): dto is EntityListResponseDto => dto !== null);
  }
}
```

**Mapper Rules:**
- ✅ ONLY mapping logic
- ✅ Handle null/undefined
- ✅ Provide array mapping helpers
- ❌ NO business logic
- ❌ NO validation

---

### Step 4: Create Service Layer

**File:** `src/services/entity.service.js`

**Template:**
```javascript
const entityRepository = require('../repositories/entity.repository');
const { CreateEntityRequestDto, UpdateEntityRequestDto } = require('../dto/request/entity.request.dto');

class EntityService {
  async getAll() {
    return await entityRepository.findAll();
  }

  async getById(id) {
    const entity = await entityRepository.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    return entity;
  }

  async create(data) {
    // 1. Create and validate Request DTO
    const requestDto = new CreateEntityRequestDto(data);

    const validation = requestDto.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 2. Business rules
    const existing = await entityRepository.findByField(requestDto.field);
    if (existing) {
      throw new Error('Entity already exists');
    }

    // 3. Create entity
    return await entityRepository.create(requestDto);
  }

  async update(id, data) {
    // 1. Check existence
    const entity = await entityRepository.findById(id);
    if (!entity) {
      throw new Error('Entity not found');
    }

    // 2. Validate Request DTO
    const requestDto = new UpdateEntityRequestDto(data);

    const validation = requestDto.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    if (requestDto.isEmpty()) {
      throw new Error('No fields to update');
    }

    // 3. Business rules
    // Add business logic here

    // 4. Update
    return await entityRepository.update(id, requestDto);
  }

  async delete(id) {
    const entity = await entityRepository.findById(id);

    if (!entity) {
      throw new Error('Entity not found');
    }

    return await entityRepository.delete(id);
  }
}

module.exports = new EntityService();
```

**Service Rules:**
- ✅ ALL business logic goes here
- ✅ Use Request DTOs for validation
- ✅ Throw meaningful errors
- ✅ Orchestrate repository calls
- ✅ Transaction management (if needed)
- ❌ NO HTTP concerns (no req, res)
- ❌ NO direct database access (use repositories)
- ❌ NO DTO mapping (that's controller's job)

---

### Step 5: Create Controller Layer

**File:** `src/controllers/entity.controller.js`

**Template:**
```javascript
const entityService = require('../services/entity.service');
const EntityMapper = require('../dto/mapper/entity.mapper');

class EntityController {
  /**
   * @swagger
   * /api/entities:
   *   get:
   *     summary: Get all entities
   *     tags: [Entities]
   *     responses:
   *       200:
   *         description: List of entities
   *       500:
   *         description: Server error
   */
  async getAll(req, res) {
    try {
      const entities = await entityService.getAll();
      const entityDtos = EntityMapper.toListResponseDtoArray(entities);

      res.status(200).json({
        success: true,
        data: entityDtos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/entities/{id}:
   *   get:
   *     summary: Get entity by ID
   *     tags: [Entities]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Entity details
   *       404:
   *         description: Entity not found
   */
  async getById(req, res) {
    try {
      const entity = await entityService.getById(req.params.id);
      const entityDto = EntityMapper.toDetailResponseDto(entity);

      res.status(200).json({
        success: true,
        data: entityDto,
      });
    } catch (error) {
      const statusCode = error.message === 'Entity not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/entities:
   *   post:
   *     summary: Create new entity
   *     tags: [Entities]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - field1
   *               - field2
   *             properties:
   *               field1:
   *                 type: string
   *               field2:
   *                 type: string
   *     responses:
   *       201:
   *         description: Entity created
   *       400:
   *         description: Validation error
   */
  async create(req, res) {
    try {
      const entity = await entityService.create(req.body);
      const entityDto = EntityMapper.toDetailResponseDto(entity);

      res.status(201).json({
        success: true,
        data: entityDto,
      });
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/entities/{id}:
   *   put:
   *     summary: Update entity
   *     tags: [Entities]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Entity updated
   *       404:
   *         description: Entity not found
   */
  async update(req, res) {
    try {
      const entity = await entityService.update(req.params.id, req.body);
      const entityDto = EntityMapper.toDetailResponseDto(entity);

      res.status(200).json({
        success: true,
        data: entityDto,
      });
    } catch (error) {
      const statusCode = this.getStatusCode(error);
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * @swagger
   * /api/entities/{id}:
   *   delete:
   *     summary: Delete entity
   *     tags: [Entities]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Entity deleted
   *       404:
   *         description: Entity not found
   */
  async delete(req, res) {
    try {
      await entityService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Entity deleted successfully',
      });
    } catch (error) {
      const statusCode = error.message === 'Entity not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  getStatusCode(error) {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('required') ||
        error.message.includes('Invalid') ||
        error.message.includes('already exists') ||
        error.message.includes('must be')) {
      return 400;
    }
    return 500;
  }
}

module.exports = new EntityController();
```

**Controller Rules:**
- ✅ Handle HTTP request/response
- ✅ Call service methods
- ✅ Map responses using Mapper
- ✅ Return proper status codes
- ✅ Include Swagger documentation
- ✅ Consistent response format: `{ success, data/error }`
- ❌ NO business logic
- ❌ NO direct repository calls
- ❌ NO validation (use Request DTOs in service)

---

### Step 6: Create Routes

**File:** `src/routes/entity.routes.js`

**Template:**
```javascript
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entity.controller');

router.get('/', entityController.getAll.bind(entityController));
router.get('/:id', entityController.getById.bind(entityController));
router.post('/', entityController.create.bind(entityController));
router.put('/:id', entityController.update.bind(entityController));
router.delete('/:id', entityController.delete.bind(entityController));

module.exports = router;
```

**Route Rules:**
- ✅ Map HTTP methods to controller methods
- ✅ Use `.bind(controller)` to preserve context
- ✅ RESTful conventions
- ❌ NO business logic
- ❌ NO middleware (add separately if needed)

---

### Step 7: Register Routes

**File:** `src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const employeeRoutes = require('./employee.routes');
const entityRoutes = require('./entity.routes'); // Add this

router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/entities', entityRoutes); // Add this

module.exports = router;
```

---

### Step 8: Update Swagger Config

**File:** `src/config/swagger.js`

Add new tag:
```javascript
tags: [
  {
    name: 'Users',
    description: 'User management endpoints',
  },
  {
    name: 'Employees',
    description: 'Employee management endpoints',
  },
  {
    name: 'Entities', // Add this
    description: 'Entity management endpoints',
  },
  {
    name: 'Health',
    description: 'Health check endpoints',
  },
],
```

---

## Naming Conventions

### Files
- Routes: `entity.routes.js` (lowercase, plural optional)
- Controllers: `entity.controller.js` (lowercase, singular)
- Services: `entity.service.js` (lowercase, singular)
- Repositories: `entity.repository.js` (lowercase, singular)
- Request DTOs: `entity.request.dto.js`
- Response DTOs: `entity.response.dto.js`
- Mappers: `entity.mapper.js`

### Classes
- Controllers: `EntityController`
- Services: `EntityService`
- Repositories: `EntityRepository`
- Request DTOs: `CreateEntityRequestDto`, `UpdateEntityRequestDto`
- Response DTOs: `EntityResponseDto`, `EntityDetailResponseDto`, `EntityListResponseDto`
- Mappers: `EntityMapper`

### Variables
- Use camelCase: `entityService`, `employeeData`
- Constants: `MAX_ITEMS`, `DEFAULT_PAGE_SIZE`

### Functions
- Use descriptive names: `getAll`, `findById`, `validateEmail`
- Use verbs: `create`, `update`, `delete`, `validate`

---

## Response Format Standards

### Success Response
```javascript
{
  "success": true,
  "data": { /* entity or array */ }
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message here"
}
```

### Status Codes
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Conventions

### Prisma Schema
- Model names: PascalCase (`Employee`, `Department`)
- Field names: camelCase (`firstName`, `createdAt`)
- Table names: snake_case (`employees`, `departments`)
- Column names: snake_case (`first_name`, `created_at`)

### Migrations
- Always use `npm run db:migrate` (not `db:push`)
- Descriptive names: `add_phone_to_employee`, `create_department_table`
- Never edit applied migrations
- Commit migrations to git

---

## Common Patterns

### Error Handling in Services
```javascript
// Throw errors, don't return them
if (!entity) {
  throw new Error('Entity not found');
}

// Validation errors
if (!validation.isValid) {
  throw new Error(validation.errors.join(', '));
}
```

### Error Handling in Controllers
```javascript
try {
  // Service call
} catch (error) {
  const statusCode = this.getStatusCode(error);
  res.status(statusCode).json({
    success: false,
    error: error.message,
  });
}
```

### Using Request DTOs
```javascript
// Always in services, not controllers
const requestDto = new CreateEntityRequestDto(data);

const validation = requestDto.validate();
if (!validation.isValid) {
  throw new Error(validation.errors.join(', '));
}

await repository.create(requestDto);
```

### Using Response DTOs
```javascript
// Always in controllers, not services
const entities = await service.getAll();
const dtos = EntityMapper.toListResponseDtoArray(entities);

res.json({ success: true, data: dtos });
```

---

## What NOT to Do

### ❌ Don't Skip Layers
```javascript
// BAD: Controller calling repository directly
const employee = await employeeRepository.findById(id);

// GOOD: Controller calls service
const employee = await employeeService.getById(id);
```

### ❌ Don't Put Business Logic in Controllers
```javascript
// BAD: Validation in controller
if (!req.body.email || !isValidEmail(req.body.email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// GOOD: Validation in Request DTO (via service)
const employee = await employeeService.create(req.body);
```

### ❌ Don't Put HTTP Logic in Services
```javascript
// BAD: Using res in service
async create(req, res) {
  res.status(201).json({ success: true });
}

// GOOD: Return data, let controller handle HTTP
async create(data) {
  return await repository.create(data);
}
```

### ❌ Don't Return Raw Models in APIs
```javascript
// BAD: Returning Prisma model directly
res.json({ success: true, data: employee });

// GOOD: Return Response DTO
const dto = EntityMapper.toDetailResponseDto(employee);
res.json({ success: true, data: dto });
```

### ❌ Don't Hardcode Values
```javascript
// BAD: Hardcoded connection string
const connection = 'postgresql://localhost:5432/db';

// GOOD: Use environment variables
const connection = process.env.DATABASE_URL;
```

---

## Testing Checklist

When creating new endpoints, verify:

- [ ] Schema created/updated in `prisma/schema.prisma`
- [ ] Migration run: `npm run db:migrate`
- [ ] Repository created with CRUD methods
- [ ] Request DTOs created with validation
- [ ] Response DTOs created (multiple variants)
- [ ] Mapper created with array helpers
- [ ] Service created with business logic
- [ ] Controller created with error handling
- [ ] Routes created and registered
- [ ] Swagger documentation added
- [ ] Swagger tag added to config
- [ ] Test in Swagger UI (`/api-docs`)
- [ ] Verify in Prisma Studio (`npm run db:studio`)

---

## Quick Reference Commands

```bash
# Start development
npm run app:start

# After schema changes
npm run db:migrate

# View database
npm run db:studio

# View API docs
# Visit: http://localhost:3000/api-docs

# Fresh database reset (careful!)
npm run db:reset
```

---

## Architecture Decision Records

### Why DTOs?
- **Security:** Control what data is exposed
- **Flexibility:** Change API format without changing database
- **Validation:** Centralized input validation
- **Separation:** API contracts separate from domain models

### Why Repository Pattern?
- **Abstraction:** Can switch ORMs without changing business logic
- **Testability:** Easy to mock data access
- **Centralization:** All queries in one place

### Why Service Layer?
- **Business Logic:** Single place for all business rules
- **Reusability:** Same logic for REST, GraphQL, CLI
- **Testability:** Test business logic without HTTP/DB

### Why Mappers?
- **Single Responsibility:** Only mapping, no business logic
- **Reusability:** Used across multiple controllers
- **Maintainability:** Easy to add new DTO variants

---

## Additional Resources

- **Architecture Details:** See `SYSTEM_ARCHITECTURE.md`
- **Scripts Guide:** See `SCRIPTS_GUIDE.md`
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com/

---

## Summary for Claude Code

When assisting with this project:

1. **Always follow the layered architecture**
2. **Never skip layers or mix responsibilities**
3. **Use the templates provided above**
4. **Follow naming conventions strictly**
5. **Include Swagger documentation**
6. **Use DTOs for all input/output**
7. **Keep services pure (no HTTP concerns)**
8. **Keep repositories simple (no business logic)**
9. **Map responses in controllers, not services**
10. **Run `npm run db:migrate` after schema changes**

This architecture is designed for maintainability, testability, and scalability. Follow it consistently!
