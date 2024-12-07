import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { GetReferenceDto, GetReferenceExcelDto } from "../dtos/references.dto";
import isMongoId from "validator/lib/isMongoId";
import { Reference } from "../models/references.model";


export const GetReferencesReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferenceDto[] = []
    const data = await Reference.find()
    result = data.map((ref) => {
        return {
            _id: ref._id,
            gst: ref.gst,
            party: ref.party,
            address: ref.address,
            state: ref.state,
            pincode: ref.pincode,
            business: ref.business,
            sale_scope: ref.sale_scope,
            reference: ref.reference
        }
    })
    return res.status(200).json(result)
}
export const BulkCreateAndUpdateReferenceFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferenceExcelDto[] = []
    let validated = true
    let statusText: string = ""
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
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetReferenceExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let item = workbook_response[i]
            let gst: string | null = item.gst
            let party: string | null = item.party
            let address: string | null = item.address
            let state: string | null = item.state
            let pincode: number | null = item.pincode
            let business: string | null = item.business
            let sale_scope: number | null = item.sale_scope
            let reference: string | null = item.reference || "Default"
            if (!party) {
                validated = false
                statusText = "party required"
            }
            if (!state) {
                validated = false
                statusText = "state required"
            }
            if (!reference) {
                validated = false
                statusText = "reference required"
            }

            if (validated) {
                if (item._id && isMongoId(String(item._id))) {
                    let tmpitem = await Reference.findById(item._id)

                    if (tmpitem) {
                        await Reference.findByIdAndUpdate(item._id, {
                            gst: gst,
                            address: address,
                            state: item.state.toLowerCase(),
                            pincode: pincode,
                            business: business,
                            party: item.party.toLowerCase(),
                            sale_scope: sale_scope,
                            reference: item.reference.toLowerCase(),
                            updated_by: req.user,
                            updated_at: new Date()
                        })
                        statusText = "updated"
                    }

                    else {
                        console.log(item._id, "not found")
                        statusText = "not found"
                    }

                }

                if (!item._id || !isMongoId(String(item._id))) {
                    let oldref = await Reference.findOne({ state: state.toLowerCase(), party: party.toLowerCase(), reference: item.reference.toLowerCase() })
                    if (!oldref) {
                        await new Reference({
                            gst: gst,
                            party: party.toLowerCase(),
                            address: address,
                            state: state.toLowerCase(),
                            pincode: pincode,
                            business: business,
                            sale_scope: sale_scope,
                            reference: reference.toLowerCase(),
                            created_by: req.user,
                            updated_by: req.user,
                            created_at: new Date(),
                            updated_at: new Date()
                        }).save()
                        statusText = "created"
                    }
                    else
                        statusText = "duplicate"
                }

            }

            result.push({
                ...item,
                status: statusText
            })
        }


    }
    return res.status(200).json(result);
}

export const DownloadExcelTemplateForCreateReferenceReport = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any[] = [
        {
            _id: 'wwwewew',
            gst: '22AAAAA0000A15',
            party: 'sunrise traders',
            address: 'mumbai maharashtra',
            state: 'maharashtra',
            pincode: 120914,
            business: 'safety',
            sale_scope: 900000,
            reference: 'A'
        }
    ]
    let data = await Reference.find()
    if (data.length > 0)
        checklist = data.map((ref) => {
            return {
                _id: ref._id.valueOf(),
                gst: ref.gst,
                party: ref.party,
                address: ref.address,
                state: ref.state,
                pincode: ref.pincode,
                business: ref.business,
                sale_scope: ref.sale_scope,
                reference: ref.reference
            }
        })
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: checklist })
    ConvertJsonToExcel(template)
    let fileName = "CreateReferenceTemplate.xlsx"
    return res.download("./file", fileName)
}