import { Tooltip } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Checkbox } from '@/components/ui/checkbox'

import { formatFractional2 } from './AgencyUtilities'

const ConfigureSideUI = ({
  tag,
  discountedPrice,
  title,
  planDescription,
  trialValidForDays,
  allowTrial,
  allowedFeatures,
  basicsData,
  features,
  from,
  handleClose,
  handleResetValues,
}) => {
  // console.log("Passed allwoed features are", allowedFeatures);
  const [isAgency, setIsAgency] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          setIsAgency(userRole === 'Agency' || userRole === 'AgencySubAccount')
        }
      } catch (error) {
        console.log('Error parsing user data:', error)
      }
    }
  }, [])

  return (
    <div
      className={`w-full h-full ${from === 'dashboard' ? 'rounded-xl' : 'rounded-tr-xl rounded-br-xl'}`}
      style={
        isAgency
          ? {
              background: `linear-gradient(to bottom right, hsl(var(--brand-primary)), hsl(var(--brand-primary))100%)`,
            }
          : {
              backgroundImage: "url('/otherAssets/monthlyplansbg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
      }
    >
      <div className="p-4 flex flex-col items-center h-[100%]">
        <div className="flex justify-end w-full items-center h-[5%]">
          <CloseBtn
            // disabled={createPlanLoader}
            onClick={() => {
              handleClose()
              handleResetValues()
            }}
            showWhiteCross={true}
          />
        </div>
        <div
          className={`${from === 'dashboard' ? 'w-[90%]' : 'w-9/12'} h-[95%] flex flex-col items-center justify-start mt-[5vh] overflow-auto scrollbar-hide`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div 
            className="w-full rounded-lg flex flex-col items-center"
            style={{
              background: `linear-gradient(to bottom, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.4) 100%)`,
            }}
          >
            <div className="flex flex-row items-center gap-2 pt-4">
              <Image
                src="/svgIcons/powerWhite.svg"
                // "/svgIcons/power.svg"
                height={24}
                width={24}
                alt="*"
              />

              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: 'white', //: '#7902df'
                }}
              >
                {basicsData?.tag || 'Tag'}
              </div>
              <Image
                src="/svgIcons/enterArrowWhite.svg"
                // "/svgIcons/enterArrow.svg"
                height={20}
                width={20}
                alt="*"
              />
            </div>
            <div className="bg-white rounded-lg mt-2 mb-2 p-4 flex flex-col items-center w-[95%]">
              <div className="flex flex-row items-center justify-between w-full">
                <div />
                {from === 'dashboard' ? (
                  <div
                    className="text-center"
                    style={{ fontWeight: '700', fontSize: '29px' }}
                  >
                    {basicsData.title || 'Title'}
                  </div>
                ) : (
                  <div
                    className="text-center"
                    style={{ fontWeight: '700', fontSize: '29px' }}
                  >
                    {basicsData.title || 'Title'}
                  </div>
                )}
                <div>
                  {from === 'dashboard' && (
                    <div className="text-sm font-medium capitalize bg-[#A9A9A940] text-[#A9A9A9] rounded-full px-2 py-1">
                      {basicsData?.duration}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{ fontWeight: '700', fontSize: '35px' }}
                className="text-center mt-4 font-bold text-[35px]"
              >
                {basicsData?.originalPrice > 0 && (
                  <span
                    className="text-[#00000020] line-through"
                    style={{ fontWeight: '700', fontSize: '30px' }}
                  >
                    ${formatFractional2(basicsData?.originalPrice) || ''}
                  </span>
                )}
                <span
                  className="ms-2"
                  style={{ 
                    fontWeight: '700', 
                    fontSize: '35px',
                    color: 'hsl(var(--brand-primary))',
                  }}
                >
                  $
                  {formatFractional2(
                    // basicsData.discountedPrice is now the total price per month (not price per credit)
                    basicsData?.discountedPrice || 0,
                  )}
                </span>
              </div>
              <div
                className="text-center"
                style={{ fontWeight: '500', fontSize: '15px' }}
              >
                {basicsData?.planDescription || 'Desc text goes here'}
              </div>
              <button className="bg-brand-primary h-[41px] mt-4 rounded-lg text-center text-white w-full">
                {allowTrial && trialValidForDays ? (
                  <span>{trialValidForDays} Day Free Trial</span>
                ) : (
                  'Get Started'
                )}
              </button>
              {Array.isArray(allowedFeatures) &&
                allowedFeatures?.length > 0 && (
                  <div className="w-full">
                    {Array.isArray(allowedFeatures) &&
                      allowedFeatures.map((item) => {
                        return (
                          <div
                            key={item.id}
                            className="w-full flex flex-row items-center gap-2 mt-6"
                          >
                            <Checkbox checked={true} className="h-4 w-4" />
                            <div
                              className="flex flex-row items-center gap-2"
                              style={{
                                whiteSpace: 'nowrap',
                                width: '100%',
                                borderWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  borderWidth: 0,
                                }}
                              >
                                {item.text}
                              </div>
                              {from === 'dashboard' && item?.subtext && (
                                <Tooltip
                                  title={item?.subtext}
                                  placement="top"
                                  arrow
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#ffffff', // Ensure white background
                                        color: '#333', // Dark text color
                                        fontSize: '10px',
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
                                  <Image
                                    src="/otherAssets/infoLightDark.png"
                                    alt="info"
                                    width={14}
                                    height={14}
                                    className="cursor-pointer rounded-full"
                                  />
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigureSideUI
