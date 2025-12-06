import Image from 'next/image'
import React, { useEffect, useState } from 'react'

function ShootingStarLoading({ open }) {
  const [authProgressValue, setAuthProgressValue] = useState(0)
  // Animate progress bar for indeterminate effect when checking auth
  useEffect(() => {
    if (!open) {
      setAuthProgressValue(0)
      return
    }

    const interval = setInterval(() => {
      setAuthProgressValue((prev) => {
        if (prev >= 90) {
          return 0
        }
        // Smaller increments for smoother animation
        return prev + 2
      })
    }, 50) // More frequent updates for smoother animation
    return () => clearInterval(interval)
  }, [open])

  return (
    <>
      <div className="flex flex-col w-full h-[100svh] items-center justify-center bg-white">
        <div className="flex flex-col items-center w-full max-w-md px-8">
          {/* Orb Image */}
          <div className="mb-16 bg-white rounded-md p-4">
            <Image
              src="/agentXOrb.gif"
              height={142}
              width={152}
              alt="Loading"
              style={{ height: '142px', width: '152px', resize: 'contain' }}
            />
          </div>

          {/* Shooting Star Progress Bar */}
          <div className="w-full relative" style={{ height: '2px' }}>
            <div className="absolute inset-0 bg-gray-200 rounded-full" />
            <div
              className="absolute left-0 top-0 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${authProgressValue}%`,
                height: '4px',
                background: `linear-gradient(90deg, 
              rgba(121, 2, 223, 0.2) 0%,
              rgba(121, 2, 223, 0.4) 15%,
              rgba(121, 2, 223, 0.6) 35%,
              rgba(121, 2, 223, 0.75) 55%,
              rgba(121, 2, 223, 0.9) 75%,
              rgba(121, 2, 223, 1) 90%,
              rgba(121, 2, 223, 1) 100%
            )`,
                transition: 'width 0.2s ease-out',
              }}
            >
              {/* Bright, thick head at the end */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: '18px',
                  height: '8px',
                  background: 'rgba(121, 2, 223, 1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShootingStarLoading
