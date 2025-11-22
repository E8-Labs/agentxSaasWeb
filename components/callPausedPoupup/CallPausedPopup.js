import { Box, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'

import PlansView from './PlansView'
import UpgradePlanView from './UpgradePlanView'

function CallPausedPopup({ open, onClose }) {
  const [step, setStep] = useState('plans') // 'plans' | 'upgrade'
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleClose = () => {
    setStep('plans') // Reset on close
    onClose()
  }

  const handlePlanSelect = () => {
    setStep('upgrade')
  }

  const handleCancelUpgrade = () => {
    setStep('plans')
  }

  const handleUpgradeConfirm = () => {
    // Your logic for upgrading the plan
    handleClose()
  }

  return (
    <Modal
      open={open}
      closeAfterTransition
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
        },
      }}
      onClose={handleClose}
    >
      <Box className="w-full h-full flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-xl w-7/12 p-8 flex flex-col items-center gap-8 relative overflow-hidden">
          <div
            className="absolute left-0 bottom-0 w-full h-[400px]
                        pointer-events-none z-0 opacity-70"
            style={{
              backgroundImage: "url('/otherAssets/halfOrb.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
            }}
          />
          {step === 'plans' ? (
            <PlansView
              handleClose={handleClose}
              onPlanSelect={handlePlanSelect}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
            />
          ) : (
            <UpgradePlanView
              onCancel={handleCancelUpgrade}
              selectedPlan={selectedPlan}
              onClose={handleClose}
            />
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default CallPausedPopup

const styles = {
  paymentModal: {
    // height: "auto",
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    // my: "50vh",
    // transform: "translateY(-50%)",
    borderRadius: 2,
    border: 'none',
    outline: 'none',
    height: '100svh',
  },
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  pricingBox: {
    position: 'relative',
    // padding: '10px',
    borderRadius: '10px',
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
    textDecoration: 'line-through',
    color: '#7902DF65',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
    whiteSpace: 'nowrap',
  },
}
