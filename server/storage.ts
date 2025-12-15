import { 
  userSettings, 
  savedSimulations, 
  favoriteLocations,
  type UserSettings, 
  type InsertUserSettings,
  type SavedSimulation,
  type InsertSavedSimulation,
  type FavoriteLocation,
  type InsertFavoriteLocation
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(data: InsertUserSettings): Promise<UserSettings>;
  
  getSavedSimulations(userId: string): Promise<SavedSimulation[]>;
  createSimulation(data: InsertSavedSimulation): Promise<SavedSimulation>;
  deleteSimulation(id: string, userId: string): Promise<void>;
  
  getFavoriteLocations(userId: string): Promise<FavoriteLocation[]>;
  addFavoriteLocation(data: InsertFavoriteLocation): Promise<FavoriteLocation>;
  deleteFavoriteLocation(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings || undefined;
  }

  async upsertUserSettings(data: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values(data)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          selectedCity: data.selectedCity,
          latitude: data.latitude,
          longitude: data.longitude,
          preferences: data.preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  async getSavedSimulations(userId: string): Promise<SavedSimulation[]> {
    return await db
      .select()
      .from(savedSimulations)
      .where(eq(savedSimulations.userId, userId))
      .orderBy(savedSimulations.createdAt);
  }

  async createSimulation(data: InsertSavedSimulation): Promise<SavedSimulation> {
    const [simulation] = await db
      .insert(savedSimulations)
      .values(data)
      .returning();
    return simulation;
  }

  async deleteSimulation(id: string, userId: string): Promise<void> {
    await db
      .delete(savedSimulations)
      .where(
        and(
          eq(savedSimulations.id, id),
          eq(savedSimulations.userId, userId)
        )
      );
  }

  async getFavoriteLocations(userId: string): Promise<FavoriteLocation[]> {
    return await db
      .select()
      .from(favoriteLocations)
      .where(eq(favoriteLocations.userId, userId))
      .orderBy(favoriteLocations.createdAt);
  }

  async addFavoriteLocation(data: InsertFavoriteLocation): Promise<FavoriteLocation> {
    const [location] = await db
      .insert(favoriteLocations)
      .values(data)
      .returning();
    return location;
  }

  async deleteFavoriteLocation(id: string, userId: string): Promise<void> {
    await db
      .delete(favoriteLocations)
      .where(
        and(
          eq(favoriteLocations.id, id),
          eq(favoriteLocations.userId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
