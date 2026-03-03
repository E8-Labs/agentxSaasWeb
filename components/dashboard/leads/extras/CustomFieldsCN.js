'use client'

import React from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { capitalize } from '@/utilities/StringUtility'
import { GetFormattedDateString } from '@/utilities/utility'
import {
  TypographyBody,
  TypographyCaption,
} from '@/lib/typography'
import { Tooltip } from '@mui/material'

const CustomFieldsCN = ({
  leadColumns,
  selectedLeadsDetails,
  showCustomVariables,
  onToggleCustomVariables,
  expandedCustomFields,
  onToggleExpandField,
}) => {
  // Early return if no data
  if (!leadColumns || !Array.isArray(leadColumns) || leadColumns.length === 0) {
    return null
  }

  if (!selectedLeadsDetails) {
    return null
  }

  // Get custom fields that are not default fields and have values
  const getCustomFields = () => {
    const excludedColumns = [
      'Name', 'name',
      'Phone', 'phone',
      'address', 'Address',
      'More', 'more',
      'Stage', 'stage',
      'status', 'Status',
      'email', 'Email',
      'Email', 'email',
      'createdAt', 'CreatedAt',
      'updatedAt', 'UpdatedAt',
      0,
    ]

    return (leadColumns || []).filter((column) => {
      const columnTitle = column?.title

      // Exclude if no title
      if (!columnTitle) {
        return false
      }

      // Exclude default columns (case-insensitive)
      const normalizedTitle = String(columnTitle).trim()
      if (excludedColumns.some(excluded =>
        String(excluded).toLowerCase() === normalizedTitle.toLowerCase()
      )) {
        return false
      }

      // Exclude if column is marked as default
      if (column?.isDefault === true || column?.idDefault === true) {
        return false
      }

      // Get the value from selectedLeadsDetails
      const value = selectedLeadsDetails?.[columnTitle]

      // Check if value exists and is meaningful
      if (value === undefined || value === null) {
        return false
      }

      // Exclude empty strings and whitespace-only strings
      if (typeof value === 'string' && value.trim() === '') {
        return false
      }

      // Exclude empty arrays
      if (Array.isArray(value) && value.length === 0) {
        return false
      }

      // Exclude empty objects
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return false
      }

      // Only include if we have a meaningful value
      return true
    })
  }

  const customFields = getCustomFields()
  const extraCount = customFields.length

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') { }

  // Don't show if there are no custom fields
  if (extraCount < 1) {
    return null
  }

  const getDetailsColumnData = (column, item) => {
    const { title } = column
    if (item) {
      switch (title) {
        case 'Name':
          return <div></div>
        case 'Date':
          return item.createdAt ? GetFormattedDateString(item?.createdAt) : '-'
        case 'Phone':
          return '-'
        case 'Stage':
          return item.stage ? item.stage.stageTitle : 'No Stage'
        default:
          const value = `${item[title]}`
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value)
          }
          const initialTextLength = Math.ceil(value.length > 20 ? 20 : value.length)
          var dots = value.length > 20 ? '...' : ''
          const initialText = expandedCustomFields.includes(title)
            ? value
            : value.slice(0, initialTextLength)
          return initialText + dots || '-'
      }
    }
  }

  /** Full value for tooltip (always complete answer, no truncation). */
  const getFullValueForTooltip = (column, item) => {
    const { title } = column
    if (!item) return ''
    switch (title) {
      case 'Date':
        return item.createdAt ? GetFormattedDateString(item.createdAt) : '-'
      case 'Phone':
        return '-'
      case 'Stage':
        return item.stage ? item.stage.stageTitle : 'No Stage'
      default:
        const value = item[title]
        if (value === undefined || value === null) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
    }
  }

  const ShowReadMoreButton = (column, item) => {
    const { title } = column
    if (item) {
      switch (title) {
        case 'Name':
        case 'Date':
        case 'Phone':
        case 'Stage':
          return false
        default:
          const value = `${item[title]}`
          if (value.length > 60) {
            return true
          } else {
            return false
          }
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-0 px-4 bg-transparent">
      <div className="flex flex-row items-center justify-between w-full">
        <Button
          variant="ghost"
          className="justify-start p-0 h-8 gap-2"
          onClick={onToggleCustomVariables}
        >
          <FileText className="h-4 w-4" />
          <TypographyBody className="font-normal">Custom fields</TypographyBody>
          {showCustomVariables ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="link"
          className="h-auto p-0 text-brand-primary ml-auto"
          onClick={onToggleCustomVariables}
        >
          <TypographyCaption className="text-brand-primary">+{extraCount}</TypographyCaption>
        </Button>
      </div>

      {showCustomVariables && (
        <div className="flex flex-col gap-2 mt-0">
          {customFields.map((column, index) => {
            return (
              <div
                key={index}
                className="flex flex-row items-start justify-between gap-4 w-full flex-wrap"
              >
                <TypographyCaption className="text-muted-foreground">
                  {capitalize(column?.title || '')}
                </TypographyCaption>
                <div className="flex flex-row items-end gap-2 flex-wrap">
                  <Tooltip
                    title={getFullValueForTooltip(column, selectedLeadsDetails)}
                    arrow
                    placement="top"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'white',
                          color: 'hsl(var(--foreground))',
                          fontSize: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                          maxWidth: 320,
                        },
                      },
                      arrow: { sx: { color: 'white' } },
                    }}
                  >
                    <TypographyBody className="text-right cursor-default">
                      {getDetailsColumnData(column, selectedLeadsDetails)}
                    </TypographyBody>
                  </Tooltip>
                  {ShowReadMoreButton(column, selectedLeadsDetails) && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 underline min-w-[120px]"
                      onClick={() => onToggleExpandField(column?.title)}
                    >
                      <TypographyCaption className="underline">
                        {expandedCustomFields.includes(column?.title)
                          ? 'Read Less'
                          : 'Read More'}
                      </TypographyCaption>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CustomFieldsCN

