# AutoManager - Complete Technical Documentation for Firebase + Google AI Studio Migration

**Date**: November 21, 2025  
**Project**: Canadian Car Dealership Inventory Management System  
**Current Stack**: React + Vite + Express + PostgreSQL  
**Target Stack**: Google AI Studio + Firebase (Auth + Firestore) + Make.com Workflows

---

## 1. FULL PROJECT STRUCTURE

### Directory Tree

```
automanager/
├── client/                          # Frontend React application
│   ├── index.html                  # Main HTML entry point
│   ├── src/
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── index.css               # Global styles
│   │   ├── pages/                  # Route components
│   │   │   ├── inventory.tsx       # Main inventory management UI (1,500 lines)
│   │   │   ├── upload.tsx          # CSV/URL vehicle import page
│   │   │   └── appraisal.tsx       # Vehicle appraisal tools page
│   │   ├── components/
│   │   │   └── ui/                 # shadcn/ui components (20+ premade components)
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── select.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── checkbox.tsx
│   │   │       └── [18+ more UI components]
│   │   ├── lib/
│   │   │   ├── api-hooks.ts        # React Query hooks for API calls (268 lines)
│   │   │   ├── utils.ts            # Utility functions (cn() for class merging)
│   │   │   └── nhtsa.ts            # VIN decoding utilities
│   │   └── hooks/
│   │       └── use-toast.ts        # Toast notification hook
│
├── server/                          # Express backend
│   ├── index.ts                    # Express app initialization
│   ├── routes.ts                   # API endpoint definitions (202 lines)
│   ├── storage.ts                  # Database abstraction layer (IStorage interface)
│   └── vite.ts                     # Vite dev middleware integration
│
├── shared/                          # Code shared between client & server
│   └── schema.ts                   # Drizzle ORM schema + Zod validation (68 lines)
│
├── migrations/                      # Drizzle database migrations (auto-generated)
│   └── [timestamp]_init.sql
│
├── attached_assets/                 # Static data files
│   └── canadian_trim_data.json     # 1995-2025 trim database for Canadian vehicles
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS plugins
└── drizzle.config.ts               # Drizzle ORM configuration
```

### File Responsibilities & Relationships

| File | Purpose | Connected Files |
|------|---------|-----------------|
| `client/pages/inventory.tsx` | Dealership/vehicle inventory UI, filtering, CRUD | api-hooks.ts, nhtsa.ts, UI components |
| `client/pages/upload.tsx` | CSV/URL vehicle import form | api-hooks.ts, schema.ts |
| `client/pages/appraisal.tsx` | Vehicle appraisal calculator & tools | api-hooks.ts |
| `client/lib/api-hooks.ts` | React Query mutations & queries | routes.ts, schema.ts |
| `server/routes.ts` | REST API endpoint handlers | storage.ts, schema.ts |
| `server/storage.ts` | Database CRUD operations (IStorage interface) | schema.ts, Drizzle ORM |
| `shared/schema.ts` | Drizzle table definitions + Zod schemas | routes.ts, storage.ts, api-hooks.ts |

---

## 2. FILE-BY-FILE EXPLANATION

### `/client/pages/inventory.tsx` (1,500+ lines)

**Purpose**: Main dealership and vehicle inventory management interface.

**Key Functions**:

1. **State Management**
   - Dealership selection (`selectedDealership`)
   - Car filters (range sliders: `filterYearRange`, `filterPriceRange`, `filterKmsRange`)
   - Multi-select filters (arrays: `filterTransmission`, `filterDrivetrain`, `filterFuelType`, `filterBodyType`, `filterEngineCylinders`)
   - Single filters: `filterMake`, `filterModel`, `filterColor`, `filterTrim`, `filterVin`, `filterProvince`
   - Edit modes for dealerships and cars

2. **Core Functionality**

   a) **`getFilteredCars()`** - Complex client-side filtering logic
      - Filters by dealership, search term, and all active filter criteria
      - Year: range-based filtering (min/max)
      - Price: range-based filtering in real currency
      - Kilometers: range-based filtering
      - Transmission/Drivetrain/Fuel/Body/Cylinders: multi-select matching
      - Returns sorted array of Car objects
   
   b) **`clearFilters()`** - Resets all filter states to defaults
      - Range filters reset to full range: `[1995, 2025]`, `[0, 200000]`, `[0, 300000]`
      - Multi-select filters reset to empty arrays: `[]`
      - Single filters reset to empty strings: `""`

   c) **`handleAddDealership()`** - Creates new dealership
      - Validates required fields (name, address)
      - Calls `createDealershipMutation` from API hooks
      - Shows toast notification on success/failure
   
   d) **`handleUpdateCar()`** - Updates vehicle record
      - Validates VIN or Stock Number requirement
      - Handles features array separately if changed
      - Validates all required fields before submission
   
   e) **`handleDeleteCar()`** - Removes vehicle from inventory
      - Requires user confirmation dialog
      - Calls `deleteCarMutation`

3. **UI Components**
   - Dealership sidebar with selection and CRUD buttons
   - Advanced filters section with:
     - Dropdown selects for Make, Model, Trim
     - Range sliders for Year, Price, Kilometers
     - Multi-select checkbox groups for Transmission/Drivetrain/Fuel/Body/Cylinders
   - Vehicle cards grid displaying inventory
   - Edit/Delete/Link buttons for each vehicle
   - Add Dealership dialog
   - Edit Dealership dialog
   - Edit Car dialog with comprehensive form

4. **Dependencies**
   - React hooks: `useState`, `useRef`, `useEffect`, `useMemo`
   - API hooks: `useDealerships`, `useCars`, `useCreateDealership`, `useUpdateDealership`, `useDeleteDealership`, `useCreateCar`, `useUpdateCar`, `useDeleteCar`, `useToggleSoldStatus`
   - UI library: shadcn/ui components
   - Icons: Lucide React
   - Utilities: `nhtsa.ts` for VIN decoding and trim lookup
   - Toast notifications: `useToast()` hook

**Inputs & Outputs**:
- Input: User actions (clicks, form submissions, filter changes)
- Output: Rendered UI + API calls to backend

**Connection Map**:
```
inventory.tsx
├─ calls → api-hooks.ts (mutations & queries)
├─ calls → nhtsa.ts (VIN decoding, getTrimsForMake)
├─ renders → UI components from /components/ui/
└─ displays data from → Dealership & Car types (from api-hooks.ts)
```

---

### `/client/lib/api-hooks.ts` (268 lines)

**Purpose**: React Query hooks for all API communication. Acts as data layer.

**Interfaces**:

```typescript
interface Dealership {
  id: string;
  name: string;
  location: string;
  province: string;
  address: string;
  postalCode: string;
  phone: string;
  createdAt?: string;
}

interface Car {
  id: string;
  dealershipId: string;
  vin: string;
  stockNumber?: string;
  condition: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  color: string;
  price: string;
  kilometers: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  drivetrain?: string;
  engineCylinders?: string;
  engineDisplacement?: string;
  features?: string[];
  listingLink: string;
  carfaxLink: string;
  carfaxStatus?: 'clean' | 'claims' | 'unavailable';
  notes: string;
  status: 'available' | 'sold' | 'pending';
  createdAt?: string;
}
```

**Query Hooks** (Read operations):

1. **`useDealerships()`**
   - Fetches: GET `/api/dealerships`
   - Returns: `Dealership[]`
   - Query key: `['dealerships']`
   - Stale time: Infinite (stable data)

2. **`useCars(dealershipId?, search?)`**
   - Fetches: GET `/api/cars?dealershipId={id}&search={term}`
   - Returns: `Car[]`
   - Query key: `['cars', dealershipId, search]`
   - Filters at API level or returns all

3. **`useCarByVin(vin)`**
   - Fetches: GET `/api/cars/vin/{vin}`
   - Returns: `Car | null`
   - Enabled only when VIN length > 0

**Mutation Hooks** (Write operations):

1. **Dealership Mutations**
   - `useCreateDealership()` → POST `/api/dealerships`
   - `useUpdateDealership()` → PATCH `/api/dealerships/{id}`
   - `useDeleteDealership()` → DELETE `/api/dealerships/{id}`
   - All invalidate `['dealerships']` query on success

2. **Car Mutations**
   - `useCreateCar()` → POST `/api/cars`
   - `useUpdateCar()` → PATCH `/api/cars/{id}`
   - `useDeleteCar()` → DELETE `/api/cars/{id}`
   - `useToggleSoldStatus()` → Toggles car status between 'available' and 'sold'
   - All invalidate `['cars']` query on success

3. **Error Handling**
   - All mutations show toast notifications
   - Success: "Operation completed"
   - Error: "Failed to {operation}" with destructive variant

---

### `/shared/schema.ts` (68 lines)

**Purpose**: Single source of truth for database schema using Drizzle ORM + Zod validation.

**Dealerships Table**:
```typescript
CREATE TABLE dealerships (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  province TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Cars Table**:
```typescript
CREATE TABLE cars (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id VARCHAR NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  vin TEXT,
  stock_number TEXT,
  condition TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT NOT NULL,
  year TEXT NOT NULL,
  color TEXT NOT NULL,
  price TEXT NOT NULL,
  kilometers TEXT NOT NULL,
  transmission TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  body_type TEXT NOT NULL,
  drivetrain TEXT,
  engine_cylinders TEXT,
  engine_displacement TEXT,
  features TEXT[] (array of features),
  listing_link TEXT NOT NULL,
  carfax_link TEXT NOT NULL,
  carfax_status TEXT,
  notes TEXT NOT NULL,
  status TEXT DEFAULT 'available' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Validation Schemas**:
```typescript
insertDealershipSchema = Zod schema for POST/creating dealerships
  - Required: name, location, province, address, postalCode, phone
  - Omitted: id (auto-generated), createdAt (auto-generated)

insertCarSchema = Zod schema for POST/creating cars
  - Required: dealershipId, condition, make, model, trim, year, color, price, kilometers, transmission, fuelType, bodyType, listingLink, carfaxLink, notes
  - Optional: vin, stockNumber, drivetrain, engineCylinders, engineDisplacement, features, carfaxStatus
  - At least one of (vin, stockNumber) must be provided at API level (validated in routes.ts)

updateDealershipSchema = Partial dealership (all fields optional for PATCH)
updateCarSchema = Partial car (all fields optional for PATCH)
```

**Type Exports**:
- `Dealership` = Select type (what's returned from DB)
- `InsertDealership` = Insert type (what's sent when creating)
- `UpdateDealership` = Update type (what's sent when patching)
- Same pattern for Cars

---

### `/server/routes.ts` (202 lines)

**Purpose**: Express route handlers for all API endpoints. Validates input, calls storage, returns JSON responses.

**Dealership Endpoints**:

1. **GET /api/dealerships** (200 OK)
   - Returns all dealerships
   - Error: 500 if DB fails

2. **GET /api/dealerships/:id** (200 OK | 404 Not Found)
   - Returns single dealership
   - Error: 500 if DB fails

3. **POST /api/dealerships** (201 Created | 400 Bad Request)
   - Creates dealership
   - Validates with `insertDealershipSchema`
   - Error: 400 if validation fails

4. **PATCH /api/dealerships/:id** (200 OK | 404 Not Found | 400 Bad Request)
   - Updates dealership
   - Validates with `updateDealershipSchema`
   - Error: 404 if not found, 400 if validation fails

5. **DELETE /api/dealerships/:id** (204 No Content | 404 Not Found)
   - Deletes dealership (CASCADE deletes cars)
   - Error: 404 if not found

**Car Endpoints**:

1. **GET /api/cars** (200 OK)
   - Query params: `dealershipId` (optional), `search` (optional)
   - Returns filtered cars

2. **GET /api/cars/:id** (200 OK | 404 Not Found)
   - Returns single car

3. **GET /api/cars/vin/:vin** (200 OK)
   - Returns car by VIN or null

4. **GET /api/cars/stock/:stockNumber** (200 OK)
   - Returns car by stock number or null

5. **POST /api/cars** (201 Created | 409 Conflict | 400 Bad Request)
   - Creates car
   - Validates with `insertCarSchema`
   - Checks: VIN uniqueness, Stock Number uniqueness
   - Error: 409 if VIN/Stock already exists, 400 if validation fails

6. **PATCH /api/cars/:id** (200 OK | 404 Not Found | 400 Bad Request | 409 Conflict)
   - Updates car
   - Validates with `updateCarSchema`
   - Enforces: At least one of (VIN, Stock Number) must be provided
   - Checks: VIN/Stock uniqueness (excluding current car)
   - Error: 400 if no VIN/Stock, 409 if duplicate, 404 if not found

7. **DELETE /api/cars/:id** (204 No Content | 404 Not Found)
   - Deletes car
   - Error: 404 if not found

**Validation Pattern**:
```typescript
const validated = schema.parse(req.body);  // Throws if invalid
if (validated.condition !== expected) {    // Business logic
  return res.status(409).json({ error: "..." });
}
const result = await storage.operation(validated);
res.json(result);
```

---

### `/server/storage.ts` (IStorage Interface + Implementation)

**Purpose**: Database abstraction layer using Drizzle ORM. All database queries happen here.

**IStorage Interface Methods**:

**Dealership Operations**:
- `getAllDealerships(): Promise<Dealership[]>` - SELECT all
- `getDealership(id: string): Promise<Dealership | null>` - SELECT by id
- `createDealership(data: InsertDealership): Promise<Dealership>` - INSERT
- `updateDealership(id: string, data: UpdateDealership): Promise<Dealership | null>` - UPDATE
- `deleteDealership(id: string): Promise<boolean>` - DELETE

**Car Operations**:
- `getAllCars(): Promise<Car[]>` - SELECT all
- `getCar(id: string): Promise<Car | null>` - SELECT by id
- `getCarByVin(vin: string): Promise<Car | null>` - SELECT by vin
- `getCarByStockNumber(stockNumber: string): Promise<Car | null>` - SELECT by stock
- `getCarsByDealership(dealershipId: string): Promise<Car[]>` - SELECT by dealership
- `searchCars(term: string): Promise<Car[]>` - Full-text search across make, model, vin, trim
- `createCar(data: InsertCar): Promise<Car>` - INSERT
- `updateCar(id: string, data: UpdateCar): Promise<Car | null>` - UPDATE
- `deleteCar(id: string): Promise<boolean>` - DELETE
- `updateCarStatus(id: string, status: 'available' | 'sold' | 'pending'): Promise<Car | null>` - UPDATE status

**Query Implementation Example**:
```typescript
async getAllDealerships() {
  return await db.select().from(dealerships);  // SELECT * FROM dealerships
}

async createCar(data: InsertCar) {
  const [car] = await db.insert(cars).values(data).returning();
  return car;  // INSERT INTO cars ... RETURNING *
}

async searchCars(term: string) {
  const searchTerm = `%${term.toLowerCase()}%`;
  return await db.select().from(cars)
    .where(or(
      ilike(cars.make, searchTerm),
      ilike(cars.model, searchTerm),
      ilike(cars.vin, searchTerm),
      ilike(cars.trim, searchTerm)
    ));  // WHERE make ILIKE '%term%' OR ...
}
```

**Connection**: Uses Neon PostgreSQL driver via `@neondatabase/serverless` for serverless execution.

---

### `/client/lib/nhtsa.ts`

**Purpose**: VIN decoding utilities and Canadian trim database lookup.

**Functions**:

1. **`decodeVIN(vin: string): Promise<VINDecodingResult>`**
   - Calls NHTSA VIN decoder API (not internal, external HTTP call)
   - Returns: `{ make, model, year, bodyType, ... }`
   - Used in: inventory.tsx when user enters VIN

2. **`getTrimsForMake(make: string): string[]`**
   - Looks up Canadian trim database for a specific make
   - Returns array of available trims for that make (1995-2025 models)
   - Used in: filter dropdowns and edit form for trim selection

**Data Source**: `/attached_assets/canadian_trim_data.json`
- 1995-2025 vehicle trim data for Canadian market
- Indexed by make name

---

### `/server/index.ts`

**Purpose**: Express application initialization and server startup.

**Configuration**:
- PORT: 5000
- NODE_ENV: development or production
- Middleware: Express JSON parsing, session management (if auth implemented)
- Database: Connects to PostgreSQL via Neon serverless driver
- Vite Integration: In development, uses Vite as dev middleware for HMR

**Startup**:
```typescript
const app = express();
app.use(express.json());
registerRoutes(app);  // Attach all routes from routes.ts
app.listen(5000, () => console.log("Server running on port 5000"));
```

---

## 3. AUTHENTICATION & USER FLOW

### Current State: NO AUTHENTICATION

The current Replit application has **NO authentication mechanism**. All endpoints are publicly accessible.

### Planned Firebase Auth Integration (for migration):

**Flow**:

1. **User Registration** → Firebase Auth (`createUserWithEmailAndPassword`)
   - Frontend: User enters email + password in signup form
   - Firebase: Creates user account, returns `uid` and `idToken`
   - Frontend: Stores `idToken` in browser local storage
   - Backend: Validates token on protected routes via `admin.auth().verifyIdToken()`

2. **User Login** → Firebase Auth (`signInWithEmailAndPassword`)
   - Frontend: User enters email + password
   - Firebase: Returns `uid` and `idToken`
   - Frontend: Stores token, redirects to dashboard

3. **Protected Routes** → Express middleware:
   ```typescript
   async function authMiddleware(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     try {
       req.user = await admin.auth().verifyIdToken(token);
       next();
     } catch {
       res.status(401).json({ error: "Unauthorized" });
     }
   }
   // app.get('/api/dealerships', authMiddleware, handler);
   ```

4. **User Logout** → Clear local storage + sign out from Firebase
   ```typescript
   await signOut(auth);  // Firebase SDK
   localStorage.removeItem('idToken');
   ```

### No Roles/Permissions Currently

Current system assumes single-role access (dealership admin). For multi-role support:
- Store user role in Firestore: `{ uid, email, role: 'admin' | 'manager' | 'viewer' }`
- Check role in middleware before allowing operations

---

## 4. DATABASE OVERVIEW

### Database Type: PostgreSQL (Neon Serverless)

**Hosted On**: Neon serverless backend  
**Connection**: Via `@neondatabase/serverless` driver over HTTP  
**Tables**: 2 primary tables with FK relationship  
**Indexes**: Created automatically by Drizzle on primary keys; additional indexes can be added for search performance

### Table Definitions

#### **dealerships** (37 dealerships for Quebec in current system)

```typescript
dealerships {
  id: VARCHAR (UUID) PRIMARY KEY
  name: TEXT NOT NULL
  location: TEXT NOT NULL (city name)
  province: TEXT NOT NULL (e.g., "QC")
  address: TEXT NOT NULL
  postal_code: TEXT NOT NULL
  phone: TEXT NOT NULL
  created_at: TIMESTAMP DEFAULT NOW()
}
```

**Example**:
```json
{
  "id": "ea1bc5a6-6349-496e-8359-809d3e1b33e",
  "name": "Premier Auto Group",
  "location": "Montreal",
  "province": "QC",
  "address": "123 Rue Saint-Laurent, Montreal, QC",
  "postal_code": "H2X 1Y2",
  "phone": "(514) 555-0123",
  "created_at": "2025-11-20T10:30:00.000Z"
}
```

#### **cars** (one-to-many relationship with dealerships)

```typescript
cars {
  id: VARCHAR (UUID) PRIMARY KEY
  dealership_id: VARCHAR FK → dealerships.id (CASCADE DELETE)
  vin: TEXT (nullable, unique at application level)
  stock_number: TEXT (nullable, unique at application level)
  condition: TEXT NOT NULL (enum: 'new', 'used', 'certified pre-owned')
  make: TEXT NOT NULL (e.g., "Toyota")
  model: TEXT NOT NULL (e.g., "Camry")
  trim: TEXT NOT NULL (e.g., "LE", "XLE", "Hybrid")
  year: TEXT NOT NULL (YYYY format)
  color: TEXT NOT NULL (e.g., "Black", "Silver")
  price: TEXT NOT NULL (numeric as string for flexibility)
  kilometers: TEXT NOT NULL (numeric as string)
  transmission: TEXT NOT NULL (e.g., "automatic", "manual")
  fuel_type: TEXT NOT NULL (e.g., "gasoline", "diesel", "hybrid")
  body_type: TEXT NOT NULL (e.g., "sedan", "suv", "truck")
  drivetrain: TEXT (nullable, e.g., "FWD", "AWD")
  engine_cylinders: TEXT (nullable, e.g., "4", "6", "8")
  engine_displacement: TEXT (nullable, e.g., "2.5L")
  features: TEXT[] (array of feature names, e.g., ["Leather Seats", "Backup Camera"])
  listing_link: TEXT NOT NULL (URL to listing page)
  carfax_link: TEXT NOT NULL (URL to Carfax report)
  carfax_status: TEXT (nullable, enum: 'clean', 'claims', 'unavailable')
  notes: TEXT NOT NULL (dealer notes about condition/history)
  status: TEXT DEFAULT 'available' NOT NULL (enum: 'available', 'sold', 'pending')
  created_at: TIMESTAMP DEFAULT NOW()
}
```

**Example**:
```json
{
  "id": "64ce5484-e60a-4ae3-856b-e2f16a536bea",
  "dealership_id": "ea1bc5a6-6349-496e-8359-809d3e1b33e",
  "vin": "2T1FB1E31DC123456",
  "stock_number": "PM-2024-001",
  "condition": "used",
  "make": "Toyota",
  "model": "Camry",
  "trim": "XLE",
  "year": "2024",
  "color": "Silver",
  "price": "35000",
  "kilometers": "15000",
  "transmission": "automatic",
  "fuel_type": "gasoline",
  "body_type": "sedan",
  "drivetrain": "FWD",
  "engine_cylinders": "4",
  "engine_displacement": "2.5L",
  "features": ["Leather Seats", "Sunroof", "Navigation", "Backup Camera", "Heated Seats"],
  "listing_link": "https://premierauto.example.com/vehicle/64ce5484",
  "carfax_link": "https://www.carfax.ca/report/2T1FB1E31DC123456",
  "carfax_status": "clean",
  "notes": "Excellent condition, single owner, full service history",
  "status": "available",
  "created_at": "2025-11-20T11:45:00.000Z"
}
```

### Relationships & Cascade

```
dealerships (1) ──── (N) cars
  └─ onDelete: CASCADE  → When dealership is deleted, all its cars are deleted
```

### Query Patterns Used in Application

1. **Get all dealerships**: `SELECT * FROM dealerships;`
2. **Get all cars**: `SELECT * FROM cars;`
3. **Get cars by dealership**: `SELECT * FROM cars WHERE dealership_id = $1;`
4. **Search cars**: `SELECT * FROM cars WHERE make ILIKE $1 OR model ILIKE $2 ...;`
5. **Filter cars by fields**: `SELECT * FROM cars WHERE year >= $1 AND price <= $2 ...;`
6. **Get car by VIN**: `SELECT * FROM cars WHERE vin = $1;`
7. **Create car**: `INSERT INTO cars (...) VALUES (...) RETURNING *;`
8. **Update car**: `UPDATE cars SET (...) WHERE id = $1 RETURNING *;`
9. **Delete car**: `DELETE FROM cars WHERE id = $1;`

### Migration to Firestore

Current tables map to Firestore collections:

```
Firestore
├── dealerships/ (collection)
│   ├── {dealership_id1} (document)
│   │   ├── name: "Premier Auto Group"
│   │   ├── location: "Montreal"
│   │   └── ...
│   └── {dealership_id2}
│
└── cars/ (collection)
    ├── {car_id1} (document)
    │   ├── dealership_id: "dealership_id1" (reference)
    │   ├── make: "Toyota"
    │   └── ...
    └── {car_id2}
```

**Firestore Advantages**:
- Real-time sync (no polling needed)
- Built-in auth integration
- Automatic indexing
- No ops/server management

**Migration complexity**: Moderate - need to restructure queries from SQL → Firestore queries

---

## 5. AI / LLM WORKFLOW

### Current State: NO LLM INTEGRATION

The current Replit application does **NOT use any LLM or AI features**.

### Potential AI Features for Enhancement

If implementing AI via Google AI Studio (future):

1. **VIN Auto-Fill Suggestions**
   - User enters partial VIN
   - LLM suggests likely make/model/year based on VIN patterns
   - Autocompletes fields

2. **Intelligent Listing Description**
   - LLM generates listing description from car data
   - Optimized for marketplaceswhere listed

3. **Price Recommendation**
   - LLM analyzes historical data + market trends
   - Suggests optimal price based on condition, make, mileage
   - Compares against market averages

4. **Appraisal Automation**
   - LLM evaluates car condition notes
   - Suggests fair appraisal value
   - Flags potential issues

### Integration Pattern (if implemented)

```typescript
// In backend
async function generateListing(carData: Car): Promise<string> {
  const response = await googleAIStudio.generateContent({
    prompt: `Generate a compelling vehicle listing for: 
      ${carData.year} ${carData.make} ${carData.model} ${carData.trim}
      Color: ${carData.color}
      Condition: ${carData.condition}
      Mileage: ${carData.kilometers}km
      Features: ${carData.features?.join(', ')}
    `,
    model: "gemini-pro"
  });
  return response.text;
}

// Call from frontend
const { data: listingDescription } = useQuery({
  queryKey: ['listing', carId],
  queryFn: () => fetch(`/api/cars/${carId}/listing`).then(r => r.json())
});
```

---

## 6. API INTEGRATIONS

### External APIs Currently Used

1. **NHTSA VIN Decoder API** (Vehicle Info)
   - URL: `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/...`
   - Method: GET
   - Purpose: Decode VIN to extract make, model, year, body type, etc.
   - Used in: `client/lib/nhtsa.ts` → `decodeVIN()`
   - Rate limit: No specific limit documented; used client-side

2. **Canadian Trim Database** (Local Static JSON)
   - File: `/attached_assets/canadian_trim_data.json`
   - Format: JSON with makes as keys, trims as values
   - Purpose: Autocomplete trim options based on selected make
   - Used in: inventory.tsx filter dropdown, add vehicle form

### No Third-Party Integrations

- **Stripe**: Not integrated (no payment processing)
- **Twilio**: Not integrated (no SMS/calls)
- **Mailgun/SendGrid**: Not integrated (no email)
- **Google Maps**: Not integrated (location data is static)
- **Carfax API**: Not integrated; only stores URL and status manually

### Make.com Automation Workflows (Planned for Migration)

Suggested integration points when migrating to Make:

1. **New Vehicle Alert Workflow**
   - Trigger: New car created in Firestore
   - Action: Send email to dealership managers + SMS to lead generation team
   - Action: Post to internal Slack channel

2. **Vehicle Status Changed Workflow**
   - Trigger: Car status changes from 'available' → 'sold'
   - Action: Update internal inventory counts
   - Action: Archive listing on external marketplaces
   - Action: Notify dealership team

3. **Price Update Notification**
   - Trigger: Car price changed by > 5%
   - Action: Notify manager for approval
   - Action: Update external listings

4. **Scheduled Reports**
   - Trigger: Every Monday 8 AM
   - Action: Generate weekly inventory report
   - Action: Email to dealership owners

---

## 7. FRONTEND OVERVIEW

### UI Architecture

**Framework**: React 19 with TypeScript + Vite  
**Styling**: Tailwind CSS v4 + shadcn/ui (New York variant)  
**Routing**: Wouter (lightweight alternative to React Router)  
**State Management**: TanStack Query (React Query) for server state  
**Form Handling**: React Hook Form + Zod validation  
**Icons**: Lucide React (40+ icons used)  
**Animations**: Tailwind CSS animations + framer-motion (optional)

### Component Hierarchy

```
App (root router)
├── Layout (persistent sidebar + header)
│   ├── Sidebar Navigation
│   │   ├── Logo/Brand
│   │   ├── Dealership Selector
│   │   └── Nav Links (Inventory, Upload, Appraisal)
│   │
│   └── Main Content Area
│       ├── Route: /inventory
│       │   └── InventoryPage
│       │       ├── Header (title + stats)
│       │       ├── Filters Section (collapsible)
│       │       │   ├── Make dropdown
│       │       │   ├── Model dropdown
│       │       │   ├── Year range slider
│       │       │   ├── Price range slider
│       │       │   ├── Kilometers range slider
│       │       │   ├── Multi-select checkboxes (transmission, drivetrain, etc.)
│       │       │   └── Clear All button
│       │       ├── Dealership Sidebar
│       │       │   ├── All Inventory button
│       │       │   └── Individual dealership buttons
│       │       │       ├── Edit button
│       │       │       ├── Delete button
│       │       │       └── Car count badge
│       │       ├── Vehicles Grid
│       │       │   └── Car Cards (repeating)
│       │       │       ├── Image (if available)
│       │       │       ├── Vehicle info (make, model, year, price)
│       │       │       ├── Specs (transmission, mileage, fuel)
│       │       │       ├── Status badge
│       │       │       ├── Actions
│       │       │       │   ├── Available/Sold button
│       │       │       │   ├── External link button (to listing)
│       │       │       │   ├── Edit button
│       │       │       │   └── Delete button
│       │       │       └── Carfax status (if available)
│       │       └── Dialogs
│       │           ├── Add Dealership Modal
│       │           ├── Edit Dealership Modal
│       │           └── Edit Vehicle Modal
│       │
│       ├── Route: /upload
│       │   └── UploadPage
│       │       ├── CSV file selector
│       │       ├── Manual URL input
│       │       ├── Preview of vehicles to import
│       │       └── Import button
│       │
│       └── Route: /appraisal
│           └── AppraisalPage
│               ├── VIN/Stock Number search
│               ├── Vehicle details form
│               ├── Condition assessment
│               ├── Features checklist
│               ├── Market research data
│               └── Appraisal value output
│
└── Toast Notifications (Sonner)
    ├── Success messages
    ├── Error messages
    └── Loading states
```

### Data Flow: Client to Backend

```
User Action (click, type, form submit)
    ↓
React State Update (useState hook)
    ↓
API Call via React Query Hook (useMutation or useQuery)
    ↓
fetch() to backend API endpoint
    ↓
Server validates request with Zod schema
    ↓
Storage layer executes database query
    ↓
Response returned to client
    ↓
React Query cache updated (invalidateQueries)
    ↓
Component re-renders with new data
    ↓
Toast notification shown to user
```

### User Flows

**Flow 1: Browse Inventory**
1. User lands on /inventory
2. System fetches all dealerships + all cars
3. User selects a dealership from sidebar
4. Cars filtered by dealership on client
5. User adjusts filters (make, year, price, etc.)
6. Cars filtered client-side in real-time
7. User clicks "Clear Filters" to reset

**Flow 2: Add Vehicle**
1. Click "Add Vehicle" in dealership actions
2. Modal opens with form
3. User enters VIN
4. System auto-fetches VIN details from NHTSA + Canadian trim DB
5. Form pre-fills with decoded data
6. User reviews and adds more details (features, price, etc.)
7. Click "Save"
8. Submission validates all required fields
9. POST to /api/cars
10. Success: Car added, toast shown, inventory refreshed

**Flow 3: Edit Vehicle**
1. Click edit icon on car card
2. Modal opens pre-filled with car data
3. User modifies fields
4. PATCH to /api/cars/{id}
5. Validation enforces VIN or Stock Number
6. Success: Car updated, inventory refreshed

**Flow 4: Search by VIN**
1. User enters VIN in search field
2. Query /api/cars/vin/{vin}
3. If exists: Display car details
4. If not exists: Show "No car found" message
5. Use search results to pre-fill edit form

---

## 8. BACKEND OVERVIEW

### Architecture Pattern

**Design**: RESTful API with clear separation of concerns

```
Express App
├── HTTP Routes (/api/*)
│   └── Request validation (Zod schemas)
│   └── Error handling (try-catch)
│   └── HTTP status codes (200, 201, 400, 404, 500)
│
└── Storage Layer (Abstract database)
    └── Database queries (Drizzle ORM)
    └── Transaction management
    └── Error handling
```

### Request Flow Example

```
POST /api/cars
  ↓
app.post("/api/cars", async (req, res) => {
  try {
    const validated = insertCarSchema.parse(req.body);  // ← Zod validation
    const existingByVin = await storage.getCarByVin(validated.vin);  // ← Check duplicates
    if (existingByVin) return res.status(409).json(...);  // ← Conflict
    const car = await storage.createCar(validated);  // ← DB insert
    res.status(201).json(car);  // ← Success
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(400).json({ error: "Invalid car data" });  // ← Validation error
  }
})
```

### Error Handling

**HTTP Status Codes Used**:
- **200 OK**: Successful GET, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation failed, missing required fields
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate VIN or Stock Number
- **500 Internal Server Error**: Database or server error

**Error Responses**:
```json
{
  "error": "A vehicle with this VIN already exists"
}
```

### Routing Structure

```
/api/dealerships
  GET    (list all)
  POST   (create)
  /{id}
    GET     (single)
    PATCH   (update)
    DELETE  (delete)

/api/cars
  GET    (list all, with optional filters)
  POST   (create)
  /{id}
    GET     (single)
    PATCH   (update)
    DELETE  (delete)
  /vin/{vin}
    GET     (lookup by VIN)
  /stock/{stockNumber}
    GET     (lookup by stock number)
```

### Middleware

**Current Middleware**:
- `express.json()`: Parse JSON request bodies
- Session middleware (placeholder, not active)
- Vite dev middleware (in development): HMR support

**Recommended Middleware for Production**:
```typescript
app.use(cors());  // CORS headers
app.use(helmet());  // Security headers
app.use(morgan('combined'));  // Request logging
app.use(authMiddleware);  // Auth on protected routes
```

### Database Connection

**Method**: Neon serverless PostgreSQL via HTTP  
**Driver**: `@neondatabase/serverless`  
**Connection String**: Stored in environment variable `DATABASE_URL`

```typescript
import { Pool } from '@neondatabase/serverless';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);
```

### File Storage

**Current**: No file storage  
**Recommendations for Migration**:
- Firebase Cloud Storage for vehicle images
- Make.com integration for document handling

---

## 9. DEPENDENCIES & VERSIONS

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.21.2 | Web server framework |
| `drizzle-orm` | ^0.39.1 | Type-safe ORM for PostgreSQL |
| `@neondatabase/serverless` | ^0.10.4 | Serverless PostgreSQL driver |
| `zod` | ^3.25.76 | Runtime type validation |
| `drizzle-zod` | ^0.7.0 | Zod schema generation from Drizzle |
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | React DOM rendering |
| `@tanstack/react-query` | ^5.60.5 | Server state management |
| `wouter` | ^3.3.5 | Lightweight routing |
| `react-hook-form` | ^7.66.0 | Form state management |
| `@hookform/resolvers` | ^3.10.0 | Form validation resolvers |
| `tailwindcss` | ^4.1.14 | CSS utility framework |
| `@radix-ui/*` | ^1.2-2.2 | Headless UI components (20+ packages) |
| `shadcn/ui` | (local) | Pre-built Radix components |
| `lucide-react` | ^0.545.0 | Icon library |
| `sonner` | ^2.0.7 | Toast notifications |
| `framer-motion` | ^12.23.24 | Animation library (optional) |
| `recharts` | ^2.15.4 | Charting library (for future analytics) |
| `date-fns` | ^3.6.0 | Date manipulation |
| `clsx` | ^2.1.1 | Class name utilities |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5.6.3 | Type checking |
| `vite` | ^7.1.9 | Build tool & dev server |
| `@vitejs/plugin-react` | ^5.0.4 | React support for Vite |
| `@tailwindcss/vite` | ^4.1.14 | Tailwind v4 Vite plugin |
| `drizzle-kit` | ^0.31.4 | Database migration tools |
| `esbuild` | ^0.25.0 | Server bundler |
| `tsx` | ^4.20.5 | TypeScript execution |
| `@types/*` | various | TypeScript type definitions |

### Build Output

```bash
npm run build
# Creates:
# - dist/public/  (Vite bundle for frontend)
# - dist/index.js (esbuild bundle for server)
```

### Environment Variables

```
DATABASE_URL=postgresql://...neon.tech  (Neon serverless connection)
NODE_ENV=production|development
```

---

## 10. REDEPLOYMENT GUIDE: Firebase + Google AI Studio

### Step 1: Prepare Firestore Schema

**Map current PostgreSQL schema to Firestore:**

```
Firebase Project
├── Authentication (Email/Password)
├── Firestore Database
│   ├── dealerships/ (collection)
│   │   └── {doc} { name, location, province, address, postalCode, phone, createdAt }
│   │
│   └── cars/ (collection)
│       └── {doc} { dealershipId, vin, stockNumber, make, model, year, price, ... }
│
└── Cloud Storage (for images - optional)
    └── vehicles/ (folder structure by dealership)
```

### Step 2: Migrate Database from PostgreSQL to Firestore

**Option A: Automated Migration**
```bash
# Export PostgreSQL data as JSON
npm run export:db

# Import to Firestore using Firebase Admin SDK
node scripts/migrate-to-firestore.js
```

**Script Example** (`scripts/migrate-to-firestore.js`):
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();
const dealershipsData = require('../exports/dealerships.json');

for (const dealership of dealershipsData) {
  await addDoc(collection(db, 'dealerships'), {
    name: dealership.name,
    location: dealership.location,
    province: dealership.province,
    address: dealership.address,
    postalCode: dealership.postal_code,
    phone: dealership.phone,
    createdAt: new Date(dealership.created_at),
  });
}
```

**Option B: Manual Migration**
1. Open Firebase Console → Firestore
2. Create collections manually
3. Add documents with data from exported JSON

### Step 3: Set Up Firebase Project

1. Create Firebase project: https://console.firebase.google.com
2. Enable services:
   - Authentication (Email/Password provider)
   - Firestore Database (native mode, US multi-region)
   - Cloud Storage (optional, for images)
3. Generate service account key for server-side operations
4. Create web app for frontend

### Step 4: Update Backend (Express → Firebase Functions or Node.js)

**Option A: Firebase Cloud Functions** (Recommended)
```bash
firebase init functions
```

Rewrite routes to use Firebase Admin SDK:
```typescript
// Old (Drizzle + PostgreSQL)
app.get("/api/cars", async (req, res) => {
  const cars = await storage.getAllCars();
  res.json(cars);
});

// New (Firebase Firestore)
exports.getCars = functions.http.onRequest(async (req, res) => {
  const snapshot = await db.collection('cars').get();
  const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(cars);
});
```

**Option B: Keep Express, Add Firebase SDK**
```typescript
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/api/cars", async (req, res) => {
  const snapshot = await db.collection('cars').get();
  const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(cars);
});
```

### Step 5: Update Frontend (Add Firebase Auth)

**Install Firebase SDK:**
```bash
npm install firebase
```

**Create Firebase config** (`src/lib/firebase.ts`):
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Create Auth Context** (`src/contexts/AuthContext.tsx`):
```typescript
import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout: () => signOut(auth) }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

**Wrap App with Auth Provider** (`src/App.tsx`):
```typescript
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          {/* routes */}
        </Layout>
      </Router>
    </AuthProvider>
  );
}
```

**Add Login Page** (`src/pages/login.tsx`):
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to /inventory
    } catch (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-4">
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleLogin}>Sign In</Button>
      </div>
    </div>
  );
}
```

**Update API Hooks** (`src/lib/api-hooks.ts`):
```typescript
import { collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchCars() {
  const snapshot = await getDocs(collection(db, 'cars'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createCar(carData) {
  const docRef = await addDoc(collection(db, 'cars'), carData);
  return { id: docRef.id, ...carData };
}

export async function updateCar(id, carData) {
  const carRef = doc(db, 'cars', id);
  await updateDoc(carRef, carData);
  return { id, ...carData };
}

export async function deleteCar(id) {
  await deleteDoc(doc(db, 'cars', id));
}
```

### Step 6: Set Up Make.com Workflows

**Workflow 1: New Vehicle Alert**
```
Trigger: Firestore - Document Created (collection: cars)
Actions:
  1. Gmail - Send Email
     To: dealership managers
     Subject: New vehicle added: {make} {model}
     Body: Template with car details
  2. Slack - Send Message
     Channel: #inventory
     Message: New car: {year} {make} {model} - {price}
```

**Workflow 2: Vehicle Status Change**
```
Trigger: Firestore - Document Updated (collection: cars, field: status)
Condition: status changed to "sold"
Actions:
  1. Google Sheets - Add Row
     Spreadsheet: Sold Vehicles Log
  2. Slack - Send Message
     Channel: #sales
     Message: {make} {model} SOLD for {price}
```

**Workflow 3: Weekly Inventory Report**
```
Trigger: Schedule - Every Monday 08:00 AM
Actions:
  1. Firestore - Count Documents (cars where status = "available")
  2. Gmail - Send Email
     To: owner@dealership.com
     Subject: Weekly Inventory Report
     Body: Google Sheets with summary stats
```

### Step 7: Set Up Google AI Studio (Optional)

**Integration point: VIN decoding enhancement**

1. Sign up: https://ai.google.dev
2. Create API key
3. Add to backend:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

app.post("/api/cars/analyze-vin", async (req, res) => {
  const { vin } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this VIN and extract vehicle info: ${vin}. 
    Return JSON: { make, model, year, body_type, engine }`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  res.json(JSON.parse(text));
});
```

### Step 8: Deploy Frontend to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Step 9: Deploy Backend

**Option A: Firebase Functions**
```bash
firebase deploy --only functions
```

**Option B: Google Cloud Run**
```bash
gcloud run deploy automanager --source .
```

**Option C: Traditional hosting (Heroku, Railway, Fly.io)**
```bash
# Build
npm run build

# Deploy
git push heroku main
```

### Step 10: Set Up Monitoring & Logging

**Firebase Console:**
- Performance Monitoring
- Cloud Functions Logs
- Firestore Usage

**Google Cloud Console:**
- Cloud Logging (centralized logs)
- Cloud Monitoring (metrics, alerts)

### Migration Complexity Analysis

| Component | Complexity | Effort | Notes |
|-----------|-----------|--------|-------|
| Database (PostgreSQL → Firestore) | **Medium** | 4-6 hrs | Data structure is similar; need migration script |
| Authentication | **Low** | 2-3 hrs | Firebase Auth is simpler than building from scratch |
| API Routes | **Medium** | 6-8 hrs | Need to rewrite from Express to Firestore queries |
| Frontend Auth Integration | **Low** | 2-3 hrs | Firebase SDK is straightforward |
| Make.com Workflows | **Low** | 3-4 hrs | Visual UI, no coding required |
| Google AI Integration | **Low** | 2-3 hrs | Simple API calls, optional feature |
| **Total** | | **19-27 hrs** | ~2-3 days of development |

### Risk Mitigation

1. **Data Loss**: Export PostgreSQL → JSON backup before migration
2. **Downtime**: Dual-write pattern during migration (write to both DB systems)
3. **Breaking Changes**: Keep old API running in parallel, redirect traffic gradually
4. **Cost**: Use Firebase free tier for testing; monitor usage

### Post-Migration Verification

- [ ] All dealerships migrated (count matches)
- [ ] All cars migrated with correct relationships
- [ ] Auth working (login/logout flows)
- [ ] All CRUD operations tested
- [ ] Make.com workflows triggering correctly
- [ ] Performance comparable or better
- [ ] Load testing at expected traffic levels
- [ ] Backup/restore tested

### Rollback Plan

If issues arise:
1. Keep PostgreSQL running for 2 weeks post-migration
2. Revert API to use PostgreSQL (single line config change)
3. Restore DNS to old server IP
4. Notify users of temporary maintenance
5. Fix issues, retry migration

---

## SUMMARY: Key Takeaways for Migration

### What Stays the Same
- React frontend structure (pages, components, hooks)
- UI/UX design (shadcn/ui components still work)
- Business logic (filtering, validation rules)
- External APIs (NHTSA VIN decoder, Carfax links)

### What Changes
- **Database**: PostgreSQL ↔ Firestore (query syntax different)
- **Authentication**: None → Firebase Auth (add login/logout screens)
- **Hosting**: Replit ↔ Firebase Hosting + Cloud Functions
- **API Layer**: Express routes ↔ Firebase Functions or Firestore SDK
- **Automation**: None → Make.com workflows

### Time & Cost Estimates
- **Development Time**: 2-3 weeks (including testing)
- **Firebase Cost**: ~$5-20/month (at current traffic levels)
- **Make.com Cost**: ~$10/month for automation workflows
- **Total Savings**: Eliminate Replit subscription, gain scalability

### Recommended Implementation Order
1. Set up Firebase project + Firestore
2. Migrate data from PostgreSQL
3. Add Firebase Auth to frontend
4. Rewrite API layer
5. Set up Make.com workflows
6. Test end-to-end
7. Deploy and monitor
8. Keep old system running 2 weeks for rollback capability

---

**Documentation Generated**: November 21, 2025  
**Project Status**: Development Complete - Ready for Migration  
**Next Steps**: Execute migration plan following this guide
