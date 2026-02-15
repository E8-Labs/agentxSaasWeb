import { Box, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import UpgradePlan from '@/components/userPlans/UpgradePlan'

function UnlockAgentModal({
  open,
  handleClose,
  title = 'Unlock More Agents',
  subTitle = 'Upgrade to add more agents to your team and scale your sales operation',
  desc = '',
  buttonTitle = 'No Thanks',
}) {
  const stripePromise = getStripe()

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <div className="w-full">
      <Modal
        open={open}
        // onClose={handleClose()}
        //     handleResetValues();
        //     handleClose("");
        // }}
      >
        {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
        <Box className="bg-white h-auto overflow-auto rounded-xl w-11/12 sm:w-10/12 md:w-6/12 lg:w-4/12 xl:w-5/12 2xl:w-4/12 border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-full ">
            <div className="w-full flex flex-col items-center justify-center px-8 pt-4">
              <div className="w-full flex flex-row items-start justify-end">
                <CloseBtn
                  onClick={() => {
                    handleClose()
                  }}
                />
              </div>
              <Image
                className=""
                src="/otherAssets/unlockAgents.png"
                height={50}
                width={300}
                alt="Axel"
              />

              <div className="flex flex-row items-center -mt-10">
                <div
                  className="text-brand-primary"
                  style={{ fontSize: '29px', fontWeight: '700' }}
                >
                  {title}
                </div>
                <Image
                  alt="*"
                  src={'/otherAssets/starsIcon2.png'}
                  height={28}
                  width={26}
                />
              </div>
              <div
                className="mt-3 w-full text-center"
                style={{ fontSize: '16px', fontWeight: '400' }}
              >
                {desc} <br /> Please upgrade your plan to add additional agents.
              </div>
            </div>

            <div
              className="w-full h-[200px] flex flex-col items-center justify-end -mt-10"
              style={{
                backgroundImage: "url('/otherAssets/gradientBg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // borderRadius:'20px'
              }}
            >
              <button
                className="mt-10 h-[54px] w-[50%] px-10 rounded-xl bg-brand-primary text-white text-center flex flex-row items-center justify-center hover:bg-brand-primary/90"
                style={{ fontSize: '15px', fontWeight: '500' }}
                onClick={() => {
                  setShowUpgradeModal(true)
                }}
              >
                Upgrade
              </button>

              <button
                className="text-brand-primary mt-4 pb-8"
                style={{ fontSize: '15px', fontWeight: '500' }}
                onClick={() => {
                  handleClose()
                }}
              >
                {buttonTitle}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
      {/* UpgradePlan Modal */}
      {showUpgradeModal && (
        <Elements stripe={stripePromise}>
          <UpgradePlan
            open={showUpgradeModal}
            handleClose={(result) => {
              setShowUpgradeModal(false)
              if (result) {
                // Plan was upgraded successfully, close the unlock modal too
                handleClose(true)
              }
            }}
            setSelectedPlan={() => {}}
          />
        </Elements>
      )}
    </div>
  );
}

export default UnlockAgentModal
