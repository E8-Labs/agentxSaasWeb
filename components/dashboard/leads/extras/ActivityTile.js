'use client'

import React from 'react'
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
    return (
      <div
        className="h-4 w-4"
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
    item?.callOutcome === 'Email Failed' || item?.callOutcome === 'Text Failed' || outcome === 'Ongoing'
  const shouldShowChevron =
    item.callOutcome !== 'No Answer' && !isExpandDisabled

  return (
    <div className="mt-4">
      <TypographyCaption className="text-black -ms-4">
        {GetFormattedDateString(item?.createdAt, true)}
      </TypographyCaption>
      <div className="w-full flex flex-row items-center gap-2 h-full">
        <div
          className="pb-4 pt-6 ps-4 w-full"
          style={{ borderLeft: '1px solid hsl(var(--border))' }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              {getIcon()}
              <TypographyBodySemibold>Outcome</TypographyBodySemibold>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full bg-muted"
              // disabled={isExpandDisabled}
              onClick={() => !isExpandDisabled && onToggleExpand(item)}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: outcomeColor }}
              />
              <TypographyBodyMedium>{outcome}</TypographyBodyMedium>
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

