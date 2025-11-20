import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type { 
  Dealership, 
  InsertDealership, 
  UpdateDealership,
  Car,
  InsertCar,
  UpdateCar 
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export interface IStorage {
  // Dealership operations
  getAllDealerships(): Promise<Dealership[]>;
  getDealership(id: string): Promise<Dealership | undefined>;
  createDealership(dealership: InsertDealership): Promise<Dealership>;
  updateDealership(id: string, dealership: UpdateDealership): Promise<Dealership | undefined>;
  deleteDealership(id: string): Promise<boolean>;
  
  // Car operations
  getAllCars(): Promise<Car[]>;
  getCarsByDealership(dealershipId: string): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
  getCarByVin(vin: string): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, car: UpdateCar): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  searchCars(query: string): Promise<Car[]>;
}

export class DatabaseStorage implements IStorage {
  // Dealership operations
  async getAllDealerships(): Promise<Dealership[]> {
    return await db.select().from(schema.dealerships).orderBy(desc(schema.dealerships.createdAt));
  }

  async getDealership(id: string): Promise<Dealership | undefined> {
    const results = await db.select().from(schema.dealerships).where(eq(schema.dealerships.id, id));
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
}

export const storage = new DatabaseStorage();
