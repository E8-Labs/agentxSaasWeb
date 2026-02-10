"use client"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Mail, MessageSquareDot, PhoneCall } from "lucide-react"

const groupButtonClass = cn(
    "rounded-none border-0 border-r border-input last:border-r-0",
    "first:rounded-l-md last:rounded-r-md",
    "h-9 w-9 p-0 shadow-none hover:bg-accent hover:text-accent-foreground",
    "disabled:opacity-50 disabled:pointer-events-none"
)

/**
 * Send actions as icon-only button group: Text | Email | Call.
 * Matches ShadCN button group style (single border, vertical separators).
 * Buttons stay clickable when no access so parent handleSendAction can open upgrade modals.
 */
export function SendActionsButtonGroup({
    onSelect,
    emailCapability = {},
    dialerCapability = {},
    smsCapability = {},
    className,
}) {
    const buttons = [
        {
            value: "sms",
            label: "Text",
            icon: MessageSquareDot,
            hasAccess: smsCapability.hasAccess,
        },
        {
            value: "email",
            label: "Email",
            icon: Mail,
            hasAccess: emailCapability.hasAccess,
        },
        {
            value: "call",
            label: "Call",
            icon: PhoneCall,
            hasAccess: dialerCapability.hasAccess,
        },
    ]

    return (
        <TooltipProvider delayDuration={0}>
            <ButtonGroup className={cn("inline-flex", className)}>
                {buttons.map(({ value, label, icon: Icon, hasAccess }) => (
                    <Tooltip key={value}>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={groupButtonClass}
                                onClick={() => onSelect({ value })}
                                aria-label={label}
                            >
                                <Icon className="h-4 w-4 text-foreground" aria-hidden />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4}>
                            <p>{label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </ButtonGroup>
        </TooltipProvider>
    )
}

export default SendActionsButtonGroup