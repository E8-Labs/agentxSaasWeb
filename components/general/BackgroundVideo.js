import { useEffect, useState } from 'react'

export default function BackgroundVideo({
  showImageOnly = false,
  imageUrl = '/assets/background.png',
}) {
  const [isVideoSupported, setIsVideoSupported] = useState(true)
  // Initialize shouldShowGradient based on hostname - custom domains should start with gradient
  const [shouldShowGradient, setShouldShowGradient] = useState(() => {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    const isDevDomain = hostname === 'dev.assignx.ai'
    const isProdDomain = hostname === 'app.assignx.ai'
    const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')
    // If on custom domain (not assignx.ai), start with gradient true
    const isCustomDomain = !hostname.includes('.assignx.ai') && hostname !== 'assignx.ai' && !isLocalhost
    return isCustomDomain
  })
  // Try to get initial gradient color from cookie/localStorage
  // Use same parsing logic as BrandingProvider to handle double-encoding
  const [gradientColor, setGradientColor] = useState(() => {
    if (typeof window === 'undefined') return 'hsl(270, 75%, 50%)'
    
    // Try to get primaryColor from cookie with double-decode handling
    let brandingData = null
    try {
      const cookies = document.cookie.split(';')
      const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
      
      if (brandingCookie) {
        const value = brandingCookie.split('=')[1]
        // Cookie may be double-encoded, try decoding twice
        let decoded = decodeURIComponent(value)
        try {
          brandingData = JSON.parse(decoded)
        } catch (e) {
          // If first decode fails, try decoding again (double-encoded)
          try {
            brandingData = JSON.parse(decodeURIComponent(decoded))
          } catch (e2) {}
        }
      }
    } catch (e) {}
    
    if (!brandingData) {
      const branding = localStorage.getItem('agencyBranding')
      if (branding) {
        try {
          brandingData = JSON.parse(branding)
        } catch (e) {}
      }
    }
    
    if (brandingData?.primaryColor) {
      const color = brandingData.primaryColor
      // If it's already hsl format
      if (color.startsWith('hsl')) return color
      // If it's just values like "270 75% 50%"
      return `hsl(${color})`
    }
    
    return 'hsl(270, 75%, 50%)'
  })

  // Get brand primary color from CSS variable
  const getBrandColor = () => {
    if (typeof window === 'undefined') return 'hsl(270, 75%, 50%)'
    
    const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
    if (computedColor) {
      // CSS variable might be in format "270 75% 50%" or "hsl(270, 75%, 50%)"
      if (computedColor.startsWith('hsl')) {
        return computedColor
      } else {
        return `hsl(${computedColor})`
      }
    }
    return 'hsl(270, 75%, 50%)'
  }

  useEffect(() => {

    // Check if user is subaccount or agency
    const checkUserRole = () => {
      if (typeof window === 'undefined') return false
      
      // Check User localStorage
      const userData = localStorage.getItem('User')
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {}
      }
      
      // Check LocalStorageUser
      const localUser = localStorage.getItem('LocalStorageUser')
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser)
          const userRole = parsed?.user?.userRole || parsed?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            return true
          }
        } catch (error) {}
      }
      
      // Check SubaccoutDetails
      const subAccountData = localStorage.getItem('SubaccoutDetails')
      if (subAccountData) {
        try {
          const parsed = JSON.parse(subAccountData)
          if (parsed) {
            return true
          }
        } catch (error) {}
      }
      
      return false
    }

    // Check if we're on a custom domain or subdomain and have branding
    const checkBranding = () => {
      if (typeof window === 'undefined') return false
      
      const hostname = window.location.hostname
      // Exact matches for dev and prod
      const isDevDomain = hostname === 'dev.assignx.ai'
      const isProdDomain = hostname === 'app.assignx.ai'
      const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')
      
      // Custom domain (not assignx.ai domain)
      const isCustomDomain = !hostname.includes('.assignx.ai') && hostname !== 'assignx.ai' && !isLocalhost
      
      // Subdomain (like eric.assignx.ai, but not app or dev)
      const isAssignxSubdomain = hostname.includes('.assignx.ai') && 
                                 hostname !== 'assignx.ai' && 
                                 !isDevDomain && 
                                 !isProdDomain && 
                                 !isLocalhost
      
      // Check branding from cookie first (middleware sets this), then localStorage
      // Use same parsing logic as BrandingProvider to handle double-encoding
      let brandingData = null
      try {
        const cookies = document.cookie.split(';')
        const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
        
        if (brandingCookie) {
          const value = brandingCookie.split('=')[1]
          // Cookie may be double-encoded, try decoding twice
          let decoded = decodeURIComponent(value)
          try {
            brandingData = JSON.parse(decoded)
          } catch (e) {
            // If first decode fails, try decoding again (double-encoded)
            try {
              brandingData = JSON.parse(decodeURIComponent(decoded))
            } catch (e2) {}
          }
        }
      } catch (e) {}
      
      if (!brandingData) {
        const branding = localStorage.getItem('agencyBranding')
        if (branding) {
          try {
            brandingData = JSON.parse(branding)
          } catch (error) {}
        }
      }
      
      // If on custom domain or subdomain and branding exists, use branding background
      if ((isCustomDomain || isAssignxSubdomain) && brandingData?.primaryColor) {
        return true
      }
      return false
    }

    // Use a small delay to ensure CSS variables are set by ThemeProvider
    const initBackground = () => {
      const isSubaccountOrAgency = checkUserRole()
      const hasBranding = checkBranding()
      const brandColor = getBrandColor()

      // Show gradient if user is subaccount/agency OR if on custom domain/subdomain with branding
      setShouldShowGradient(isSubaccountOrAgency || hasBranding)
      setGradientColor(brandColor)

      // Check video support for normal users (only if not showing gradient)
      if (!isSubaccountOrAgency && !hasBranding) {
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
    }
    
    // Run immediately
    initBackground()
    
    // Also run after a short delay to catch CSS variable updates
    const timeout = setTimeout(initBackground, 500)
    
    return () => {
      clearTimeout(timeout)
    }
  }, [])

  // Listen for branding updates and user role changes
  useEffect(() => {
    const handleUpdate = () => {
      // Re-check user role
      const userData = localStorage.getItem('User')
      const localUser = localStorage.getItem('LocalStorageUser')
      const subAccountData = localStorage.getItem('SubaccoutDetails')

      let isSubaccountOrAgency = false

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            isSubaccountOrAgency = true
          }
        } catch (error) {}
      }

      if (!isSubaccountOrAgency && localUser) {
        try {
          const parsed = JSON.parse(localUser)
          const userRole = parsed?.user?.userRole || parsed?.userRole
          if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
            isSubaccountOrAgency = true
          }
        } catch (error) {}
      }

      if (!isSubaccountOrAgency && subAccountData) {
        try {
          const parsed = JSON.parse(subAccountData)
          if (parsed) {
            isSubaccountOrAgency = true
          }
        } catch (error) {}
      }

      // Re-check branding
      const hostname = window.location.hostname
      const isDevDomain = hostname === 'dev.assignx.ai'
      const isProdDomain = hostname === 'app.assignx.ai'
      const isLocalhost = hostname === 'localhost' || hostname.includes('127.0.0.1')
      const isCustomDomain = !hostname.includes('.assignx.ai') && hostname !== 'assignx.ai' && !isLocalhost
      const isAssignxSubdomain = hostname.includes('.assignx.ai') && 
                                 hostname !== 'assignx.ai' && 
                                 !isDevDomain && 
                                 !isProdDomain && 
                                 !isLocalhost

      // Check branding from cookie first (middleware sets this), then localStorage
      // Use same parsing logic as BrandingProvider to handle double-encoding
      let brandingData = null
      try {
        const cookies = document.cookie.split(';')
        const brandingCookie = cookies.find(c => c.trim().startsWith('agencyBranding='))
        
        if (brandingCookie) {
          const value = brandingCookie.split('=')[1]
          // Cookie may be double-encoded, try decoding twice
          let decoded = decodeURIComponent(value)
          try {
            brandingData = JSON.parse(decoded)
          } catch (e) {
            // If first decode fails, try decoding again (double-encoded)
            try {
              brandingData = JSON.parse(decodeURIComponent(decoded))
            } catch (e2) {}
          }
        }
      } catch (e) {}
      
      if (!brandingData) {
        const branding = localStorage.getItem('agencyBranding')
        if (branding) {
          try {
            brandingData = JSON.parse(branding)
          } catch (error) {}
        }
      }
      
      let hasBranding = false
      if ((isCustomDomain || isAssignxSubdomain) && brandingData?.primaryColor) {
        hasBranding = true
      }

      // Get brand color
      const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
      const computedColor = brandColor 
        ? (brandColor.startsWith('hsl') ? brandColor : `hsl(${brandColor})`)
        : 'hsl(270, 75%, 50%)'
      setGradientColor(computedColor)

      setShouldShowGradient(isSubaccountOrAgency || hasBranding)
    }

    window.addEventListener('agencyBrandingUpdated', handleUpdate)
    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleUpdate)
    }
  }, [])

  // Compute gradient string
  const getGradientString = () => {
    // Convert HSL to HSLA with opacity
    // Handle both formats: hsl(0 100% 50%) and hsl(0, 100%, 50%)
    const hslMatch = gradientColor.match(/hsl\(([^)]+)\)/)
    if (hslMatch) {
      let hslValues = hslMatch[1].trim()
      // If values are space-separated (e.g., "0 100% 50%"), convert to comma-separated
      if (!hslValues.includes(',')) {
        // Split by spaces and join with commas
        const parts = hslValues.split(/\s+/)
        hslValues = parts.join(', ')
      }
      // Use comma-separated format for both colors in the gradient
      const baseColor = `hsl(${hslValues})`
      const colorWithOpacity = `hsla(${hslValues}, 0.4)`
      const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
        ? 'linear-gradient(to bottom left'
        : 'radial-gradient(circle at top right'
      const gradientString = `${gradientType}, ${baseColor} 0%, ${colorWithOpacity} 100%)`
      return gradientString
    }
    // Fallback
    const gradientType = process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
      ? 'linear-gradient(to bottom left'
      : 'radial-gradient(circle at top right'
    const fallbackGradient = `${gradientType}, hsl(270, 75%, 50%) 0%, hsla(270, 75%, 50%, 0.4) 100%)`
    return fallbackGradient
  }

  if (shouldShowGradient) {
    const gradientStr = getGradientString()
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: gradientStr,
        }}
      />
    )
  }

  if (!showImageOnly && isVideoSupported) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/banerVideo.mp4" type="video/mp4" />
      </video>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
