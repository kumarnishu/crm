import { IUser } from "./user.types"

export type ITodoTemplate = {
    _id: string,
    serial_no: number,
    title: string,
    subtitle: string,
    category: string,
    category2: string,
    contacts: string,
    is_hidden: boolean,
    last_reply: string,
    run_once: boolean,
    frequency_type: string,
    frequency_value: string,
    start_date: string,
    connected_user:string,
    status?:string
}
export type ITodo = {
    _id: string,
    serial_no: number,
    title: string,
    subtitle: string,
    category: string,
    category2: string,
    contacts: {
        mobile: string,
        name: string,
        is_sent: boolean,
        status: string
    }[],
    is_completed: boolean,
    is_hidden: boolean,
    replies: { reply: string, created_by: IUser, timestamp: Date }[]
    is_active: boolean,
    run_once: boolean,
    is_paused: boolean,
    running_key: string,
    refresh_key: string,
    frequency_type: string,
    frequency_value: string,
    cron_string: string,
    refresh_cron_string: string,
    next_run_date: Date,
    next_refresh_date: Date,
    start_date: Date,
    connected_user: IUser,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

export type ITodoBody = Request['body'] & ITodo;
