import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import * as yup from 'yup';
import { toTitleCase } from '../../../utils/TitleCase';
import { AlertContext } from '../../../contexts/alertContext';
import { AuthorizationService } from '../../../services/AuthorizationService';
import { GetKeyDto } from '../../../dtos/AuthorizationDto';
import { DropDownDto } from '../../../dtos/DropDownDto';

function CreateOrEditKeyForm({ keyitm, setDialog }: { keyitm?: GetKeyDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const [categories, setCategories] = useState<DropDownDto[]>([])
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: {
                key: string,
                category: string,
                type: string,
                serial_no: number,
                is_date_key: boolean,
                map_to_username: boolean,
                map_to_state: boolean,
            },
            id?: string
        }>
        (new AuthorizationService().CreateOrEditKey, {

            onSuccess: () => {
                queryClient.refetchQueries('keys')
                setAlert({ message: keyitm ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })
    const { data, isSuccess: isSuccesskeysData } = useQuery<AxiosResponse<DropDownDto[]>, BackendError>(["key_categories"], async () => new AuthorizationService().GetAllKeyCategoriesForDropdown({ show_assigned_only: false }))


    const formik = useFormik<{
        category: string,
        key: string,
        type: string,
        serial_no: number,
        is_date_key: boolean,
        map_to_username: boolean,
        map_to_state: boolean,
    }>({
        initialValues: {
            key: keyitm ? keyitm.key : "",
            category: keyitm ? keyitm.category.id : "",
            type: keyitm ? keyitm.type : "",
            serial_no: keyitm ? Number(keyitm.serial_no) : 0,
            is_date_key: keyitm && keyitm.is_date_key ? true : false,
            map_to_username: keyitm && keyitm.map_to_username ? true : false,
            map_to_state: keyitm && keyitm.map_to_state ? true : false,
        },
        validationSchema: yup.object({
            key: yup.string().required(),
            category: yup.string().required(),
            type: yup.string().required(),
            serial_no: yup.number().required(),
            is_date_key: yup.boolean(),
            map_to_username: yup.boolean(),
            map_to_state: yup.boolean(),
        }),
        onSubmit: (values: {
            key: string,
            category: string,
            type: string,
            serial_no: number,
            is_date_key: boolean,
            map_to_username: boolean,
            map_to_state: boolean,
        }) => {
            mutate({
                id: keyitm?._id,
                body: {
                    key: values.key,
                    category: values.category,
                    type: values.type,
                    serial_no: values.serial_no,
                    is_date_key: values.is_date_key,
                    map_to_username: values.map_to_username,
                    map_to_state: values.map_to_state,
                }
            })
        }
    });

    useEffect(() => {
        if (isSuccesskeysData && data) {
            setCategories(data.data);
        }
    }, [data, isSuccesskeysData]);

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)

        }
    }, [isSuccess])

    console.log(formik.errors)
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >
                <TextField
                    required
                    error={
                        formik.touched.serial_no && formik.errors.serial_no ? true : false
                    }
                    autoFocus
                    id="serial_no"
                    label="Serial No"
                    fullWidth
                    helperText={
                        formik.touched.serial_no && formik.errors.serial_no ? formik.errors.serial_no : ""
                    }
                    {...formik.getFieldProps('serial_no')}
                />
                <TextField
                    required
                    error={
                        formik.touched.key && formik.errors.key ? true : false
                    }
                    multiline
                    minRows={4}
                    autoFocus
                    id="key"
                    label="Key"
                    fullWidth
                    helperText={
                        formik.touched.key && formik.errors.key ? formik.errors.key : ""
                    }
                    {...formik.getFieldProps('key')}
                />
                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused

                    error={
                        formik.touched.category && formik.errors.category ? true : false
                    }
                    id="category"
                    label="Category"
                    fullWidth
                    helperText={
                        formik.touched.category && formik.errors.category ? formik.errors.category : ""
                    }
                    {...formik.getFieldProps('category')}
                >
                    {!keyitm && <option key={0} value={undefined}>
                        Select Category
                    </option>}
                    {
                        categories && categories.map(state => {
                            return (<option key={state.id} value={state.id}>
                                {state.label && state.label.toUpperCase()}
                            </option>)
                        })
                    }
                </TextField>

                < TextField
                    select
                    SelectProps={{
                        native: true
                    }}
                    focused
                    error={
                        formik.touched.type && formik.errors.type ? true : false
                    }
                    id="type"
                    label="Type"
                    fullWidth
                    helperText={
                        formik.touched.type && formik.errors.type ? formik.errors.type : ""
                    }
                    {...formik.getFieldProps('type')}
                >
                    <option key={'wd'} value={undefined}>
                        Select Type
                    </option>
                    {
                        ['string', 'number', 'boolean', 'date', 'timestamp'].map(type => {
                            return (<option key={type} value={type}>
                                {type && toTitleCase(type)}
                            </option>)
                        })
                    }
                </TextField>
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={formik.values.is_date_key}
                        {...formik.getFieldProps('is_date_key')}
                    />} label="Is Date Key" />
                </FormGroup>
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={formik.values.map_to_username}
                        {...formik.getFieldProps('map_to_username')}
                    />} label="Map To Username" />
                </FormGroup>
                <FormGroup>
                    <FormControlLabel control={<Checkbox
                        checked={formik.values.map_to_state}
                        {...formik.getFieldProps('map_to_state')}
                    />} label="Map To State" />
                </FormGroup>
                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !keyitm ? "Add Key" : "Update Key"}
                </Button>
            </Stack>



        </form>
    )
}

export default CreateOrEditKeyForm
