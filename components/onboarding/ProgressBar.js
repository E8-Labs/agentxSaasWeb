import React, { useState } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const ProgressBar = ({value}) => {

    const [progress, setProgress] = useState(value);

    return (
        <div className='mt-8'>
            <div>
                <Box sx={{ width: '100%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#402FFF',
                            },
                            backgroundColor: '#402FFF35',
                        }} />
                </Box>
            </div>
        </div>
    )
}

export default ProgressBar