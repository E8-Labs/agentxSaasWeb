import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const getBrandPrimaryRgb01 = () => {
  try {
    const brandPrimary = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--brand-primary')?.trim()
    if (!brandPrimary) return null

    const el = document.createElement('div')
    el.style.color = `hsl(${brandPrimary})`
    document.body.appendChild(el)
    const rgb = getComputedStyle(el).color
    document.body.removeChild(el)

    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    if (!m) return null
    const r = Number(m[1]) / 255
    const g = Number(m[2]) / 255
    const b = Number(m[3]) / 255
    if (![r, g, b].every((n) => Number.isFinite(n))) return null
    return [r, g, b, 1]
  } catch {
    return null
  }
}

const recolorPureBlackTo = (node, rgba01) => {
  if (!node || !rgba01) return

  const visit = (obj) => {
    if (!obj || typeof obj !== 'object') return

    if (
      obj.c &&
      obj.c.k &&
      Array.isArray(obj.c.k) &&
      obj.c.k.length === 4 &&
      obj.c.k[0] === 0 &&
      obj.c.k[1] === 0 &&
      obj.c.k[2] === 0 &&
      obj.c.k[3] === 1
    ) {
      obj.c.k = [...rgba01]
    }

    for (const key of Object.keys(obj)) {
      const val = obj[key]
      if (Array.isArray(val)) val.forEach(visit)
      else if (val && typeof val === 'object') visit(val)
    }
  }

  visit(node)
}

function ShootingStarLoading({ open }) {
  const [authProgressValue, setAuthProgressValue] = useState(0)
  const [isSubaccount, setIsSubaccount] = useState(false)

  const subaccountLoaderAnimation = useMemo(() => {
    try {
      // Put lottie JSON files under /public/assets/animation/
      // This one can be replaced with the actual subaccount loader JSON anytime.
      // eslint-disable-next-line global-require
      return require('../../public/assets/animation/subAccountLoader.json')
    } catch (e) {
      return null
    }
  }, [])

  useEffect(() => {
    if (!open) return

    try {
      const raw = localStorage.getItem('User')
      if (!raw) {
        setIsSubaccount(false)
        return
      }
      const parsed = JSON.parse(raw)
      const role =
        parsed?.user?.userRole || parsed?.userRole || parsed?.role || null
      setIsSubaccount(role === 'AgencySubAccount')
    } catch (e) {
      setIsSubaccount(false)
    }
  }, [open])

  const brandedSubaccountLoaderAnimation = useMemo(() => {
    if (typeof window === 'undefined') return subaccountLoaderAnimation
    if (!subaccountLoaderAnimation) return null

    const rgba01 = getBrandPrimaryRgb01()
    if (!rgba01) return subaccountLoaderAnimation

    const cloned = JSON.parse(JSON.stringify(subaccountLoaderAnimation))
    recolorPureBlackTo(cloned, rgba01)
    return cloned
  }, [subaccountLoaderAnimation])

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
          {
            !isSubaccount && (
              <div className="mb-16 bg-white rounded-md p-4">
                <AgentXOrb
                  width={152}
                  height={142}
                  alt="Loading"
                  style={{ height: '142px', width: '152px', resize: 'contain' }}
                />
              </div>
            )
          }

          {isSubaccount && subaccountLoaderAnimation ? (
            <div className="w-full flex items-center justify-center">
              <div
                className="w-[160px] h-[160px] rounded-full"
                style={{
                  // brand glow behind lottie
                  boxShadow:
                    '0 0 0 8px hsl(var(--brand-primary) / 0.08), 0 20px 60px -18px hsl(var(--brand-primary) / 0.55)',
                }}
              >
                <Lottie
                  animationData={
                    brandedSubaccountLoaderAnimation || subaccountLoaderAnimation
                  }
                  loop
                  autoplay
                />
              </div>
            </div>
          ) : (
            /* Shooting Star Progress Bar */
            <div className="w-full relative" style={{ height: '2px' }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: 'hsl(var(--brand-primary) / 0.14)',
                }}
              />
              <div
                className="absolute left-0 top-0 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${authProgressValue}%`,
                  height: '4px',
                  background: `linear-gradient(90deg,
                    hsl(var(--brand-primary) / 0.20) 0%,
                    hsl(var(--brand-primary) / 0.40) 15%,
                    hsl(var(--brand-primary) / 0.60) 35%,
                    hsl(var(--brand-primary) / 0.75) 55%,
                    hsl(var(--brand-primary) / 0.90) 75%,
                    hsl(var(--brand-primary)) 90%,
                    hsl(var(--brand-primary)) 100%
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
                    background: 'hsl(var(--brand-primary))',
                    boxShadow:
                      '0 0 16px hsl(var(--brand-primary) / 0.75), 0 0 2px hsl(var(--brand-primary) / 0.95)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ShootingStarLoading
