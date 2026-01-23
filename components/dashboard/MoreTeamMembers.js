import { Box, Modal } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import CloseBtn from '../globalExtras/CloseBtn'

const MoreTeamMembers = ({
  open,
  onClose,
  onUpgrade,
  onAddTeamSeat,
  costPerAdditionalTeamSeat = 10,
  from = '',
}) => {
  const router = useRouter()

  const handleUpgrade = () => {
    onUpgrade()
    onClose()
  }

  const handleAddTeamSeat = () => {
    onAddTeamSeat()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(15px)',
        },
      }}
    >
      <Box
        className="flex justify-center items-center w-full h-full"
        sx={{
          outline: 'none',
        }}
      >
        <div
          className="bg-white rounded-2xl p-8 relative max-w-2xl w-full mx-4"
          style={{
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-row items-center justify-between w-full">
              <div></div>
              {/* Close Button */}
              <CloseBtn onClick={onClose} />
            </div>
            {/* Avatars */}

            <Image
              src="/otherAssets/unlockAgents.png"
              height={100}
              width={300}
              alt="Axel"
            />

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4 -mt-3">
              Add Team Members
            </h2>

            {/* Description */}
            <div className="text-center text-gray-600 mb-8 space-y-2">
              <p>
                You have reached the maximum number of team seats on your
                current plan. You can upgrade your plan or add team seats for{' '}
                <span className="font-semibold text-brand-primary">
                  ${costPerAdditionalTeamSeat}
                </span>{' '}
                per month.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Upgrade Button */}
              <button
                onClick={handleUpgrade}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Upgrade
              </button>

              {/* Add Agent Button */}
              <Link
                href=""
                onClick={handleAddTeamSeat}
                className="w-full text-brand-primary hover:text-brand-primary/90 font-semibold py-2 px-6 rounded-lg transition-colors block text-center"
                prefetch={true}
              >
                Add Team Seat for ${costPerAdditionalTeamSeat} per month
              </Link>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default MoreTeamMembers
