'use client'

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { X, Phone, Mail, MessageSquare, PhoneCall, ListTodo } from 'lucide-react'
import Drawer from '@mui/material/Drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTasks } from '@/components/onboarding/services/apisServices/TaskService'
import Apis from '@/components/apis/Apis'
import TaskCard from '@/components/messaging/TaskCard'
import LeadDetails from '@/components/dashboard/leads/extras/LeadDetails'
import { TypographyH3, TypographyBody, TypographyH3Semibold, TypographyCaption, TypographyTitle, TypographyButtonText, TypographyAlert, TypographyCaptionMedium } from '@/lib/typography'
import { cn } from '@/lib/utils'
import { sanitizeHTMLForEmailBody } from '@/utilities/textUtils'

const getAuthToken = () => {
  try {
    const localData = localStorage.getItem('User')
    if (localData) {
      const Data = JSON.parse(localData)
      return Data.token
    }
  } catch (e) {}
  return null
}

async function fetchTeamMemberActivities(teamMemberUserId, range, from, to, limit = 50, offset = 0) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')
  const params = new URLSearchParams({ teamMemberUserId: String(teamMemberUserId), range: range || 'all', limit: String(limit), offset: String(offset) })
  if (range === 'custom' && from && to) {
    params.append('from', from)
    params.append('to', to)
  }
  const res = await axios.get(`${Apis.getTeamMemberActivities}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

const RANGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'last_24hrs', label: 'Last 24hrs' },
  { value: 'last_7days', label: 'Last 7days' },
  { value: 'custom', label: 'Custom' },
]

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Dos' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export default function TeamMemberActivityDrawer({ open, onClose, teamMember, admin }) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [totals, setTotals] = useState({ sms: 0, email: 0, calls: 0 })
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [range, setRange] = useState('all')
  const [counts, setCounts] = useState({ todo: 0, 'in-progress': 0, done: 0 })
  const [taskStatusFilter, setTaskStatusFilter] = useState(null)
  const [selectedLeadIdForModal, setSelectedLeadIdForModal] = useState(null)

  const teamMemberUserId = teamMember?.invitedUserId || teamMember?.invitedUser?.id

  const loadTasks = useCallback(async () => {
    if (!teamMemberUserId) return
    setTasksLoading(true)
    try {
      const params = { assignedTo: teamMemberUserId }
      if (taskStatusFilter) params.status = taskStatusFilter
      const res = await getTasks(params)
      const list = Array.isArray(res?.data) ? res.data : res?.data?.tasks ?? res?.tasks ?? []
      setTasks(list)
      const c = res?.counts ?? res?.data?.counts ?? {}
      setCounts({ todo: c.todo ?? 0, 'in-progress': c['in-progress'] ?? 0, done: c.done ?? 0 })
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setTasks([])
    } finally {
      setTasksLoading(false)
    }
  }, [teamMemberUserId, taskStatusFilter])

  const loadActivities = useCallback(async () => {
    if (!teamMemberUserId) return
    setActivitiesLoading(true)
    try {
      const res = await fetchTeamMemberActivities(teamMemberUserId, range)
      const data = res?.data
      setActivities(data?.activities ?? [])
      setTotals(data?.totals ?? { sms: 0, email: 0, calls: 0 })
    } catch (err) {
      console.error('Failed to load activities:', err)
      setActivities([])
      setTotals({ sms: 0, email: 0, calls: 0 })
    } finally {
      setActivitiesLoading(false)
    }
  }, [teamMemberUserId, range])

  useEffect(() => {
    if (open && activeTab === 'tasks' && teamMemberUserId) loadTasks()
  }, [open, activeTab, teamMemberUserId, taskStatusFilter, loadTasks])

  useEffect(() => {
    if (open && activeTab === 'activity' && teamMemberUserId) loadActivities()
  }, [open, activeTab, teamMemberUserId, range, loadActivities])

  const displayName = teamMember?.name || teamMember?.invitedUser?.name || 'Team Member'
  const displayEmail = teamMember?.email || teamMember?.invitedUser?.email || ''
  const displayPhone = teamMember?.phone || teamMember?.invitedUser?.phone || ''
  const initial = (displayName || 'T').charAt(0).toUpperCase()
  const formattedPhone = displayPhone
    ? displayPhone.length >= 10
      ? `(${displayPhone.slice(-10, -7)}) ${displayPhone.slice(-7, -4)}-${displayPhone.slice(-4)}`
      : displayPhone
    : ''

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        sx: { zIndex: 5000 },
      }}
      PaperProps={{
        sx: {
          // width: { xs: 'calc(100% - 32px)', sm: 720 },
          // maxWidth: 'calc(100vw - 48px)',
          height: 'calc(100% - 48px)',
          maxHeight: 'calc(100vh - 48px)',
          top: 24,
          right: 24,
          bottom: 24,
          // left: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 5000
        },
      }}
    >
      <div className="flex h-full bg-background rounded-xl overflow-hidden w-[58vw]">
        {/* Left column: header, profile, vertical tabs - header height matches right for aligned lines */}
        <div className="flex flex-col w-[20vw] shrink-0 border-r border-border bg-background">
          <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
            <span className="text-base font-semibold text-foreground">Team Member</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          {teamMember && (
            <>
              <div className="p-5 flex flex-col items-center text-center ">
                {/* Avatar: solid purple circle with white initial when no profile image */}
                <div className="h-16 w-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-semibold mb-4">
                  {initial}
                </div>
                <TypographyH3Semibold>{displayName}</TypographyH3Semibold>
                {/* <span className="text-base font-semibold text-foreground">{displayName}</span> */}
                {displayEmail && (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="flex items-center justify-center gap-1.5 mt-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <TypographyButtonText >{displayEmail}</TypographyButtonText>
                  </a>
                )}
                {displayPhone && (
                  <TypographyButtonText className="flex items-center justify-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {formattedPhone}
                  </TypographyButtonText>
                )}
              </div>
              <nav className="p-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'tasks'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {/* <ListTodo className="h-4 w-4 shrink-0" /> */}
                  Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    'flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'activity'
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {/* <MessageSquare className="h-4 w-4 shrink-0" /> */}
                  Activity Log
                </button>
              </nav>
            </>
          )}
        </div>

        {/* Right column: content - header height h-14 to align divider line with left */}
        <div className="flex flex-col flex-1 min-w-0 w-[80vw]">
          {activeTab === 'tasks' && (
            <>
              <div className="flex items-center h-14 shrink-0 border-b border-border">
                
              </div>
              <span className="text-lg font-semibold text-foreground ml-2 mt-2 mb-3">Task</span>
              <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-border">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTaskStatusFilter(taskStatusFilter === opt.value ? null : opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      taskStatusFilter === opt.value
                        ? 'bg-brand-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                  >
                    {opt.label} {counts[opt.value] ?? 0}
                  </button>
                ))}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-5">
                  {tasksLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <TypographyBody className="text-muted-foreground italic py-8">No tasks assigned</TypographyBody>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onUpdate={loadTasks}
                          onDelete={loadTasks}
                          statusOptions={[
                            { label: 'To Do', value: 'todo' },
                            { label: 'In Progress', value: 'in-progress' },
                            { label: 'Done', value: 'done' },
                          ]}
                          priorityOptions={[
                            { label: 'No Priority', value: 'no-priority' },
                            { label: 'Low', value: 'low' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'High', value: 'high' },
                          ]}
                          teamMembers={[]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {activeTab === 'activity' && (
            <>
              <div className="flex items-center justify-between px-6 h-14 shrink-0 border-b border-border">
                
              </div>
              <div className="flex items-center justify-between px-6 h-14 shrink-0 ">
                <span className="text-lg font-semibold text-foreground">Activity Log</span>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="text-sm  border-none rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {RANGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Stats section: background wrapper, cards with no border, label above count, brand icons */}
              <div className="px-6 py-5 border-b border-border ">
                <div className="grid grid-cols-3 gap-3 bg-[#F9F9F9] p-3 rounded-lg">
                  <div className="rounded-lg p-4 flex flex-col items-center gap-1 bg-background/80">
                    <PhoneCall className="h-6 w-6 text-brand-primary shrink-0" />
                    <TypographyBody className="text-sm font-medium text-foreground">Calls</TypographyBody>
                    <span className="text-2xl font-semibold text-foreground">{totals.calls}</span>
                  </div>
                  <div className="rounded-lg p-4 flex flex-col items-center gap-2 bg-background/80">
                    <MessageSquare className="h-6 w-6 text-brand-primary shrink-0" />
                    <TypographyBody className="text-sm font-medium text-foreground">Texts</TypographyBody>
                    <span className="text-2xl font-semibold text-foreground">{totals.sms}</span>
                  </div>
                  <div className="rounded-lg p-4 flex flex-col items-center gap-2 bg-background/80">
                    <Mail className="h-6 w-6 text-brand-primary shrink-0" />
                    <TypographyBody className="text-sm font-medium text-foreground">Emails</TypographyBody>
                    <span className="text-2xl font-semibold text-foreground">{totals.email}</span>
                  </div>
                </div>
              </div>
              <ScrollArea className="flex-1 bg-[#F9F9F9]">
                <div className="px-6 py-5">
                  {activitiesLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
                    </div>
                  ) : activities.length === 0 ? (
                    <TypographyBody className="text-muted-foreground italic py-8">No activities in this range</TypographyBody>
                  ) : (
                    <ActivityTimeline activities={activities} onLeadClick={setSelectedLeadIdForModal} />
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
      {selectedLeadIdForModal != null && (
        <LeadDetails
          selectedLead={selectedLeadIdForModal}
          showDetailsModal={true}
          setShowDetailsModal={() => setSelectedLeadIdForModal(null)}
          hideDelete={true}
        />
      )}
    </Drawer>
  )
}

/** Vertical timeline: date left, purple circle + icon on line, message card right (wireframe) */
const DATE_COL_WIDTH = '10rem' // fits "Jan 7, 2026 at 4:00 PM" on one line; fixed so icon stays on line
const GAP_DATE_ICON = '0.5rem' // tight space between date and icon
const GAP_ICON_CONTENT = '1rem'
const ICON_COL_WIDTH = '2rem'
const LINE_LEFT = `calc(${DATE_COL_WIDTH} + ${GAP_DATE_ICON} + ${ICON_COL_WIDTH} / 2)`

function ActivityTimeline({ activities, onLeadClick }) {
  return (
    <div className="relative">
      {/* Vertical line through center of icon column */}
      <div
        className="absolute top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"
        style={{ left: LINE_LEFT }}
        aria-hidden
      />
      <div className="space-y-8">
        {activities.map((item) => (
          <ActivityTimelineItem key={item.id} item={item} onLeadClick={onLeadClick} />
        ))}
      </div>
    </div>
  )
}

function ActivityTimelineItem({ item, onLeadClick }) {
  const leadName = item.lead
    ? [item.lead.firstName, item.lead.lastName].filter(Boolean).join(' ') || item.lead.email || 'Lead'
    : 'Lead'
  const leadId = item.leadId ?? item.lead?.id
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : ''
  const contentSnippet = item.content ? (item.content.length > 120 ? item.content.slice(0, 120) + '...' : item.content) : ''
  const hasLongContent = item.content && item.content.length > 120

  return (
    <div className="relative flex items-center">
      {/* Date column: fixed width, then tight gap to icon */}
      <div className="shrink-0 text-left" style={{ width: DATE_COL_WIDTH, marginRight: GAP_DATE_ICON }}>
        <span className="text-xs text-gray-500 whitespace-nowrap">{dateStr}</span>
      </div>
      {/* Icon column: purple circle centered on timeline line */}
      <div className="w-8 shrink-0 flex justify-center items-center" style={{ marginRight: GAP_ICON_CONTENT }}>
        <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white z-[1] shrink-0">
          {item.type === 'call' && <PhoneCall className="h-4 w-4" />}
          {item.type === 'email' && <Mail className="h-4 w-4" />}
          {item.type === 'sms' && <MessageSquare className="h-4 w-4" />}
        </div>
      </div>
      {/* Message card: white bg, no border, wireframe-style padding */}
      <div className="flex-1 min-w-0 rounded-lg bg-background py-3 pr-4 pl-5">
        {item.type === 'call' && (
          <>
            <TypographyBody className="font-semibold text-foreground">
              Made a call to{' '}
              {leadId ? (
                <button
                  type="button"
                  onClick={() => onLeadClick(leadId)}
                  className="text-brand-primary underline cursor-pointer hover:opacity-90"
                >
                  {leadName}
                </button>
              ) : (
                leadName
              )}
            </TypographyBody>
            {item.durationSeconds != null && (
              <TypographyBody className="text-sm text-muted-foreground mt-1">
                {Math.floor(item.durationSeconds / 60)}:{String(item.durationSeconds % 60).padStart(2, '0')} mins
              </TypographyBody>
            )}
            {item.summary && <TypographyBody className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.summary}</TypographyBody>}
          </>
        )}
        {item.type === 'email' && (
          <>
            <TypographyBody className="font-semibold text-foreground">
              Sent an email to{' '}
              {leadId ? (
                <button
                  type="button"
                  onClick={() => onLeadClick(leadId)}
                  className="text-brand-primary underline cursor-pointer hover:opacity-90"
                >
                  {leadName}
                </button>
              ) : (
                <span className="text-brand-primary underline">{leadName}</span>
              )}
            </TypographyBody>
            {item.subject && <TypographyBody className="text-sm text-foreground mt-1">Subject: {item.subject}</TypographyBody>}
            {item.content && (
              <div
                className="prose prose-sm max-w-none break-words text-sm text-muted-foreground mt-1
                  [&_p]:!mt-0 [&_p]:!mb-[0.35em] [&_p]:!leading-snug
                  [&_ul]:!my-[0.35em] [&_ul]:!pl-[1.25em] [&_ul]:!list-disc
                  [&_ol]:!my-[0.35em] [&_ol]:!pl-[1.25em]
                  [&_li]:!my-[0.15em] [&_a]:!text-brand-primary [&_a:hover]:!underline"
                dangerouslySetInnerHTML={{ __html: sanitizeHTMLForEmailBody(item.content) }}
              />
            )}
            {hasLongContent && <span className="text-sm text-brand-primary underline mt-1 inline-block">Read more</span>}
          </>
        )}
        {item.type === 'sms' && (
          <>
            <TypographyBody className=" text-foreground">
              Sent a text message to @
              {leadId ? (
                <button
                  type="button"
                  onClick={() => onLeadClick(leadId)}
                  className="text-brand-primary underline cursor-pointer hover:opacity-90"
                >
                  {leadName}
                </button>
              ) : (
                leadName
              )}
            </TypographyBody>
            {contentSnippet && <TypographyBody className="text-sm text-muted-foreground mt-1 line-clamp-3">{contentSnippet}</TypographyBody>}
            {hasLongContent && <span className="text-sm text-brand-primary underline mt-1 inline-block">Read more</span>}
          </>
        )}
      </div>
    </div>
  )
}
