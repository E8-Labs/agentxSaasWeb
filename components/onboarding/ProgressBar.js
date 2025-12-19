import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import React, { useEffect, useState } from 'react'

const ProgressBar = ({ value }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // //console.log;
    setProgress(value)
  }, [value])

  return (
    <div className="flex">
      {/* <div> */}
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'hsl(var(--brand-primary, 270 75% 50%))',
              },
              backgroundColor: 'hsl(var(--brand-primary, 270 75% 50%) / 0.21)',
            }}
          />
        </Box>
      {/* </div> */}
    </div>
  )
}

export default ProgressBar
