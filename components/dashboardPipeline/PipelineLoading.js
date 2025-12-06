import { Avatar, Box, Skeleton, Typography } from '@mui/material'
import React from 'react'

function PipelineLoading({ fullScreen = true }) {
  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-5">
      <Box sx={{ width: '100%' }}>
        {fullScreen ? (
          <>
            <Skeleton
              variant="text"
              width="40%"
              height={70}
              sx={{ marginTop: 0 }}
            />

            <Box
              sx={{
                flexDirection: 'row',
                gap: 3,
                display: 'flex',
                marginTop: 4,
              }}
            >
              <Skeleton variant="text" width={250} height={50} />
              <Skeleton variant="text" width={250} height={50} />
              <Skeleton variant="text" width={250} height={50} />
              <Skeleton variant="text" width={250} height={50} />
            </Box>
          </>
        ) : (
          <></>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Skeleton variant="text" width={250} height={250} />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Skeleton variant="text" width={250} height={250} />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Skeleton variant="text" width={250} height={250} />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Skeleton variant="text" width={250} height={250} />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
            <Skeleton
              variant="text"
              width={250}
              height={250}
              sx={{ marginTop: -10 }}
            />
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default PipelineLoading
