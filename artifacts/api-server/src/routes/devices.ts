import { Router } from "express";
import { db, devices, children } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";
import crypto from "crypto";

const router = Router();

router.get("/children/:childId/devices", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

  const rows = await db.query.devices.findMany({
    where: eq(devices.child_id, childId),
    orderBy: (d, { asc }) => [asc(d.created_at)],
  });
  return res.json(rows);
});

router.post("/children/:childId/devices", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const childId = String(req.params["childId"]);
  const { device_name, platform } = req.body;
  if (!device_name) return res.status(400).json({ error: "device_name required" });

  const pairing_code = crypto.randomBytes(3).toString("hex").toUpperCase();

  const [row] = await db.insert(devices).values({
    parent_id: userId,
    child_id: childId,
    device_name,
    platform: platform ?? null,
    status: "pending",
    pairing_code,
  }).returning();
  return res.status(201).json(row);
});

router.delete("/devices/:deviceId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const deviceId = String(req.params["deviceId"]);
  await db.delete(devices)
    .where(and(eq(devices.id, deviceId), eq(devices.parent_id, userId)));
  return res.json({ success: true });
});

export default router;
