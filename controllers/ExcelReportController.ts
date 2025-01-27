import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { decimalToTimeForXlsx, excelSerialToDate, invalidate, parseExcelDate } from "../utils/datesHelper";
import moment from "moment";
import { IColumnRowData, IRowData } from "../dtos/SalesDto";
import { IKeyCategory, ICRMState } from "../interfaces/AuthorizationInterface";
import { IUser } from "../interfaces/UserInterface";
import { KeyCategory, Key } from "../models/AuthorizationModel";
import { ExcelDB } from "../models/ExcelReportModel";
import { VisitReport } from "../models/SalesModel";
import { User } from "../models/UserModel";
import { IPartyRemark } from "../interfaces/PartyPageInterface";
import { PartyRemark } from "../models/PartPageModel";


export class ExcelReportController {

    public async GetExcelDbReport(req: Request, res: Response, next: NextFunction) {
        const category = req.query.category
        const hidden = req.query.hidden
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };
        if (!category) {
            return res.status(400).json({ message: 'please select category ' })
        }
        let cat: IKeyCategory | null = null
        cat = await KeyCategory.findById(category)


        let assigned_keys: any[] = req.user.assigned_keys;
        let assigned_states: string[] = []
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        let assigned_employees: string[] = [String(req.user.username), String(req.user.alias1 || ""), String(req.user.alias2 || "")].filter(value => value)

        //for hiding rows
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        dt1.setDate(dt1.getDate() + 1)
        let dt2 = new Date(dt1)
        dt2.setDate(dt1.getDate() - 7)

        let keys = await Key.find({ category: category, _id: { $in: assigned_keys } }).sort('serial_no');


        //data push for assigned keys
        let data = await ExcelDB.find({ category: category }).populate('key').sort('created_at')

        let maptoemployeekeys = await Key.find({ map_to_username: true, category: category }).sort('serial_no');
        let maptostateskeys = await Key.find({ map_to_state: true, category: category }).sort('serial_no');

        if (req.user.assigned_users && req.user?.assigned_users.length > 0) {
            req.user.assigned_users.map((u: any) => {
                assigned_employees.push(u.username)
                if (u.alias1)
                    assigned_employees.push(u.alias1)
                if (u.alias2)
                    assigned_employees.push(u.alias2)
            })
        }
        // filter for states
        if (maptostateskeys && maptostateskeys.length > 0)
            data = data.filter((dt) => {
                let matched = false;
                maptostateskeys.forEach((key) => {
                    //@ts-ignore
                    if (assigned_states.includes(String(dt[key.key]).trim().toLowerCase())) {
                        matched = true
                    }
                })
                if (matched) {
                    return dt;
                }
            })

        //filter for employees
        if (maptoemployeekeys && maptoemployeekeys.length > 0)
            data = data.filter((dt) => {
                let matched = false;
                maptoemployeekeys.forEach((key) => {
                    //@ts-ignore
                    if (assigned_employees.includes(String(dt[key.key]).trim().toLowerCase())) {
                        matched = true
                    }
                })
                if (matched) {
                    return dt;
                }
            })

        if (cat && cat.category == 'BillsAge') {
            result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
            result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
        }
        else if (cat && cat.category == 'PartyTarget') {
            {
                result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
                result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
            }
        }
        else if (cat && cat.category == 'OrderDash') {
            {
                result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
                result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
            }
        }
        else if (cat && cat.category == 'ClientSale') {
            {
                result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
                result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
            }
        }
        // for (let k = 0; k < keys.length; k++) {
        //     let c = keys[k]
        //     result.columns.push({ key: c.key, header: c.key, type: c.type })
        // }

        //actual data filling starts from here

        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt

            let push_row = true
            if (dt) {
                let lastremark: IPartyRemark | undefined = undefined;
                for (let i = 0; i < keys.length; i++) {
                    if (assigned_keys.includes(keys[i]._id)) {
                        let key = keys[i].key
                        //@ts-ignore
                        if (dt[key]) {
                            if (keys[i].type == "timestamp")
                                //@ts-ignore
                                obj[key] = String(decimalToTimeForXlsx(dt[key]))
                            else if (keys[i].type == "date") {
                                if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                    //@ts-ignore
                                    obj[key] = moment(dt[key]).format("MMM-YY")
                                }
                                else {
                                    //@ts-ignore
                                    obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                                }
                            }
                            else
                                //@ts-ignore
                                obj[key] = dt[key]

                            //adding bills age actions
                            if (cat && cat.category == 'BillsAge' && key == 'Account Name') {
                                //@ts-ignore
                                lastremark = await PartyRemark.findOne({ created_by: req.user._id, party: dt[key] }).sort('-created_at')
                                if (lastremark) {
                                    obj['last remark'] = lastremark.remark
                                    if (lastremark.next_call)
                                        obj['next call'] = moment(lastremark.next_call).format('YYYY-MM-DD')
                                }
                            }
                            if (cat && cat.category == 'PartyTarget' && key == 'PARTY') {
                                //@ts-ignore
                                lastremark = await PartyRemark.findOne({ created_by: req.user._id, party: dt[key] }).sort('-created_at')
                                if (lastremark) {
                                    obj['last remark'] = lastremark.remark
                                    if (lastremark.next_call)
                                        obj['next call'] = moment(lastremark.next_call).format('YYYY-MM-DD')
                                }
                            }
                            if (cat && cat.category == 'OrderDash' && key == 'Customer Name') {
                                //@ts-ignore
                                lastremark = await PartyRemark.findOne({ created_by: req.user._id, party: dt[key] }).sort('-created_at')
                                if (lastremark) {
                                    obj['last remark'] = lastremark.remark
                                    if (lastremark.next_call)
                                        obj['next call'] = moment(lastremark.next_call).format('YYYY-MM-DD')
                                }
                            }
                            if (cat && cat.category == 'ClientSale' && key == 'CUSTOMER') {
                                //@ts-ignore
                                lastremark = await PartyRemark.findOne({ created_by: req.user._id, party: dt[key] }).sort('-created_at')
                                if (lastremark) {
                                    obj['last remark'] = lastremark.remark
                                    if (lastremark.next_call)
                                        obj['next call'] = moment(lastremark.next_call).format('YYYY-MM-DD')
                                }
                            }
                        }
                        else {
                            if (keys[i].type == "number")
                                obj[key] = 0
                            else
                                obj[key] = ""
                        }
                    }

                }
                if (hidden && hidden !== 'true' && lastremark && lastremark.next_call > dt1) {
                    if (lastremark.created_by == req.user._id.valueOf())
                        push_row = false
                }

            }
            if (push_row && dt)
                return obj
        }))
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }
        return res.status(200).json(result)
    }

    static async SaveVisistReports(user: IUser) {
        let salesman: IUser[] = []
        salesman = await User.find({ assigned_permissions: 'sales_menu' })
        let cat = await KeyCategory.findOne({ category: 'visitsummary' })
        for (let i = 0; i < salesman.length; i++) {
            let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)

            const regexNames = names.map(name => new RegExp(`^${name}$`, 'i'));
            let records = await ExcelDB.find({ category: cat, 'Employee Name': { $in: regexNames } })
            let found = 0;
            let notfound = 0;
            for (let k = 0; k < records.length; k++) {
                let employee = salesman[i];
                //@ts-ignore
                let date = records[k]["Visit Date"]
                let dt1 = new Date(date)
                let dt2 = new Date(dt1)
                dt1.setHours(0, 0, 0, 0)
                dt2.setHours(0, 0, 0, 0)
                dt2.setDate(dt1.getDate() + 1)
                //@ts-ignore
                let intime = records[k]['In Time'];
                let report = await VisitReport.findOne({ employee: employee, visit_date: { $gte: dt1, $lt: dt2 }, intime: intime })
                if (report)
                    found++
                else {
                    await new VisitReport({
                        employee: employee,
                        visit_date: new Date(date),
                        //@ts-ignore
                        customer: records[k]["Customer Name"],
                        //@ts-ignore
                        intime: records[k]["In Time"],
                        //@ts-ignore
                        outtime: records[k]["Out Time"],
                        //@ts-ignore
                        visitInLocation: records[k]["Visit In Location"],
                        //@ts-ignore
                        visitOutLocation: records[k]["Visit Out Location"],
                        //@ts-ignore
                        remarks: records[k]["Remarks"],
                        created_at: new Date(),
                        updated_at: new Date(),
                        created_by: user,
                        updated_by: user,
                    }).save()
                    notfound++
                }


            }
        }
    }

    public async CreateExcelDBFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: { key: string, category: string, problem: string }[] = []
        if (!req.file)
            return res.status(400).json({
                message: "please provide an Excel file",
            });
        if (req.file) {
            const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
            if (req.file.size > 100 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
            const workbook = xlsx.read(req.file.buffer);

            let categories = await KeyCategory.find();
            for (let i = 0; i < categories.length; i++) {
                let sheetName = categories[i];
                const worksheet = workbook.Sheets[sheetName.category];
                const sheetData: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: true });


                if (worksheet && sheetData) {
                    let columns = await Key.find({ category: sheetName });
                    let keys: any = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false })[0];
                    const remotekeys = columns.map((c) => { return c.key })

                    if (Array.isArray(keys)) {
                        for (let rk = 0; rk < keys.length; rk++) {
                            if (keys[rk] && !remotekeys.includes(keys[rk]))
                                result.push({ key: keys[rk], category: sheetName.category, problem: "not found" })
                        }
                    }

                    if (columns && sheetData) {
                        await ExcelDB.deleteMany({ category: sheetName });

                        for (let j = 0; j < sheetData.length - sheetName.skip_bottom_rows || 0; j++) {
                            let obj: any = {};
                            obj.category = sheetName;

                            for (let k = 0; k < columns.length; k++) {
                                let column = columns[k];
                                if (column && column.key) {
                                    if (column.type == 'date') {
                                        obj.key = column;
                                        obj[String(column.key)] = new Date(excelSerialToDate(sheetData[j][column.key])) > invalidate ? new Date(excelSerialToDate(sheetData[j][column.key])) : parseExcelDate(sheetData[j][column.key])
                                    }
                                    else {
                                        obj.key = column;
                                        obj[String(column.key)] = sheetData[j][column.key];
                                    }
                                }

                            }
                            if (obj['key'])
                                await new ExcelDB(obj).save();
                        }
                    }
                }
            }
            await ExcelReportController.SaveVisistReports(req.user)
        }

        if (result.length > 0)
            return res.status(200).json(result);
        else
            return res.status(200).json([]);
    }

}