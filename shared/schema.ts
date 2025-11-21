import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dealerships = pgTable("dealerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  province: text("province").notNull(),
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cars = pgTable("cars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: varchar("dealership_id").notNull().references(() => dealerships.id, { onDelete: 'cascade' }),
  vin: text("vin"),
  stockNumber: text("stock_number"),
  condition: text("condition").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim").notNull(),
  year: text("year").notNull(),
  color: text("color").notNull(),
  price: text("price").notNull(),
  kilometers: text("kilometers").notNull(),
  transmission: text("transmission").notNull(),
  fuelType: text("fuel_type").notNull(),
  bodyType: text("body_type").notNull(),
  drivetrain: text("drivetrain"),
  engineCylinders: text("engine_cylinders"),
  engineDisplacement: text("engine_displacement"),
  features: text("features").array(),
  listingLink: text("listing_link").notNull(),
  carfaxLink: text("carfax_link").notNull(),
  carfaxStatus: text("carfax_status"),
  notes: text("notes").notNull(),
  status: text("status").notNull().default('available'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dealership schemas
export const insertDealershipSchema = createInsertSchema(dealerships).omit({
  id: true,
  createdAt: true,
});

export const updateDealershipSchema = insertDealershipSchema.partial();

export type InsertDealership = z.infer<typeof insertDealershipSchema>;
export type UpdateDealership = z.infer<typeof updateDealershipSchema>;
export type Dealership = typeof dealerships.$inferSelect;

// Car schemas
export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
});

export const updateCarSchema = insertCarSchema.partial();

export type InsertCar = z.infer<typeof insertCarSchema>;
export type UpdateCar = z.infer<typeof updateCarSchema>;
export type Car = typeof cars.$inferSelect;
