import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText } from '@mui/material'
import {  useEffect, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { useFormik } from 'formik';
import * as Yup from "yup"
import { AssignCRMCitiesToUsers } from '../../../services/LeadsServices';
import { DropDownDto } from '../../../dtos/dropdown.dto';
import { GetUsersForDropdown } from '../../../services/UserServices';

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    cities: DropDownDto[], flag: number
}

function AssignCrmCitiesDialog({ cities, flag, dialog, setDialog }: Props) {

    const [users, setUsers] = useState<DropDownDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("users", async () => GetUsersForDropdown({ hidden: false, show_assigned_only: false }))
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                city_ids: string[],
                flag: number
            }
        }>
        (AssignCRMCitiesToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('crm_cities')
            }
        })
    const formik = useFormik<{
        user_ids: string[],
        city_ids: string[],
    }>({
        initialValues: {
            user_ids: [],
            city_ids: cities.map((item) => { return item.id })
        },
        validationSchema: Yup.object({
            user_ids: Yup.array()
                .required('field'),
            city_ids: Yup.array()
                .required('field')
        }),
        onSubmit: (values: {
            user_ids: string[],
            city_ids: string[]
        }) => {
            mutate({
                body: {
                    user_ids: values.user_ids,
                    city_ids: cities.map((item) => { return item.id }),
                    flag: flag
                }
            })

        }
    });

    useEffect(() => {
        if (isUsersSuccess)
            setUsers(usersData?.data)
    }, [isUsersSuccess, usersData])


    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
            formik.setValues({ user_ids: [], city_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={dialog ==='AssignCrmCitiesDialog'}
            onClose={() => {
                setDialog(undefined)
                formik.setValues({ user_ids: [], city_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
                formik.setValues({ user_ids: [], city_ids: [] });
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag === 0 ? 'Remove Cities' : 'Assign Cities'}
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {flag === 1 && `Warning ! This will assign ${cities.length} Cities to the ${formik.values.user_ids.length} Users.`}
                        {flag === 0 && `Warning ! This will remove  ${cities.length} Cities from  ${formik.values.user_ids.length} Users.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ user_ids: [], city_ids: cities.map((item) => { return item.id }) })}>Remove Selection</Button>
                    <form onSubmit={formik.handleSubmit}>
                        <InputLabel id="demo-multiple-checkbox-label">Users</InputLabel>
                        <Select
                            label="Users"
                            fullWidth
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            input={<OutlinedInput label="User" />}
                            renderValue={() => `${formik.values.user_ids.length} users`}
                            {...formik.getFieldProps('user_ids')}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <Checkbox checked={formik.values.user_ids.includes(user.id)} />
                                    <ListItemText primary={user.label} />
                                </MenuItem>
                            ))}
                        </Select>

                        <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color={flag != 0 ? "primary" : "error"} type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>
                            {flag == 0 ? 'Remove ' : "Assign"}
                        </Button>
                    </form>


                </Stack>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message="successfull" color="success" />
                    ) : null
                }
            </DialogContent>
        </Dialog >
    )
}

export default AssignCrmCitiesDialog