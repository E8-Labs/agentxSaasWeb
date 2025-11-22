'use client'

import React, { useState } from 'react'

import { Slider } from '@/components/ui/slider'

export default function GradientSlider({ minutes, setMinutes }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="relative w-full">
        {/* Bubble above thumb */}
        <div
          className="absolute -top-10 flex items-center justify-center px-3 py-1 rounded-lg text-white text-sm font-semibold shadow-lg"
          style={{
            left: `calc(${(minutes / 500) * 100}% - 25px)`,
            background: 'linear-gradient(to bottom, #C73BFF, #7902DF)',
          }}
        >
          {minutes} credits
          <div
            className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: '#7902DF' }}
          />
        </div>

        {/* Slider itself */}
        <Slider
          defaultValue={[0]}
          max={500}
          step={30}
          onValueChange={(val) => setMinutes(val[0])}
        />
      </div>
    </div>
  )
}
