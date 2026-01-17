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

        // Check localStorage for agency branding
        try {
          
            const userData = localStorage.getItem('User')
            if (userData) {
                const parsedUser = JSON.parse(userData)
                if (parsedUser?.user?.agencyBranding) {
                    setHasBranding(true)
                    setAgencyLogoUrl(parsedUser.user.agencyBranding.logoUrl)
                }
                else if (parsedUser?.agencyBranding) {
                    setHasBranding(true)
                    setAgencyLogoUrl(parsedUser.agencyBranding.logoUrl)
                }
            }
        } catch (e) {
            // Ignore errors
        }

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