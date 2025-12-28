import React from 'react'
import Image from 'next/image'
function BrandingLogo() {
    const [agencyBranding, setAgencyBranding] = useState(null);

    useEffect(() => {
        const brandingCookie = getCookie('agencyBranding');
        if (brandingCookie) {
            setAgencyBranding(JSON.parse(decodeURIComponent(brandingCookie)));
        }
    }, []);
    return (
        <div>
            {agencyBranding?.logoUrl ? (
                <Image
                    className=""
                    src={agencyBranding.logoUrl}
                    style={{ height: "29px", width: "auto", maxWidth: "200px", resize: "contain", objectFit: "contain" }}
                    height={29}
                    width={200}
                    alt="agency logo"
                    unoptimized={true}
                />
            ) : (
                <Image
                    className=""
                    src="/assets/assignX.png"
                    style={{ height: "29px", width: "122px", resize: "contain" }}
                    height={29}
                    width={122}
                    alt="*"
                />
            )}
        </div>
    )
}

export default BrandingLogo