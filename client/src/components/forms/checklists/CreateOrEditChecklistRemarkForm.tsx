import { Button,  CircularProgress,  Stack, TextField } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { useEffect, useContext } from 'react';
import { useMutation } from 'react-query';
import * as Yup from "yup"
import { ChoiceContext, CheckListChoiceActions } from '../../../contexts/dialogContext';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import AlertBar from '../../snacks/AlertBar';
import { CreateOrEditChecklistRemarkDto, GetChecklistBoxDto, GetChecklistDto, GetChecklistRemarksDto } from '../../../dtos';
import { CreateOrEditChecklistRemark } from '../../../services/CheckListServices';


function CreateOrEditChecklistRemarkForm({ remark, checklist, checklist_box, setDisplay }: { checklist: GetChecklistDto, checklist_box: GetChecklistBoxDto, remark?: GetChecklistRemarksDto, setDisplay?: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { mutate, isLoading, isSuccess, isError, error } = useMutation
        <AxiosResponse<string>, BackendError, {
            body: CreateOrEditChecklistRemarkDto,
            remark?: GetChecklistRemarksDto
        }>
        (CreateOrEditChecklistRemark, {
            onSuccess: () => {
                queryClient.invalidateQueries('remarks')
                queryClient.invalidateQueries('checklists')
            }
        })

    const { setChoice } = useContext(ChoiceContext)

    const formik = useFormik<{
        remark: string,
        stage: string,
    }>({
        initialValues: {
            remark: remark ? remark.remark : "",
            stage: checklist_box ? checklist_box.stage : ""
        },
        validationSchema: Yup.object({
            stage: Yup.string(),
            remark: Yup.string().required("required field")
                .min(5, 'Must be 5 characters or more')
                .max(200, 'Must be 200 characters or less')
                .required('Required field')
        }),
        onSubmit: (values: {
            remark: string,
            stage: string
        }) => {
            if (remark) {
                mutate({
                    remark,
                    body: {
                        remark: values.remark,
                        stage: values.stage,
                        checklist_box: checklist_box._id,
                        checklist: checklist._id
                    }
                })
            }
            else {
                mutate({
                    body: {
                        remark: values.remark,
                        stage: values.stage,
                        checklist_box: checklist_box._id,
                        checklist: checklist._id
                    }
                })
            }

        }
    });


    useEffect(() => {
        if (isSuccess) {
            setChoice({ type: CheckListChoiceActions.close_checklist })
            if (setDisplay)
                setDisplay(false);
        }
    }, [isSuccess, setChoice])
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack
                gap={2}
                pt={2}
            >
                {/* remarks */}
                <TextField
                    multiline
                    minRows={4}
                    required
                    error={
                        formik.touched.remark && formik.errors.remark ? true : false
                    }
                    autoFocus
                    id="remark"
                    label="Remark"
                    fullWidth
                    helperText={
                        formik.touched.remark && formik.errors.remark ? formik.errors.remark : ""
                    }
                    {...formik.getFieldProps('remark')}
                />

                {!remark &&
                    < TextField
                        select
                        SelectProps={{
                            native: true
                        }}
                        focused
                        error={
                            formik.touched.stage && formik.errors.stage ? true : false
                        }
                        id="stage"
                        label="Stage"
                        fullWidth
                        helperText={
                            formik.touched.stage && formik.errors.stage ? formik.errors.stage : ""
                        }
                        {...formik.getFieldProps('stage')}
                    >

                        <option key={'open'} value={'open'}>
                            Open
                        </option>
                        <option key={'pending'} value={'pending'}>
                            Pending
                        </option>
                        <option key={'done'} value={'done'}>
                            Done
                        </option>
                    </TextField>
                }


                <Button variant="contained" color="primary" type="submit"
                    disabled={Boolean(isLoading)}
                    fullWidth>{Boolean(isLoading) ? <CircularProgress /> : !remark ? "Add Remark" : "Update Remark"}
                </Button>
            </Stack>

            {
                isError ? (
                    <>
                        {<AlertBar message={error?.response.data.message} color="error" />}
                    </>
                ) : null
            }
            {
                isSuccess ? (
                    <>
                        {!remark ? <AlertBar message="new remark created" color="success" /> : <AlertBar message="remark updated" color="success" />}
                    </>
                ) : null
            }

        </form>
    )
}

export default CreateOrEditChecklistRemarkForm