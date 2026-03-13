import { api } from "./client";

export interface StartupTemplate {
  slug: string;
  name: string;
  description: string | null;
  defaultRoadmap30: Array<{ title: string; description?: string; milestone?: string; order?: number }>;
  defaultRoadmap90: Array<{ title: string; description?: string; milestone?: string; order?: number }>;
}

export interface StartupProfile {
  id: string;
  companyId: string;
  templateSlug: string | null;
  targetMarket: string | null;
  techStack: string | null;
  visionSummary: string | null;
  roadmap30Days: Array<{ title: string; description?: string; milestone?: string; order?: number }>;
  roadmap90Days: Array<{ title: string; description?: string; milestone?: string; order?: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStartupResult {
  companyId: string;
  issuePrefix: string;
}

export const startupBuilderApi = {
  create: (data: {
    startupName: string;
    startupDescription?: string | null;
    targetMarket?: string | null;
    techStack?: string | null;
    templateSlug?: string | null;
  }) => api.post<CreateStartupResult>("/startup-builder/create", data),

  listTemplates: () => api.get<StartupTemplate[]>("/startup-builder/templates"),

  getProfile: (companyId: string) =>
    api.get<StartupProfile | null>(`/startup-builder/companies/${companyId}/profile`),
};
