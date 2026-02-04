# System Architecture Documentation

## Overview

This application follows a **Layered Architecture** pattern with clear separation of concerns. Each layer has a specific responsibility and communicates only with adjacent layers, ensuring maintainability, testability, and scalability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client/API                          │
│                    (HTTP Requests/Responses)                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Routes Layer                           │
│              (src/routes/*.routes.js)                       │
│   • Defines API endpoints                                   │
│   • Maps URLs to controller methods                         │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                          │
│              (src/controllers/*.controller.js)              │
│   • Handles HTTP requests/responses                         │
│   • Maps domain models to DTOs                              │
│   • Returns appropriate status codes                        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      DTO Layer                              │
│                    (src/dto/)                               │
│   • Request DTOs: Validate & sanitize input                │
│   • Response DTOs: Format output data                       │
│   • Mappers: Convert between models and DTOs                │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│              (src/services/*.service.js)                    │
│   • Business logic implementation                           │
│   • Data validation & transformation                        │
│   • Orchestrates repository operations                      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                          │
│            (src/repositories/*.repository.js)               │
│   • Data access abstraction                                 │
│   • Database operations (CRUD)                              │
│   • Queries via Prisma ORM                                  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│              (PostgreSQL via Prisma)                        │
│   • Data persistence                                        │
│   • Schema: prisma/schema.prisma                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
project-root/
├── src/
│   ├── routes/           # Route definitions
│   ├── controllers/      # Request handlers
│   ├── dto/              # Data Transfer Objects
│   │   ├── request/      # Input validation & sanitization
│   │   ├── response/     # Output formatting
│   │   └── mapper/       # DTO ↔ Model conversion
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── models/           # Domain models (future use)
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── .env                  # Environment variables
├── package.json          # Dependencies
└── docker-compose.yml    # Docker configuration
```

---

## Layer-by-Layer Breakdown

### 1. Routes Layer (`src/routes/`)

**Purpose:** Define API endpoints and map them to controller methods.

**Responsibilities:**
- Define HTTP methods (GET, POST, PUT, DELETE)
- Map URL paths to controller functions
- Group related endpoints together
- Apply route-specific middleware

**What to Store:**
- Route definitions
- Endpoint grouping by resource (e.g., `employee.routes.js`, `user.routes.js`)

**Example:**
```javascript
// employee.routes.js
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
```

**Why Needed:**
- Centralized route management
- Clean URL structure
- Easy to add/modify endpoints
- Separation from business logic

---

### 2. Controller Layer (`src/controllers/`)

**Purpose:** Handle HTTP requests and responses.

**Responsibilities:**
- Receive HTTP requests
- Call appropriate service methods
- Map service results to Response DTOs
- Return HTTP responses with correct status codes
- Handle errors gracefully
- Add Swagger/API documentation

**What to Store:**
- Controller classes/objects
- HTTP-specific logic
- Status code mapping
- API documentation (Swagger JSDoc)

**Example:**
```javascript
async getAllEmployees(req, res) {
  try {
    const employees = await employeeService.getAllEmployees();
    const employeeDtos = EmployeeMapper.toResponseDtoArray(employees);
    res.status(200).json({ success: true, data: employeeDtos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

**Why Needed:**
- Isolates HTTP concerns from business logic
- Makes testing easier (can test business logic without HTTP)
- Consistent response format
- Centralized error handling

---

### 3. DTO Layer (`src/dto/`)

**Purpose:** Define data transfer objects for input validation and output formatting.

#### 3.1 Request DTOs (`src/dto/request/`)

**Responsibilities:**
- Validate incoming data
- Sanitize user input (trim, lowercase, etc.)
- Type checking
- Business rule validation
- Provide meaningful error messages

**What to Store:**
- Input validation classes
- Sanitization logic
- Validation rules

**Example:**
```javascript
class CreateEmployeeRequestDto {
  constructor(data) {
    this.name = data.name?.trim();
    this.email = data.email?.trim().toLowerCase();
  }

  validate() {
    // Validation logic
    if (!this.email || !this.isValidEmail(this.email)) {
      return { isValid: false, errors: ['Invalid email'] };
    }
    return { isValid: true, errors: [] };
  }
}
```

**Why Needed:**
- Security: Prevent invalid/malicious data
- Data consistency: Ensure data meets requirements
- Single source of truth for validation
- Decouples validation from business logic

#### 3.2 Response DTOs (`src/dto/response/`)

**Responsibilities:**
- Format data for API responses
- Control what data is exposed to clients
- Hide sensitive information (e.g., internal IDs, passwords)
- Transform data types (e.g., Decimal to String)
- Provide different views of same data

**What to Store:**
- Response formatting classes
- Multiple DTO variants for different use cases
- Data transformation logic

**Example:**
```javascript
// Hide ID and salary for public lists
class EmployeeListResponseDto {
  constructor(employee) {
    this.name = employee.name;
    this.email = employee.email;
    this.position = employee.position;
    // ID and salary excluded
  }
}
```

**Why Needed:**
- Security: Control data exposure
- Flexibility: Different responses for different endpoints
- API evolution: Change response format without changing database
- Clean API contracts

#### 3.3 Mappers (`src/dto/mapper/`)

**Responsibilities:**
- Convert domain models to DTOs
- Convert DTOs to domain models (if needed)
- Single responsibility: only mapping logic
- Handle null/undefined cases

**What to Store:**
- Mapper utility classes
- Conversion functions
- Array mapping helpers

**Example:**
```javascript
class EmployeeMapper {
  static toResponseDto(employee) {
    return new EmployeeResponseDto(employee);
  }

  static toResponseDtoArray(employees) {
    return employees.map(e => this.toResponseDto(e));
  }
}
```

**Why Needed:**
- Separation of concerns
- Reusable mapping logic
- Centralized transformation
- Easier to maintain and test

---

### 4. Service Layer (`src/services/`)

**Purpose:** Implement business logic and orchestrate data operations.

**Responsibilities:**
- Business rule enforcement
- Data validation (using Request DTOs)
- Transaction management
- Coordinate multiple repository calls
- Throw meaningful business exceptions
- No HTTP concerns

**What to Store:**
- Business logic
- Validation logic
- Transaction orchestration
- Complex operations that involve multiple entities

**Example:**
```javascript
class EmployeeService {
  async createEmployee(data) {
    // 1. Validate using Request DTO
    const requestDto = new CreateEmployeeRequestDto(data);
    const validation = requestDto.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // 2. Business rule: check for duplicates
    const existing = await employeeRepository.findByEmail(requestDto.email);
    if (existing) {
      throw new Error('Employee already exists');
    }

    // 3. Delegate to repository
    return await employeeRepository.create(requestDto);
  }
}
```

**Why Needed:**
- Centralized business logic
- Reusable across different interfaces (REST, GraphQL, CLI)
- Testable without HTTP or database
- Single source of truth for business rules

---

### 5. Repository Layer (`src/repositories/`)

**Purpose:** Abstract data access and provide a clean interface to the database.

**Responsibilities:**
- Database operations (CRUD)
- Query construction
- Data access abstraction
- No business logic
- Handle Prisma Client operations

**What to Store:**
- Database queries
- CRUD operations
- Custom queries
- Prisma-specific code

**Example:**
```javascript
class EmployeeRepository {
  async findAll() {
    return await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.employee.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async create(data) {
    return await prisma.employee.create({ data });
  }
}
```

**Why Needed:**
- Database abstraction: Can switch ORMs without changing business logic
- Centralized data access
- Reusable queries
- Easier testing (can mock repositories)
- Separation from business logic

---

### 6. Models Layer (`src/models/`)

**Purpose:** Define domain models and business entities.

**Responsibilities:**
- Domain entity definitions
- Business entity methods
- Rich domain models (if using Domain-Driven Design)
- Entity validation

**What to Store:**
- Domain models
- Entity classes
- Business entity behavior

**Note:** Currently using Prisma models, but this layer is useful for:
- Adding business methods to entities
- Complex domain logic
- Value objects
- Domain events

**Why Needed:**
- Rich domain models
- Business logic encapsulation
- Domain-Driven Design support

---

### 7. Configuration Layer (`src/config/`)

**Purpose:** Store application configuration and setup.

**Responsibilities:**
- Database connection setup
- External service configuration
- API documentation setup (Swagger)
- Environment-specific settings

**What to Store:**
- Database configuration (`database.js`)
- Swagger configuration (`swagger.js`)
- Third-party service configs
- App constants

**Why Needed:**
- Centralized configuration
- Environment management
- Easy to modify settings
- Separation from application code

---

### 8. Middleware Layer (`src/middleware/`)

**Purpose:** Intercept and process requests before they reach controllers.

**Responsibilities:**
- Authentication
- Authorization
- Request validation
- Logging
- Error handling
- Rate limiting
- CORS

**What to Store:**
- Custom middleware functions
- Authentication logic
- Request processors
- Error handlers

**Why Needed:**
- Cross-cutting concerns
- Request preprocessing
- Security enforcement
- Centralized error handling

---

## Database Layer (Prisma)

### Schema (`prisma/schema.prisma`)

**Purpose:** Define database structure and relationships.

**What to Store:**
- Table definitions
- Column types and constraints
- Relationships
- Indexes
- Database configuration

**Why Needed:**
- Single source of truth for database structure
- Type-safe database client generation
- Migration management
- Database abstraction

---

## Key Architectural Principles

### 1. Separation of Concerns
Each layer has a single, well-defined responsibility. This makes the code:
- Easier to understand
- Easier to test
- Easier to maintain
- Easier to modify

### 2. Dependency Rule
Dependencies flow in one direction (downward):
```
Routes → Controllers → DTOs → Services → Repositories → Database
```

**Never reverse this flow.** Lower layers should never depend on higher layers.

### 3. Single Responsibility Principle
Each class/module should have one reason to change:
- Controllers: HTTP concerns change
- Services: Business rules change
- Repositories: Data access changes
- DTOs: API contracts change

### 4. Abstraction
Each layer abstracts implementation details:
- Services don't know about HTTP
- Repositories don't know about business logic
- Controllers don't know about database queries

---

## Data Flow Examples

### Creating an Employee

```
1. Client sends POST /api/employees with JSON body
   ↓
2. Route layer maps to employeeController.createEmployee()
   ↓
3. Controller receives request
   ↓
4. Controller calls employeeService.createEmployee(req.body)
   ↓
5. Service creates CreateEmployeeRequestDto from data
   ↓
6. Service validates DTO
   ↓
7. Service checks business rules (no duplicate email)
   ↓
8. Service calls employeeRepository.create(dto)
   ↓
9. Repository calls Prisma Client to insert into database
   ↓
10. Database returns created record
   ↓
11. Repository returns domain model to Service
   ↓
12. Service returns domain model to Controller
   ↓
13. Controller uses Mapper to convert model to EmployeeDetailResponseDto
   ↓
14. Controller sends HTTP 201 with DTO as JSON
   ↓
15. Client receives response
```

### Getting All Employees

```
1. Client sends GET /api/employees
   ↓
2. Route maps to employeeController.getAllEmployees()
   ↓
3. Controller calls employeeService.getAllEmployees()
   ↓
4. Service calls employeeRepository.findAll()
   ↓
5. Repository queries database via Prisma
   ↓
6. Database returns records
   ↓
7. Repository returns array of models to Service
   ↓
8. Service returns models to Controller
   ↓
9. Controller uses Mapper.toResponseDtoArray() to convert
   ↓
10. Controller sends HTTP 200 with DTO array (no IDs exposed)
   ↓
11. Client receives response
```

---

## Benefits of This Architecture

### 1. Maintainability
- Easy to find where to make changes
- Changes in one layer don't affect others
- Clear file organization

### 2. Testability
- Each layer can be tested independently
- Mock dependencies easily
- Test business logic without HTTP/Database

### 3. Scalability
- Add new features without touching existing code
- Easy to add new layers or components
- Horizontal scaling possible

### 4. Security
- Input validation centralized in Request DTOs
- Output control via Response DTOs
- Authorization in middleware
- No direct database access from controllers

### 5. Flexibility
- Switch databases without changing business logic
- Change API format without changing database
- Support multiple interfaces (REST, GraphQL, CLI)

### 6. Team Collaboration
- Clear boundaries between layers
- Multiple developers can work on different layers
- Reduced merge conflicts

---

## Best Practices

### Do's ✓
- Keep layers thin and focused
- Use DTOs for all API input/output
- Validate at the service layer
- Keep controllers simple (just HTTP handling)
- Use meaningful error messages
- Document API endpoints with Swagger
- Use TypeScript or JSDoc for type hints
- Write unit tests for services and repositories

### Don'ts ✗
- Don't put business logic in controllers
- Don't access database directly from controllers
- Don't expose internal models in API responses
- Don't skip validation
- Don't mix HTTP concerns with business logic
- Don't hardcode configuration values
- Don't create circular dependencies between layers

---

## Future Enhancements

1. **Add authentication/authorization middleware**
2. **Implement error handling middleware**
3. **Add request logging middleware**
4. **Create base classes for common patterns**
5. **Add caching layer for frequently accessed data**
6. **Implement event-driven architecture for complex workflows**
7. **Add background job processing**
8. **Implement API versioning**

---

## Conclusion

This layered architecture provides a solid foundation for building scalable, maintainable applications. Each layer has a clear purpose and responsibility, making the codebase easy to understand and modify. By following these architectural principles, the application remains flexible and can adapt to changing requirements without major refactoring.
