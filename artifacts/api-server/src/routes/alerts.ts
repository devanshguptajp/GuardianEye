import { Router } from "express";
import { db, alerts, children } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";
import { sendPushToUser } from "./push";

const router = Router();

router.get("/children/:childId/alerts", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const rows = await db.query.alerts.findMany({
    where: eq(alerts.child_id, childId),
    orderBy: (a, { desc }) => [desc(a.created_at)],
  });
  return res.json(rows);
});

router.patch("/alerts/:alertId/read", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const alertId = String(req.params["alertId"]);
  const [updated] = await db.update(alerts)
    .set({ read: true })
    .where(and(eq(alerts.id, alertId), eq(alerts.parent_id, userId)))
    .returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

export default router;
