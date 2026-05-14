import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import childrenRouter from "./children";
import alertsRouter from "./alerts";
import appLimitsRouter from "./app-limits";
import appUsageRouter from "./app-usage";
import devicesRouter from "./devices";
import webBlocklistRouter from "./web-blocklist";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(childrenRouter);
router.use(alertsRouter);
router.use(appLimitsRouter);
router.use(appUsageRouter);
router.use(devicesRouter);
router.use(webBlocklistRouter);
router.use(pushRouter);

export default router;
