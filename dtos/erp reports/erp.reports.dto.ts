import { DropDownDto } from "../common/dropdown.dto"

export type GetErpStateDto = {
    _id: string,
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    assigned_users: string
}
export type CreateOrEditErpStateDto = {
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number
}
export type GetPendingOrdersReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    product_family: string,
    article: string,
    size5: number,
    size6: number,
    size7: number,
    size8: number,
    size9: number,
    size10: number,
    size11: number,
    size12_24pairs: number,
    size13: number,
    size11x12: number,
    size3: number,
    size4: number,
    size6to10: number,
    size7to10: number,
    size8to10: number,
    size4to8: number,
    size6to9: number,
    size5to8: number,
    size6to10A: number,
    size7to10B: number,
    size6to9A: number,
    size11close: number,
    size11to13: number,
    size3to8: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}
export type GetPartyTargetReportDto = {
    _id: string,
    slno: string,
    PARTY: string,
    Create_string: string,
    STATION: string,
    SALES_OWNER: string,
    report_owner: DropDownDto
    All_TARGET: string,
    TARGET: number,
    PROJECTION: number,
    GROWTH: number,
    TARGET_ACHIEVE: number,
    TOTAL_SALE_OLD: number,
    TOTAL_SALE_NEW: number,
    Last_Apr: number,
    Cur_Apr: number,
    Last_May: number,
    Cur_May: number,
    Last_Jun: number,
    Cur_Jun: number,
    Last_Jul: number,
    Cur_Jul: number,
    Last_Aug: number,
    Cur_Aug: number,
    Last_Sep: number,
    Cur_Sep: number,
    Last_Oct: number,
    Cur_Oct: number,
    Last_Nov: number,
    Cur_Nov: number,
    Last_Dec: number,
    Cur_Dec: number,
    Last_Jan: number,
    Cur_Jan: number,
    Last_Feb: number,
    Cur_Feb: number,
    Last_Mar: number,
    Cur_Mar: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}
export type GetClientSaleLastYearReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}
export type GetBillsAgingReportDto = {
    _id: string,
    report_owner: DropDownDto
    account: string,
    plu70: number,
    in70to90: number,
    in90to120: number,
    plus120: number
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto,
    status?: string
}

export type GetErpStateFromExcelDto = {
    _id?: string,
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    status?: any
}



export type GetSaleAnalysisReportDto = {
    state: string,
    monthly_target: number,
    monthly_achivement: number,
    monthly_percentage: number,
    annual_target: number,
    annual_achivement: number,
    annual_percentage: number,
    last_year_sale: number,
    last_year_sale_percentage_comparison: number
}
export type GetPartyTargetReportFromExcelDto = {
    slno: string,
    PARTY: string,
    Create_Date: string,
    STATION: string,
    SALES_OWNER: string,
    report_owner: string
    All_TARGET: string,
    TARGET: number,
    PROJECTION: number,
    GROWTH: number,
    TARGET_ACHIEVE: number,
    TOTAL_SALE_OLD: number,
    TOTAL_SALE_NEW: number,
    Last_Apr: number,
    Cur_Apr: number,
    Last_May: number,
    Cur_May: number,
    Last_Jun: number,
    Cur_Jun: number,
    Last_Jul: number,
    Cur_Jul: number,
    Last_Aug: number,
    Cur_Aug: number,
    Last_Sep: number,
    Cur_Sep: number,
    Last_Oct: number,
    Cur_Oct: number,
    Last_Nov: number,
    Cur_Nov: number,
    Last_Dec: number,
    Cur_Dec: number,
    Last_Jan: number,
    Cur_Jan: number,
    Last_Feb: number,
    Cur_Feb: number,
    Last_Mar: number,
    Cur_Mar: number,
    status?: string,
    created_at?: string,
}



export type GetBillsAgingReportFromExcelDto = {
    report_owner: string
    account: string,
    total?: number,
    plu70: number,
    in70to90: number,
    in90to120: number,
    plus120: number
    status?: string,
    created_at?: string,
}
export type GetPendingOrdersReportFromExcelDto = {
    report_owner: string
    account: string,
    product_family: string,
    article: string,
    total?: number,
    size5: number,
    size6: number,
    size7: number,
    size8: number,
    size9: number,
    size10: number,
    size11: number,
    size12_24pairs: number,
    size13: number,
    size11x12: number,
    size3: number,
    size4: number,
    size6to10: number,
    size7to10: number,
    size8to10: number,
    size4to8: number,
    size6to9: number,
    size5to8: number,
    size6to10A: number,
    size7to10B: number,
    size6to9A: number,
    size11close: number,
    size11to13: number,
    size3to8: number,
    status?: string, created_at?: string,
}

export type GetClientSaleReportFromExcelDto = {
    report_owner: string,
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
    total?: number,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    status?: string,
    created_at?: string,
}