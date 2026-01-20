import { Box, CircularProgress, Tooltip, Typography } from '@mui/material'
import React from 'react'

import Results from './Results'

const ScoringProgress = ({
  value = 8.9,
  maxValue = 10,
  size = 35,
  thickness = 4,
  color = '#7902df',
  backgroundColor = '#f3f4f6',
  showValue = true,
  fontSize = '14px',
  fontWeight = '500',
  className = '',
  sx = {},
  questions = [],
  showTooltip = true,
  tooltipTitle = 'Results',
}) => {
  // Calculate the percentage for the progress
  const percentage = (value / maxValue) * 100

  // Create tooltip content if questions are provided
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

  return (
    <Tooltip
      title={tooltipContent}
      disableHoverListener={!showTooltip || questions.length === 0}
      placement="bottom"
      arrow
      enterDelay={300}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'red',
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
      <Box
        className={className}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: questions.length > 0 ? 'pointer' : 'default',
          ...sx,
        }}
      >
        {/* Background Circle */}
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

        {/* Progress Circle */}
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={thickness}
          sx={{
            color: color,
            position: 'relative',
            zIndex: 2,
            // Custom styling for the progress arc
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              transition: 'stroke-dasharray 0.5s ease-in-out',
            },
          }}
        />

        {/* Center Text */}
        {showValue && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="span"
              sx={{
                fontSize: fontSize,
                fontWeight: fontWeight,
                color: '#000',
                lineHeight: 1,
                fontFamily: 'inherit',
              }}
            >
              {value}
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}

export default ScoringProgress
