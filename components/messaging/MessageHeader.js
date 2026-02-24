'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import { TypographyH3 } from '@/lib/typography'
import TaskBoard from './TaskBoard'
import { useTaskStatus } from '@/hooks/use-task-status'

function MessageHeader({ selectedThread = null, selectedUser = null }) {
    const [taskBoardOpen, setTaskBoardOpen] = useState(false)
    const taskButtonRef = useRef(null)


    // Get task status for indicator dots
    const { hasActiveTasks, hasPastDueTasks } = useTaskStatus(
        selectedThread?.leadId || null,
        selectedThread?.id || null,
        null
    )

    return (
        <>
            <div className="w-full p-4 border-b flex flex-row items-center justify-between h-[65px]" style={{ borderBottom: '1px solid #eaeaea' }}>
                <TypographyH3>Messages</TypographyH3>
                <div className='flex flex-row items-center justify-end gap-2'>
                    <button
                        ref={taskButtonRef}
                        onClick={() => setTaskBoardOpen(true)}
                        className="mb-1 w-auto h-10 px-3 py-3 rounded-lg bg-black/[0.02] hover:opacity-70 transition-opacity outline-none relative flex-shrink-0 flex items-center justify-center [&_img]:opacity-80 [&_img]:brightness-0"
                    >
                        <Image
                            src='/messaging/checkList.svg'
                            alt='Tasks'
                            width={20}
                            height={20}
                        />
                        {/* Status indicator dots */}
                        {(hasActiveTasks || hasPastDueTasks) && (
                            <div className="absolute -top-1 -right-1 flex items-center gap-0.5">
                                {/* Red dot for past due (highest priority) */}
                                {hasPastDueTasks && (
                                    <div
                                        className="w-2.5 h-2.5 rounded-full border-2 border-white"
                                        style={{ backgroundColor: '#EF4444' }}
                                    />
                                )}
                                {/* Purple dot for active tasks (todo/in-progress) */}
                                {hasActiveTasks && !hasPastDueTasks && (
                                    <div
                                        className="w-2.5 h-2.5 rounded-full border-2 border-white"
                                        style={{ backgroundColor: '#7804DF' }}
                                    />
                                )}
                            </div>
                        )}
                    </button>

                    <NotficationsDrawer />
                </div>
            </div>

            <TaskBoard
                open={taskBoardOpen}
                onClose={() => setTaskBoardOpen(false)}
                // leadId={selectedThread?.leadId || null}
                // threadId={selectedThread?.id || null}
                buttonRef={taskButtonRef}
                selectedUser={selectedUser}
            />
        </>
    )
}

export default MessageHeader