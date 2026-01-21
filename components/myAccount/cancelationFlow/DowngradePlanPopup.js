import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Checkbox } from '@/components/ui/checkbox'
import { next30Days } from '@/constants/Constants'

// Helper function to get brand primary color as hex
const getBrandPrimaryHex = () => {
  if (typeof window === 'undefined') return '#7902DF'
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  if (brandPrimary) {
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2
      
      let r = 0, g = 0, b = 0
      
      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0
      } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x
      } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c
      } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h < 1) {
        r = c; g = 0; b = x
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return '#7902DF'
}

function DowngradePlanPopup({
  open,
  handleClose,
  onConfirm,
  downgradeTitle,
  features,
  subscribePlanLoader,
  isFrom,
  selectedUser,
}) {
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [nxtCharge, setNxtChage] = useState(null)

  // Get brand primary color for styling
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')

  useEffect(() => {
    const updateBrandColor = () => {
      setBrandPrimaryColor(getBrandPrimaryHex())
    }
    
    updateBrandColor()
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])

  useEffect(() => {
    getUserData()
  }, [])

  const getUserData = () => {
    let data = localStorage.getItem('User')

    if (data) {
      let u = JSON.parse(data)
      let date = u.user.nextChargeDate

      date = moment(date).format('MM/DD/YYYY')
      setNxtChage(date)
    }
  }

  return (
    <Modal
      open={open}
      // onClose={handleClose()}
      //     handleResetValues();
      //     handleClose("");
      // }}
    >
      {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
      <Box className="bg-white max-h-[90vh] overflow-auto rounded-xl w-6/12 md:w-6/12 lg:w-[35%] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-full flex flex-col items-center justify-between h-[100%]">
          <div className="w-full flex flex-col items-center justify-center px-4 pt-4 h-[90%] ">
            <div className="w-full flex flex-row items-start justify-end  ">
              <CloseBtn onClick={handleClose} />
            </div>
            <div className="flex flex-col items-center gap-2 h-full py-4 ">
              <div
                className="-mt-5"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'hsl(var(--brand-primary))',
                  WebkitMaskImage: 'url(/otherAssets/IconAccount.png)',
                  maskImage: 'url(/otherAssets/IconAccount.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
              <div className="text-center text-xl font-semibold">
                {downgradeTitle}
              </div>

              <div className="flex flex-col items-center justify-center w-full ">
                <div className="text-center text-sm font-normal">
                  {`This means you’ll lose access to the premium features below starting ${nxtCharge}. Still want to move forward?`}
                </div>

                <div className="text-center text-sm font-normal mt-2 mb-1">
                  {`You’ll lose access to`}
                </div>

                <div
                  className=" overflow-y-auto  "
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 w-full mt-2 place-items-center">
                    {isFrom
                      ? Array.isArray(features) &&
                        features?.map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-row items-center gap-2 w-full"
                          >
                            <Checkbox
                              checked={true}
                              className="h-4 w-4 !rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                            />
                            <div className="text-[13px] font-normal flex flex-row items-center gap-2">
                              <span>{item?.text}</span>
                              {item.subtext && (
                                <Tooltip
                                  title={item.subtext}
                                  arrow
                                  placement="top"
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#ffffff', // Ensure white background
                                        color: '#333', // Dark text color
                                        fontSize: '14px',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        boxShadow:
                                          '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                                      },
                                    },
                                    arrow: {
                                      sx: {
                                        color: '#ffffff', // Match tooltip background
                                      },
                                    },
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: '600',
                                      color: '#000000',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Image
                                      src="/agencyIcons/InfoIcon.jpg"
                                      alt="info"
                                      width={16}
                                      height={16}
                                      className="cursor-pointer rounded-full"
                                    />
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        ))
                      : Array.isArray(features) &&
                        features?.map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-row items-center gap-2 w-full"
                          >
                            <Checkbox
                              checked={true}
                              className="h-4 w-4 !rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                            />
                            <div className="text-[13px] font-normal">
                              {item}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[10%] w-full pb-4 px-4">
            <div className="flex flex-row items-center w-full justify-start mt-2 gap-2">
              <button
                onClick={() => {
                  setConfirmChecked(!confirmChecked)
                }}
              >
                {confirmChecked ? (
                  <div
                    className="flex flex-row items-center justify-center rounded"
                    style={{ 
                      height: '17px', 
                      width: '17px',
                      backgroundColor: brandPrimaryColor
                    }}
                  >
                    <Image
                      src={'/assets/whiteTick.png'}
                      height={6}
                      width={8}
                      alt="*"
                    />
                  </div>
                ) : (
                  <div
                    className="bg-none border-2 flex flex-row items-center justify-center rounded"
                    style={{ height: '17px', width: '17px' }}
                  ></div>
                )}
              </button>

              <div className="text-xs font-normal">
                {`I confirm that i’ll lose access to features.`}
              </div>
            </div>
            {subscribePlanLoader ? (
              <div className="w-full flex flex-row items-center justify-center mt-5 h-[40px]">
                <CircularProgress size={30} />
              </div>
            ) : (
              <button
                className={`w-full flex items-center rounded-lg justify-center mt-5 border h-[40px] ${!confirmChecked ? 'bg-btngray text-black' : 'text-white'}`}
                style={{
                  fontWeight: '400',
                  fontSize: 15.8,
                  outline: 'none',
                  backgroundColor: confirmChecked ? brandPrimaryColor : undefined,
                }}
                disabled={!confirmChecked}
                onClick={() => {
                  onConfirm()
                }}
              >
                Confirm Cancellation
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default DowngradePlanPopup
