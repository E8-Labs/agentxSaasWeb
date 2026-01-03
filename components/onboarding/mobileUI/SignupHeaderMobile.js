import Image from 'next/image'
import React from 'react'

function SignupHeaderMobile({
    title,
    description,
}) {
    return (
        <div className="bg-gradient-to-b mt-10 from-purple-500 to-blue-500 h-[40vh] w-[100vw]"
        style={{
            backgroundImage: 'url(/svgIcons/mobileSignupBg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}
        >
            <div className="p-3">
                <Image src="/svgIcons/whiteAssignxLogo.svg" alt="Agency Onboarding Background"
                    width={100} height={100} />
            </div>

            <div className="h-[1px] w-full mt-2 mb-5 bg-white"></div>
            <div
                className=" md:text-2xl text-xl font-[600] text-white"
                style={{ textAlign: 'center' }}
            >
                {title}
            </div>

            <div className="mt-2 md:text-4xl text-[13px] font-[400] text-white"
                style={{ textAlign: 'center' }}
            >
                {description}
            </div>
        </div>
    )
}

export default SignupHeaderMobile