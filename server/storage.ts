import {
  users,
  bagTypes,
  cars,
  carBagInventory,
  locations,
  bagUsage,
  familyMembers,
  socialShares,
  type User,
  type UpsertUser,
  type BagType,
  type InsertBagType,
  type Car,
  type InsertCar,
  type CarBagInventory,
  type InsertCarBagInventory,
  type Location,
  type InsertLocation,
  type BagUsage,
  type InsertBagUsage,
  type FamilyMember,
  type InsertFamilyMember,
  type SocialShare,
  type InsertSocialShare,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSetupStatus(id: string, completed: boolean): Promise<User>;
  updateUserPaymentStatus(id: string, customerId: string): Promise<User>;

  // Bag type operations
  createBagType(bagType: InsertBagType): Promise<BagType>;
  getUserBagTypes(userId: string): Promise<BagType[]>;
  deleteBagType(id: number, userId: string): Promise<void>;

  // Car operations
  createCar(car: InsertCar): Promise<Car>;
  getUserCars(userId: string): Promise<Car[]>;
  deleteCar(id: number, userId: string): Promise<void>;

  // Car bag inventory operations
  setCarBagInventory(inventory: InsertCarBagInventory): Promise<CarBagInventory>;
  getCarBagInventory(carId: number): Promise<CarBagInventory[]>;
  updateBagQuantity(carId: number, bagTypeId: number, quantity: number): Promise<void>;

  // Location operations
  createLocation(location: InsertLocation): Promise<Location>;
  getUserLocations(userId: string): Promise<Location[]>;
  deleteLocation(id: number, userId: string): Promise<void>;
  toggleLocationActive(id: number, userId: string): Promise<void>;

  // Bag usage operations
  recordBagUsage(usage: InsertBagUsage): Promise<BagUsage>;
  getUserBagUsage(userId: string, limit?: number): Promise<BagUsage[]>;
  getUserSavings(userId: string): Promise<{ totalSavings: number; totalBagsSaved: number }>;

  // Family operations
  inviteFamilyMember(invite: InsertFamilyMember): Promise<FamilyMember>;
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  acceptFamilyInvite(inviteId: number): Promise<void>;
  getFamilySavings(userId: string): Promise<{ totalSavings: number; members: any[] }>;

  // Social sharing operations
  recordSocialShare(share: InsertSocialShare): Promise<SocialShare>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSetupStatus(id: string, completed: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ hasCompletedSetup: completed, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPaymentStatus(id: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        hasPaidAccess: true, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Bag type operations
  async createBagType(bagType: InsertBagType): Promise<BagType> {
    const [newBagType] = await db.insert(bagTypes).values(bagType).returning();
    return newBagType;
  }

  async getUserBagTypes(userId: string): Promise<BagType[]> {
    return await db
      .select()
      .from(bagTypes)
      .where(eq(bagTypes.userId, userId));
  }

  async deleteBagType(id: number, userId: string): Promise<void> {
    await db
      .delete(bagTypes)
      .where(and(eq(bagTypes.id, id), eq(bagTypes.userId, userId)));
  }

  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async getUserCars(userId: string): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.userId, userId))
      .orderBy(desc(cars.createdAt));
  }

  async deleteCar(id: number, userId: string): Promise<void> {
    await db
      .delete(cars)
      .where(and(eq(cars.id, id), eq(cars.userId, userId)));
  }

  // Car bag inventory operations
  async setCarBagInventory(inventory: InsertCarBagInventory): Promise<CarBagInventory> {
    const [newInventory] = await db
      .insert(carBagInventory)
      .values(inventory)
      .onConflictDoUpdate({
        target: [carBagInventory.carId, carBagInventory.bagTypeId],
        set: {
          quantity: inventory.quantity,
          lowStockThreshold: inventory.lowStockThreshold,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newInventory;
  }

  async getCarBagInventory(carId: number): Promise<CarBagInventory[]> {
    return await db
      .select()
      .from(carBagInventory)
      .where(eq(carBagInventory.carId, carId));
  }

  async updateBagQuantity(carId: number, bagTypeId: number, quantity: number): Promise<void> {
    await db
      .update(carBagInventory)
      .set({ 
        quantity,
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(carBagInventory.carId, carId),
          eq(carBagInventory.bagTypeId, bagTypeId)
        )
      );
  }

  // Location operations
  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async getUserLocations(userId: string): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(eq(locations.userId, userId))
      .orderBy(desc(locations.createdAt));
  }

  async deleteLocation(id: number, userId: string): Promise<void> {
    await db
      .delete(locations)
      .where(and(eq(locations.id, id), eq(locations.userId, userId)));
  }

  async toggleLocationActive(id: number, userId: string): Promise<void> {
    const [location] = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, id), eq(locations.userId, userId)));
    
    if (location) {
      await db
        .update(locations)
        .set({ isActive: !location.isActive })
        .where(eq(locations.id, id));
    }
  }

  // Bag usage operations
  async recordBagUsage(usage: InsertBagUsage): Promise<BagUsage> {
    const [newUsage] = await db.insert(bagUsage).values(usage).returning();
    return newUsage;
  }

  async getUserBagUsage(userId: string, limit = 10): Promise<BagUsage[]> {
    return await db
      .select()
      .from(bagUsage)
      .where(eq(bagUsage.userId, userId))
      .orderBy(desc(bagUsage.usedAt))
      .limit(limit);
  }

  async getUserSavings(userId: string): Promise<{ totalSavings: number; totalBagsSaved: number }> {
    const result = await db
      .select({
        totalSavings: sum(bagUsage.savingsAmount),
        totalBagsSaved: sum(bagUsage.quantity),
      })
      .from(bagUsage)
      .where(eq(bagUsage.userId, userId));

    return {
      totalSavings: Number(result[0]?.totalSavings || 0),
      totalBagsSaved: Number(result[0]?.totalBagsSaved || 0),
    };
  }

  // Family operations
  async inviteFamilyMember(invite: InsertFamilyMember): Promise<FamilyMember> {
    const [newInvite] = await db.insert(familyMembers).values(invite).returning();
    return newInvite;
  }

  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.inviterId, userId));
  }

  async acceptFamilyInvite(inviteId: number): Promise<void> {
    await db
      .update(familyMembers)
      .set({ 
        status: "accepted", 
        acceptedAt: new Date() 
      })
      .where(eq(familyMembers.id, inviteId));
  }

  async getFamilySavings(userId: string): Promise<{ totalSavings: number; members: any[] }> {
    // This would need a more complex query to get family member savings
    // For now, returning basic structure
    const userSavings = await this.getUserSavings(userId);
    return {
      totalSavings: userSavings.totalSavings,
      members: [],
    };
  }

  // Social sharing operations
  async recordSocialShare(share: InsertSocialShare): Promise<SocialShare> {
    const [newShare] = await db.insert(socialShares).values(share).returning();
    return newShare;
  }
}

export const storage = new DatabaseStorage();
