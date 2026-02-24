'use client'

import React, { useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  TypographyBodySemibold,
  TypographyBodyMedium,
  TypographyCaption,
} from '@/lib/typography'
import { GetFormattedDateString } from '@/utilities/utility'
import { getCommunicationTypeIcon, getOutcome, getOutcomeColor } from './activityUtils'

const ActivityTile = ({
  item,
  isExpanded,
  onToggleExpand,
  children,
}) => {
  const iconPath = getCommunicationTypeIcon(item)
  const outcome = getOutcome(item)
  const outcomeColor = getOutcomeColor(item)

  const getIcon = () => {
    if (React.isValidElement(iconPath)) {
      return <div className="flex h-4 w-4 items-center justify-center shrink-0">{iconPath}</div>
    }
    return (
      <div
        className="h-4 w-4 shrink-0"
        style={{
          backgroundColor: '#000000',
          WebkitMaskImage: `url(${iconPath})`,
          maskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    )
  }

  const isExpandDisabled =
    item?.callOutcome === 'Email Failed' || item?.callOutcome === 'Text Failed' || outcome === 'Ongoing' || item?.status !== "completed" || item?.status !== "success" || item?.status === 'failed'
  const shouldShowChevron =
    item.callOutcome !== 'No Answer' && isExpandDisabled

  return (
    <div className="mt-4">
      <TypographyCaption className="text-black ms-0">
        {GetFormattedDateString(item?.createdAt, true)}
      </TypographyCaption>
      <div className="w-full flex flex-row items-center gap-2 h-full">
        <div
          className="py-3 px-4 ml-3 w-full"
          style={{ borderLeft: '1px solid hsl(var(--border))' }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              {getIcon()}
              <TypographyBodySemibold className="font-normal">Outcome</TypographyBodySemibold>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg bg-black/[0.02] h-auto py-1 px-2 text-sm"
              // disabled={isExpandDisabled}
              onClick={() => isExpandDisabled && onToggleExpand(item)}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: outcomeColor }}
              />
              <TypographyBodyMedium className="font-normal">{outcome}</TypographyBodyMedium>
              {shouldShowChevron && (
                isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              )}
            </Button>
          </div>
          {isExpanded && (
            <Card className="mt-6">
              <CardContent className="p-4">
                {children}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityTile

