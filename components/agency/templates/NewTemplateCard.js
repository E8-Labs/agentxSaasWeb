'use client'

import { Card, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

export default function NewTemplateCard() {
  return (
    <Link href="/create-template" style={{ textDecoration: 'none' }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          bgcolor: '#ffffff',
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 5, px: 3 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 300, color: '#1a1a1a', mb: 1.5 }}>+</Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#1a1a1a' }}>New Template</Typography>
        </CardContent>
      </Card>
    </Link>
  )
}
