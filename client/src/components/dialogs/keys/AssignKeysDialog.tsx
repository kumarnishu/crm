import { Dialog, DialogContent, DialogTitle, Typography, IconButton, Stack, Button,  InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText } from '@mui/material'
import { useContext, useEffect, useState } from 'react';
import { ChoiceContext, KeyChoiceActions } from '../../../contexts/dialogContext';
import { Cancel } from '@mui/icons-material';
import { AxiosResponse } from 'axios';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { useFormik } from 'formik';
import * as Yup from "yup"
import { GetUsers } from '../../../services/UserServices';
import {  GetKeyDto } from '../../../dtos';
import { GetUserDto } from '../../../dtos';
import { AssignKeysToUsers } from '../../../services/KeyServices';


function AssignKeysDialog({ keys, flag }: { keys: GetKeyDto[], flag: number }) {
    const [users, setUsers] = useState<GetUserDto[]>([])
    const { data: usersData, isSuccess: isUsersSuccess } = useQuery<AxiosResponse<GetUserDto[]>, BackendError>("users", async () => GetUsers({ hidden: 'false', show_assigned_only: false }))


    const { choice, setChoice } = useContext(ChoiceContext)
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                user_ids: string[],
                key_ids: string[],
                flag: number
            }
        }>
        (AssignKeysToUsers, {
            onSuccess: () => {
                queryClient.invalidateQueries('keys')
            }
        })
    const formik = useFormik<{
        user_ids: string[],
        key_ids: string[],
    }>({
        initialValues: {
            user_ids: [],
            key_ids: keys.map((item) => { return item._id })
        },
        validationSchema: Yup.object({
            user_ids: Yup.array()
                .required('field'),
            key_ids: Yup.array()
                .required('field')
        }),
        onSubmit: (values: {
            user_ids: string[],
            key_ids: string[]
        }) => {
            mutate({
                body: {
                    user_ids: values.user_ids,
                    key_ids: keys.map((item) => { return item._id }),
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
            setChoice({ type: KeyChoiceActions.close_key });
            formik.setValues({ user_ids: [], key_ids: [] });
        }
    }, [isSuccess])
    return (
        <Dialog
            fullWidth
            open={choice === KeyChoiceActions.assign_keys ? true : false}
            onClose={() => {
                setChoice({ type: KeyChoiceActions.close_key });
                formik.setValues({ user_ids: [], key_ids: [] });
            }}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setChoice({ type: KeyChoiceActions.close_key });
                formik.setValues({ user_ids: [], key_ids: [] });
            }}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                {flag === 0 ? 'Remove States' : 'Assign States'}
            </DialogTitle>
            <DialogContent>
                <Stack
                    gap={2}
                >
                    <Typography variant="body1" color="error">

                        {flag === 1 && `Warning ! This will assign ${keys.length} States to the ${formik.values.user_ids.length} Users.`}
                        {flag === 0 && `Warning ! This will remove  ${keys.length} States from  ${formik.values.user_ids.length} Users.`}

                    </Typography>
                    <Button onClick={() => formik.setValues({ user_ids: [], key_ids: keys.map((item) => { return item._id }) })}>Remove Selection</Button>
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
                                <MenuItem key={user._id} value={user._id}>
                                    <Checkbox checked={formik.values.user_ids.includes(user._id)} />
                                    <ListItemText primary={user.username} />
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

export default AssignKeysDialog