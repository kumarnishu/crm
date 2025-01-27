import { Dialog, DialogTitle, DialogContent, IconButton, Stack, Button, CircularProgress, Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Cancel } from '@mui/icons-material';

import { useMutation } from 'react-query';
import { BackendError } from '../../..';
import { AxiosResponse } from 'axios';
import { queryClient } from '../../../main';
import { AlertContext } from '../../../contexts/alertContext';
import AlertBar from '../../snacks/AlertBar';
import { DropdownService } from '../../../services/DropDownServices';
import { DropDownDto } from '../../../dtos/DropDownDto';


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>,
    category: DropDownDto
}
function DeleteCheckListCategoryDialog({ category, dialog, setDialog }: Props) {
    const { setAlert } = useContext(AlertContext)
    const { mutate, isLoading, isSuccess, error, isError } = useMutation
        <AxiosResponse<any>, BackendError, string>
        (new DropdownService().DeleteChecklistCategory, {

            onSuccess: () => {
                queryClient.invalidateQueries('check_categories')
                setAlert({ message: "success", color: 'success' })
            },
            onError: (error) => setAlert({ message: error.response.data.message || "an error ocurred", color: 'error' })
        })

    useEffect(() => {
        if (isSuccess)
            setDialog(undefined)
    }, [isSuccess])

    return (
        <>
            <Dialog fullWidth open={dialog == 'DeleteCheckListCategoryDialog'}
                onClose={() => setDialog(undefined)}
            >
                <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => setDialog(undefined)}>
                    <Cancel fontSize='large' />
                </IconButton>

                <DialogTitle sx={{ minWidth: '350px' }} textAlign="center">
                    Delete Category
                </DialogTitle>
                {
                    isError ? (
                        <AlertBar message={error?.response.data.message} color="error" />
                    ) : null
                }
                {
                    isSuccess ? (
                        <AlertBar message=" deleted checklist category" color="success" />
                    ) : null
                }

                <DialogContent>
                    <Typography variant="body1" color="error">
                        {`Warning ! This will delete  ${category.label}`}

                    </Typography>
                </DialogContent>

                <Stack
                    direction="column"
                    gap={2}
                    padding={2}
                    width="100%"
                >
                    <Button fullWidth variant="outlined" color="error"
                        onClick={() => {
                            mutate(category.id)
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress /> :
                            "Delete Category"}
                    </Button>
                </Stack >
            </Dialog>
        </>
    )
}

export default DeleteCheckListCategoryDialog