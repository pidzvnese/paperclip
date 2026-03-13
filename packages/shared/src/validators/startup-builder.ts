import { z } from "zod";

export const createStartupWorkspaceSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  startupDescription: z.string().optional().nullable(),
  targetMarket: z.string().optional().nullable(),
  techStack: z.string().optional().nullable(),
  templateSlug: z.string().optional().nullable(),
});

export type CreateStartupWorkspace = z.infer<typeof createStartupWorkspaceSchema>;
