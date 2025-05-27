import Image from 'next/image'
import React from 'react'
import AddVoiceMail from './AddVoiceMail'
import { Plus } from 'lucide-react'

function NoVoicemailView({
    openModal, showAddBtn = true, title = "No Voicemail", subTitle = "You don't have a voicemail added"
}) {
    return (
        <div className='flex flex-col items-center justify-center mt-6'>
            <Image src={"/svgIcons/noVoicemailIcon.svg"}
                height={50} width={193} alt='*'
            />

            <div className='text-center' style={{ fontSize: 22, fontWeight: '700', color: '#151515' }}>
                {title}
            </div>

            <div className='text-center' style={{ fontSize: 15, fontWeight: '500', color: '#151515',marginTop: 10 }}>
                {subTitle}
            </div>


            {showAddBtn && (<button className="flex h-[54px] items-center flex-row gap-2 bg-purple p-2 px-8 rounded-lg mt-3"
                onClick={openModal}
            >
                <Plus color="white"></Plus>
                <div
                    className="flex items-center justify-center  text-black text-white font-medium"
                // Fixed typo
                >
                    Add New
                </div>
            </button>)}

        </div>
    )
}

export default NoVoicemailView