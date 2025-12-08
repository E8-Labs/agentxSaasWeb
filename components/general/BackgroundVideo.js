import { useEffect, useState } from 'react'

export default function BackgroundVideo({
  showImageOnly = false,
  imageUrl = '/assets/background.png',
}) {
  const [isVideoSupported, setIsVideoSupported] = useState(false)
  const [shouldUseBranding, setShouldUseBranding] = useState(false)

  useEffect(() => {
    // Check if we're on a custom domain or subdomain and have branding
    const checkBranding = () => {
      if (typeof window === 'undefined') return false
      
      const hostname = window.location.hostname
      const isAssignxDomain = hostname.includes('.assignx.ai') || hostname === 'assignx.ai' || hostname.includes('localhost')
      const isCustomDomain = !isAssignxDomain && hostname !== 'localhost' && !hostname.includes('127.0.0.1')
      const isAssignxSubdomain = isAssignxDomain && hostname !== 'assignx.ai' && !hostname.includes('localhost') && hostname.includes('.assignx.ai')
      
      // Check if branding exists in localStorage
      const branding = localStorage.getItem('agencyBranding')
      if (branding) {
        try {
          const brandingData = JSON.parse(branding)
          // If on custom domain or subdomain and branding exists, use branding background
          if ((isCustomDomain || isAssignxSubdomain) && brandingData?.primaryColor) {
            return true
          }
        } catch (error) {
          console.log('Error parsing branding:', error)
        }
      }
      return false
    }

    const hasBranding = checkBranding()
    setShouldUseBranding(hasBranding)

    if (!hasBranding) {
      const checkVideoAutoplaySupport = async () => {
        const video = document.createElement('video')
        video.src = '/banerVideo.mp4'
        video.muted = true
        video.playsInline = true

        try {
          await video.play()
          video.remove()
          setIsVideoSupported(true)
        } catch {
          video.remove()
          setIsVideoSupported(false)
        }
      }

      checkVideoAutoplaySupport()
    }
  }, [])

  // Listen for branding updates
  useEffect(() => {
    const handleBrandingUpdate = () => {
      const branding = localStorage.getItem('agencyBranding')
      if (branding) {
        try {
          const brandingData = JSON.parse(branding)
          const hostname = window.location.hostname
          const isAssignxDomain = hostname.includes('.assignx.ai') || hostname === 'assignx.ai' || hostname.includes('localhost')
          const isCustomDomain = !isAssignxDomain && hostname !== 'localhost' && !hostname.includes('127.0.0.1')
          const isAssignxSubdomain = isAssignxDomain && hostname !== 'assignx.ai' && !hostname.includes('localhost') && hostname.includes('.assignx.ai')
          
          if ((isCustomDomain || isAssignxSubdomain) && brandingData?.primaryColor) {
            setShouldUseBranding(true)
          }
        } catch (error) {
          console.log('Error parsing branding in BackgroundVideo:', error)
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden ">
      {shouldUseBranding ? (
        // Show primary color background when branding is present on custom domain/subdomain
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: 'hsl(var(--brand-primary, 270 75% 50%))',
          }}
        />
      ) : !showImageOnly && isVideoSupported ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/banerVideo.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${imageUrl}')`,
          }}
        />
      )}
    </div>
  )
}
