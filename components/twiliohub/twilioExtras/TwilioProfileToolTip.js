'use client'

import { Button, Popover, Tooltip, Typography } from '@mui/material'
import Image from 'next/image'
import * as React from 'react'

export default function TwilioProfileToolTip({ toolTip }) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <div>
      {/* <button
                aria-describedby={id}
                onClick={handleClick}
            >
                <Image
                    alt='*'
                    src={"/agencyIcons/InfoIcon.jpg"}
                    height={15}
                    width={15}
                />
    </button>*/}

      <Tooltip
        title={toolTip}
        arrow
        placement="top-start"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: '#ffffff', // Ensure white background
              color: '#333', // Dark text color
              fontSize: '16px',
              fontWeight: '500',
              padding: '10px 15px',
              borderRadius: '8px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
            },
          },
          arrow: {
            sx: {
              color: '#ffffff', // Match tooltip background
            },
          },
        }}
      >
        <Image
          alt="*"
          src={'/agencyIcons/InfoIcon.jpg'}
          height={15}
          width={15}
        />
      </Tooltip>

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
            maxWidth: '320px',
          },
        }}
      >
        <Typography>{toolTip}</Typography>
      </Popover>
    </div>
  )
}
