import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import CloseBtn from '../globalExtras/CloseBtn'

const YearlyPlanModal = ({
  open,
  handleClose,
  onContinueYearly,
  onContinueMonthly,
  selectedDuration = null,
  loading = false,
  isFree = false,
}) => {
  let description = isFree
    ? 'We have our free plan available for users that want to try before committing. Enjoy!'
    : `All annual plans get 30% discount compared to ${selectedDuration ? selectedDuration.title : 'monthly'} plans`

  let title = isFree ? 'Get started for free!' : 'Pay less with annual billing'
  let heading = isFree ? 'No Credit Card Required ' : 'Subscribe to yearly plan'
  let tag = isFree ? 'No Credit Card' : '2 months free'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
        },
      }}
    >
      <Box className="flex justify-center items-center w-full h-full px-4">
        <div
          className="w-[400px] max-w-[90vw] flex flex-col overflow-hidden rounded-[12px] bg-white border border-[#eaeaea] shadow-[0_4px_36px_rgba(0,0,0,0.25)]"
        >
          {/* Header */}
          <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-[#eaeaea]">
            <div className="text-[16px] font-semibold text-black">
              {title}
            </div>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-lg">$</span>
            </div>
            <div className="flex-1 text-[14px] text-[rgba(0,0,0,0.8)]">
              <div className="mb-2 font-semibold">
                {heading} 🎉
              </div>
              <div className="text-[14px] leading-relaxed">
                {description}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-row items-center justify-between px-4 py-3 border-t border-[#eaeaea] gap-3">
            {isFree ? (
              loading ? (
                <div className="w-full flex items-center justify-center py-1">
                  <CircularProgress size={20} />
                </div>
              ) : (
                <button
                  onClick={onContinueMonthly}
                  className="h-[40px] w-full rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98]"
                >
                  Continue on Free Plan
                </button>
              )
            ) : (
              <>
                {loading ? (
                  <div className="w-full flex items-center justify-center py-1">
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={onContinueMonthly}
                      className="h-[40px] flex-1 rounded-lg bg-muted px-4 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98]"
                    >
                      {`Continue ${selectedDuration ? selectedDuration.title : 'Monthly'}`}
                    </button>
                    <button
                      onClick={onContinueYearly}
                      className="h-[40px] flex-1 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98]"
                    >
                      Get Yearly
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default YearlyPlanModal
