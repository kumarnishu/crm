import { Dialog, IconButton, Stack, Button } from '@mui/material'
import { Cancel } from '@mui/icons-material'
import CurrentStock from '../../party/CurrentStock'
import PartyAgeing1 from '../../party/PartyAgeing1'
import PartyAgeing2 from '../../party/PartyAgeing2'
import PartyClientSale from '../../party/PartyClientSale'
import PartyForcastAndGrowth from '../../party/PartyForcastAndGrowth'
import PartyPendingOrders from '../../party/PartyPendingOrders'
import { ArticlesProvider } from '../../../contexts/ArticlesContext'
import { useState } from 'react'
import ViewPartyRemarksDialog from '../party/ViewPartyRemarksDialog'

type Props = {
    dialog: string | undefined,
    setDialog: React.Dispatch<React.SetStateAction<string | undefined>>
    party: string
}

function ViewPartyDetailDialog({ party, dialog, setDialog }: Props) {
    const [dialog2, setdialog2] = useState<string | undefined>()
    return (
        <>
            <Dialog
                open={dialog === "ViewPartyDetailDialog"}
                fullScreen
                onClose={() => {
                    setdialog2(undefined)
                    setDialog(undefined)
                }
                }
            >

                <Stack direction={{ sm: 'column', md: 'row' }} gap={2} alignItems={'center'} justifyContent={'center'}>
                    <p style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'left' }}>
                        {party}
                    </p>
                    <div>

                        <Button variant='text' color="error" sx={{ fontSize: 17 }} onMouseOver={() => setdialog2('ViewPartyRemarksDialog')}>
                            last 5 Remarks
                        </Button>
                        <IconButton style={{ display: 'inline-block' }} color="error" onClick={() => {
                            setdialog2(undefined)
                            setDialog(undefined)
                        }}>
                            <Cancel fontSize='large' />
                        </IconButton>
                    </div>
                </Stack>
                {dialog && <ArticlesProvider>
                    <Stack direction={{ sm: 'column', md: 'row' }} sx={{ width: '100vw' }} gap={1}   >
                        <Stack gap={1} direction={'column'} justifyContent={'space-between'} sx={{
                            width: {
                                sm: "100%",
                                md: '49%'
                            }
                        }}>
                            <PartyAgeing1 party={party} />
                            <PartyAgeing2 party={party} />
                            <PartyForcastAndGrowth party={party} />
                            <PartyClientSale party={party} />
                            <PartyPendingOrders party={party} />
                        </Stack>
                        <Stack direction={'row'} >
                            <CurrentStock party={party} />
                        </Stack>
                    </Stack>
                </ArticlesProvider>}
            </Dialog>
            <ViewPartyRemarksDialog party={party} dialog={dialog2} setDialog={setdialog2} />
        </>
    )
}

export default ViewPartyDetailDialog