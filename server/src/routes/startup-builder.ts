import { Router } from "express";
import type { Db } from "@paperclipai/db";
import { createStartupWorkspaceSchema } from "@paperclipai/shared";
import { validate } from "../middleware/validate.js";
import { accessService, startupBuilderService, logActivity } from "../services/index.js";
import { assertBoard, assertCompanyAccess, getActorInfo } from "./authz.js";

export function startupBuilderRoutes(db: Db) {
  const router = Router();
  const svc = startupBuilderService(db);
  const access = accessService(db);

  router.get("/", (_req, res) => {
    res.json({ ok: true, feature: "startup-builder" });
  });

  router.post("/create", validate(createStartupWorkspaceSchema), async (req, res) => {
    assertBoard(req);
    const userId = req.actor.userId ?? "local-board";
    const result = await svc.createWorkspace(req.body, userId);
    await access.ensureMembership(result.companyId, "user", userId, "owner", "active");
    const actor = getActorInfo(req);
    await logActivity(db, {
      companyId: result.companyId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      action: "startup_workspace.created",
      entityType: "company",
      entityId: result.companyId,
      details: { issuePrefix: result.issuePrefix },
    });
    res.status(201).json(result);
  });

  router.get("/templates", async (req, res) => {
    assertBoard(req);
    const templates = await svc.listTemplates();
    res.json(templates);
  });

  router.get("/companies/:companyId/profile", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const profile = await svc.getProfileByCompanyId(companyId);
    res.json(profile ?? null);
  });

  return router;
}
