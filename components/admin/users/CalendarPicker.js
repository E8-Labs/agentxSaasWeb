"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CalendarPicker({ onSelectDate }) {
  const [date, setDate] = React.useState();

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant={"outline"}
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[9999]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            onSelectDate(date);
            setDate(date);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
