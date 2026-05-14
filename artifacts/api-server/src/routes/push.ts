import { Router } from "express";
import webpush from "web-push";
import { db, push_subscriptions } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUserId } from "../lib/auth";

const router = Router();

const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"] ?? "";
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"] ?? "";
const VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:support@guardianeye.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

router.get("/push/vapid-public-key", requireAuth, (_req, res) => {
  return res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post("/push/subscribe", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { endpoint, keys } = req.body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription object" });
  }

  const existing = await db.query.push_subscriptions.findFirst({
    where: and(
      eq(push_subscriptions.parent_id, userId),
      eq(push_subscriptions.endpoint, endpoint),
    ),
  });

  if (!existing) {
    await db.insert(push_subscriptions).values({
      parent_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  return res.json({ success: true });
});

router.delete("/push/unsubscribe", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { endpoint } = req.body as { endpoint: string };
  if (!endpoint) return res.status(400).json({ error: "endpoint required" });

  await db.delete(push_subscriptions).where(
    and(
      eq(push_subscriptions.parent_id, userId),
      eq(push_subscriptions.endpoint, endpoint),
    ),
  );
  return res.json({ success: true });
});

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; severity?: string },
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const subs = await db.query.push_subscriptions.findMany({
    where: eq(push_subscriptions.parent_id, userId),
  });

  const badge =
    payload.severity === "high"
      ? "🚨"
      : payload.severity === "warning"
        ? "⚠️"
        : "🔔";

  const message = JSON.stringify({
    title: `${badge} ${payload.title}`,
    body: payload.body ?? "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "guardianeye-alert",
    data: { url: "/app/alerts" },
  });

  const dead: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) dead.push(sub.endpoint);
      }
    }),
  );

  if (dead.length) {
    await Promise.all(
      dead.map((ep) =>
        db.delete(push_subscriptions).where(eq(push_subscriptions.endpoint, ep)),
      ),
    );
  }
}

export default router;
