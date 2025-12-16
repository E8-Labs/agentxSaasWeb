import Image from 'next/image'

const AgentInfoCard = ({ name, value, icon, bgColor, iconColor }) => {
  // Render icon with branding using mask-image approach (same logic as NotificationsDrawer.js)
  const renderIcon = () => {
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

      <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
        {name}
      </div>
      <div style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
        {value}
      </div>
    </div>
  )
}

export default AgentInfoCard
