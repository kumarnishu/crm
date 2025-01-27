import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button, CircularProgress, MenuItem, Select, InputLabel, OutlinedInput, Checkbox, ListItemText, } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import {  useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';

import { useFormik } from 'formik';
import * as Yup from "yup"
import { AlertContext } from '../../../contexts/alertContext';
import { UserService } from '../../../services/UserServices';
import { DropDownDto } from '../../../dtos/DropDownDto';
import { GetUserDto } from '../../../dtos/UserDto';



type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    user: GetUserDto, setUser: React.Dispatch<React.SetStateAction<GetUserDto | undefined>>
}

function AssignUsersDialog({ user, setUser, dialog, setDialog }: Props) {
    const [users, setUsers] = useState<DropDownDto[]>(user.assigned_usersDropdown)
    const { data, isSuccess: isUserSuccess } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>("user_dropdowns", async () => new UserService().GetUsersForDropdown({ hidden: false, show_assigned_only: false }))
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess} = useMutation
        <AxiosResponse<string>, BackendError, {
            id: string,
            body: {
                ids: string[]
            }
        }>
        (new UserService().AssignUsers, {
              onSuccess: () => {
                queryClient.invalidateQueries('users')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const formik = useFormik<{
        ids: string[]
    }>({
        initialValues: {
            ids: user.assigned_usersDropdown.map((u) => { return u.id })
        },
        validationSchema: Yup.object({
            ids: Yup.array()
                .required('field')
        }),
        onSubmit: (values: {
            ids: string[]
        }) => {
            mutate({
                id: user._id,
                body: {
                    ids: values.ids
                }
            })
            queryClient.invalidateQueries('users')
        }
    });

    useEffect(() => {
        if (isUserSuccess) {
            setUsers(data?.data.map((u) => { return { id: u.id,  label: u.label } }))
        }
    }, [isUserSuccess, data])


    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
            setUser(undefined)
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={dialog === 'AssignUsersDialog'}
            onClose={() => {
                setUser(undefined)
                setDialog(undefined)
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => { setUser(undefined); setDialog(undefined) }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                Assign Users
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">
                        {`Warning ! This will assign ${formik.values.ids.length} users to the selected user.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ ids: [] })}>Remove Selection</Button>
                    <form onSubmit={formik.handleSubmit}>
                        <InputLabel id="demo-multiple-checkbox-label">Users</InputLabel>
                        <Select
                            label="Users"
                            fullWidth
                            labelId="demo-multiple-checkbox-label"
                            id="demo-multiple-checkbox"
                            multiple
                            input={<OutlinedInput label="User" />}
                            renderValue={() => `${formik.values.ids.length} users`}
                            {...formik.getFieldProps('ids')}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <Checkbox checked={formik.values.ids.includes(user.id)} />
                                    <ListItemText primary={user.label} />
                                </MenuItem>
                            ))}
                        </Select>
                        <Button style={{ padding: 10, marginTop: 10 }} variant="contained" color="primary" type="submit"
                            disabled={Boolean(isLoading)}
                            fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Assign"}
                        </Button>
                    </form>


                </Stack>
            </DialogContent>
        </Dialog >
    )
}

export default AssignUsersDialog