import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import { TypographyH3 } from '@/lib/typography'

function MessageHeader() {
    return (
        <div className='w-full p-4 border-b flex flex-row items-center justify-between'>
            <TypographyH3>Messages</TypographyH3>
            <div className='flex flex-row items-center justify-center gap-2'>
                    <Image className='mb-1' src='/messaging/checkList.svg' alt='add'
                        width={40} height={40} />

                <NotficationsDrawer/>
            </div>
        </div>


    )
}

export default MessageHeader