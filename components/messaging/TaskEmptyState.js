'use client'

import React from 'react'
import { TypographyH3, TypographyBody } from '@/lib/typography'
import { AlertCircle } from 'lucide-react'

const TaskEmptyState = ({title = 'No Task Created', description = undefined}) => {
  // Default description for "To Do" tab
  const defaultDescription = (
    <>
      <span>Tasks created by you or other team members<br></br></span>will show up here
    </>
  )
  
  // If description is explicitly null, don't show it
  // If description is undefined, show default
  // If description is provided (JSX or string), show it
  const shouldShowDescription = description !== null
  const displayDescription = description !== undefined && description !== null ? description : defaultDescription

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-gray-400" />
      </div>
      <TypographyH3 className="text-foreground mb-2 font-semibold">
        {title}
      </TypographyH3>
      {shouldShowDescription && (
        <TypographyBody className="text-muted-foreground text-center max-w-sm">
          {displayDescription}
        </TypographyBody>
      )}
    </div>
  )
}

export default TaskEmptyState
