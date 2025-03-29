import Image from 'next/image'
import React from 'react'
import AddVoiceMail from './AddVoiceMail'

function NoVoicemailView({
    openModal
}) {
    return (
        <div className='flex flex-col items-center justify-center gap-3 mt-6'>
            <Image src={"/svgIcons/noVoicemailIcon.svg"}
                height={63} width={193} alt='*'
            />

            <div style={{ fontSize: 22, fontWeight: '700', color: '#151515' }}>
                No Voicemail
            </div>

            <div style={{ fontSize: 15, fontWeight: '500', color: '#151515' }}>
                {`You don’t have a voicemail added`}
            </div>


            <button onClick={openModal} className='
            w-[197px] h-[54px] rounded-lg flex flex-col item-center justify-center bg-purple text-white
            mt-2 
            ' style={{ fontWeight: '500' }}>
                Add New
            </button>
            
        </div>
    )
}

export default NoVoicemailView