import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Divider, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

const Results = ({
  title = 'Results',
  questions = [],
  className = 'flex flex-col items-start gap-2',
  sx = {},
}) => {
  // Default questions data if none provided
  const defaultQuestions = [
    {
      id: 1,
      text: 'Thinking about selling to downsize?',
      status: true, // true = green checkmark, false = red X
    },
    {
      id: 2,
      text: 'Relocating or moving for work/family?',
      status: true,
    },
    {
      id: 3,
      text: 'Have they tried selling this property before? (FSBO or expired listing)',
      status: true,
    },
    {
      id: 4,
      text: 'Is this the property owner?',
      status: false,
    },
    {
      id: 5,
      text: 'Did they book an appointment?',
      status: true,
    },
  ]

  const questionsToRender = questions.length > 0 ? questions : defaultQuestions

  return (
    <Box
      className={className}
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        ...sx,
      }}
    >
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          textAlign: 'left',
          marginBottom: '10px',
          fontSize: '18px',
          color: '#1f2937',
        }}
      >
        {title}
      </Typography>

      {/* Questions List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {questionsToRender.map((question, index) => (
          <React.Fragment key={question.id || index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                gap: '12px',
              }}
            >
              {/* Status Indicator */}

              {question.answer === true ? (
                <Image
                  src={'/otherAssets/greenTickIcon.png'}
                  height={24}
                  width={24}
                  alt="*"
                />
              ) : (
                <Image
                  src={'/otherAssets/redCrossIcon.png'}
                  height={24}
                  width={24}
                  alt="*"
                />
              )}

              {/* Question Text */}
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.4',
                  flex: 1,
                }}
              >
                {question.question}
              </Typography>
            </Box>

            {/* Divider (except for last item) */}
            {index < questionsToRender.length - 1 && (
              <Divider
                sx={{
                  borderColor: '#e5e7eb',
                  margin: '0',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  )
}

export default Results
