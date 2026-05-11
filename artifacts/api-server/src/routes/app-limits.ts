import { Router } from "express";
import { db, app_limits, children } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/children/:childId/app-limits", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const rows = await db.query.app_limits.findMany({
    where: eq(app_limits.child_id, childId),
    orderBy: (a, { asc }) => [asc(a.created_at)],
  });
  return res.json(rows);
});

router.post("/children/:childId/app-limits", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const { app_name, package_id, daily_minutes, blocked } = req.body;
  if (!app_name) return res.status(400).json({ error: "app_name required" });

  const [row] = await db.insert(app_limits).values({
    parent_id: userId,
    child_id: childId,
    app_name,
    package_id: package_id ?? null,
    daily_minutes: daily_minutes ?? 60,
    blocked: blocked ?? false,
  }).returning();
  return res.status(201).json(row);
});

router.patch("/app-limits/:limitId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const limitId = String(req.params["limitId"]);
  const { app_name, daily_minutes, blocked } = req.body;
  const patch: Record<string, unknown> = {};
  if (app_name !== undefined) patch.app_name = app_name;
  if (daily_minutes !== undefined) patch.daily_minutes = daily_minutes;
  if (blocked !== undefined) patch.blocked = blocked;

  const [updated] = await db.update(app_limits)
    .set(patch)
    .where(and(eq(app_limits.id, limitId), eq(app_limits.parent_id, userId)))
    .returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

router.delete("/app-limits/:limitId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const limitId = String(req.params["limitId"]);
  await db.delete(app_limits)
    .where(and(eq(app_limits.id, limitId), eq(app_limits.parent_id, userId)));
  return res.json({ success: true });
});

export default router;
