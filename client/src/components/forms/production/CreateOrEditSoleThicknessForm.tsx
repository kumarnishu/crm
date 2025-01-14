import { Button, CircularProgress, Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as Yup from "yup"
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import { DropdownService } from '../../../services/DropDownServices';
import { ProductionService } from '../../../services/ProductionService';
import { CreateOrEditSoleThicknessDto } from '../../../dtos/ProductionDto';
import { GetDyeDto, DropDownDto } from '../../../dtos/DropDownDto';
import { GetSoleThicknessDto } from '../../../dtos/ProductionDto';


function CreateOrEditSoleThicknessForm({ thickness, setDialog }: { thickness?: GetSoleThicknessDto, setDialog: React.Dispatch<React.SetStateAction<string | undefined>> }) {
    const { setAlert } = useContext(AlertContext)
    const { data: dyes } = useQuery<AxiosResponse<GetDyeDto[]>, BackendError>("dyes", async () => new DropdownService().GetDyes())
    const [dyeid, setDyeid] = useState<string>('');
    const [articles, setArticles] = useState<DropDownDto[]>([])
    const { data: dyedata, isSuccess: isDyeSuccess, refetch: refetchDye } = useQuery<AxiosResponse<GetDyeDto>, BackendError>(["dye", dyeid], async () => new DropdownService().GetDyeById(dyeid), { enabled: false })

    const { mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetSoleThicknessDto>, BackendError, {
            id?: string,
            body: CreateOrEditSoleThicknessDto
        }>
        (new ProductionService().CreateOrEditSoleThickness, {

            onSuccess: () => {
                queryClient.refetchQueries('thickness')
                setAlert({ message: thickness ? "updated" : "created", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })


    const formik = useFormik({
        initialValues: {
            dye: thickness ? thickness.dye.id : "",
            article: thickness ? thickness.article.id : "",
            size: thickness && thickness.size ? thickness.size : "",
            left_thickness: thickness ? thickness.left_thickness : 0,
            right_thickness: thickness ? thickness.right_thickness : 0
        },
        validationSchema: Yup.object({
            dye: Yup.string()
                .required('Required field'),
            article: Yup.string()
                .required('Required field'),
            size: Yup.string()
                .required('Required field'),
            left_thickness: Yup.number()
                .required('Required field'),
            right_thickness: Yup.number()
                .required('Required field'),
        }),
        onSubmit: (values) => {
            if (thickness)
                mutate({
                    id: thickness._id,
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
        if (formik.values.dye) {
            setDyeid(formik.values.dye)
        }
    }, [formik.values.dye])

    useEffect(() => {
        if (isDyeSuccess && dyedata && dyedata.data) {
            let tmp = dyedata.data.articles && dyedata.data.articles.map((a) => { return { id: a.id, label: a.label, value: a.label } })
            setArticles(tmp)
            dyedata.data.size && formik.setValues({ ...formik.values, size: dyedata.data.size })
        }
        else {
            setArticles([])
            formik.setValues({ ...formik.values, size: '' })
        }
    }, [dyedata, isDyeSuccess])


    useEffect(() => {
        refetchDye()
    }, [dyeid])

    useEffect(() => {
        if (isSuccess) {
            setDialog(undefined)
        }
    }, [isSuccess])

    return (
        <form onSubmit={formik.handleSubmit}>

            <Stack
                direction="column"
                gap={2}
                pt={2}
            >

                {/* dyes */}
                < TextField
                    select

                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.dye && formik.errors.dye ? true : false
                    }
                    id="dye"
                    helperText={
                        formik.touched.dye && formik.errors.dye ? formik.errors.dye : ""
                    }
                    {...formik.getFieldProps('dye')}
                    required
                    label="Select Dye"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        dyes && dyes.data && dyes.data.map((dye, index) => {
                            return (<option key={index} value={dye._id}>
                                {dye.dye_number}
                            </option>)

                        })
                    }
                </TextField>
                <TextField
                    required
                    fullWidth
                    disabled
                    error={
                        formik.touched.size && formik.errors.size ? true : false
                    }
                    id="size"
                    label="Size"
                    helperText={
                        formik.touched.size && formik.errors.size ? formik.errors.size : ""
                    }
                    {...formik.getFieldProps('size')}
                />

                {/* articles */}
                < TextField
                    select

                    SelectProps={{
                        native: true,
                    }}
                    error={
                        formik.touched.article && formik.errors.article ? true : false
                    }
                    id="article"
                    helperText={
                        formik.touched.article && formik.errors.article ? formik.errors.article : ""
                    }
                    {...formik.getFieldProps('article')}
                    required
                    label="Select Article"
                    fullWidth
                >
                    <option key={'00'} value={undefined}>
                    </option>
                    {
                        articles && articles.map((article, index) => {
                            return (<option key={index} value={article.id}>
                                {article.label}
                            </option>)
                        })
                    }
                </TextField>



                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.left_thickness && formik.errors.left_thickness ? true : false
                    }
                    id="left_thickness"
                    label="Left Thickness"
                    helperText={
                        formik.touched.left_thickness && formik.errors.left_thickness ? formik.errors.left_thickness : ""
                    }
                    {...formik.getFieldProps('left_thickness')}
                />

                <TextField
                    required
                    fullWidth
                    type="number"
                    error={
                        formik.touched.right_thickness && formik.errors.right_thickness ? true : false
                    }
                    id="right_thickness"
                    label="Right Thickness"
                    helperText={
                        formik.touched.right_thickness && formik.errors.right_thickness ? formik.errors.right_thickness : ""
                    }
                    {...formik.getFieldProps('right_thickness')}
                />


                <Button variant="contained" size="large" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : "Submit"}
                </Button>
            </Stack>
        </form>
    )
}

export default CreateOrEditSoleThicknessForm
