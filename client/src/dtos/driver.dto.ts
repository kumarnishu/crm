import { DropDownDto } from "./dropdown.dto"

export type GetDriverSystemDto = {
    _id: string,
    driver: DropDownDto
    photo: string,
    location:string,
    created_at: string,
    updated_at: string,
    created_by: DropDownDto,
    updated_by: DropDownDto
}

export type CreateDriverSystemDto = {
    driver: string
    latitude:string,
    longitude:string
    photo:string
}
