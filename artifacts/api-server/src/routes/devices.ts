import { Router } from "express";
import { db, devices, children } from "@workspace/db";
import { eq, and } from "drizzle-orm";
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

  const child = await db.query.children.findFirst({
    where: and(eq(children.id, childId), eq(children.parent_id, userId)),
  });
  if (!child) return res.status(404).json({ error: "Not found" });

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

router.get("/devices/pair/:code", async (req, res) => {
  const code = String(req.params["code"]).toUpperCase();
  const device = await db.query.devices.findFirst({
    where: eq(devices.pairing_code, code),
  });
  if (!device) return res.status(404).json({ error: "Invalid pairing code" });
  const child = await db.query.children.findFirst({
    where: eq(children.id, device.child_id),
  });
  return res.json({
    device,
    childName: child?.name ?? "Unknown",
    childId: device.child_id,
    status: device.status,
  });
});

router.post("/devices/pair/:code", async (req, res) => {
  const code = String(req.params["code"]).toUpperCase();
  const { platform } = req.body;
  const device = await db.query.devices.findFirst({
    where: eq(devices.pairing_code, code),
  });
  if (!device) return res.status(404).json({ error: "Invalid pairing code" });

  const [updated] = await db.update(devices)
    .set({
      status: "active",
      last_seen: new Date(),
      platform: platform ?? device.platform ?? "web",
    })
    .where(eq(devices.pairing_code, code))
    .returning();
  return res.json({ success: true, childId: updated.child_id });
});

export default router;
