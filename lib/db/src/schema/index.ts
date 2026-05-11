import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  pin_hash: text("pin_hash"),
  subscription_tier: text("subscription_tier").notNull().default("basic"),
  theme: text("theme").notNull().default("dark"),
  trial_ends_at: timestamp("trial_ends_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const children = pgTable("children", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  name: text("name").notNull(),
  avatar_url: text("avatar_url"),
  birth_year: integer("birth_year"),
  color: text("color"),
  focus_mode: text("focus_mode"),
  focus_mode_expires_at: timestamp("focus_mode_expires_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  child_id: uuid("child_id"),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull().default("info"),
  read: boolean("read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const app_limits = pgTable("app_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  child_id: uuid("child_id").notNull(),
  app_name: text("app_name").notNull(),
  package_id: text("package_id"),
  daily_minutes: integer("daily_minutes").notNull().default(60),
  blocked: boolean("blocked").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const app_usage_log = pgTable("app_usage_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  child_id: uuid("child_id").notNull(),
  app_name: text("app_name").notNull(),
  package_id: text("package_id"),
  date: text("date").notNull(),
  minutes_used: integer("minutes_used").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  child_id: uuid("child_id").notNull(),
  device_name: text("device_name"),
  platform: text("platform"),
  status: text("status").notNull().default("pending"),
  pairing_code: text("pairing_code"),
  paired_at: timestamp("paired_at"),
  last_seen: timestamp("last_seen"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const web_blocklist = pgTable("web_blocklist", {
  id: uuid("id").primaryKey().defaultRandom(),
  parent_id: text("parent_id").notNull(),
  child_id: uuid("child_id").notNull(),
  domain: text("domain").notNull(),
  category: text("category"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles);
export const insertChildSchema = createInsertSchema(children).omit({ id: true, created_at: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, created_at: true });
export const insertAppLimitSchema = createInsertSchema(app_limits).omit({ id: true, created_at: true });
export const insertAppUsageLogSchema = createInsertSchema(app_usage_log).omit({ id: true, created_at: true, updated_at: true });
export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true, created_at: true });
export const insertWebBlocklistSchema = createInsertSchema(web_blocklist).omit({ id: true, created_at: true });

export type Profile = typeof profiles.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type AppLimit = typeof app_limits.$inferSelect;
export type AppUsageLog = typeof app_usage_log.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type WebBlocklistEntry = typeof web_blocklist.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertAppLimit = z.infer<typeof insertAppLimitSchema>;
export type InsertAppUsageLog = z.infer<typeof insertAppUsageLogSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type InsertWebBlocklistEntry = z.infer<typeof insertWebBlocklistSchema>;
