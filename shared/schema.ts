import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  selectedCity: text("selected_city").notNull().default("Coimbatore"),
  latitude: real("latitude").notNull().default(11.0168),
  longitude: real("longitude").notNull().default(76.9558),
  preferences: jsonb("preferences").default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedSimulations = pgTable("saved_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  windSpeed: real("wind_speed").notNull(),
  rainChance: real("rain_chance").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  trafficDensity: real("traffic_density").notNull(),
  industrialActivity: real("industrial_activity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favoriteLocations = pgTable("favorite_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  cityName: text("city_name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSavedSimulationSchema = createInsertSchema(savedSimulations).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteLocationSchema = createInsertSchema(favoriteLocations).omit({
  id: true,
  createdAt: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertSavedSimulation = z.infer<typeof insertSavedSimulationSchema>;
export type SavedSimulation = typeof savedSimulations.$inferSelect;

export type InsertFavoriteLocation = z.infer<typeof insertFavoriteLocationSchema>;
export type FavoriteLocation = typeof favoriteLocations.$inferSelect;
