import { Avatar, Box, Skeleton, Typography } from '@mui/material'
import React from 'react'

function LeadDetailsLoader() {
    return (
        <div className="w-full h-full flex flex-col items-start justify-start p-5">
            <Box sx={{ width: '100%' }}>
                {/* <Skeleton variant="text" width="15%" height={35} sx={{ marginTop: 0 }} /> */}
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={250} height={45} />
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={100} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <Skeleton variant="text" width={150} height={45} />
                    <Skeleton variant="text" width={150} height={45} />
                    <Skeleton variant="text" width={150} height={45} />
                </Box>
                <Box
                    sx={{
                        flexDirection: 'row',
                        // gap: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: "column"
                    }}
                >
                    <Skeleton variant="text" width={500} height={80} />
                    <Skeleton variant="text" width={500} height={80} />
                    <Skeleton variant="text" width={500} height={80} />
                </Box>
            </Box>
        </div>
    )
}

export default LeadDetailsLoader
