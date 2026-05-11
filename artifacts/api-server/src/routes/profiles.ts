import { Router } from "express";
import { db, profiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.get("/profiles/me", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  let profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) });
  if (!profile) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    const [created] = await db.insert(profiles).values({ id: userId, trial_ends_at: trialEndsAt }).returning();
    profile = created;
  }
  return res.json(profile);
});

router.patch("/profiles/me", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { display_name } = req.body;
  const [updated] = await db.update(profiles)
    .set({ display_name, updated_at: new Date() })
    .where(eq(profiles.id, userId))
    .returning();
  if (!updated) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    const [created] = await db.insert(profiles).values({ id: userId, display_name, trial_ends_at: trialEndsAt }).returning();
    return res.json(created);
  }
  return res.json(updated);
});

router.post("/profiles/me/pin", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { pin_hash } = req.body;
  if (!pin_hash) return res.status(400).json({ error: "pin_hash required" });
  await db.update(profiles).set({ pin_hash, updated_at: new Date() }).where(eq(profiles.id, userId));
  return res.json({ success: true });
});

router.post("/profiles/me/verify-pin", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { pin_hash } = req.body;
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) });
  return res.json({ valid: profile?.pin_hash === pin_hash });
});

export default router;
