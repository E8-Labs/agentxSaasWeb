"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Accordion = ({ type = "single", defaultValue, className, children, ...props }) => {
  const [openItems, setOpenItems] = React.useState(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      if (type === "single") {
        return defaultValue
      } else {
        // For multiple type, defaultValue should already be an array
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
      }
    }
    return type === "single" ? null : []
  })

  const contextValue = React.useMemo(() => ({
    openItems,
    setOpenItems,
    type
  }), [openItems, type])

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionContext = React.createContext({
  openItems: null,
  setOpenItems: () => {},
  type: "single"
})

const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const isOpen = context.type === "single" 
    ? context.openItems === value 
    : Array.isArray(context.openItems) && context.openItems.includes(value)

  return (
    <div
      ref={ref}
      className={cn("border-b", className)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <AccordionItemContext.Provider value={value}>
        {children}
      </AccordionItemContext.Provider>
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionItemContext = React.createContext(null)

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  
  const handleClick = () => {
    if (context.type === "single") {
      context.setOpenItems(context.openItems === itemValue ? null : itemValue)
    } else {
      const current = Array.isArray(context.openItems) ? context.openItems : []
      const newValue = current.includes(itemValue)
        ? current.filter(v => v !== itemValue)
        : [...current, itemValue]
      context.setOpenItems(newValue)
    }
  }

  const isOpen = context.type === "single" 
    ? context.openItems === itemValue 
    : Array.isArray(context.openItems) && context.openItems.includes(itemValue)

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", 
        isOpen && "rotate-180"
      )} />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  const isOpen = context.type === "single" 
    ? context.openItems === itemValue 
    : Array.isArray(context.openItems) && context.openItems.includes(itemValue)

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden text-sm transition-all pb-4 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
