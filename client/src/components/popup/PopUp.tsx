import { AdsClickOutlined } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';
import { useEffect, useState } from 'react'

function PopUp({ element }: { element: JSX.Element }) {
    const [popup, setPopup] = useState<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (popup)
            setTimeout(() => {
                setPopup(null)
            }, 4000)
    }, [popup])

    return (
        <div>
            <Button onClick={(e) => setPopup(e.currentTarget)}>
                <AdsClickOutlined />
            </Button>
            <Popover
                open={Boolean(popup)}
                anchorEl={popup}
                onClose={() =>
                    setPopup(null)
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {element}
            </Popover>
        </div >
    )
}

export default PopUp