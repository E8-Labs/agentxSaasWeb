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
            <div className='w-full p-4 border-b flex flex-row items-center justify-between'>
                <TypographyH3>Messages</TypographyH3>
                {!selectedUser && (
                    <div className='flex flex-row items-center justify-end gap-2'>
                        {process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production' && (
                            <button
                                ref={taskButtonRef}
                                onClick={() => setTaskBoardOpen(true)}
                                className="mb-1 hover:opacity-70 transition-opacity relative"
                            >
                                <Image 
                                    src='/messaging/checkList.svg' 
                                    alt='Tasks' 
                                    width={22} 
                                    height={22} 
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
                        )}

                        <NotficationsDrawer/>
                    </div>
                )}
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