import { Box, CircularProgress, Modal } from '@mui/material'
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import { getAgencyUUID, hasAgencyUUID } from '@/utilities/AgencyUtility'
import { PersistanceKeys } from '@/constants/Constants'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const getBrandPrimaryRgb01 = () => {
  try {
    const brandPrimary = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--brand-primary')?.trim()
    if (!brandPrimary) return null

    // Convert hsl(var(--brand-primary)) into rgb via a dummy element
    const el = document.createElement('div')
    el.style.color = `hsl(${brandPrimary})`
    document.body.appendChild(el)
    const rgb = getComputedStyle(el).color // "rgb(r, g, b)"
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

  // Replace any AE-exported pure-black colors [0,0,0,1] in fill/stroke definitions
  const visit = (obj) => {
    if (!obj || typeof obj !== 'object') return

    // Lottie color objects look like: { c: { a: 0, k: [0,0,0,1], ix: ... } }
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
      if (Array.isArray(val)) {
        val.forEach(visit)
      } else if (val && typeof val === 'object') {
        visit(val)
      }
    }
  }

  visit(node)
}

const LoaderAnimation = ({
  loaderModal,
  isOpen,
  title = 'Your agent is building..',
}) => {
  const [isSubaccount, setIsSubaccount] = useState(false)

  const subaccountLoaderAnimation = useMemo(() => {
    try {
      // eslint-disable-next-line global-require
      return require('../../public/assets/animation/subAccountLoader.json')
    } catch (e) {
      return null
    }
  }, [])

  const brandedSubaccountLoaderAnimation = useMemo(() => {
    if (typeof window === 'undefined') return subaccountLoaderAnimation
    if (!subaccountLoaderAnimation) return null

    const rgba01 = getBrandPrimaryRgb01()
    if (!rgba01) return subaccountLoaderAnimation

    // Deep clone so we don't mutate the cached require() object
    const cloned = JSON.parse(JSON.stringify(subaccountLoaderAnimation))
    recolorPureBlackTo(cloned, rgba01)
    return cloned
  }, [subaccountLoaderAnimation])

  useEffect(() => {
    // Only read localStorage in browser
    try {
      // Method 1: Check if user is already registered as agency or subaccount
      const raw = localStorage.getItem('User')
      if (raw) {
        const parsed = JSON.parse(raw)
        const role =
          parsed?.user?.userRole || parsed?.userRole || parsed?.role || null
        if (role === 'AgencySubAccount' || role === 'Agency') {
          setIsSubaccount(true)
          return
        }
      }

      // Method 2: Check if user is signing up as subaccount (before registration)
      // Check for agency UUID in localStorage (set when visiting /onboarding/{uuid})
      // This works on localhost too - if UUID is present, show subaccount loader
      const hasAgencyUuid = hasAgencyUUID()
      if (hasAgencyUuid) {
        setIsSubaccount(true)
        return
      }

      // Method 3: Check for custom domain (hostname-based detection)
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        // If hostname is not localhost/127.0.0.1 and not the default domain,
        // it might be a custom agency domain
        const isCustomDomain =
          hostname &&
          !hostname.includes('localhost') &&
          !hostname.includes('127.0.0.1') &&
          !hostname.includes('assignx.ai') &&
          !hostname.includes('app.assignx.ai') &&
          !hostname.includes('app.promptsavvy.ai') &&
          !hostname.includes('dev.assignx.ai')
        
        if (isCustomDomain) {
          setIsSubaccount(true)
          return
        }
      }

      // Method 4: Check URL path for agency UUID pattern
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname
        const uuidPattern = /\/onboarding\/([^\/]+)/
        if (uuidPattern.test(pathname)) {
          setIsSubaccount(true)
          return
        }
      }

      // No subaccount indicators found
      setIsSubaccount(false)
    } catch (e) {
      console.error('Error detecting subaccount status:', e)
      setIsSubaccount(false)
    }
  }, [loaderModal, isOpen])

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '600',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
      borderRadius: '7px',
    },
    errmsg: {
      fontSize: 12,
      fontWeight: '500',
      borderRadius: '7px',
    },
    modalsStyle: {
      height: 'auto',
      // bgcolor: "transparent",
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <div>
      <Modal
        open={loaderModal || isOpen}
        // onClose={() => loaderModal(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-4/12 sm:w-7/12 w-8/12 rounded-3xl bg-white"
          sx={styles.modalsStyle}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: 'transparent',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row items-start mt-12 justify-center">
                {/* <CircularProgress size={200} thickness={1} /> */}
                {isSubaccount && subaccountLoaderAnimation ? (
                  <div
                    className="w-[160px] h-[160px] rounded-full"
                    style={{
                      // brand glow behind lottie
                      boxShadow:
                        '0 0 0 10px hsl(var(--brand-primary) / 0.08), 0 24px 70px -24px hsl(var(--brand-primary) / 0.55)',
                    }}
                  >
                    <Lottie
                      animationData={
                        brandedSubaccountLoaderAnimation ||
                        subaccountLoaderAnimation
                      }
                      loop
                      autoplay
                    />lotie
                  </div>
                ) : (
                  <div
                    className="rounded-full"
                    style={{
                      boxShadow:
                        '0 0 0 10px hsl(var(--brand-primary) / 0.08), 0 24px 70px -24px hsl(var(--brand-primary) / 0.55)',
                    }}
                  >
                    <AgentXOrb
                      width={152}
                      height={142}
                      style={{
                        height: '142px',
                        width: '152px',
                        resize: 'contain',
                      }}
                    />orb
                  </div>
                )}
              </div>

              <div
                className="text-center mt-8"
                style={{ fontWeight: '600', fontSize: 16 }}
              >
                {title}tt
              </div>

              {/* <div className='text-center mt-6 pb-8' style={{ fontWeight: "400", fontSize: 15 }}>
                                Loading ...
                            </div> */}

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default LoaderAnimation
