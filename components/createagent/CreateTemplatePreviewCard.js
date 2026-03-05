'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'

const PURPLE_BG = '#6A0DAD'
const industryLabel = (industry) => {
  const map = {
    RealEstateAgent: 'Real Estate',
    SalesDevRep: 'Sales Dev',
    SolarRep: 'Solar',
    InsuranceAgent: 'Insurance',
    MarketerAgent: 'Marketer',
    RecruiterAgent: 'Recruiter',
    Creator: 'Creator',
    TaxAgent: 'Tax',
  }
  return map[industry] || industry || 'Type'
}

export default function CreateTemplatePreviewCard({
  industry,
  name,
  agentRole,
  description,
}) {
  const typeLabel = industryLabel(industry)
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        mx: 'auto',
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        p: 2,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: '64px',
          bgcolor: 'rgba(106, 13, 173, 0.12)',
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#151515' }}>
          {typeLabel}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #e0e7ff 0%, #fce7f3 50%, #e0f2fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, color: '#151515' }}>
          {name ? name.charAt(0).toUpperCase() : '?'}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#151515',
          textAlign: 'center',
          mb: 0.5,
        }}
      >
        {name || 'Name'}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: '#8a8a8a',
          textAlign: 'center',
          mb: 1.5,
        }}
      >
        {agentRole || 'Role'}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: '#666',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description ||
          'Description Lorem ipsum dolor sit amet consectetur. Neque purus feugiat arcu vel. Tellus sodales porttitor euismod nibh mattis.'}
      </Typography>
    </Box>
  )
}

export { PURPLE_BG, industryLabel }
