import { IUser } from "./UserInterface"

export type IPartyRemark = {
    _id: string,
    remark: string,
    next_call: Date,
    party: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type IParty= {
    _id: string,
    party: string,
    mobile: string,
    city: string,
    state: string,
    customer:string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ISampleSystem={
    _id:string
    date:Date,
    otherparty:boolean,
    party:string,
    state:string,
    samples:string,
    last_remark:string,
    next_call:Date,
    stage:string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}