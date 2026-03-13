import { createDb } from "./client.js";
import { companies, agents, goals, projects, issues, startupTemplates } from "./schema/index.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

console.log("Seeding database...");

const [company] = await db
  .insert(companies)
  .values({
    name: "Paperclip Demo Co",
    description: "A demo autonomous company",
    status: "active",
    budgetMonthlyCents: 50000,
  })
  .returning();

const [ceo] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "CEO Agent",
    role: "ceo",
    title: "Chief Executive Officer",
    status: "idle",
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from ceo"] },
    budgetMonthlyCents: 15000,
  })
  .returning();

const [engineer] = await db
  .insert(agents)
  .values({
    companyId: company!.id,
    name: "Engineer Agent",
    role: "engineer",
    title: "Software Engineer",
    status: "idle",
    reportsTo: ceo!.id,
    adapterType: "process",
    adapterConfig: { command: "echo", args: ["hello from engineer"] },
    budgetMonthlyCents: 10000,
  })
  .returning();

const [goal] = await db
  .insert(goals)
  .values({
    companyId: company!.id,
    title: "Ship V1",
    description: "Deliver first control plane release",
    level: "company",
    status: "active",
    ownerAgentId: ceo!.id,
  })
  .returning();

const [project] = await db
  .insert(projects)
  .values({
    companyId: company!.id,
    goalId: goal!.id,
    name: "Control Plane MVP",
    description: "Implement core board + agent loop",
    status: "in_progress",
    leadAgentId: ceo!.id,
  })
  .returning();

await db.insert(issues).values([
  {
    companyId: company!.id,
    projectId: project!.id,
    goalId: goal!.id,
    title: "Implement atomic task checkout",
    description: "Ensure in_progress claiming is conflict-safe",
    status: "todo",
    priority: "high",
    assigneeAgentId: engineer!.id,
    createdByAgentId: ceo!.id,
  },
  {
    companyId: company!.id,
    projectId: project!.id,
    goalId: goal!.id,
    title: "Add budget auto-pause",
    description: "Pause agent at hard budget ceiling",
    status: "backlog",
    priority: "medium",
    createdByAgentId: ceo!.id,
  },
]);

await db.insert(startupTemplates).values([
  {
    slug: "saas",
    name: "SaaS Startup",
    description: "Subscription software product with landing page, auth, and core features",
    defaultRoadmap30: [
      { title: "Define MVP scope", description: "List must-have features", order: 1 },
      { title: "Landing page", description: "Marketing landing with signup", order: 2 },
      { title: "Auth & billing", description: "User auth and subscription billing", order: 3 },
    ],
    defaultRoadmap90: [
      { title: "Launch MVP", order: 1 },
      { title: "Onboarding flow", order: 2 },
      { title: "Core feature set", order: 3 },
      { title: "Analytics & feedback", order: 4 },
    ],
  },
  {
    slug: "ai-tool",
    name: "AI Tool",
    description: "AI-powered product with model integration and usage tracking",
    defaultRoadmap30: [
      { title: "Define use case", order: 1 },
      { title: "Model integration (API)", order: 2 },
      { title: "Simple UI", order: 3 },
    ],
    defaultRoadmap90: [
      { title: "Launch beta", order: 1 },
      { title: "Usage & limits", order: 2 },
      { title: "Improve prompts/flows", order: 3 },
    ],
  },
  {
    slug: "marketplace",
    name: "Marketplace",
    description: "Two-sided marketplace connecting buyers and sellers",
    defaultRoadmap30: [
      { title: "Supply side MVP", order: 1 },
      { title: "Demand side MVP", order: 2 },
      { title: "Matching & discovery", order: 3 },
    ],
    defaultRoadmap90: [
      { title: "Launch marketplace", order: 1 },
      { title: "Payments", order: 2 },
      { title: "Trust & safety", order: 3 },
    ],
  },
  {
    slug: "content-platform",
    name: "Content Platform",
    description: "Content creation, curation, and distribution platform",
    defaultRoadmap30: [
      { title: "Content model", order: 1 },
      { title: "Create & edit flows", order: 2 },
      { title: "Feed or discovery", order: 3 },
    ],
    defaultRoadmap90: [
      { title: "Launch platform", order: 1 },
      { title: "Engagement features", order: 2 },
      { title: "Monetization", order: 3 },
    ],
  },
]);

console.log("Seed complete");
process.exit(0);
