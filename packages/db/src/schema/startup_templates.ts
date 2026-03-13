import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export interface RoadmapItem {
  id?: string;
  title: string;
  description?: string;
  milestone?: string;
  order?: number;
}

export const startupTemplates = pgTable("startup_templates", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultRoadmap30: jsonb("default_roadmap_30").$type<RoadmapItem[]>().notNull().default([]),
  defaultRoadmap90: jsonb("default_roadmap_90").$type<RoadmapItem[]>().notNull().default([]),
});
