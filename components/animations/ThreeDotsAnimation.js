// components/ThreeDotLoader.tsx
'use client'

import { motion } from 'framer-motion'
import React from 'react'

// components/ThreeDotLoader.tsx

export default function ThreeDotLoader() {
  const bounceTransition = {
    y: {
      duration: 0.6,
      yoyo: Infinity,
      ease: 'easeOut',
    },
    opacity: {
      duration: 0.6,
      yoyo: Infinity,
      ease: 'easeOut',
    },
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#000',
            borderRadius: '50%',
            display: 'inline-block',
          }}
          animate={{
            y: ['0%', '-40%'],
            opacity: [0.4, 1],
          }}
          transition={{
            ...bounceTransition,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}
