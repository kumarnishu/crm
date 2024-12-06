import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetDyeStatusReport } from "../controllers/dye-status-report.controller";
const router = express.Router()

router.route("/dyestatus/report").get(isAuthenticatedUser, GetDyeStatusReport)

export default router