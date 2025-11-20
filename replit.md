# AutoManager - Dealership Management System

## Overview

AutoManager is a full-stack dealership management system built for Canadian car dealerships. The application provides comprehensive tools for managing vehicle inventory, dealership information, and vehicle appraisals. It features a React-based frontend with shadcn/ui components and an Express backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite as build tool and development server
- Wouter for client-side routing
- TanStack Query (React Query) for server state management
- Tailwind CSS with custom theme configuration
- shadcn/ui component library (New York style variant)
- Lucide React for iconography

**Backend:**
- Express.js server with TypeScript
- ESM module system
- Custom logging middleware for API requests
- Hot module reloading in development via Vite middleware

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database operations
- Schema-first approach with automatic TypeScript type generation
- Migration support through drizzle-kit

### Project Structure

The codebase follows a monorepo-style structure with clear separation of concerns:

- `/client` - Frontend React application
  - `/src/pages` - Route components (inventory, upload, appraisal)
  - `/src/components` - Reusable UI components
  - `/src/lib` - Utilities, API hooks, and shared logic
  - `/src/hooks` - Custom React hooks
- `/server` - Backend Express application
  - `routes.ts` - API endpoint definitions
  - `storage.ts` - Database abstraction layer
  - `vite.ts` - Development server setup
- `/shared` - Code shared between client and server
  - `schema.ts` - Drizzle database schema and Zod validation schemas
- `/attached_assets` - Static data files (Canadian automotive database, trim data)
- `/migrations` - Database migration files

### Database Schema

The application uses two primary tables:

**Dealerships Table:**
- Stores dealership information (name, location, province, address, postal code, phone)
- Auto-generated UUID primary keys
- Timestamp tracking for creation date

**Cars Table:**
- Comprehensive vehicle information including VIN, make, model, trim, year
- Technical specifications (transmission, fuel type, body type, drivetrain, engine details)
- Pricing and mileage data
- Array field for vehicle features
- Links to external resources (listing and Carfax)
- Status tracking (available, sold, pending)
- Foreign key relationship to dealerships with cascade delete

**Schema Design Decisions:**
- Used Drizzle ORM over Prisma for its lightweight approach and SQL-like syntax
- PostgreSQL chosen for robust relational data support and array fields
- Zod schemas derived from Drizzle schemas for consistent validation
- Separate insert and update schemas to handle optional fields correctly

### API Architecture

RESTful API design with the following endpoints:

**Dealerships:**
- `GET /api/dealerships` - List all dealerships
- `GET /api/dealerships/:id` - Get single dealership
- `POST /api/dealerships` - Create dealership
- `PATCH /api/dealerships/:id` - Update dealership
- `DELETE /api/dealerships/:id` - Delete dealership

**Cars:**
- `GET /api/cars` - List all cars (with optional dealership filter and search)
- `GET /api/cars/:id` - Get single car
- `GET /api/cars/vin/:vin` - Look up car by VIN
- `POST /api/cars` - Create car
- `PATCH /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

**Design Patterns:**
- Repository pattern via `IStorage` interface in storage.ts
- Input validation using Zod schemas
- Consistent error handling with appropriate HTTP status codes
- Request/response logging with truncation for readability

### Frontend Architecture

**State Management:**
- TanStack Query for server state with custom query keys
- Local component state for UI interactions
- Custom hooks (`use-toast`, `use-mobile`) for cross-cutting concerns
- No global state management library (Redux, Zustand) - relies on React Query cache

**Routing:**
- Wouter chosen over React Router for minimal bundle size
- Three main routes: inventory (/), upload (/upload), appraisal (/appraisal)
- Layout component wraps all routes with sidebar navigation

**Component Architecture:**
- Extensive use of shadcn/ui components for consistent design
- Custom business logic components in pages directory
- Composition pattern for complex UIs
- Form handling with controlled components

**Data Fetching Strategy:**
- Custom hooks in `api-hooks.ts` wrap TanStack Query
- Mutations include optimistic updates and cache invalidation
- Error boundaries via toast notifications
- Infinite stale time configured for stable data

### Build and Deployment

**Development:**
- Vite dev server on port 5000 for frontend
- Express server with HMR support
- TypeScript type checking without emission
- Hot reload for both client and server code

**Production:**
- Vite builds frontend to `dist/public`
- esbuild bundles server to `dist/index.js`
- Single Node.js process serves both static assets and API
- Environment variables for database connection

**Module Resolution:**
- Path aliases configured (@/, @shared/, @assets/)
- Consistent across TypeScript config and Vite config
- ESM imports throughout the codebase

### Special Features

**Canadian Automotive Data:**
- Comprehensive trim database for Canadian market vehicles (1995-2025)
- JSON and CSV formats provided in attached_assets
- Infiniti-specific model data included
- Used for validation and autocomplete in vehicle entry forms

**VIN Decoding:**
- Integration pattern for NHTSA VIN decoder (referenced in code)
- Client-side trim validation for Canadian market

**Carfax Integration:**
- Links to Carfax reports stored per vehicle
- Status tracking (clean, claims, unavailable)

**Responsive Design:**
- Mobile-first Tailwind configuration
- Custom breakpoint hook for conditional rendering
- Sheet components for mobile navigation

## External Dependencies

### Third-Party Services

**Database:**
- Neon PostgreSQL serverless database
- Connection via `@neondatabase/serverless` driver
- Requires `DATABASE_URL` environment variable

**Development Tools:**
- Replit-specific plugins for development environment
  - Runtime error modal overlay
  - Cartographer for code navigation
  - Dev banner for replit environment
- Only loaded in development mode when `REPL_ID` is present

### Key NPM Packages

**UI Framework:**
- @radix-ui/* - Headless UI primitives (20+ packages)
- tailwindcss - Utility-first CSS framework
- tw-animate-css - Animation utilities
- class-variance-authority - Component variant management
- lucide-react - Icon library

**Data Management:**
- drizzle-orm - Type-safe ORM
- drizzle-zod - Zod schema generation from Drizzle schemas
- @tanstack/react-query - Async state management
- zod - Runtime type validation

**Forms:**
- react-hook-form - Form state management
- @hookform/resolvers - Validation resolver integration

**Backend:**
- express - Web server framework
- connect-pg-simple - PostgreSQL session store (available but not actively used)

**Utilities:**
- date-fns - Date manipulation
- nanoid - ID generation
- clsx / tailwind-merge - Class name utilities
- cmdk - Command palette component

### Build Tools

- vite - Frontend build tool and dev server
- @vitejs/plugin-react - React support for Vite
- @tailwindcss/vite - Tailwind v4 integration
- esbuild - Server bundling
- tsx - TypeScript execution for development
- drizzle-kit - Database migrations and schema management