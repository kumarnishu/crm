import { NextFunction, Request, Response } from 'express';
import { KeyCategory } from '../models/key-category.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';

export const test = async (req: Request, res: Response, next: NextFunction) => {

    const category = req.query.category
    let dt1 = new Date()
    dt1.setHours(0, 0, 0, 0)
    let dt2 = new Date()

    dt2.setDate(dt1.getDate() + 1)
    dt2.setHours(0)
    dt2.setMinutes(0)
    let cat = await KeyCategory.findOne({ category: category })
    let remarks = await ExcelDBRemark.find({
        created_at: { $gte: dt1, $lt: dt2 },
        category: cat
    })
        .populate({
            path: 'created_by',
            select: 'username' // Specify the fields to fetch from the populated model
        })
        .select('remark obj created_at');

    return res.status(200).json({
        total: await ExcelDBRemark.find({ category: cat }).count(),
        today: remarks.length,
        remarks: remarks
    });

}