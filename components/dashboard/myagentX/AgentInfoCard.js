import Image from 'next/image'

const ICON_SIZE = 18

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
    <div className="flex flex-col items-start gap-2">
      {/* Icon */}
      {renderIcon()}

      <div style={{ fontSize: 14, fontWeight: 400, color: '#000' }}>
        {name}
      </div>
      <div className="text-sm font-normal text-black/80">
        {value}
      </div>
      {subtitle && rate != null && rate !== '' && (
        <div
          style={{
            fontSize: 12,
            fontWeight: '400',
            color: '#00000099',
            marginTop: 2,
          }}
        >
          {subtitle} {Number(rate).toFixed(2)}%
        </div>
      )}
    </div>
  )
}

export default AgentInfoCard
