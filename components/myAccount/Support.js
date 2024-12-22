import React from 'react'
import Image from 'next/image'

function Support() {
    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

            <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                Support
            </div>

            <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                {"Account > Support"}
            </div>

            <div style={{alignSelf:'center'}} className='w-8/12 bg-white border rounded p-4 mt-10'>
                <div className='flex flex-row gap-2'>
                    <Image src={'/otherAssets/calenderIcon.png'}
                        alt='calender'
                        height={24}
                        width={24}
                    />
                    <div style={{ fontSize: 16, fontWeight: '500', color: '#402FFF' }}>
                        Join our weekly AI Webinar
                    </div>

                </div>
                <div style={{ fontSize: 14, fontWeight: '400', marginTop: '1vh' }}>
                    Lorem ipsum dolor sit amet consectetur. Odio in congue a magna in. Et placerat est in imperdiet odio facilisis donec
                </div>
            </div>

            <div className='w-8/12 bg-purple rounded p-4 mt-4' style={{alignSelf:'center'}}>
                <div className='flex flex-row gap-2'>
                    <Image src={'/otherAssets/screenIcon.png'}
                        alt='calender'
                        height={24}
                        width={24}
                    />
                    <div style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>
                        Schedule a one on one consultation
                    </div>

                </div>
                <div style={{ fontSize: 14, fontWeight: '400', marginTop: '1vh', color: '#fff' }}>
                    Lorem ipsum dolor sit amet consectetur. Odio in congue a magna in. Et placerat est in imperdiet odio facilisis donec
                </div>
            </div>

        </div>

    )
}

export default Support