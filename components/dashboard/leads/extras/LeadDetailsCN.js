'use client'

import {
  BadgeCheck,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  History,
  IdCard,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Play,
  Send,
  Sparkles,
  Sun,
  Tag,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { useMemo } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import DropdownCn from './DropdownCn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const sampleLead = {
  name: 'Jammie',
  email: 'jammie.christine@gmail.com',
  phone: '(542) 084-4003',
  address: '3914 Murphy Canyon Rd # A-157 San Diego, CA, 92123',
  pipeline: 'Solar ☀',
  appointment: 'Aug 03, 2025 10:00 AM',
  tags: ['Tag Value', 'Booked'],
  assignee: { name: 'Noah Nega', avatar: '/image-2.png' },
  stage: 'Booked',
  customFieldsCount: 3,
  activities: [
    {
      duration: '3:54mins',
      summary: 'Summary:',
      description:
        'Lorem ipsum dolor sit amet consectetur. Dis est leo hendrerit placerat est sed non sed. Orci ornare commodo massa tempus nulla urna purus facilisis nisi. Maecenas hendrerit cum et ipsum. Magna varius odio potenti ridiculus pulvinar pellentesque',
      timestamp: '12/09/2024, 12:12 AM',
    },
  ],
}

export const InfoRow = ({ icon, children }) => (
  <div className="flex items-center gap-2 text-sm text-foreground">
    <span className="text-muted-foreground">{icon}</span>
    <div className="leading-6">{children}</div>
  </div>
)

export const TagPill = ({ label }) => (
  <Badge
    variant="outline"
    className="rounded-full border-muted text-sm font-medium px-3 py-1 bg-muted/40 text-foreground"
  >
    {label}
  </Badge>
)

const ActivityCard = ({ activity }) => (
  <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="font-medium">{activity.duration}</span>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border">
          <Play className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>

    <div className="mt-3 space-y-2 text-sm text-foreground">
      <p className="font-semibold">{activity.summary}</p>
      <p className="text-muted-foreground leading-6 line-clamp-3">{activity.description}</p>
    </div>

    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <CopyIcon />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
        </Button>
      </div>
      <span>{activity.timestamp}</span>
    </div>
  </div>
)

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <rect x="2" y="2" width="13" height="13" rx="2" />
  </svg>
)

const leadTabs = [
  { id: 'perplexity', label: 'Perplexity', icon: <Zap className="h-5 w-5" /> },
  { id: 'kyc', label: 'KYC', icon: <IdCard className="h-5 w-5" /> },
  { id: 'activity', label: 'Activity', icon: <History className="h-5 w-5" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="h-5 w-5" /> },
]

const LeadDetailsCN = ({ showDetailsModal, setShowDetailsModal, leadData }) => {
  const lead = useMemo(() => ({ ...sampleLead, ...leadData }), [leadData])

  const handleOpenChange = (open) => {
    if (!open) {
      setShowDetailsModal?.(false)
    }
  }

  // Avoid rendering when closed so it doesn't sit inline on the page
  if (!showDetailsModal) {
    return null
  }

  return (
    <Sheet open={!!showDetailsModal} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">More Info</h2>
            <button
              className="h-9 w-9 rounded-full hover:bg-muted"
              onClick={() => setShowDetailsModal?.(false)}
              aria-label="Close"
            >
              <X className="mx-auto h-5 w-5" />
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 px-6 py-4">
              <div className="flex items-start justify-between gap-4 rounded-2xl bg-white py-0">
                <div className="flex flex-1 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {lead.avatar ? (
                      <AvatarImage src={lead.avatar} alt={lead.name} />
                    ) : (
                      <AvatarFallback className="text-md font-semibold">{lead.name?.[0] || 'L'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <p className="truncate text-lg font-semibold leading-none text-foreground">
                      {lead.name}
                    </p>
                    <DropdownCn
                      label="Send"
                      options={[
                        { label: 'Email', value: 'email', icon: Mail },
                        { label: 'Call', value: 'call', icon: PhoneCall },
                        { label: 'SMS', value: 'sms', icon: MessageDotsIcon },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <DropdownCn
                    label="Payment"
                    icon={WalletCards}
                    align="end"
                    options={[
                      { label: 'New payment', value: 'new', icon: CreditCard },
                      { label: 'History', value: 'history', icon: History },
                    ]}
                  />
                  <DropdownCn
                    label={lead.stage || 'Stage'}
                    align="end"
                    options={
                      leadData?.stagesList?.length
                        ? leadData.stagesList.map((s) => ({
                            label: s.stageTitle,
                            value: s.stageTitle,
                            onSelect: () => leadData?.updateLeadStage?.(s),
                          }))
                        : [
                            { label: 'Booked', value: 'Booked' },
                            { label: 'Hot Lead', value: 'Hot Lead' },
                            { label: 'No Stage', value: 'No Stage' },
                          ]
                    }
                    onSelect={(opt) => leadData?.setSelectedStage?.(opt.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow icon={<Mail className="h-4 w-4" />}>{lead.email}</InfoRow>
                <InfoRow icon={<Phone className="h-4 w-4" />}>{lead.phone}</InfoRow>
                <InfoRow icon={<MapPin className="h-4 w-4" />}>{lead.address}</InfoRow>
                <InfoRow icon={<Sparkles className="h-4 w-4" />}>{lead.pipeline}</InfoRow>
                <InfoRow icon={<Calendar className="h-4 w-4" />}>{lead.appointment}</InfoRow>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {lead.tags?.map((tag) => (
                      <TagPill key={tag} label={tag} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {lead.assignee?.avatar ? (
                      <AvatarImage src={lead.assignee.avatar} alt={lead.assignee.name} />
                    ) : (
                      <AvatarFallback>{lead.assignee?.name?.[0] || 'A'}</AvatarFallback>
                    )}
                  </Avatar>
                  <Select defaultValue={lead.assignee?.name || 'Noah Nega'}>
                    <SelectTrigger className="flex-1 justify-between rounded-lg border-muted">
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noah Nega">Noah Nega</SelectItem>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WorkflowIcon />
                    <span className="text-sm font-medium text-foreground">Custom fields</span>
                    <ChevronIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button variant="link" className="h-auto p-0 text-indigo-primary">
                    +{lead.customFieldsCount}
                  </Button>
                </div>
              </div>

              <div>
                <Tabs defaultValue="activity">
                  <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent">
                    {leadTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-indigo-primary data-[state=active]:text-indigo-primary"
                      >
                        {tab.icon}
                        <span className="text-sm font-medium">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <Separator />

              <div className="space-y-3">
                {lead.activities?.map((activity, idx) => (
                  <ActivityCard key={idx} activity={activity} />
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const WorkflowIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="7" cy="7" r="2" />
    <circle cx="17" cy="7" r="2" />
    <circle cx="7" cy="17" r="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="7" y1="9" x2="7" y2="15" />
    <line x1="17" y1="9" x2="17" y2="15" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)

const ChevronIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 12 8" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 2l4 4 4-4" />
  </svg>
)

const MessageDotsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" />
    <circle cx="8.5" cy="11.5" r="1" />
    <circle cx="12" cy="11.5" r="1" />
    <circle cx="15.5" cy="11.5" r="1" />
  </svg>
)

export default LeadDetailsCN
