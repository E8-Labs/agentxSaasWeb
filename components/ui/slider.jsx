"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils" // if you have cn helper

export function Slider({ className, ...props }) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#C73BFF] to-[#7902DF]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-white bg-[#7902DF] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C73BFF]" />
    </SliderPrimitive.Root>
  )
}
