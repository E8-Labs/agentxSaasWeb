'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'

import Results from '@/components/ui/Results'

/**
 * Circular progress with value/maxValue label (e.g. 5/10).
 * Optional tooltip with Results when questions are provided.
 */
function CircularScoringBar({
    value = 0,
    maxValue = 10,
    size = 35,
    thickness = 4,
    color = '#7902df',
    backgroundColor = '#f3f4f6',
    questions = [],
    showTooltip = true,
    tooltipTitle = 'Results',
    className = '',
    sx = {},
}) {
    const percentage = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0

    const tooltipContent =
        questions.length > 0 ? (
            <Results
                title={tooltipTitle}
                questions={questions}
                sx={{
                    boxShadow: 'none',
                    padding: '12px',
                    minWidth: '280px',
                }}
            />
        ) : null

    const inner = (
        <Box
            className={className}
            sx={{ position: 'relative', display: 'inline-flex', ...sx }}
        >
            <CircularProgress
                variant="determinate"
                value={100}
                size={size}
                thickness={thickness}
                sx={{
                    color: backgroundColor,
                    position: 'absolute',
                    zIndex: 1,
                }}
            />
            <CircularProgress
                variant="determinate"
                value={percentage}
                size={size}
                thickness={thickness}
                sx={{
                    color,
                    position: 'relative',
                    zIndex: 2,
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                        transition: 'stroke-dasharray 0.5s ease-in-out',
                    },
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '12px' }}
                >
                    {`${Math.round(Number(value))}/${maxValue}`}
                </Typography>
            </Box>
        </Box>
    )

    if (showTooltip && tooltipContent) {
        return (
            <Tooltip
                title={tooltipContent}
                placement="bottom"
                arrow
                enterDelay={300}
                leaveDelay={200}
                componentsProps={{
                    tooltip: {
                        sx: {
                            backgroundColor: '#ffffff',
                            padding: 0,
                            boxShadow:
                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px',
                            maxWidth: 'none',
                        },
                    },
                    arrow: {
                        sx: {
                            color: '#ffffff',
                            '&::before': {
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                            },
                        },
                    },
                }}
            >
                {inner}
            </Tooltip>
        )
    }

    return inner
}

export default CircularScoringBar