import { Dialog, DialogContent, IconButton, DialogTitle } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CreateOrEditLeadStageForm from '../../forms/dropdown/CreateOrEditLeadStageForm'
import { DropDownDto } from '../../../dtos/DropDownDto'


type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    stage?: DropDownDto
}

function CreateOrEditStageDialog({ stage, dialog, setDialog }: Props) {
   

    return (
        <Dialog fullScreen={Boolean(window.screen.width < 500)}
            open={dialog === 'CreateOrEditStageDialog'}
        >
            <IconButton style={{ display: 'inline-block', position: 'absolute', right: '0px' }} color="error" onClick={() => {
                setDialog(undefined)
            }
            }>
                <Cancel fontSize='large' />
            </IconButton>
            <DialogTitle sx={{ minWidth: '350px' }} textAlign={"center"}>{!stage ? "New Stage" : "Edit Stage"}</DialogTitle>
            <DialogContent>
                <CreateOrEditLeadStageForm  setDialog={
                    setDialog
                }stage={stage} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateOrEditStageDialog