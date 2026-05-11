import { Router } from "express";
import { db, children, alerts, app_limits, devices, web_blocklist } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/children", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const rows = await db.query.children.findMany({
    where: eq(children.parent_id, userId),
    orderBy: (c, { asc }) => [asc(c.created_at)],
  });
  return res.json(rows);
});

router.post("/children", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { name, birth_year, color } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const [child] = await db.insert(children).values({
    parent_id: userId, name, birth_year: birth_year ?? null, color: color ?? null,
  }).returning();
  return res.status(201).json(child);
});

router.get("/children/:childId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });
  return res.json(child);
});

router.delete("/children/:childId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  await db.delete(alerts).where(and(eq(alerts.child_id, childId), eq(alerts.parent_id, userId)));
  await db.delete(app_limits).where(and(eq(app_limits.child_id, childId), eq(app_limits.parent_id, userId)));
  await db.delete(devices).where(and(eq(devices.child_id, childId), eq(devices.parent_id, userId)));
  await db.delete(web_blocklist).where(and(eq(web_blocklist.child_id, childId), eq(web_blocklist.parent_id, userId)));
  await db.delete(children).where(and(eq(children.id, childId), eq(children.parent_id, userId)));

  return res.json({ success: true });
});

router.patch("/children/:childId/focus-mode", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const { mode, duration_minutes } = req.body;

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const focus_mode_expires_at = duration_minutes
    ? new Date(Date.now() + Number(duration_minutes) * 60 * 1000)
    : null;

  const [updated] = await db.update(children)
    .set({ focus_mode: mode ?? null, focus_mode_expires_at })
    .where(eq(children.id, childId))
    .returning();

  return res.json(updated);
});

router.get("/children/:childId/overview", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const [recentAlerts, [{ unread }], [{ appCount }], [{ siteCount }], [{ devCount }]] = await Promise.all([
    db.query.alerts.findMany({
      where: eq(alerts.child_id, childId),
      orderBy: (a, { desc }) => [desc(a.created_at)],
      limit: 5,
    }),
    db.select({ unread: count() }).from(alerts).where(and(eq(alerts.child_id, childId), eq(alerts.read, false))),
    db.select({ appCount: count() }).from(app_limits).where(eq(app_limits.child_id, childId)),
    db.select({ siteCount: count() }).from(web_blocklist).where(eq(web_blocklist.child_id, childId)),
    db.select({ devCount: count() }).from(devices).where(eq(devices.child_id, childId)),
  ]);

  return res.json({
    child,
    recent_alerts: recentAlerts,
    unread_alerts_count: Number(unread),
    app_limits_count: Number(appCount),
    blocked_sites_count: Number(siteCount),
    active_devices_count: Number(devCount),
  });
});

export default router;
