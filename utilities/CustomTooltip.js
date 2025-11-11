import React from 'react'
import { Tooltip } from '@mui/material'
import Image from 'next/image'

const CustomTooltip = ({ title }) => {
    return (

        <Tooltip
            title={title}
            arrow
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: "#ffffff",
                        color: "#333",
                        fontSize: "14px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                    },
                },
                arrow: {
                    sx: {
                        color: "#ffffff",
                    },
                },
            }}
        >
            <Image
            
                src="/otherAssets/infoLightDark.png"
                alt="Info"
                width={16}
                height={16}
                className="cursor-pointer rounded-full"
            />
        </Tooltip>
    )
}

export default CustomTooltip