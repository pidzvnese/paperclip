import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import type { RoadmapItem } from "./startup_templates.js";

export const startupProfiles = pgTable(
  "startup_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    templateSlug: text("template_slug"),
    targetMarket: text("target_market"),
    techStack: text("tech_stack"),
    visionSummary: text("vision_summary"),
    roadmap30Days: jsonb("roadmap_30_days").$type<RoadmapItem[]>().notNull().default([]),
    roadmap90Days: jsonb("roadmap_90_days").$type<RoadmapItem[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdUniqueIdx: uniqueIndex("startup_profiles_company_id_idx").on(table.companyId),
  }),
);
