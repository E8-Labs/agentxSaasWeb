'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

function SignupHeaderMobile({
    title,
    description,
}) {
    const [hasBranding, setHasBranding] = useState(false)
    const [agencyLogoUrl, setAgencyLogoUrl] = useState(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Resolution order: cookie (middleware) → localStorage
        const getCookie = (name) => {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop().split(';').shift()
            return null
        }

        try {
            let brandingData = null
            const brandingCookie = getCookie('agencyBranding')
            if (brandingCookie) {
                try {
                    brandingData = JSON.parse(decodeURIComponent(brandingCookie))
                } catch (e) {}
            }
            if (!brandingData) {
                const storedBranding = localStorage.getItem('agencyBranding')
                if (storedBranding) {
                    try {
                        brandingData = JSON.parse(storedBranding)
                    } catch (e) {}
                }
            }
            if (brandingData && brandingData.primaryColor) {
                setHasBranding(true)
                setAgencyLogoUrl(brandingData.logoUrl || null)
                return
            }
        } catch (e) {}

        setHasBranding(false)
        setAgencyLogoUrl(null)
    }, [])

    const backgroundStyle = {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    }

    // Only add background image if no branding is available
    if (!hasBranding) {
        backgroundStyle.backgroundImage = 'url(/svgIcons/mobileSignupBg.png)'
    }

    return (
        <div className={`bg-gradient-to-b mt-10 ${hasBranding ? 'from-brand-primary to-brand-primary/40' : 'from-purple-500 to-blue-500'} h-[40vh] w-[100vw]`}
        style={backgroundStyle}
        >
            <div className="p-3">
                {agencyLogoUrl ? (
                    <Image 
                        src={agencyLogoUrl} 
                        alt="Agency Logo"
                        width={100} 
                        height={20}
                        style={{ 
                            height: '30px', 
                            width: 'auto', 
                            maxWidth: '200px', 
                            objectFit: 'contain' 
                        }}
                        unoptimized={true}
                    />
                ) : (
                    <Image 
                        src="/svgIcons/whiteAssignxLogo.svg" 
                        alt="Agency Onboarding Background"
                        width={100} 
                        height={100} 
                    />
                )}
            </div>

            <div className="h-[1px] w-full mt-2 mb-3 bg-white"></div>
            <div
                className=" md:text-2xl text-xl font-[600] text-white"
                style={{ textAlign: 'center' }}
            >
                {title}
            </div>

            <div className="mt-2  text-[16px] font-[400] text-white max-w-[80%] mx-auto"
                style={{ textAlign: 'center' }}
            >
                {description}
            </div>
        </div>
    )
}

export default SignupHeaderMobile