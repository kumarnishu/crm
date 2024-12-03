import mongoose from "mongoose"
import { IUser } from "./user"
import { IItemUnit } from "./item-unit"
import { IExpenseCategory } from "./expense-category"


export type IExpenseItem = {
    _id: string,
    item: string,
    unit: IItemUnit,
    stock: number,
    category: IExpenseCategory
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const ExpenseItemSchema = new mongoose.Schema<IExpenseItem, mongoose.Model<IExpenseItem, {}, {}>, {}>({
    item: {
        type: String,
        index: true,
        lowercase: true,
        required: true
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemUnit',
        required: true
    },
    stock: {
        type: Number, default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseCategory',
        required: true
    },
    created_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_at: {
        type: Date,
        default: new Date(),
        required: true,

    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

export const ExpenseItem = mongoose.model<IExpenseItem, mongoose.Model<IExpenseItem, {}, {}>>("ExpenseItem", ExpenseItemSchema)