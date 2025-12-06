import { Avatar, Box, Skeleton, Typography } from '@mui/material'
import React from 'react'

function LeadLoading() {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-5">
      <Box sx={{ width: '100%' }}>
        {/* <Skeleton variant="text" width="15%" height={35} sx={{ marginTop: 0 }} /> */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            marginTop: 4,
          }}
        >
          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>

          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>

          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>

          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>

          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>
          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>
          <Box
            sx={{
              flexDirection: 'row',
              gap: 3,
              display: 'flex',
            }}
          >
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
            <Skeleton variant="text" width={150} height={35} />
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default LeadLoading
