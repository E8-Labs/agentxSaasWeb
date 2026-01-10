'use client'

import React from 'react'
import { TypographyH3, TypographyBody } from '@/lib/typography'
import { AlertCircle } from 'lucide-react'

const TaskEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <TypographyH3 className="text-foreground mb-2 font-semibold">No Task Created</TypographyH3>
      <TypographyBody className="text-muted-foreground text-center max-w-sm">
        Task created by you or other team members will show up here
      </TypographyBody>
    </div>
  )
}

export default TaskEmptyState
