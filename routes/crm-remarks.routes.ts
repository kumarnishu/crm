import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/remarks/:id").get(isAuthenticatedUser, controller.GetRemarkHistory)
router.route("/remarks/refers/:id").get(isAuthenticatedUser, controller.GetReferRemarkHistory)
router.route("/activities").get(isAuthenticatedUser, controller.GetActivities)
router.route("/remarks/:id").post(isAuthenticatedUser, controller.NewRemark)
router.route("/remarks/:id").put(isAuthenticatedUser, controller.UpdateRemark)
router.route("/remarks/:id").delete(isAuthenticatedUser, controller.DeleteRemark)


export default router