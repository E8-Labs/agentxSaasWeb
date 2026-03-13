'use client'

import { formatFractional2Stable } from '@/components/agency/plan/AgencyUtilities'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'



const ICON_SIZE = 18

const SUBTITLE_SHORT = {
  'Answer rate': 'Ans. rate',
  'Conversion rate': 'Conv. rate',
}

function getSubtitleLabel(subtitle) {
  return SUBTITLE_SHORT[subtitle] ?? subtitle
}

/** Small pie chart showing rate (0–100) as filled portion. Filled = brand primary, unfilled = light. */
function RatePie({ value, size = 15 }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div
      className="shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          hsl(var(--brand-primary)) 0deg ${(pct / 100) * 360}deg,
          hsl(var(--brand-primary) / 0.2) ${(pct / 100) * 360}deg 360deg
        )`,
      }}
      aria-hidden
    />
  )
}

const AgentInfoCard = ({
  name,
  value,
  icon,
  iconComponent,
  bgColor,
  iconColor,
  iconWrapperClassName,
  subtitle,
  rate,
  toolTip,
}) => {
  // When iconComponent (e.g. Lucide icon) is provided, render it at 18px; optional wrapper for container styling. subtitle/rate for functional display.
  const renderIcon = () => {
    if (iconComponent) {
      const iconEl = (
        <div className={iconColor ? `flex shrink-0 ${iconColor}` : 'flex shrink-0 text-foreground'} style={{ width: ICON_SIZE, height: ICON_SIZE }}>
          {iconComponent}
        </div>
      )
      if (iconWrapperClassName) {
        return (
          <div className={`flex items-center justify-center ${iconWrapperClassName}`}>
            {iconEl}
          </div>
        )
      }
      return iconEl
    }
    if (typeof window === 'undefined') {
      return <Image src={icon} height={24} width={24} alt="icon" />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()

    // Only apply branding if brand color is set and valid (indicates custom domain with branding)
    if (!brandColor || brandColor === '' || brandColor.length < 3) {
      return <Image src={icon} height={24} width={24} alt="icon" />
    }

    // Use mask-image approach: background color with icon as mask
    return (
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          minHeight: 24,
          backgroundColor: `hsl(${brandColor})`,
          WebkitMaskImage: `url(${icon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${icon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {/* Icon - only element not full width */}
      <div className="flex flex-row items-center gap-8">
        {renderIcon()}
        {
          toolTip && rate != null && rate !== '' && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex shrink-0 items-center gap-1">
                    <RatePie value={Number(rate)} size={15} />
                    <span className="tabular-nums text-xs font-normal leading-4 tracking-[-0.06px] text-brand-primary whitespace-nowrap">
                      {Number(rate) % 1 === 0
                        ? `${Number(rate).toFixed(0)}%`
                        : `${Number(rate).toFixed(1)}%`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className=" px-2 py-1 text-xs">
                <span className="tabular-nums text-xs font-normal leading-4 tracking-[-0.06px] text-brand-primary whitespace-nowrap">
                {Number(rate) % 1 === 0
                  ? `${Number(rate).toFixed(0)}%`
                  : `${Number(rate).toFixed(1)}%`}
              </span> {toolTip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }
      </div>

      <div className="w-full text-sm font-normal text-foreground">
        {name}
      </div>
      <div className="w-full text-sm font-normal text-black/80">
        {value}
      </div>
    </div>
  )
}

export default AgentInfoCard
