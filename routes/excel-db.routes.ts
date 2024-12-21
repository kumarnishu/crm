import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetExcelDbReport, CreateExcelDBFromExcel } from "../controllers/excel-db.controller";


import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/excel-db").get(isAuthenticatedUser, GetExcelDbReport)
router.route("/excel-db").post(isAuthenticatedUser, upload.single('excel'), CreateExcelDBFromExcel)

export default router