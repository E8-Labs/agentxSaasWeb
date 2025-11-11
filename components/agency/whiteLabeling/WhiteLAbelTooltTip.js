import { Tooltip } from '@mui/material'
import Image from 'next/image'
import React from 'react'

const WhiteLAbelTooltTip = ({ tip }) => {
    return (
        <Tooltip
            title={tip}
            placement="top"
            arrow
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: "#ffffff", // Ensure white background
                        color: "#333", // Dark text color
                        fontSize: "14px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                    },
                },
                arrow: {
                    sx: {
                        color: "#ffffff", // Match tooltip background
                    },
                },
            }}
        >
            <Image
                src="/otherAssets/infoLightDark.png"
                alt="info"
                width={12}
                height={12}
                className="cursor-pointer rounded-full"
            />
        </Tooltip>
    )
}

export default WhiteLAbelTooltTip
