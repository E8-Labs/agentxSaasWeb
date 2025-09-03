import Image from 'next/image'
import React from 'react'

function UpgardView({
    title,
    subTitle
}) {
    return (
        <div className='w-full flex flex-col items-center justify-center gap-3 px-6 mt-8'>
            <Image
                alt="*"
                src={"/otherAssets/starsIcon2.png"}
                height={28}
                width={26}
            />

            <div className='text-lg font-semibold'>
                {title}
            </div>
            <div className='text-[14px] font-normal text-center w-[70%]'>
                {subTitle}
            </div>

            <button className='flex flex-col text-white items-center justify-center h-[50px] mt-6 w-[50%] bg-purple rounded-lg'
            onClick={() => {
                window.open('/dashboard/myAccount?tab=2')
              }}
            >
                Upgrade Plan
            </button>

        </div>
    )
}

export default UpgardView