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
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import DropdownCn from './DropdownCn'
import NotesTabCN from './NotesTabCN'
import KYCTabCN from './KYCTabCN'
import ActivityTabCN from './ActivityTabCN'
import InsightsTabCN from './InsightsTabCN'
import CustomFieldsCN from './CustomFieldsCN'
import {
  TypographyTitle,
  TypographyBody,
  TypographyCaption,
  TypographyBodyMedium,
} from '@/lib/typography'
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
  <div className="flex items-center gap-2">
    <span className="text-muted-foreground">{icon}</span>
    <TypographyBodyMedium>{children}</TypographyBodyMedium>
  </div>
)

export const TagPill = ({ label, onRemove, isLoading, onDeletePermanently, deletePermanentLoader, from = null }) => {
  const handleRemove = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isLoading && onRemove) {
      onRemove(label)
    }
  }

  const handleDeletePermanently = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!deletePermanentLoader && onDeletePermanently) {
      onDeletePermanently(label)
    }
  }

  return (
    <Badge
      variant="outline"
      className="rounded-[8px] w-auto border border-border/50 pl-1 pr-0.5 py-1 text-sm bg-black/[0.02] hover:bg-black/[0.02] flex items-center gap-1 group relative transition-colors shadow-sm min-w-0"
    >
      {/*<TypographyCaption className="font-medium text-foreground">{from === "dashboardPipeline" ? label.length > 10 ? label.slice(0, 10) + "..." : label : label}</TypographyCaption>*/}

      {from === "dashboardPipeline" && label.length > 10 ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <TypographyCaption className="font-medium text-foreground">
                  {label.slice(0, 10) + "..."}
                </TypographyCaption>
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TypographyCaption className="font-medium text-foreground">
          {label}
        </TypographyCaption>
      )}

      <div className="flex items-center gap-0.5 ml-1">
        {/*   {onDeletePermanently && (
          <button
            type="button"
            onClick={handleDeletePermanently}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            disabled={deletePermanentLoader}
            className="h-4 w-4 min-w-[16px] flex items-center justify-center hover:bg-destructive/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label={`Delete tag ${label} permanently`}
            title="Delete tag permanently"
          >
            {deletePermanentLoader ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
            )}
          </button>
        )}*/}
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            disabled={isLoading}
            className="h-4 w-4 min-w-[16px] flex items-center justify-center hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label={`Remove tag ${label}`}
            title="Remove tag from lead"
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
            )}
          </button>
        )}
      </div>
    </Badge>
  )
}

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
  { id: 'insights', label: 'Insights', icon: <Zap className="h-5 w-5" /> },
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
            <TypographyTitle className="font-semibold">More Info</TypographyTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setShowDetailsModal?.(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
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
                    <TypographyTitle className="truncate font-semibold">
                      {lead.name}
                    </TypographyTitle>
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

                <div className="relative flex flex-col items-end gap-2">
                  <DropdownCn
                    label="Payment"
                    icon={WalletCards}
                    align="end"
                    options={[
                      { label: 'New payment', value: 'new', icon: CreditCard },
                      { label: 'History', value: 'history', icon: History },
                    ]}
                  />
                  <div className="relative">
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
                <CustomFieldsCN
                  leadColumns={leadData?.leadColumns || []}
                  selectedLeadsDetails={leadData?.selectedLeadsDetails}
                  showCustomVariables={leadData?.showCustomVariables || false}
                  onToggleCustomVariables={leadData?.onToggleCustomVariables}
                  expandedCustomFields={leadData?.expandedCustomFields || []}
                  onToggleExpandField={leadData?.onToggleExpandField}
                  columnsLength={leadData?.columnsLength || []}
                />
              </div>

              <div className="mt-6">
                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent">
                    {leadTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary"
                      >
                        {tab.icon}
                        <TypographyCaption className="font-medium">{tab.label}</TypographyCaption>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="insights">
                    <InsightsTabCN
                      selectedLeadsDetails={leadData?.selectedLeadsDetails}
                      showConfirmPerplexity={leadData?.showConfirmPerplexity}
                      setshowConfirmPerplexity={leadData?.setshowConfirmPerplexity}
                      userLocalData={leadData?.userLocalData}
                      handleEnrichLead={leadData?.handleEnrichLead}
                      loading={leadData?.loading}
                      creditCost={leadData?.creditCost}
                    />
                  </TabsContent>

                  <TabsContent value="kyc">
                    <KYCTabCN kycs={leadData?.selectedLeadsDetails?.kycs || []} />
                  </TabsContent>

                  <TabsContent value="activity">
                    <ActivityTabCN
                      callActivity={leadData?.selectedLeadsDetails?.callActivity || []}
                      isExpandedActivity={leadData?.isExpandedActivity || []}
                      onToggleExpand={leadData?.onToggleExpand}
                      onCopyCallId={leadData?.onCopyCallId}
                      onReadTranscript={leadData?.onReadTranscript}
                      onPlayRecording={leadData?.onPlayRecording}
                      getCommunicationTypeIcon={leadData?.getCommunicationTypeIcon}
                      getOutcome={leadData?.getOutcome}
                      showColor={leadData?.showColor}
                      callTranscript={leadData?.callTranscript}
                      emailSmsTranscript={leadData?.emailSmsTranscript}
                      leadName={leadData?.selectedLeadsDetails?.firstName}
                      leadId={leadData?.selectedLeadsDetails?.id}
                    />
                  </TabsContent>

                  <TabsContent value="notes">
                    <NotesTabCN
                      noteDetails={leadData?.noteDetails || []}
                      selectedLeadsDetails={leadData?.selectedLeadsDetails}
                      onNotesUpdated={leadData?.onNotesUpdated}
                    />
                  </TabsContent>
                </Tabs>
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
