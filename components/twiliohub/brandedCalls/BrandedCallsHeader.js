import React from 'react';
import Link from "next/link";


const BrandedCallsHeader = () => {

    const styles = {
        boldFont: {
            fontSize: 22,
            fontWeight: "700"
        },
        regularFont: {
            fontSize: 15,
            fontWeight: "500"
        },
    }

    return (
        <div className='w-full'>
            <section className="py-4 max-w-2xl mx-auto">
                <h2 className="mb-2" style={styles.boldFont}>Branded Calling</h2>
                <p style={styles.regularFont}>
                    {`Branded calling increases your answer rates by allowing you to display
        your business’s name on the called party’s cell phone after the business
        passes verification. Branded calling is a Beta product available to
        select direct customers who make Voice calls using their Twilio phone
        numbers. Please visit the `}
                    <Link
                        href="https://www.twilio.com/voice/pricing"
                        className="text-purple underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Twilio Voice Pricing Page
                    </Link>{" "}
                    for more details on Branded Calling fees.
                </p>
            </section>
        </div>
    )
}

export default BrandedCallsHeader
