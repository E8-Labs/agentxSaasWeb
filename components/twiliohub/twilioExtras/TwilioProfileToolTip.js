'use client';
import * as React from 'react';
import { Button, Popover, Typography } from '@mui/material';
import Image from 'next/image';

export default function TwilioProfileToolTip({ toolTip }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>
            <button
                aria-describedby={id}
                onClick={handleClick}
            >
                <Image
                    alt='*'
                    src={"/agencyIcons/InfoIcon.jpg"}
                    height={15}
                    width={15}
                />
            </button>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        padding: 2,
                        backgroundColor: 'white',
                        color: 'black',
                        boxShadow: 6,
                        maxWidth: "320px"
                    },
                }}
            >
                <Typography>{toolTip}</Typography>
            </Popover>
        </div>
    );
}
