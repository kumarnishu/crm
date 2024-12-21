import { AxiosResponse } from "axios"
import { BackendError } from "../.."
import { useMutation } from "react-query"
import { useContext, useEffect, useState } from "react"
import { Button, CircularProgress, Stack } from "@mui/material"
import { Download, Upload } from "@mui/icons-material"
import styled from "styled-components"
import { saveAs } from 'file-saver';
import ExportToExcel from "../../utils/ExportToExcel"
import { queryClient } from "../../main"
import { GetKeyFromExcelDto } from "../../dtos/keys.dto"
import { AlertContext } from "../../contexts/alertContext"
import { AuthorizationService } from "../../services/AuthorizationService"


const FileInput = styled.input`
background:none;
color:blue;
`


export function ExpenseItemButtons() {
    const { data, mutate, isLoading, isSuccess } = useMutation
        <AxiosResponse<GetKeyFromExcelDto[]>, BackendError, FormData>
        (new AuthorizationService().CreateKeysFromExcel, { onSuccess: () => queryClient.refetchQueries('keys') })
    const [file, setFile] = useState<File | null>(null)
    const { setAlert } = useContext(AlertContext)


    function HandleExport() {
        saveAs(`/api/v1/download/template/expense-items`)
    }


    function handleFile() {
        if (file) {
            let formdata = new FormData()
            formdata.append('excel', file)
            mutate(formdata)
        }
    }
    useEffect(() => {
        if (file) {
            handleFile()
        }
    }, [file])

    useEffect(() => {
        if (isSuccess && data) {
            if (data.data.length > 0) {
                ExportToExcel(data.data, "output.xlsx")
            }
            setAlert({ message: 'File uploaded successfully', color: 'success' })
        }
    }, [isSuccess, data])


    return (
        <Stack direction={'row'} gap={1}>
            <>

                {
                    isLoading ?
                        <CircularProgress />
                        :
                        <>
                            <Button

                                component="label"
                                color="inherit"
                                variant="contained"
                            >
                                <Upload />
                                <FileInput
                                    id="upload_input"
                                    hidden
                                    type="file" required name="file" onChange={
                                        (e: any) => {
                                            if (e.currentTarget.files) {
                                                setFile(e.currentTarget.files[0])
                                            }
                                        }}>
                                </FileInput >
                            </Button>
                        </>
                }
            </>
            <Button variant="contained" color="inherit" startIcon={<Download />} onClick={() => HandleExport()}> Template</Button>
        </Stack>

    )
}