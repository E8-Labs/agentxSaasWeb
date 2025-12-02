import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Checkbox } from '@/components/ui/checkbox'

import { formatFractional2 } from './AgencyUtilities'

const SideUI = ({
  tag,
  discountedPrice,
  title,
  planDescription,
  trialValidForDays,
  allowTrial,
  handleClose,
  handleResetValues,
  minutes,
  originalPrice,
  allowedFeatures,
}) => {
  const price = discountedPrice * minutes
  console.log('discountedPrice is', price)
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
      className="w-full h-full rounded-tr-xl rounded-br-xl"
      style={
        isAgency
          ? {
              background: `linear-gradient(to bottom right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary)) 100%)`,
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
          className="w-9/12 h-[95%] flex flex-col items-center justify-start pt-4 overflow-auto scrollbar-hide"
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
                {tag || 'Tag'}
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
              <div
                className="text-center"
                style={{ fontWeight: '700', fontSize: '29px' }}
              >
                {title || 'Title'}
              </div>
              <div className="text-center mt-4">
                {originalPrice && (
                  <span
                    className="text-[#00000020] line-through"
                    style={{ fontWeight: '700', fontSize: '30px' }}
                  >
                    ${formatFractional2(originalPrice) || ''}
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
                  ${formatFractional2(price) || '0'}
                </span>
              </div>
              <div
                className="text-center"
                style={{ fontWeight: '500', fontSize: '15px' }}
              >
                {planDescription || 'Desc text goes here'}
              </div>
              <button className="bg-brand-primary h-[41px] mt-4 rounded-lg text-center text-white w-full">
                Get Started{' '}
                {allowTrial ? <span>| {trialValidForDays}</span> : ''}
              </button>
              {allowedFeatures?.length > 0 && (
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

export default SideUI
