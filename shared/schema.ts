import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, index, jsonb, integer, decimal, boolean, date } from "drizzle-orm/pg-core";
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
  role: z.enum(["admin", "dealer", "data_analyst", "transportation"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Schema for updating user
export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "dealer", "data_analyst", "transportation"]).optional(),
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

// ============================================
// TRANSPORTATION MODULE TABLES
// ============================================

// Transport Trucks (Fleet)
export const trucks = pgTable("trucks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitNumber: varchar("unit_number").unique().notNull(),
  make: varchar("make"),
  model: varchar("model"),
  year: integer("year"),
  capacity: integer("capacity").default(8),
  currentLocation: varchar("current_location"),
  status: varchar("status").default("available"), // available, en_route, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = typeof trucks.$inferInsert;

// Transport Drivers
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  licenseNumber: varchar("license_number"),
  licenseExpiry: date("license_expiry"),
  assignedTruckId: varchar("assigned_truck_id").references(() => trucks.id),
  status: varchar("status").default("active"), // active, off_duty, on_leave
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

// Transport Quotes
export const transportQuotes = pgTable("transport_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: varchar("quote_number").unique().notNull(),
  userId: varchar("user_id").references(() => users.id),
  pickupAddress: text("pickup_address"),
  pickupCity: varchar("pickup_city").notNull(),
  pickupProvince: varchar("pickup_province").notNull(),
  pickupPostal: varchar("pickup_postal"),
  deliveryAddress: text("delivery_address"),
  deliveryCity: varchar("delivery_city").notNull(),
  deliveryProvince: varchar("delivery_province").notNull(),
  deliveryPostal: varchar("delivery_postal"),
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
  vehicleYear: integer("vehicle_year"),
  vehicleMake: varchar("vehicle_make"),
  vehicleModel: varchar("vehicle_model"),
  vehicleType: varchar("vehicle_type"), // sedan, suv, pickup, fullsize_suv, luxury, motorcycle
  vehicleVin: varchar("vehicle_vin"),
  isRunning: boolean("is_running").default(true),
  isEnclosed: boolean("is_enclosed").default(false),
  liftGateRequired: boolean("lift_gate_required").default(false),
  vehicleCount: integer("vehicle_count").default(1),
  serviceLevel: varchar("service_level").default("standard"), // standard, expedited_2day, expedited_1day
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  surcharges: decimal("surcharges", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  status: varchar("status").default("quoted"), // quoted, expired, converted
  validUntil: timestamp("valid_until"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TransportQuote = typeof transportQuotes.$inferSelect;
export type InsertTransportQuote = typeof transportQuotes.$inferInsert;

export const insertTransportQuoteSchema = createInsertSchema(transportQuotes).omit({
  id: true,
  createdAt: true,
});

// Transport Orders
export const transportOrders = pgTable("transport_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  quoteId: varchar("quote_id").references(() => transportQuotes.id),
  pickupContactName: varchar("pickup_contact_name"),
  pickupContactPhone: varchar("pickup_contact_phone"),
  pickupContactEmail: varchar("pickup_contact_email"),
  pickupInstructions: text("pickup_instructions"),
  pickupDate: date("pickup_date"),
  pickupTimePreference: varchar("pickup_time_preference"), // morning, afternoon, evening
  deliveryContactName: varchar("delivery_contact_name"),
  deliveryContactPhone: varchar("delivery_contact_phone"),
  deliveryContactEmail: varchar("delivery_contact_email"),
  deliveryInstructions: text("delivery_instructions"),
  estimatedDeliveryDate: date("estimated_delivery_date"),
  actualPickupDatetime: timestamp("actual_pickup_datetime"),
  actualDeliveryDatetime: timestamp("actual_delivery_datetime"),
  driverId: varchar("driver_id").references(() => drivers.id),
  truckId: varchar("truck_id").references(() => trucks.id),
  status: varchar("status").default("booked"), // booked, assigned, en_route_pickup, picked_up, in_transit, en_route_delivery, delivered, completed, cancelled
  trackingUrl: varchar("tracking_url"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, refunded
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TransportOrder = typeof transportOrders.$inferSelect;
export type InsertTransportOrder = typeof transportOrders.$inferInsert;

export const insertTransportOrderSchema = createInsertSchema(transportOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tracking Events
export const trackingEvents = pgTable("tracking_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => transportOrders.id).notNull(),
  eventType: varchar("event_type").notNull(), // pickup_scheduled, driver_assigned, en_route, picked_up, checkpoint, delivered
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;
