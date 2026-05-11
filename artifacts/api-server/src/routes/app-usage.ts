import { Router } from "express";
import { db, app_usage_log, children } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/children/:childId/app-usage", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const logs = await db.query.app_usage_log.findMany({
    where: and(
      eq(app_usage_log.child_id, childId),
      eq(app_usage_log.parent_id, userId),
    ),
    orderBy: (t, { desc }) => [desc(t.date)],
  });
  return res.json(logs);
});

router.post("/children/:childId/app-usage", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const { app_name, package_id, date, minutes_used } = req.body as {
    app_name: string;
    package_id?: string;
    date: string;
    minutes_used: number;
  };
  if (!app_name || !date || minutes_used === undefined) {
    return res.status(400).json({ error: "app_name, date, minutes_used required" });
  }

  const [log] = await db
    .insert(app_usage_log)
    .values({ parent_id: userId, child_id: childId, app_name, package_id, date, minutes_used })
    .returning();
  return res.status(201).json(log);
});

export default router;
