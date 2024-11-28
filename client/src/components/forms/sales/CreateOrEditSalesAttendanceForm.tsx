import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, SaleChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { GetUsers } from '../../../services/UserServices';
import { UserContext } from '../../../contexts/userContext';
import moment from 'moment';
import { CreateOrEditSalesAttendanceDto, DropDownDto, GetSalesAttendanceDto, GetUserDto } from '../../../dtos';
import { GetAllCRMCitiesForDropDown } from '../../../services/LeadsServices';
import { CreateOrEditSalesmanAttendance } from '../../../services/SalesServices';

function CreateOrEditSalesAttendanceForm({ attendance }: { attendance?: GetSalesAttendanceDto }) {
    const { user } = useContext(UserContext)
    const { data: users } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', permission: 'salesman_visit_view', show_assigned_only: true }))
    const { data: cities } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("cities", async () => GetAllCRMCitiesForDropDown({ state: 'all' }))

    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<GetSalesAttendanceDto>, BackendError, {
            id?: string,
            body: CreateOrEditSalesAttendanceDto
        }>
        (CreateOrEditSalesmanAttendance, {
            onSuccess: () => {
                queryClient.invalidateQueries('attendances')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik({
        initialValues: {
            station: attendance ? attendance.station.id : "",
            employee: attendance ? attendance.employee.id : "",
            in_time: attendance ? attendance.in_time : '',
            old_visit: attendance ? attendance.old_visit : 0,
            attendance: attendance ? attendance.attendance : 'absent',
            end_time: attendance ? attendance.end_time : '',
            new_visit: attendance ? attendance.new_visit : 0,
            remark: attendance ? attendance.remark : '',
            date: attendance ? moment(attendance.date).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD")
        },
        validationSchema: Yup.object({
            station: Yup.string()
                .required('Required field'),
            employee: Yup.string()
                .required('Required field'),
            old_visit: Yup.number().max(10, "shult not be more than 10")
                .required('Required field'),
            in_time: Yup.string(),
            attendance: Yup.string()
                .required('Required field'),
            end_time: Yup.string(),
            new_visit: Yup.number().max(10, "shult not be more than 10"),
            remark: Yup.string()
            ,
            date: Yup.string().required('Required field'),
        }),
        onSubmit: (values) => {
            if (attendance)
                mutate({
                    id: attendance._id,
                    body: values
                })
            else {
                mutate({
                    body: values

                })
            }
        }
    });

    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: SaleChoiceActions.close_sale })
        }
    }, [isSuccess])

    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                gap={2}
                pt={2}
            >
                {user?.assigned_users && user?.assigned_users.length > 0 && < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.employee && formik.errors.employee ? true : false
                    }
                    disabled={attendance ? true : false}
                    id="employee"
                    helperText={
                        formik.touched.employee && formik.errors.employee ? formik.errors.employee : ""
                    }
                    {...formik.getFieldProps('employee')}
                    required
                    label="Select Salesman"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>

                    </option>
                    {
                        users && users.data.map((user, index) => {
                            return (<option key={index} value={user._id}>
                                {user.username}
                            </option>)

                        })
                    }
                </TextField>}

                < TextField
                    type="date"
                    focused
                    error={
                        formik.touched.date && formik.errors.date ? true : false
                    }
                    disabled={attendance ? true : false}
                    id="date"
                    label="Attendance Date"
                    fullWidth
                    required
                    helperText={
                        formik.touched.date && formik.errors.date ? formik.errors.date : ""
                    }
                    {...formik.getFieldProps('date')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.station && formik.errors.station ? true : false
                    }
                    id="station"
                    helperText={
                        formik.touched.station && formik.errors.station ? formik.errors.station : ""
                    }
                    {...formik.getFieldProps('station')}
                    required
                    label="Select Station"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        cities && cities.data && cities.data.map((station, index) => {
                            return (<option key={index} value={station.id}>
                                {station.value}
                            </option>)

                        })
                    }
                </TextField>
                < TextField
                    select
                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.attendance && formik.errors.attendance ? true : false
                    }
                    id="attendance"
                    helperText={
                        formik.touched.attendance && formik.errors.attendance ? formik.errors.attendance : ""
                    }
                    {...formik.getFieldProps('attendance')}
                    required
                    label="Attendance"
                    fullWidth
                >
                    <option key={'absent'} value={'absent'}>
                        Absent
                    </option>
                    <option key={'present'} value={'present'}>
                        Present
                    </option>
                </TextField>
                <TextField
                    fullWidth
                    type="number"
                    error={
                        formik.touched.new_visit && formik.errors.new_visit ? true : false
                    }
                    id="new_visit"
                    label="New Visit"
                    helperText={
                        formik.touched.new_visit && formik.errors.new_visit ? formik.errors.new_visit : ""
                    }
                    {...formik.getFieldProps('new_visit')}
                />
                <TextField
                    fullWidth
                    type="number"
                    error={
                        formik.touched.old_visit && formik.errors.old_visit ? true : false
                    }
                    id="old_visit"
                    label="Old Visit"
                    helperText={
                        formik.touched.old_visit && formik.errors.old_visit ? formik.errors.old_visit : ""
                    }
                    {...formik.getFieldProps('old_visit')}
                />

                <TextField
                    fullWidth
                    type="time"
                    focused
                    error={
                        formik.touched.in_time && formik.errors.in_time ? true : false
                    }
                    id="in_time"
                    label="In Time"
                    helperText={
                        formik.touched.in_time && formik.errors.in_time ? formik.errors.in_time : ""
                    }
                    {...formik.getFieldProps('in_time')}
                />

                <TextField
                    focused
                    fullWidth
                    type="time"
                    error={
                        formik.touched.end_time && formik.errors.end_time ? true : false
                    }
                    id="end_time"
                    label="End day"
                    helperText={
                        formik.touched.end_time && formik.errors.end_time ? formik.errors.end_time : ""
                    }
                    {...formik.getFieldProps('end_time')}
                />

                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    id="remark"
                    label="Remark"
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />

                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message={attendance ? "updated" : "created"} color="success" />
                    ) : null
                }
                <Button variant="contained" size="large" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditSalesAttendanceForm
