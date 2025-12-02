import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Supports both Replit Auth (OAuth) and admin-created password accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default('dealer'), // 'admin', 'dealer', or 'data_analyst'
  passwordHash: varchar("password_hash"), // For admin-created users (null for OAuth users)
  passwordResetToken: varchar("password_reset_token"), // For password reset functionality
  passwordResetExpiry: timestamp("password_reset_expiry"), // Token expiration
  isActive: varchar("is_active").notNull().default('true'), // Account status
  authType: varchar("auth_type").notNull().default('oauth'), // 'oauth' or 'password'
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schema for admin creating new users
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "dealer", "data_analyst"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Schema for updating user
export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "dealer", "data_analyst"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

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
}, (table) => [
  index("IDX_cars_dealership_status").on(table.dealershipId, table.status),
  index("IDX_cars_make_model").on(table.make, table.model),
  index("IDX_cars_year").on(table.year),
  index("IDX_cars_price").on(table.price),
  index("IDX_cars_kilometers").on(table.kilometers),
  index("IDX_cars_created_at").on(table.createdAt),
  index("IDX_cars_status").on(table.status),
]);

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
