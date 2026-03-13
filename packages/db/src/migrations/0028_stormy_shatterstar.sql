CREATE TABLE "startup_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"template_slug" text,
	"target_market" text,
	"tech_stack" text,
	"vision_summary" text,
	"roadmap_30_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"roadmap_90_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startup_templates" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_roadmap_30" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"default_roadmap_90" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "startup_profiles_company_id_idx" ON "startup_profiles" USING btree ("company_id");