import { eq } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { startupProfiles, startupTemplates } from "@paperclipai/db";
import type { CreateStartupWorkspace } from "@paperclipai/shared";
import type { RoadmapItem } from "@paperclipai/db";
import { companyService } from "./companies.js";
import { agentService } from "./agents.js";

const STARTUP_AGENTS: Array<{
  role: "ceo" | "cto" | "pm" | "engineer" | "cmo";
  title: string;
  name: string;
}> = [
  { role: "ceo", title: "CEO Agent", name: "CEO Agent" },
  { role: "cto", title: "CTO Agent", name: "CTO Agent" },
  { role: "pm", title: "Product Manager Agent", name: "PM Agent" },
  { role: "engineer", title: "Engineer Agent", name: "Engineer Agent" },
  { role: "cmo", title: "Marketing Agent", name: "Marketing Agent" },
];

export function startupBuilderService(db: Db) {
  const companiesSvc = companyService(db);
  const agentsSvc = agentService(db);

  return {
    async createWorkspace(
      input: CreateStartupWorkspace,
      _userId: string,
    ): Promise<{ companyId: string; issuePrefix: string }> {
      const company = await companiesSvc.create({
        name: input.startupName,
        description: input.startupDescription ?? null,
      });
      await companiesSvc.update(company.id, { requireBoardApprovalForNewAgents: false });

      const template = input.templateSlug
        ? await db
            .select()
            .from(startupTemplates)
            .where(eq(startupTemplates.slug, input.templateSlug))
            .then((rows) => rows[0] ?? null)
        : null;

      const roadmap30: RoadmapItem[] = Array.isArray(template?.defaultRoadmap30) ? template.defaultRoadmap30 : [];
      const roadmap90: RoadmapItem[] = Array.isArray(template?.defaultRoadmap90) ? template.defaultRoadmap90 : [];

      await db.insert(startupProfiles).values({
        companyId: company.id,
        templateSlug: input.templateSlug ?? null,
        targetMarket: input.targetMarket ?? null,
        techStack: input.techStack ?? null,
        visionSummary: input.startupDescription ?? null,
        roadmap30Days: roadmap30,
        roadmap90Days: roadmap90,
      });

      let ceoId: string | null = null;
      for (const def of STARTUP_AGENTS) {
        const created = await agentsSvc.create(company.id, {
          name: def.name,
          role: def.role,
          title: def.title,
          reportsTo: ceoId,
          adapterType: "process",
          adapterConfig: {},
        });
        if (def.role === "ceo") ceoId = created.id;
      }

      return { companyId: company.id, issuePrefix: company.issuePrefix };
    },

    async getProfileByCompanyId(companyId: string) {
      return db
        .select()
        .from(startupProfiles)
        .where(eq(startupProfiles.companyId, companyId))
        .then((rows) => rows[0] ?? null);
    },

    async listTemplates() {
      return db.select().from(startupTemplates);
    },
  };
}
