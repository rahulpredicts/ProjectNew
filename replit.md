# Carsellia - Vehicle Trading & Dealership Management Platform

## Overview
Carsellia is a comprehensive, production-ready vehicle trading and dealership management platform designed for over 100,000 concurrent users. It offers secure authentication with distinct Admin and Dealer portals, extensive vehicle inventory management, and advanced appraisal tools. The platform aims to streamline dealership operations, enhance vehicle trading efficiency, and provide robust data analysis capabilities for market intelligence.

## User Preferences
- Preferred communication style: Simple, everyday language
- Scale target: 100,000 concurrent users
- Architecture: Dealer and Admin role-based separation with complete admin controls

## System Architecture

### Technology Stack
**Frontend:** React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for server state, Tailwind CSS v4 (slate/blue scheme), shadcn/ui, Lucide React.
**Backend:** Express.js with TypeScript, ESM, custom logging, Passport.js for OpenID Connect authentication.
**Database:** PostgreSQL via Neon serverless driver, Drizzle ORM for type-safe operations.
**Authentication:** Replit Auth (OpenID Connect) with multi-provider support, session-based authentication using a PostgreSQL store, role-based access control (Admin, Dealer, Data Analyst, Transportation).

### Core Features
**User & Role Management:** Secure authentication, user CRUD for admins, and role-based access control across the application.
**Vehicle Inventory Management:** Comprehensive vehicle data storage, advanced filtering, and status tracking.
**Vehicle Appraisal Module:** Professional-grade valuation system with VIN decoding, inventory-powered market intelligence, weighted comparable scoring, condition assessment (Carsellia Grade/NAAA), mechanical inspection, history/title analysis, and 30+ pricing adjustments. Includes a 3-tier decision engine (BUY/WHOLESALE/REJECT) and AI confidence scoring.
**Transportation Module:** Transport Estimate Calculator with Canadian distance matrix and multi-tiered pricing, Transport Dashboard for operations overview, and Transport Order Management for tracking and assignment.
**Data Import/Export:** Bulk CSV/URL/AI text import for vehicles and print-friendly appraisal reports.

### UI/UX Decisions
The platform features a dark modern UI with a slate-900 primary and blue-600 accent color scheme. It is designed to be responsive and mobile-first, utilizing shadcn/ui components for a consistent look and feel.

### Performance Optimizations
Includes server-side pagination, indexed database queries, connection pooling, client-side code splitting, component memoization, and Tanstack Query caching. Session management uses a PostgreSQL store with a 7-day TTL and automatic token refresh.

## External Dependencies

**Services:**
- Replit Auth (OpenID Connect)
- Neon PostgreSQL
- Optional: ScrapingDog API (for URL scraping)
- Optional: Claude API (for AI text parsing)

**NPM Packages (Key):**
- **Authentication:** `openid-client`, `passport`, `express-session`, `connect-pg-simple`
- **UI:** `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Data:** `drizzle-orm`, `drizzle-zod`, `@tanstack/react-query`, `zod`
- **Backend:** `express`, `passport`