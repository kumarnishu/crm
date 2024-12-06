import multer from "multer";
import express from "express";
const router = express.Router()
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 50 } })

import ArticlesRoutes from "./articles.routes";
import AttendancesRoutes from "./sales-attendance.routes";
import AuthRoutes from "./auth.routes";
import ChecklistCategoryRoutes from "./checklist-category.routes";
import ChecklistRoutes from "./checklist.routes";
import CrmBillsRoutes from "./crm-bills.routes";
import CrmCityRoutes from "./crm-city.routes";
import CrmRemarksRoutes from "./crm-remarks.routes";
import CrmStatesRoutes from "./crm-states.routes";
import CrmReportsRoutes from "./crm.reports.routes";
import DyeLocationRoutes from "./dye-location.routes";
import DyeStatusReportRoutes from "./dye-status-report.routes";
import DyeRoutes from "./dye.routes";
import EmailRoutes from "./email.routes";
import LeadSourceRoutes from "./lead-source.routes";
import LeadStageRoutes from "./lead-stage.routes";
import LeadTypesRoutes from "./lead-types.routes";
import LeadRoutes from "./lead.routes";
import MachineCategoriesRoutes from "./machine-categories.routes";
import MachineRoutes from "./machine.routes";
import ProductionReportRoutes from "./production-report.routes";
import ProductionRoutes from "./production.routes";
import ReferRoutes from "./refer.routes";
import ShoeWeightReportRoutes from "./shoe-weight-report.routes";
import ShoeWeightRoutes from "./shoe-weight.routes";
import SoleThicknessRoutes from "./sole-thickness.routes";
import SpareDyeRoute from "./spare-dye.routes";
import UserRoutes from "./user.routes";
import ChecklistRemarkRoutes from "./checklist-remarks.routes"
import TestRoutes from "./test.routes"
import SalesmanLeavesRoutes from "./salesman-leaves.routes"
import PaymentRoutes from "./payments.routes"
import PaymentCategoryRoutes from "./payment-category.routes"
import KeyRoutes from "./key.routes"
import KeyCategoryRoutes from "./key-category.routes"
import ExcelDBRoutes from "./excel-db.routes"
import ExcelDBRemarkRoutes from "./excel-db-remarks.routes"
import SalesmanVisitRoutes from "./salesman-visit.routes"
import VisitRemarkRoutes from "./visist-remark.routes"


import ExpenseCategoryRoutes from "./expense-category.route"
import ExpenseLocationRoutes from "./expense-location.route"
import ItemUnitRoutes from "./itemunit.route"
import ExpenseRoutes from "./expense.route"
import ExpenseItemRoutes from "./expense-item.route"


router.use(ArticlesRoutes);
router.use(AuthRoutes);
router.use(ChecklistCategoryRoutes);
router.use(ChecklistRoutes);
router.use(ChecklistRemarkRoutes);
router.use(CrmBillsRoutes);
router.use(CrmCityRoutes);
router.use(CrmRemarksRoutes);
router.use(CrmStatesRoutes);
router.use(CrmReportsRoutes);
router.use(DyeLocationRoutes);
router.use(DyeStatusReportRoutes);
router.use(DyeRoutes);
router.use(EmailRoutes);
router.use(LeadSourceRoutes);
router.use(LeadStageRoutes);
router.use(LeadTypesRoutes);
router.use(LeadRoutes);
router.use(MachineCategoriesRoutes);
router.use(MachineRoutes);
router.use(ProductionReportRoutes);
router.use(ProductionRoutes);
router.use(ReferRoutes);
router.use(ShoeWeightReportRoutes);
router.use(ShoeWeightRoutes);
router.use(SoleThicknessRoutes);
router.use(SpareDyeRoute);
router.use(UserRoutes);
router.use(TestRoutes)
router.use(SalesmanLeavesRoutes)
router.use(PaymentCategoryRoutes)
router.use(PaymentRoutes)
router.use(KeyRoutes)
router.use(KeyCategoryRoutes)
router.use(ExcelDBRoutes)
router.use(ExcelDBRemarkRoutes)
router.use(SalesmanVisitRoutes)
router.use(VisitRemarkRoutes)
router.use(AttendancesRoutes)
router.use(ExpenseCategoryRoutes)
router.use(ExpenseLocationRoutes)
router.use(ItemUnitRoutes)
router.use(ExpenseRoutes)
router.use(ExpenseItemRoutes)


export default router;
