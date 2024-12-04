import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateSalesAttendance, DeleteSalesAttendance, GetSalesAttendances, GetSalesManKpi, UpdateSalesAttendance } from "../controllers/sale-attendance.controller";
const router = express.Router()

router.route("/salesman/kpi").get(isAuthenticatedUser, GetSalesManKpi)
router.route("/attendances").get(isAuthenticatedUser, GetSalesAttendances)
    .post(isAuthenticatedUser, CreateSalesAttendance)
router.route("/attendances/:id").put(isAuthenticatedUser, UpdateSalesAttendance)
    .delete(isAuthenticatedUser, DeleteSalesAttendance)


export default router