import React from 'react'
import { Skeleton, Box, Typography, Avatar } from "@mui/material";


function LeadLoading() {
    return (
        <div className='w-full h-full flex flex-col items-start justify-start p-5'>
            <Box sx={{ width: "100%" }}>
                <Skeleton variant="text" width="15%" height={50} sx={{ marginTop: 0 }} />
                <Box sx={{
                    display: 'flex', flexDirection: "column", gap: 3, marginTop: 4
                }}>
                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>

                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>


                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>



                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>


                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>
                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>
                    <Box sx={{
                        flexDirection: 'row', gap: 3, display: 'flex',
                    }}>
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                        <Skeleton variant="text" width={150} height={50} />
                    </Box>
                    

                    
                </Box>
            </Box>
        </div>
    )
}

export default LeadLoading