'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import { TypographyH3 } from '@/lib/typography'
import TaskBoard from './TaskBoard'

function MessageHeader({ selectedThread = null }) {
    const [taskBoardOpen, setTaskBoardOpen] = useState(false)
    const taskButtonRef = useRef(null)

    return (
        <>
            <div className='w-full p-4 border-b flex flex-row items-center justify-between'>
                <TypographyH3>Messages</TypographyH3>
                <div className='flex flex-row items-center justify-center gap-2'>
                    {process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production' && (
                        <button
                            ref={taskButtonRef}
                            onClick={() => setTaskBoardOpen(true)}
                            className="mb-1 hover:opacity-70 transition-opacity"
                        >
                            <Image 
                                src='/messaging/checkList.svg' 
                                alt='Tasks' 
                                width={40} 
                                height={40} 
                            />
                        </button>
                    )}

                    <NotficationsDrawer/>
                </div>
            </div>

            <TaskBoard 
                open={taskBoardOpen} 
                onClose={() => setTaskBoardOpen(false)}
                leadId={selectedThread?.leadId || null}
                threadId={selectedThread?.id || null}
                buttonRef={taskButtonRef}
            />
        </>
    )
}

export default MessageHeader