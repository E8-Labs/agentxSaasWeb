import { Plus } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import AddVoiceMail from './AddVoiceMail'

function NoVoicemailView({
  openModal,
  showAddBtn,
  title = 'No Voicemail',
  subTitle = "You don't have a voicemail added",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-4">
        <Image
          src={'/svgIcons/noVoicemailIcon.svg'}
          height={144}
          width={144}
          alt="No voicemail"
          className="object-contain mx-auto"
        />

        <div className="text-[18px] font-semibold text-black/90 text-center">
          {title}
        </div>

        <div className="text-[14px] font-normal text-black/70 text-center">
          {subTitle}
        </div>

        {showAddBtn && (
          <button
            className="inline-flex h-11 px-6 items-center justify-center gap-2 rounded-[8px] bg-brand-primary text-[14px] font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            onClick={openModal}
          >
            <Plus size={18} color="white" />
            <span>Add New</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default NoVoicemailView
