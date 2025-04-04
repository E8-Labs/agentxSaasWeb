import Image from 'next/image'
import React from 'react'
import AddVoiceMail from './AddVoiceMail'
import { Plus } from 'lucide-react'

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


            <button className="flex h-[54px] items-center flex-row gap-2 bg-purple p-2 px-8 rounded-lg"
                onClick={openModal}
            >
                <Plus color="white"></Plus>
                <div
                    className="flex items-center justify-center  text-black text-white font-medium"
                // Fixed typo
                >
                    Add New
                </div>
            </button>

        </div>
    )
}

export default NoVoicemailView