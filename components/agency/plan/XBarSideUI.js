import React from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

const XBarSideUI = ({
  handleResetValues,
  handleClose,
  title,
  tag,
  planDescription,
  originalPrice,
  discountedPrice,
  minutes,
  from,
}) => {
  return (
    <div
      className={`${from === 'dashboard' ? 'w-full' : 'w-5/12'} h-full ${from === 'dashboard' ? 'rounded-xl' : 'rounded-tr-xl rounded-br-xl'} shadow-lg`}
      style={{
        // backgroundImage: "url('/agencyIcons/addPlanBg4.png')",
        backgroundImage: "url('/otherAssets/monthlyplansbg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="p-4 flex flex-col items-center h-[100%]">
        <div className="flex justify-end w-full items-center h-[5%]">
          <CloseBtn
            onClick={() => {
              handleClose('')
              if (handleResetValues) {
                handleResetValues()
              }
            }}
            showWhiteCross={true}
          />
        </div>
        {/*
                            (allowTrial && trialValidForDays) && (
                                <div className='w-11/12 rounded-t-xl bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Image
                                            src={"/agencyIcons/batchIcon.jpg"}
                                            alt='*'
                                            height={24}
                                            width={24}
                                        />
                                        <div style={{ fontWeight: "600", fontSize: 18, color: "white" }}>
                                            First {trialValidForDays} Days Free
                                        </div>
                                    </div>
                                </div>
                            )
                        */}
        <div className="w-11/12 h-[80%] flex flex-col items-center justify-center">
          <div
            className="px-4 py-1 pb-4"
            style={{
              ...styles.pricingBox,
              border: 'none',
              backgroundColor: 'white',
            }}
          >
            <div
              style={{
                ...styles.triangleLabel,
                borderTopRightRadius: '15px',
              }}
            ></div>
            {/* Triangle price here */}
            {discountedPrice && originalPrice && (
              <span style={styles.labelText}>
                {(
                  ((discountedPrice - originalPrice) / discountedPrice) *
                  100
                ).toFixed(0) || '-'}
                %
              </span>
            )}
            <div
              className="flex flex-row items-start gap-3"
              style={styles.content}
            >
              <div className="w-full">
                <div className="flex flex-row items-center gap-3">
                  <div
                    style={{
                      color: '#151515',
                      fontSize: 22,
                      fontWeight: '600',
                    }}
                  >
                    {title || 'XBar'} | {minutes || 'Bonus Credits'}
                  </div>
                  {tag ? (
                    <div
                      className="rounded-full bg-purple text-white p-3 py-1"
                      style={{ fontSize: 14, fontWeight: '500' }}
                    >
                      {tag}
                    </div>
                  ) : (
                    <div className="rounded-md bg-gray-200 text-white w-[127px] h-[28px]" />
                  )}
                </div>
                <div className="flex flex-row items-center justify-between mt-2">
                  <div className="flex flex-col justify-start">
                    {planDescription ? (
                      <div
                        className=""
                        style={{
                          color: '#00000060',
                          fontSize: 15,
                          //   width: "60%",
                          fontWeight: '500',
                        }}
                      >
                        {planDescription}
                      </div>
                    ) : (
                      <div className="rounded-md bg-gray-200 text-white w-[150px] h-[32px]" />
                    )}
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {discountedPrice && (
                      <div
                        style={styles.originalPrice}
                        className="line-through"
                      >
                        ${discountedPrice}
                      </div>
                    )}
                    {originalPrice && (
                      <div className="flex flex-row justify-start items-start ">
                        <div style={styles.discountedPrice}>
                          ${originalPrice}
                        </div>
                        <p style={{ color: '#15151580' }}></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default XBarSideUI

const styles = {
  labels: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#00000050',
  },
  inputs: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#000000',
  },
  text: {
    fontSize: '15px',
    fontWeight: '500',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: '700',
  },

  //style for plans
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  pricingBox: {
    position: 'relative',
    // padding: '10px',
    borderRadius: '15px',
    // backgroundColor: '#f9f9ff',
    display: 'inline-block',
    width: '100%',
  },
  triangleLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '50px solid #7902DF', // Increased height again for more padding
    borderLeft: '50px solid transparent',
  },
  labelText: {
    position: 'absolute',
    top: '10px', // Adjusted to keep the text centered within the larger triangle
    right: '5px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
  },
  content: {
    textAlign: 'left',
    paddingTop: '10px',
  },
  originalPrice: {
    // textDecoration: "line-through",
    color: '#00000020',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 22,
    // marginLeft: "10px",
  },
}
