import { Dialog, DialogContent, DialogTitle, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material'
import { AxiosResponse } from 'axios';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { queryClient } from '../../../main';
import { Cancel } from '@mui/icons-material';

import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { ProductionService } from '../../../services/ProductionService';
import { DropDownDto } from '../../../dtos/DropDownDto';
import { GetShoeWeightDto, GetSoleThicknessDto, GetSpareDyeDto, GetProductionDto } from '../../../dtos/ProductionDto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto
}


function DeleteProductionItemDialog({ category, weight, thickness, spare_dye, production, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }>
        (new ProductionService().DeleteProductionItem, {
            onSuccess: () => {
                if (category)
                    queryClient.invalidateQueries('machine_categories')
                if (thickness)
                    queryClient.invalidateQueries('thickness')
                if (weight)
                    queryClient.invalidateQueries('shoe_weights')
                if (spare_dye)
                    queryClient.invalidateQueries('spare_dyes')
                else
                    queryClient.invalidateQueries('productions')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })

        })

    useEffect(() => {
        if (isSuccess)
            setDialog(undefined)
    }, [isSuccess])

    return (
        <Dialog open={dialog === "DeleteProductionItemDialog"}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px', fontSize: '20px' }} textAlign="center">

                {category && 'Delete Catgeory'}
                {thickness && 'Delete Thickness'}
                {weight && 'Delete Weight'}
                {spare_dye && 'Delete Spare Dye'}
                {production && 'Delete Production'}
            </DialogTitle>
            {
                isError ? (
                    <AlertBar message={error?.response.data.message} color="error" />
                ) : null
            }
            {
                isSuccess ? (
                    <AlertBar message="deleted" color="success" />
                ) : null
            }
            <DialogContent>
                <Typography variant="h4" color="error">
                    Are you sure to permanently delete this item ?

                </Typography>
            </DialogContent>
            <Stack
                direction="row"
                gap={2}
                padding={2}
                width="100%"
            >
                <Button fullWidth variant="outlined" color="error"
                    onClick={() => {
                        mutate({ category, weight, thickness, spare_dye, production })
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Delete"}
                </Button>
                <Button fullWidth variant="contained" color="info"
                    onClick={() => {
                        setDialog(undefined)
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress /> :
                        "Cancel"}
                </Button>
            </Stack >
        </Dialog >
    )
}

export default DeleteProductionItemDialog
