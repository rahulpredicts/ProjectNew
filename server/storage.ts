import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, ilike, or, and, sql as sqlFn, count, gte, lte, inArray, like, asc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { 
  Dealership, 
  InsertDealership, 
  UpdateDealership,
  Car,
  InsertCar,
  UpdateCar,
  User,
  UpsertUser,
  CreateUserInput,
  UpdateUserInput
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface CarFilterParams {
  dealershipId?: string;
  search?: string;
  status?: string;
  make?: string;
  model?: string;
  vin?: string;
  vinStart?: string;
  color?: string;
  trim?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  kmsMin?: number;
  kmsMax?: number;
  province?: string;
  transmission?: string[];
  drivetrain?: string[];
  fuelType?: string[];
  bodyType?: string[];
  engineCylinders?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IStorage {
  // User operations - Required for Replit Auth and admin user management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createPasswordUser(userData: CreateUserInput, passwordHash: string): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUser(id: string, data: UpdateUserInput): Promise<User | undefined>;
  updateUserPassword(id: string, passwordHash: string): Promise<User | undefined>;
  setPasswordResetToken(id: string, token: string, expiry: Date): Promise<User | undefined>;
  clearPasswordResetToken(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Dealership operations
  getAllDealerships(): Promise<Dealership[]>;
  getDealership(id: string): Promise<Dealership | undefined>;
  getDealershipByName(name: string): Promise<Dealership | undefined>;
  createDealership(dealership: InsertDealership): Promise<Dealership>;
  updateDealership(id: string, dealership: UpdateDealership): Promise<Dealership | undefined>;
  deleteDealership(id: string): Promise<boolean>;
  
  // Car operations
  getAllCars(): Promise<Car[]>;
  getCarsPaginated(params: PaginationParams, filters?: CarFilterParams): Promise<PaginatedResult<Car>>;
  getCarsByDealership(dealershipId: string): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
  getCarByVin(vin: string): Promise<Car | undefined>;
  getCarByStockNumber(stockNumber: string): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, car: UpdateCar): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  searchCars(query: string): Promise<Car[]>;
  getCarsCount(dealershipId?: string, status?: string): Promise<{ total: number; available: number; sold: number; pending: number }>;
  getCarCountsByDealership(): Promise<Record<string, number>>;

  // Transport quote operations
  createTransportQuote(quote: schema.InsertTransportQuote): Promise<schema.TransportQuote>;
  getTransportQuote(id: string): Promise<schema.TransportQuote | undefined>;
  getTransportQuoteByNumber(quoteNumber: string): Promise<schema.TransportQuote | undefined>;
  getAllTransportQuotes(): Promise<schema.TransportQuote[]>;
  getTransportQuotesByUser(userId: string): Promise<schema.TransportQuote[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth and admin user management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createPasswordUser(userData: CreateUserInput, passwordHash: string): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash,
        authType: 'password',
        isActive: 'true',
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ role, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        passwordHash, 
        passwordResetToken: null, 
        passwordResetExpiry: null,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async setPasswordResetToken(id: string, token: string, expiry: Date): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        passwordResetToken: token, 
        passwordResetExpiry: expiry,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async clearPasswordResetToken(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ 
        passwordResetToken: null, 
        passwordResetExpiry: null,
        updatedAt: new Date() 
      })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const results = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
    return results.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
  }

  // Dealership operations
  async getAllDealerships(): Promise<Dealership[]> {
    return await db.select().from(schema.dealerships).orderBy(desc(schema.dealerships.createdAt));
  }

  async getDealership(id: string): Promise<Dealership | undefined> {
    const results = await db.select().from(schema.dealerships).where(eq(schema.dealerships.id, id));
    return results[0];
  }

  async getDealershipByName(name: string): Promise<Dealership | undefined> {
    const results = await db.select().from(schema.dealerships).where(ilike(schema.dealerships.name, name.trim()));
    return results[0];
  }

  async createDealership(dealership: InsertDealership): Promise<Dealership> {
    const results = await db.insert(schema.dealerships).values(dealership).returning();
    return results[0];
  }

  async updateDealership(id: string, dealership: UpdateDealership): Promise<Dealership | undefined> {
    const results = await db.update(schema.dealerships)
      .set(dealership)
      .where(eq(schema.dealerships.id, id))
      .returning();
    return results[0];
  }

  async deleteDealership(id: string): Promise<boolean> {
    const results = await db.delete(schema.dealerships).where(eq(schema.dealerships.id, id)).returning();
    return results.length > 0;
  }

  // Car operations
  async getAllCars(): Promise<Car[]> {
    return await db.select().from(schema.cars).orderBy(desc(schema.cars.createdAt));
  }

  async getCarsPaginated(
    params: PaginationParams, 
    filters?: CarFilterParams
  ): Promise<PaginatedResult<Car>> {
    const { page, pageSize } = params;
    const offset = (page - 1) * pageSize;
    
    const conditions: any[] = [];
    
    if (filters?.dealershipId) {
      conditions.push(eq(schema.cars.dealershipId, filters.dealershipId));
    }
    
    if (filters?.status && filters.status !== 'all') {
      conditions.push(eq(schema.cars.status, filters.status));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(schema.cars.vin, searchTerm),
          ilike(schema.cars.make, searchTerm),
          ilike(schema.cars.model, searchTerm),
          ilike(schema.cars.trim, searchTerm),
          ilike(schema.cars.year, searchTerm),
          ilike(schema.cars.color, searchTerm),
          ilike(schema.cars.stockNumber, searchTerm)
        )
      );
    }
    
    if (filters?.make) {
      conditions.push(ilike(schema.cars.make, `%${filters.make}%`));
    }
    
    if (filters?.model) {
      conditions.push(ilike(schema.cars.model, `%${filters.model}%`));
    }
    
    if (filters?.vin) {
      conditions.push(ilike(schema.cars.vin, `%${filters.vin}%`));
    }
    
    if (filters?.vinStart) {
      conditions.push(like(schema.cars.vin, `${filters.vinStart}%`));
    }
    
    if (filters?.color) {
      conditions.push(ilike(schema.cars.color, `%${filters.color}%`));
    }
    
    if (filters?.trim) {
      conditions.push(ilike(schema.cars.trim, `%${filters.trim}%`));
    }
    
    if (filters?.yearMin !== undefined) {
      conditions.push(gte(sqlFn`CAST(${schema.cars.year} AS INTEGER)`, filters.yearMin));
    }
    
    if (filters?.yearMax !== undefined) {
      conditions.push(lte(sqlFn`CAST(${schema.cars.year} AS INTEGER)`, filters.yearMax));
    }
    
    if (filters?.priceMin !== undefined) {
      conditions.push(gte(sqlFn`CAST(${schema.cars.price} AS NUMERIC)`, filters.priceMin));
    }
    
    if (filters?.priceMax !== undefined) {
      conditions.push(lte(sqlFn`CAST(${schema.cars.price} AS NUMERIC)`, filters.priceMax));
    }
    
    if (filters?.kmsMin !== undefined) {
      conditions.push(gte(sqlFn`CAST(${schema.cars.kilometers} AS NUMERIC)`, filters.kmsMin));
    }
    
    if (filters?.kmsMax !== undefined) {
      conditions.push(lte(sqlFn`CAST(${schema.cars.kilometers} AS NUMERIC)`, filters.kmsMax));
    }
    
    if (filters?.transmission && filters.transmission.length > 0) {
      conditions.push(inArray(schema.cars.transmission, filters.transmission));
    }
    
    if (filters?.drivetrain && filters.drivetrain.length > 0) {
      conditions.push(inArray(schema.cars.drivetrain, filters.drivetrain));
    }
    
    if (filters?.fuelType && filters.fuelType.length > 0) {
      conditions.push(inArray(schema.cars.fuelType, filters.fuelType));
    }
    
    if (filters?.bodyType && filters.bodyType.length > 0) {
      conditions.push(inArray(schema.cars.bodyType, filters.bodyType));
    }
    
    if (filters?.engineCylinders && filters.engineCylinders.length > 0) {
      conditions.push(inArray(schema.cars.engineCylinders, filters.engineCylinders));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Map sortBy field to database column
    const getSortColumn = (field: string) => {
      const fieldMap: any = {
        'price': schema.cars.price,
        'year': schema.cars.year,
        'kilometers': schema.cars.kilometers,
        'addedDate': schema.cars.createdAt,
        'make': schema.cars.make,
        'model': schema.cars.model
      };
      return fieldMap[field] || schema.cars.createdAt;
    };
    
    const sortColumn = filters?.sortBy ? getSortColumn(filters.sortBy) : schema.cars.createdAt;
    const isAscending = filters?.sortOrder === 'asc';
    
    const [countResult, data] = await Promise.all([
      db.select({ count: count() }).from(schema.cars).where(whereClause),
      db.select().from(schema.cars)
        .where(whereClause)
        .orderBy(isAscending ? asc(sortColumn) : desc(sortColumn))
        .limit(pageSize)
        .offset(offset)
    ]);
    
    const total = countResult[0]?.count || 0;
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async getCarsCount(dealershipId?: string, status?: string): Promise<{ total: number; available: number; sold: number; pending: number }> {
    const dealershipCondition = dealershipId ? eq(schema.cars.dealershipId, dealershipId) : undefined;
    
    const [totalResult, availableResult, soldResult, pendingResult] = await Promise.all([
      db.select({ count: count() }).from(schema.cars).where(dealershipCondition),
      db.select({ count: count() }).from(schema.cars).where(
        dealershipCondition 
          ? and(dealershipCondition, eq(schema.cars.status, 'available'))
          : eq(schema.cars.status, 'available')
      ),
      db.select({ count: count() }).from(schema.cars).where(
        dealershipCondition 
          ? and(dealershipCondition, eq(schema.cars.status, 'sold'))
          : eq(schema.cars.status, 'sold')
      ),
      db.select({ count: count() }).from(schema.cars).where(
        dealershipCondition 
          ? and(dealershipCondition, eq(schema.cars.status, 'pending'))
          : eq(schema.cars.status, 'pending')
      )
    ]);
    
    return {
      total: totalResult[0]?.count || 0,
      available: availableResult[0]?.count || 0,
      sold: soldResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0
    };
  }

  async getCarsByDealership(dealershipId: string): Promise<Car[]> {
    return await db.select().from(schema.cars)
      .where(eq(schema.cars.dealershipId, dealershipId))
      .orderBy(desc(schema.cars.createdAt));
  }

  async getCar(id: string): Promise<Car | undefined> {
    const results = await db.select().from(schema.cars).where(eq(schema.cars.id, id));
    return results[0];
  }

  async getCarByVin(vin: string): Promise<Car | undefined> {
    const results = await db.select().from(schema.cars).where(eq(schema.cars.vin, vin));
    return results[0];
  }

  async getCarByStockNumber(stockNumber: string): Promise<Car | undefined> {
    const results = await db.select().from(schema.cars).where(eq(schema.cars.stockNumber, stockNumber));
    return results[0];
  }

  async createCar(car: InsertCar): Promise<Car> {
    const results = await db.insert(schema.cars).values(car).returning();
    return results[0];
  }

  async updateCar(id: string, car: UpdateCar): Promise<Car | undefined> {
    const results = await db.update(schema.cars)
      .set(car)
      .where(eq(schema.cars.id, id))
      .returning();
    return results[0];
  }

  async deleteCar(id: string): Promise<boolean> {
    const results = await db.delete(schema.cars).where(eq(schema.cars.id, id)).returning();
    return results.length > 0;
  }

  async searchCars(query: string): Promise<Car[]> {
    const searchTerm = `%${query}%`;
    return await db.select().from(schema.cars)
      .where(
        or(
          ilike(schema.cars.vin, searchTerm),
          ilike(schema.cars.make, searchTerm),
          ilike(schema.cars.model, searchTerm),
          ilike(schema.cars.trim, searchTerm),
          ilike(schema.cars.year, searchTerm),
          ilike(schema.cars.color, searchTerm),
          ilike(schema.cars.bodyType, searchTerm),
          ilike(schema.cars.fuelType, searchTerm),
          ilike(schema.cars.drivetrain, searchTerm),
          ilike(schema.cars.notes, searchTerm)
        )
      )
      .orderBy(desc(schema.cars.createdAt));
  }

  async getCarCountsByDealership(): Promise<Record<string, number>> {
    const results = await db.select({
      dealershipId: schema.cars.dealershipId,
      count: count()
    })
    .from(schema.cars)
    .groupBy(schema.cars.dealershipId);
    
    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.dealershipId] = row.count;
    }
    return counts;
  }

  // Transport quote operations
  async createTransportQuote(quote: schema.InsertTransportQuote): Promise<schema.TransportQuote> {
    const results = await db.insert(schema.transportQuotes).values(quote).returning();
    return results[0];
  }

  async getTransportQuote(id: string): Promise<schema.TransportQuote | undefined> {
    const results = await db.select().from(schema.transportQuotes).where(eq(schema.transportQuotes.id, id));
    return results[0];
  }

  async getTransportQuoteByNumber(quoteNumber: string): Promise<schema.TransportQuote | undefined> {
    const results = await db.select().from(schema.transportQuotes).where(eq(schema.transportQuotes.quoteNumber, quoteNumber));
    return results[0];
  }

  async getAllTransportQuotes(): Promise<schema.TransportQuote[]> {
    return await db.select().from(schema.transportQuotes).orderBy(desc(schema.transportQuotes.createdAt));
  }

  async getTransportQuotesByUser(userId: string): Promise<schema.TransportQuote[]> {
    return await db.select().from(schema.transportQuotes)
      .where(eq(schema.transportQuotes.userId, userId))
      .orderBy(desc(schema.transportQuotes.createdAt));
  }
}

export const storage = new DatabaseStorage();
