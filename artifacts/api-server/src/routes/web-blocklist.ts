import { Router } from "express";
import { db, web_blocklist, children } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/children/:childId/web-blocklist", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const rows = await db.query.web_blocklist.findMany({
    where: eq(web_blocklist.child_id, childId),
    orderBy: (w, { desc }) => [desc(w.created_at)],
  });
  return res.json(rows);
});

router.post("/children/:childId/web-blocklist", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const { domain, category } = req.body;
  if (!domain) return res.status(400).json({ error: "domain required" });

  const [row] = await db.insert(web_blocklist).values({
    parent_id: userId,
    child_id: childId,
    domain,
    category: category ?? null,
  }).returning();
  return res.status(201).json(row);
});

router.delete("/web-blocklist/:entryId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const entryId = String(req.params["entryId"]);
  await db.delete(web_blocklist)
    .where(and(eq(web_blocklist.id, entryId), eq(web_blocklist.parent_id, userId)));
  return res.json({ success: true });
});

export default router;
