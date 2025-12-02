# Carsellia - Vehicle Trading & Dealership Management Platform

## Overview

Carsellia is a comprehensive, production-ready vehicle trading and dealership management platform built for 100,000+ concurrent users. The application provides secure authentication with separate Admin and Dealer portals, comprehensive vehicle inventory management, and advanced appraisal tools. Built with React, Express, and PostgreSQL on Replit.

## User Preferences

- Preferred communication style: Simple, everyday language
- Scale target: 100,000 concurrent users
- Architecture: Dealer and Admin role-based separation with complete admin controls

## System Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite as build tool and development server
- Wouter for client-side routing with role-based page access
- TanStack Query (React Query) for server state management
- Tailwind CSS v4 with slate/blue color scheme
- shadcn/ui component library
- Lucide React for iconography

**Authentication:**
- Replit Auth (OpenID Connect) with multi-provider support (Google, GitHub, Apple, Email/Password)
- Session-based authentication with PostgreSQL session store
- Role-based access control (Admin/Dealer/Data Analyst/Transportation)
- Secure token refresh mechanism

**Backend:**
- Express.js server with TypeScript
- ESM module system
- Custom logging middleware for API requests
- Hot module reloading in development
- Passport.js for OpenID Connect authentication

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe operations
- Session storage table for secure session management
- User management table with role tracking

### Project Structure

```
/client/src
  /pages
    - inventory.tsx (Vehicle listing with advanced filters)
    - upload.tsx (Bulk CSV/URL/AI text import)
    - appraisal.tsx (Vehicle valuation tool)
    - export.tsx (USA Export Profit Calculator)
    - transport.tsx (Transport Estimate Calculator with Canadian distance matrix)
    - transport-dashboard.tsx (Transportation Team operations dashboard)
    - transport-orders.tsx (Transport order management)
    - landing.tsx (Public landing page)
    - admin-dashboard.tsx (Admin dashboard overview)
    - data-analyst-dashboard.tsx (Bulk upload hub for data team)
    - user-management.tsx (Admin user CRUD - create, roles, passwords)
  /components
    - layout.tsx (Role-based sidebar navigation)
    - ui/* (shadcn/ui components)
  /lib
    - api-hooks.ts (Tanstack Query hooks)
    - queryClient.ts (Query configuration)
  /hooks
    - useAuth.ts (Authentication state)

/server
  - replitAuth.ts (Replit Auth setup)
  - routes.ts (API endpoints with auth)
  - storage.ts (Database operations)
  - index.ts (Express app setup)

/shared
  - schema.ts (Drizzle schema + Zod validation)
```

### Database Schema

**Users Table (Authentication):**
- id: UUID primary key
- email: Unique email address
- firstName, lastName: User profile
- profileImageUrl: Avatar from auth provider
- role: 'admin', 'dealer', 'data_analyst', or 'transportation'
- passwordHash: For admin-created users (null for OAuth)
- passwordResetToken, passwordResetExpiry: Password reset support
- isActive: Account status ('true'/'false')
- authType: 'oauth' or 'password'
- lastLoginAt: Last login timestamp
- createdAt, updatedAt: Timestamps

**Sessions Table (Authentication):**
- sid: Session ID
- sess: Session data (JSONB)
- expire: Session expiration timestamp

**Dealerships Table:**
- id, name, location, province, address, postalCode, phone
- createdAt timestamp

**Cars Table:**
- Comprehensive vehicle data (VIN, make, model, trim, year, price, kilometers)
- Technical specs (transmission, fuel type, drivetrain, engine details)
- Features array for vehicle amenities
- Status tracking (available, sold, pending)
- Carfax/listing links

**Transportation Module Tables:**

*Trucks Table (Fleet):*
- id, unitNumber, make, model, year, capacity
- currentLocation, status (available/en_route/maintenance)

*Drivers Table:*
- id, name, phone, email, licenseNumber, licenseExpiry
- assignedTruckId, status (active/off_duty/on_leave)

*Transport Quotes Table:*
- id, quoteNumber, userId
- Pickup/delivery locations (address, city, province, postal)
- distanceKm, vehicle details (year, make, model, VIN, type)
- Options: isRunning, isEnclosed, liftGateRequired, vehicleCount
- Pricing: basePrice, surcharges, discount, totalPrice
- serviceLevel (standard/expedited_2day/expedited_1day)
- status (quoted/expired/converted), validUntil

*Transport Orders Table:*
- id, orderNumber, quoteId
- Contact info for pickup/delivery
- Dates: pickupDate, estimatedDeliveryDate, actual pickup/delivery
- driverId, truckId, trackingUrl
- status, paymentStatus, paymentAmount

*Tracking Events Table:*
- id, orderId, eventType, location, notes, createdAt

### API Architecture

**Authentication Routes:**
- `GET /api/login` - Initiate Replit Auth flow
- `GET /api/callback` - OAuth callback (handled by Replit Auth)
- `GET /api/logout` - Logout and session cleanup
- `GET /api/auth/user` - Get current user (protected)

**Admin Routes:**
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/users` - Create new user with password (admin only)
- `PATCH /api/admin/users/:id` - Update user details (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)
- `POST /api/admin/users/:id/reset-password` - Reset user password (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

**Dealership & Car Routes:**
- Standard REST endpoints with pagination
- Advanced filtering on server-side
- Car counts by status and dealership

### Frontend Architecture

**Authentication Flow:**
- Landing page shown for unauthenticated users
- Login button redirects to `/api/login` (Replit Auth handles OAuth)
- After login, user redirected to role-specific dashboard
- Admin users see: Admin Dashboard, User Management
- Dealer users see: Inventory, Add Vehicles, Appraisal Tool
- Data Analysts see: Data Analyst Hub, Add Vehicles (bulk upload focused)

**State Management:**
- TanStack Query for server state and caching
- useAuth hook for authentication state
- Local component state for UI interactions

**Role-Based Access Control (Updated):**
- **Admins**: Full system access, user management (create/delete/reset passwords), all features including transport operations
- **Dealers**: Vehicle appraisal, view inventory & pricing, comparables, export calculator, transport quotes (NO upload/delete access)
- **Data Analysts**: Upload vehicles, delete vehicles, publish data (NO appraisal/export/transport access)
- **Transportation**: Transport dashboard, order management, quote calculator, fleet tracking (NO appraisal/export/upload access)
- Routes protected via role-specific guards in App.tsx
- Server-side role verification on all admin endpoints
- Sensitive fields (passwordHash, resetTokens) sanitized from API responses

### Transportation Module

**Transport Estimate Calculator (/transport):**
- Canadian distance matrix between 15 major cities across provinces
- Distance-based pricing tiers: $0.95/km (0-500km), $0.85/km (501-1000km), $0.75/km (1001-2000km), $0.65/km (2000+km)
- Minimum charge: $195
- Vehicle type surcharges: Sedan (base), SUV (+$45), Pickup (+$55), Full-Size (+$85), Luxury (+$125), Motorcycle (-$50)
- Additional options: Non-running (+$85), Enclosed (+$175), Lift gate (+$45)
- Multi-vehicle discounts: 5% (2-3), 10% (4+)
- Service levels: Standard (1x, 5-7 days), 2-Day Expedited (1.5x), 1-Day Expedited (2x)
- 8% fuel surcharge
- Quote generation with 7-day validity

**Transport Dashboard (/transport-dashboard):**
- Operations overview with active orders, pending pickups, in-transit, completed counts
- Fleet status showing trucks, current locations, assigned drivers
- Recent quotes summary

**Transport Orders (/transport-orders):**
- Full order management with filters (status, date range, search)
- Order tracking with status updates
- Driver/truck assignment capabilities

### Performance Optimizations

**Database:**
- Server-side pagination (50-100 items per page)
- Indexed queries on frequently searched fields
- Connection pooling via Neon
- Aggregated queries for counts

**Frontend:**
- Code splitting with Wouter lazy routing
- Component memoization for heavy lists
- Query result caching with Tanstack Query
- Debounced search inputs

**Session Management:**
- PostgreSQL session store (replaces memory store)
- Session TTL: 7 days
- Automatic token refresh
- Secure HTTP-only cookies

### Branding & UI

**Color Scheme:**
- Primary: Slate-900 (dark background)
- Accent: Blue-600 (interactive elements)
- Status: Green/Red/Yellow for states

**Components:**
- Dark modern UI for Carsellia brand
- Responsive design (mobile-first)
- Footer with contact info (Ontario, Canada)

## Authentication & Security

**Replit Auth Features:**
- No password storage (OAuth providers handle auth)
- Automatic token rotation
- Session security with secure cookies
- Multi-provider support

**Access Control:**
- Middleware authentication on all protected routes
- Role-based authorization checks
- 403 Forbidden for unauthorized access
- Automatic redirect to login on 401

## External Dependencies

**Services:**
- Replit Auth (OpenID Connect)
- Neon PostgreSQL (DATABASE_URL env var)
- Optional: ScrapingDog API for URL scraping
- Optional: Claude API for AI text parsing

**NPM Packages:**
- Replit Auth: openid-client, passport, express-session, connect-pg-simple
- UI: @radix-ui/*, tailwindcss, lucide-react
- Data: drizzle-orm, drizzle-zod, @tanstack/react-query, zod
- Backend: express, passport

## Deployment & Environment

**Environment Variables:**
- DATABASE_URL: PostgreSQL connection (Neon)
- SESSION_SECRET: Session encryption key (required for security)
- REPL_ID: Replit environment ID (auto-set by Replit)
- Optional: SCRAPINGDOG_API_KEY, CLAUDE_API_KEY

**Development:**
- Vite dev server on port 5000
- Hot module reloading for client and server
- TypeScript type checking

**Production:**
- Single Node.js process
- Frontend built to dist/public
- Express serves both static assets and API
