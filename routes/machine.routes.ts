import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetMachines, CreateMachine, UpdateMachine, ToogleMachine, BulkUploadMachine, GetMachinesForDropDown } from "../controllers/machine.controller";
const router = express.Router()

router.route("/machines").get(isAuthenticatedUser, GetMachines)
    .post(isAuthenticatedUser, CreateMachine)
router.route("/dropdown/machines").get(isAuthenticatedUser, GetMachinesForDropDown)
router.put("/machines/:id", isAuthenticatedUser, UpdateMachine)
router.patch("/machines/toogle/:id", isAuthenticatedUser, ToogleMachine)
router.put("/machines/upload/bulk", isAuthenticatedUser, upload.single('file'), BulkUploadMachine)

export default router