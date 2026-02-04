# Scripts Guide

This document explains all available npm scripts, what they do, when to use them, and how they work.

---

## Table of Contents

1. [Application Scripts](#application-scripts)
2. [Database Scripts (Prisma)](#database-scripts-prisma)
3. [Docker Scripts](#docker-scripts)
4. [Development Workflow](#development-workflow)
5. [Common Scenarios](#common-scenarios)

---

## Application Scripts

### `npm start`

**What it does:**

- Starts the Node.js server in production mode
- Runs `node src/server.js`
- No auto-reload on file changes

**When to use:**

- Production deployments
- When you want to run the app without development features
- Testing production behavior locally

**Example:**

```bash
npm start
```

**Output:**

```
Server is running on port 3000
```

---

### `npm run dev`

- - for most times use this, when in dev mode auth: gautham

**What it does:**

- Starts the server in development mode with auto-reload
- Uses `nodemon` to watch for file changes
- Automatically restarts server when code changes
- Runs `nodemon src/server.js`

**When to use:**

- During active development
- When you want automatic restarts on code changes
- Daily development work

**Example:**

```bash
npm run dev
```

**Output:**

```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`
Server is running on port 3000
```

**Tips:**

- Type `rs` in the terminal to manually restart
- Press `Ctrl+C` to stop the server

---

## Database Scripts (Prisma)

### `npm run db:generate`

**What it does:**

- Generates Prisma Client based on your `schema.prisma` file
- Creates type-safe database client in `node_modules/@prisma/client`
- Must be run after any changes to `prisma/schema.prisma`

**When to use:**

- After modifying `prisma/schema.prisma`
- After pulling code with schema changes
- When Prisma Client is out of sync with schema
- After `npm install` on a new machine

**Example:**

```bash
npm run db:generate
```

**Command executed:**

```bash
npx prisma generate
```

**Output:**

```
✔ Generated Prisma Client (v7.3.0) to ./node_modules/@prisma/client in 46ms
```

**What happens:**

- Reads `prisma/schema.prisma`
- Generates TypeScript types and JavaScript client
- Makes database queries type-safe

---

### `npm run db:migrate`

**What it does:**

- Creates a new migration based on schema changes
- Applies the migration to the database
- Updates your database schema
- Prompts you to name the migration

**When to use:**

- After changing your `prisma/schema.prisma`
- When adding new models or fields
- When modifying existing schema
- To keep database in sync with code

**Example:**

```bash
npm run db:migrate
```

**Command executed:**

```bash
npx prisma migrate dev
```

**Interactive prompt:**

```
? Enter a name for the new migration: › add_employee_phone_field
```

**Output:**

```
Applying migration `20260204123456_add_employee_phone_field`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20260204123456_add_employee_phone_field/
    └─ migration.sql

Your database is now in sync with your schema.
```

**What happens:**

1. Compares `schema.prisma` with database state
2. Creates SQL migration file in `prisma/migrations/`
3. Applies migration to database
4. Generates Prisma Client automatically

**Migration file created:**

```sql
-- prisma/migrations/20260204123456_add_employee_phone_field/migration.sql
ALTER TABLE "employees" ADD COLUMN "phone" TEXT;
```

---

### `npm run db:push`

- always better to push changes through migrations auth: gautham

**What it does:**

- Pushes schema changes directly to database
- Does NOT create migration files
- Faster but less safe than `migrate dev`

**When to use:**

- Early development/prototyping
- Quick schema experiments
- When you don't need migration history
- Local development only

**NOT recommended for:**

- Production databases
- Team projects (others won't get migrations)
- When you need migration rollback capability

**Example:**

```bash
npm run db:push
```

**Command executed:**

```bash
npx prisma db push
```

**Output:**

```
The following changes will be applied to the database:
  + Added column phone to table employees

✔ Database synchronized with schema
```

**Difference from migrate:**

```
db:migrate → Creates migration files + applies them (safe, trackable)
db:push    → Applies changes directly (fast, no history)
```

---

### `npm run db:studio`

**What it does:**

- Opens Prisma Studio - a visual database browser
- Launches a web interface at `http://localhost:5555`
- Allows you to view, edit, and manage database records
- No code required

**When to use:**

- Viewing database contents
- Manually editing records
- Testing queries
- Debugging data issues
- Quick data exploration

**Example:**

```bash
npm run db:studio
```

**Command executed:**

```bash
npx prisma studio
```

**Output:**

```
Prisma Studio is up on http://localhost:5555
```

**What you can do:**

- Browse all tables
- View records
- Add/edit/delete data
- Filter and search
- See relationships

**To stop:** Press `Ctrl+C` in terminal

---

### `npm run db:reset`

**What it does:**

- **DANGEROUS:** Deletes ALL data in database
- Drops all tables
- Re-runs all migrations from scratch
- Seeds database if seed script exists

**When to use:**

- Starting fresh in development
- Fixing corrupted local database
- Testing migrations from scratch
- Resetting to clean state

**NEVER use in production!**

**Example:**

```bash
npm run db:reset
```

**Command executed:**

```bash
npx prisma migrate reset
```

**Interactive confirmation:**

```
? Are you sure you want to reset your database? All data will be lost. › (y/N)
```

**Output:**

```
Database reset successful

The following migration(s) have been applied:

prisma/migrations/
  └─ 20260204073237_init
  └─ 20260204123456_add_employee_phone_field

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**What happens:**

1. Drops all tables
2. Deletes all data
3. Re-applies ALL migrations in order
4. Runs seed script (if exists)
5. Generates Prisma Client

---

### `npm run setup`

**What it does:**

- Complete first-time setup
- Installs dependencies
- Generates Prisma Client
- Runs migrations

**When to use:**

- First time setting up project
- After cloning repository
- New developer onboarding
- Fresh installation

**Example:**

```bash
npm run setup
```

**Commands executed:**

```bash
npm install && npx prisma generate && npx prisma migrate dev
```

**What happens:**

1. Installs all npm packages
2. Generates Prisma Client
3. Applies all pending migrations
4. Project ready to run

---

## Docker Scripts

### `npm run docker:up`

**What it does:**

- Starts PostgreSQL database in Docker container
- Runs in background (detached mode)
- Creates persistent volume for data

**When to use:**

- Before running the application
- Starting your development session
- After system restart

**Example:**

```bash
npm run docker:up
```

**Command executed:**

```bash
docker-compose up -d
```

**Output:**

```
Creating network "node_default" with the default driver
Creating volume "node_postgres_data" with default driver
Creating node_postgres-vulcan_1 ... done
```

**What happens:**

- Reads `docker-compose.yml`
- Pulls PostgreSQL image (if not exists)
- Creates container named `postgres-vulcan`
- Exposes port 5432
- Database available at `localhost:5432`

**Credentials (from docker-compose.yml):**

```
Host: localhost
Port: 5432
User: root
Password: root
Database: vulcan
```

---

### `npm run docker:down`

**What it does:**

- Stops PostgreSQL container
- Removes container
- Keeps data volume (data persists)

**When to use:**

- Stopping development session
- Freeing up system resources
- Before system shutdown

**Example:**

```bash
npm run docker:down
```

**Command executed:**

```bash
docker-compose down
```

**Output:**

```
Stopping node_postgres-vulcan_1 ... done
Removing node_postgres-vulcan_1 ... done
```

**Note:** Your data is safe! The volume persists.

---

### `npm run docker:logs`

**What it does:**

- Shows PostgreSQL container logs
- Follows logs in real-time (`-f` flag)
- Useful for debugging database issues

**When to use:**

- Debugging connection issues
- Viewing database errors
- Monitoring database activity

**Example:**

```bash
npm run docker:logs
```

**Command executed:**

```bash
docker-compose logs -f postgres-vulcan
```

**Output:**

```
postgres-vulcan_1  | PostgreSQL Database directory appears to contain a database
postgres-vulcan_1  | LOG:  database system was shut down at 2024-01-15 10:30:00 UTC
postgres-vulcan_1  | LOG:  database system is ready to accept connections
```

**To stop:** Press `Ctrl+C`

---

### `npm run app:start`

**What it does:**

- One-command startup for everything
- Starts Docker database AND development server
- Perfect for daily development start

**When to use:**

- Starting your workday
- Quick project startup
- When you want everything running

**Example:**

```bash
npm run app:start
```

**Commands executed:**

```bash
npm run docker:up && npm run dev
```

**What happens:**

1. Starts PostgreSQL in Docker
2. Waits for database to be ready
3. Starts Node.js server with nodemon

**Output:**

```
Creating node_postgres-vulcan_1 ... done
[nodemon] starting `node src/server.js`
Server is running on port 3000
```

---

## Development Workflow

### First Time Setup (New Project)

```bash
# 1. Clone the repository
git clone <repository-url>
cd node

# 2. Run complete setup
npm run setup

# 3. Start Docker database
npm run docker:up

# 4. Start development server
npm run dev
```

**Or use the shortcut:**

```bash
npm run setup
npm run app:start
```

---

### Daily Development Workflow

**Starting your day:**

```bash
npm run app:start
```

**Stopping at end of day:**

```bash
# Press Ctrl+C to stop dev server
npm run docker:down
```

---

### Making Schema Changes

**Scenario: Adding a new field to Employee**

```bash
# 1. Edit prisma/schema.prisma
# Add: phone String?

# 2. Create and apply migration
npm run db:migrate
# Enter migration name: "add_employee_phone"

# 3. Migration applied automatically
# Prisma Client regenerated automatically

# 4. Server auto-restarts (if using npm run dev)

# 5. Verify in Prisma Studio
npm run db:studio
```

---

### Creating a New Model

**Scenario: Adding a new Department model**

```bash
# 1. Edit prisma/schema.prisma
# Add:
# model Department {
#   id   Int    @id @default(autoincrement())
#   name String
# }

# 2. Create migration
npm run db:migrate
# Name: "add_department_model"

# 3. Generate Prisma Client (done automatically)

# 4. Create repository, service, controller, DTOs
```

---

### Troubleshooting Database Issues

**Database not connecting:**

```bash
# Check if Docker is running
npm run docker:logs

# Restart database
npm run docker:down
npm run docker:up
```

**Schema out of sync:**

```bash
# Regenerate Prisma Client
npm run db:generate
```

**Corrupted local database:**

```bash
# Reset everything (DELETES ALL DATA)
npm run db:reset
```

**Migration conflicts:**

```bash
# Reset and start fresh
npm run db:reset
```

---

## Common Scenarios

### Scenario 1: First Time Running the Project

```bash
git clone <repo>
cd node
npm run setup
npm run app:start

# Visit http://localhost:3000/health
# Visit http://localhost:3000/api-docs
```

---

### Scenario 2: Daily Development Start

```bash
npm run app:start

# Or separately:
npm run docker:up
npm run dev
```

---

### Scenario 3: Adding a New Field

```bash
# 1. Edit prisma/schema.prisma
# 2. Run migration
npm run db:migrate

# That's it! Server auto-restarts.
```

---

### Scenario 4: Viewing Database

```bash
npm run db:studio
# Opens http://localhost:5555
```

---

### Scenario 5: Fresh Start (Delete Everything)

```bash
npm run db:reset
# Confirm with 'y'
```

---

### Scenario 6: Pulling Code with Schema Changes

```bash
git pull

# Install new dependencies
npm install

# Apply new migrations
npm run db:migrate

# Or use setup
npm run setup
```

---

### Scenario 7: Production Deployment

```bash
# Don't use dev scripts in production!

# Build/prepare (if needed)
npm install --production

# Generate Prisma Client
npx prisma generate

# Apply migrations (use migrate deploy, not migrate dev)
npx prisma migrate deploy

# Start server
npm start
```

---

## Quick Reference

| Script                | Command                  | Use Case                     |
| --------------------- | ------------------------ | ---------------------------- |
| `npm start`           | Start production server  | Production, no auto-reload   |
| `npm run dev`         | Start development server | Development with auto-reload |
| `npm run db:generate` | Generate Prisma Client   | After schema changes         |
| `npm run db:migrate`  | Create & apply migration | After schema changes         |
| `npm run db:push`     | Push schema to DB        | Quick prototyping            |
| `npm run db:studio`   | Open database GUI        | View/edit data               |
| `npm run db:reset`    | Reset database           | Fresh start (deletes data!)  |
| `npm run docker:up`   | Start PostgreSQL         | Before running app           |
| `npm run docker:down` | Stop PostgreSQL          | End of session               |
| `npm run docker:logs` | View DB logs             | Debugging                    |
| `npm run app:start`   | Start everything         | Daily development            |
| `npm run setup`       | Complete setup           | First time setup             |

---

## Environment Variables

The scripts use these environment variables from `.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://root:root@localhost:5432/vulcan?schema=public"
```

**Note:** `DATABASE_URL` is automatically added by Prisma during `prisma init`.

---

## Prisma Migration vs Push

### Use `npm run db:migrate` when:

- ✅ Working in a team
- ✅ Need migration history
- ✅ Want to rollback changes
- ✅ Going to production
- ✅ Need SQL migration files

### Use `npm run db:push` when:

- ✅ Prototyping alone
- ✅ Early development
- ✅ Quick experiments
- ✅ Don't need history
- ❌ Never in production!

---

## Tips and Best Practices

1. **Always run migrations in order:**
   - Don't skip migrations
   - Don't delete old migrations
   - Keep migration history clean

2. **Use descriptive migration names:**

   ```bash
   ✅ "add_employee_phone_field"
   ✅ "create_department_table"
   ❌ "update"
   ❌ "fix"
   ```

3. **Commit migrations to git:**
   - Migration files should be version controlled
   - Share migrations with team

4. **Don't edit applied migrations:**
   - Once applied, don't modify migration SQL
   - Create new migration instead

5. **Use db:reset carefully:**
   - Only in development
   - Will delete ALL data
   - Always double-check environment

6. **Keep Docker running during development:**
   - Start it once at beginning of day
   - Don't stop/start repeatedly

7. **Check Prisma Studio for data:**
   - Visual way to verify changes
   - Easier than SQL queries

---

## Troubleshooting

### "Port 3000 already in use"

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### "Can't connect to database"

```bash
# Check Docker is running
docker ps

# Restart Docker containers
npm run docker:down
npm run docker:up

# Check logs
npm run docker:logs
```

### "Prisma Client not found"

```bash
npm run db:generate
```

### "Migration conflicts"

```bash
# In development only:
npm run db:reset
```

---

## Summary

- Use `npm run app:start` for daily development
- Use `npm run db:migrate` after schema changes
- Use `npm run db:studio` to view data
- Use `npm run db:reset` for fresh start (careful!)
- Use `npm run docker:logs` for debugging

Keep this guide handy for quick reference!
