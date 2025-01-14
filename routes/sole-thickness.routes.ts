import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { ProductionController } from "../controllers/ProductionController";
let controller = new ProductionController()
const router = express.Router()

router.route("/solethickness").get(isAuthenticatedUser, controller.GetSoleThickness).post(isAuthenticatedUser, controller.CreateSoleThickness)
router.route("/solethickness/me").get(isAuthenticatedUser, controller.GetMyTodaySoleThickness)
router.route("/solethickness/:id").get(isAuthenticatedUser, controller.DeleteSoleThickness).put(isAuthenticatedUser, controller.UpdateSoleThickness).delete(isAuthenticatedUser, controller.DeleteSoleThickness)

export default router
