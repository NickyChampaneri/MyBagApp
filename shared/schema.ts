import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  hasCompletedSetup: boolean("has_completed_setup").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  hasPaidAccess: boolean("has_paid_access").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bag types that can be configured per user
export const bagTypes = pgTable("bag_types", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  pricePerBag: decimal("price_per_bag", { precision: 10, scale: 2 }).notNull(),
  color: varchar("color").notNull(),
  icon: varchar("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User's cars
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  model: varchar("model"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bag inventory for each car
export const carBagInventory = pgTable("car_bag_inventory", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull().references(() => cars.id),
  bagTypeId: integer("bag_type_id").notNull().references(() => bagTypes.id),
  quantity: integer("quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(2),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved shopping locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isActive: boolean("is_active").default(true),
  reminderRadius: integer("reminder_radius").default(300), // meters
  createdAt: timestamp("created_at").defaultNow(),
});

// Bag usage tracking
export const bagUsage = pgTable("bag_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  bagTypeId: integer("bag_type_id").notNull().references(() => bagTypes.id),
  locationId: integer("location_id").references(() => locations.id),
  quantity: integer("quantity").notNull(),
  savingsAmount: decimal("savings_amount", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

// Family sharing relationships
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  memberId: varchar("member_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // pending, accepted, declined
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Social shares tracking
export const socialShares = pgTable("social_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // facebook, whatsapp, email, etc.
  content: text("content").notNull(),
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertBagType = typeof bagTypes.$inferInsert;
export type BagType = typeof bagTypes.$inferSelect;

export type InsertCar = typeof cars.$inferInsert;
export type Car = typeof cars.$inferSelect;

export type InsertCarBagInventory = typeof carBagInventory.$inferInsert;
export type CarBagInventory = typeof carBagInventory.$inferSelect;

export type InsertLocation = typeof locations.$inferInsert;
export type Location = typeof locations.$inferSelect;

export type InsertBagUsage = typeof bagUsage.$inferInsert;
export type BagUsage = typeof bagUsage.$inferSelect;

export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;

export type InsertSocialShare = typeof socialShares.$inferInsert;
export type SocialShare = typeof socialShares.$inferSelect;

// Zod schemas
export const insertBagTypeSchema = createInsertSchema(bagTypes).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertBagUsageSchema = createInsertSchema(bagUsage).omit({
  id: true,
  usedAt: true,
});
