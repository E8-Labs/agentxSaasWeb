'use client'

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'
import dayjs from 'dayjs'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Above MUI Modal (1300) and backdrop */
const POPOVER_Z_INDEX = 9999

/** Firecrawl-style: slide from bottom to final position (no scale) */
const POPOVER_DROPDOWN_CLASS =
  'border border-[#eaeaea] bg-white text-foreground shadow-[0_4px_30px_rgba(0,0,0,0.15)] rounded-xl p-0 data-[state=open]:animate-date-drop-enter data-[state=closed]:animate-date-drop-exit outline-none'

/** MUI TimePicker text field – match start-campaign-input (firecrawl-style) */
const TIME_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': {
      borderColor: '#E5E7EB',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'hsl(var(--brand-primary))',
      borderWidth: '1px',
      boxShadow: '0 0 0 1px hsl(var(--brand-primary) / 0.2)',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
    },
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px 12px',
  },
}

/** MUI TimePicker popper – our dropdown branding */
const TIME_PAPER_SX = {
  borderRadius: '12px',
  border: '1px solid #eaeaea',
  boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
  animation: 'date-picker-drop-entry 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  '& .MuiTimeClock-root': {
    '& .Mui-selected': {
      backgroundColor: 'hsl(var(--brand-primary)) !important',
      color: '#fff !important',
    },
    '& .MuiClock-pin': {
      backgroundColor: 'hsl(var(--brand-primary)) !important',
    },
    '& .MuiClockPointer-root': {
      backgroundColor: 'hsl(var(--brand-primary)) !important',
    },
    '& .MuiClockPointer-thumb': {
      borderColor: 'hsl(var(--brand-primary)) !important',
    },
  },
  '& .MuiDigitalClock-item.Mui-selected': {
    backgroundColor: 'hsl(var(--brand-primary)) !important',
    color: '#fff !important',
  },
  '& .MuiPickersArrowSwitcher-button': {
    color: 'hsl(var(--brand-primary))',
  },
}

/**
 * Two separate fields (Date + Time) that compose to a single dayjs value.
 * Keeps the same value/onChange contract as the previous DateTimePicker.
 */
export function DateAndTimeFields({
  value,
  onChange,
  minDate,
  error = false,
  disabled = false,
  timezone,
  className,
}) {
  const [dateOpen, setDateOpen] = useState(false)

  const minDateObj = minDate ? minDate.toDate() : dayjs().toDate()
  const baseDate = value || dayjs()
  const selectedDate = baseDate.startOf('day').toDate()
  const dateDisplay = baseDate.format('MMM D, YYYY')
  const timeValue = value || dayjs().startOf('day')

  const handleDateSelect = (date) => {
    if (!date) return
    const d = dayjs(date)
    const next = (value || dayjs()).startOf('day').year(d.year()).month(d.month()).date(d.date())
    onChange(next)
    setDateOpen(false)
  }

  const handleTimeChange = (newTime) => {
    if (!newTime) return
    const base = value || dayjs().startOf('day')
    const next = base
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(0)
      .millisecond(0)
    onChange(next)
  }

  const triggerInputClass = cn(
    'start-campaign-input w-full flex items-center justify-between gap-2 text-left h-10 min-h-[40px] px-3 cursor-pointer text-[14px] font-medium',
    error && 'border-destructive',
    disabled && 'opacity-60 cursor-not-allowed'
  )

  return (
    <div className={cn('grid grid-cols-[1.2fr,1fr] gap-3', className)}>
      {/* Date field */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <label className="start-campaign-label text-[14px]">Date</label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={triggerInputClass}
              aria-label="Select date"
            >
              <span>{dateDisplay}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(POPOVER_DROPDOWN_CLASS, 'w-auto p-0')}
            align="start"
            sideOffset={4}
            style={{ zIndex: POPOVER_Z_INDEX }}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={{ before: minDateObj }}
              classNames={{
                day_selected:
                  '!bg-[hsl(var(--brand-primary))] !text-white hover:!bg-[hsl(var(--brand-primary))] hover:!text-white focus:!bg-[hsl(var(--brand-primary))] focus:!text-white',
                day_today: 'bg-accent text-accent-foreground',
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time field – MUI X DesktopTimePicker with our dropdown/popup branding */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <label className="start-campaign-label text-[14px]" htmlFor="time-picker-field">
          Time
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopTimePicker
            id="time-picker-field"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            format="hh:mm a"
            ampm
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
                placeholder: 'Select time',
                sx: TIME_FIELD_SX,
                error: !!error,
              },
              popper: {
                style: { zIndex: POPOVER_Z_INDEX },
                sx: {
                  '& .MuiPaper-root': TIME_PAPER_SX,
                },
              },
            }}
            sx={{ width: '100%' }}
          />
        </LocalizationProvider>
      </div>
    </div>
  )
}
