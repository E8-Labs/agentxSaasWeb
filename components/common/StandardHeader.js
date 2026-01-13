'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import { TypographyH3 } from '@/lib/typography'
import TaskBoard from '../messaging/TaskBoard'
import { useTaskStatus } from '@/hooks/use-task-status'

/**
 * StandardHeader - Universal reusable header component matching MessageHeader.js pattern
 * 
 * @param {string|ReactNode} title - The header title text or ReactNode
 * @param {ReactNode} titleContent - Fully custom title area (overrides title if provided)
 * @param {boolean} showTasks - Whether to show the tasks icon (default: true for all pages)
 * @param {boolean} showFilters - Whether to show the filter icon (default: false)
 * @param {function} onFilterClick - Callback for filter icon click
 * @param {ReactNode} rightContent - Additional content to show before icons (e.g., buttons, search bars)
 * @param {object} selectedThread - Thread object for TaskBoard (optional)
 * @param {number} leadId - Lead ID for TaskBoard (optional)
 * @param {number} threadId - Thread ID for TaskBoard (optional)
 * @param {ReactNode} filterIcon - Custom filter icon component (optional)
 * @param {number} filterBadge - Badge count to display on filter icon (optional)
 * @param {string} className - Additional classes for container
 * @param {string} containerClassName - Override container classes
 */
function StandardHeader({ 
  title, 
  titleContent = null,
  showTasks = true, 
  showFilters = false,
  onFilterClick,
  rightContent = null,
  selectedThread = null,
  leadId = null,
  threadId = null,
  filterIcon = null,
  filterBadge = null,
  className = '',
  containerClassName = ''
}) {
  const [taskBoardOpen, setTaskBoardOpen] = useState(false)
  const taskButtonRef = useRef(null)
  
  // Get task status for indicator dots
  const { hasActiveTasks, hasPastDueTasks } = useTaskStatus(
    leadId || selectedThread?.leadId || null,
    threadId || selectedThread?.id || null,
    null
  )

  // Use containerClassName if provided, otherwise use exact MessageHeader classes
  const containerClasses = containerClassName || 'w-full p-4 border-b flex flex-row items-center justify-between h-14'

  return (
    <>
      <div className={containerClasses}>
        {/* Left: Title Section - matches MessageHeader exactly */}
        {titleContent || (typeof title === 'string' ? <TypographyH3>{title}</TypographyH3> : title)}
        
        {/* Right: Icons and Actions - matches MessageHeader structure exactly */}
        <div className='flex flex-row items-center justify-end gap-2'>
          {rightContent}
          {showFilters && onFilterClick && (
            <button
              onClick={onFilterClick}
              className="mb-1 hover:opacity-70 transition-opacity outline-none relative flex-shrink-0"
              title="Filter"
            >
              {filterIcon || (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: 'block' }}
                >
                  <path
                    d="M22 6.5H16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6.5H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 17.5H18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 17.5H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {filterBadge !== null && filterBadge > 0 && (
                <div
                  className="absolute -top-1 -right-1 flex bg-red rounded-full min-w-[24px] px-[2px] h-6 flex-row items-center justify-center text-white flex-shrink-0"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {filterBadge < 100 ? filterBadge : '99+'}
                </div>
              )}
            </button>
          )}
          {showTasks && process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production' && (
            <button
              ref={taskButtonRef}
              onClick={() => setTaskBoardOpen(true)}
              className="mb-1 hover:opacity-70 transition-opacity flex-shrink-0 relative"
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
      </div>
      {showTasks && (
        <TaskBoard 
          open={taskBoardOpen} 
          onClose={() => setTaskBoardOpen(false)}
          leadId={selectedThread?.leadId || leadId || null}
          threadId={selectedThread?.id || threadId || null}
          buttonRef={taskButtonRef}
        />
      )}
    </>
  )
}

export default StandardHeader
