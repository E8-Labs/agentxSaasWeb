'use client'

import React from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { capitalize } from '@/utilities/StringUtility'
import { GetFormattedDateString } from '@/utilities/utility'
import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
} from '@/lib/typography'

const CustomFieldsCN = ({
  leadColumns,
  selectedLeadsDetails,
  showCustomVariables,
  onToggleCustomVariables,
  expandedCustomFields,
  onToggleExpandField,
  columnsLength,
}) => {
  const getExtraColumsCount = (columns) => {
    let count = 0
    let ExcludedColumns = ['name', 'phone', 'email', 'status', 'stage', 'address']
    for (const c of columns) {
      if (!c.isDefault) {
        if (!ExcludedColumns.includes(c?.title?.toLowerCase() || '')) {
          count += 1
        }
      }
    }
    return count
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

  const extraCount = getExtraColumsCount(columnsLength)

  if (extraCount < 1) return null

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex flex-row items-center justify-between w-full">
        <Button
          variant="ghost"
          className="justify-start p-0 h-auto gap-2"
          onClick={onToggleCustomVariables}
        >
          <FileText className="h-4 w-4" />
          <TypographyBodySemibold>Custom fields</TypographyBodySemibold>
          {showCustomVariables ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="link"
          className="h-auto p-0 text-brand-primary"
          onClick={onToggleCustomVariables}
        >
          <TypographyCaption className="text-brand-primary">+{extraCount}</TypographyCaption>
        </Button>
      </div>

      {showCustomVariables && (
        <div className="flex flex-col gap-2 mt-2">
          {leadColumns.map((column, index) => {
            if (
              ['Name', 'Phone', 'address', 'More', 0, 'Stage', 'status'].includes(
                column?.title,
              )
            ) {
              return null
            }
            return (
              <div
                key={index}
                className="flex flex-row items-start justify-between gap-4 w-full flex-wrap"
              >
                <TypographyCaption className="text-muted-foreground">
                  {capitalize(column?.title || '')}
                </TypographyCaption>
                <div className="flex flex-row items-end gap-2 flex-wrap">
                  <TypographyBody className="text-right">
                    {getDetailsColumnData(column, selectedLeadsDetails)}
                  </TypographyBody>
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

