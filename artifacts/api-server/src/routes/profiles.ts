import { Router } from "express";
import { db, profiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

router.post("/profiles/admin/grant-premium", requireAuth, async (req, res) => {
  const requesterId = getUserId(req);
  const { target_user_id, revoke } = req.body as { target_user_id?: string; revoke?: boolean };

  const ADMIN_USER_IDS = (process.env["ADMIN_USER_IDS"] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ADMIN_USER_IDS.length === 0 || !ADMIN_USER_IDS.includes(requesterId)) {
    return res.status(403).json({ error: "Forbidden: not an admin" });
  }

  const userId = target_user_id ?? requesterId;
  const newTier = revoke ? "basic" : "premium";

  const existing = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) });
  if (!existing) {
    return res.status(404).json({ error: "User profile not found. They must sign in at least once first." });
  }

  const [updated] = await db.update(profiles)
    .set({ subscription_tier: newTier, updated_at: new Date() })
    .where(eq(profiles.id, userId))
    .returning();

  return res.json({ success: true, user_id: userId, subscription_tier: updated?.subscription_tier });
});

router.get("/profiles/me", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  let profile = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) });
  if (!profile) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    const [created] = await db.insert(profiles).values({ id: userId, trial_ends_at: trialEndsAt }).returning();
    profile = created;
  } else if (!profile.trial_ends_at) {
    const trialEndsAt = new Date(profile.created_at);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    const [updated] = await db.update(profiles)
      .set({ trial_ends_at: trialEndsAt })
      .where(eq(profiles.id, userId))
      .returning();
    profile = updated ?? profile;
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
