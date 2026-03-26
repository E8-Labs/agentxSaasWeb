import { cn } from '@/lib/utils'

function pctPart(numerator, denominator) {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

const CampaignStatPopover = ({
  open,
  isLastItem = false,
  campaignStatLoading,
  campaignStatData,
  onMouseLeave,
  className,
}) => {
  if (!open) return null

  return (
    <div
      className={cn(
        'absolute z-50 w-auto min-w-[200px] max-w-[90vw] rounded-lg border border-[#1515151A10] shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white text-gray-900',
        isLastItem ? 'bottom-full mb-1 right-0' : 'top-full mt-1 right-0',
        className
      )}
      onMouseEnter={(e) => {
        e.stopPropagation()
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        onMouseLeave?.()
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-2 border-b border-[#1515151A10]">
        <span className="text-[12px] font-medium text-[#666666]">Campaign Stat</span>
      </div>
      <div className="px-2.5 py-2 text-[12px] space-y-1">
        {campaignStatLoading ? (
          <p className="text-muted-foreground text-[#666666] text-[14px]">Loading…</p>
        ) : campaignStatData ? (
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[#666666]">{campaignStatData.delivered} Delivered</span>
              <span className="font-medium">
                {pctPart(campaignStatData.delivered, campaignStatData.sent)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[#666666]">{campaignStatData.opened} Opened</span>
              <span className="font-medium">
                {pctPart(campaignStatData.opened, campaignStatData.sent)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[#666666]">{campaignStatData.clicked} Clicked</span>
              <span className="font-medium">
                {pctPart(campaignStatData.clicked, campaignStatData.sent)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[#666666]">{campaignStatData.replied} Replied</span>
              <span className="font-medium">
                {pctPart(campaignStatData.replied, campaignStatData.sent)}
              </span>
            </div>
          </div>
        ) : (
          !campaignStatLoading && <p className="text-muted-foreground">No data available.</p>
        )}
      </div>
    </div>
  )
}

export default CampaignStatPopover
