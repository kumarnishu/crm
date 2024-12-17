export type GetReferenceDto = {
    party: string;
    gst: string;
    address: string;
    state: string;
    stage:string,
    pincode: number;
    business: string;
    [key: string]: string | number; // Index signature for dynamic reference columns
};


export type GetReferenceReportForSalesmanDto = {
    _id: string,
    party: string,
    address: string,
    state: string,
    stage:string,
    reference: string,
    status: string,
    last_remark: string
    [key: string]: string | number;
}


export type GetReferenceExcelDto = {
    _id: string,
    date: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string,
    status?: string
}