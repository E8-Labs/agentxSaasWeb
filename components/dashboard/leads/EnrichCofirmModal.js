import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { getUserLocalData } from '@/components/constants/constants'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

export default function EnrichConfirmModal({
  showenrichConfirmModal,
  setShowenrichConfirmModal,
  handleAddLead,
  processedData,
  Loader,
  creditCost,
}) {
  const [userData, setUserData] = useState(null)
  const [minimumCost, setMinimumCost] = useState(null)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUserData(data)
    }
  }, [])

  useEffect(() => {
    const checkMinimumRequirement = async () => {
      if (!showenrichConfirmModal || !userData || !processedData) return

      const leadCount = processedData.length
      const isAgencySubAccount = userData?.user?.userRole === 'AgencySubAccount'

      // Check if we need to enforce minimum for agency subaccount
      if (isAgencySubAccount && leadCount < 100) {
        // Calculate cost for 100 leads (minimum requirement)
        let minimumData = {
          leadCount: 100,
          type: 'enrichment',
        }
        const minimumCostData = await calculateCreditCost(minimumData)
        console.log(
          'EnrichConfirmModal - minimumCostData for 100 leads',
          minimumCostData,
        )
        setMinimumCost(minimumCostData)
        setIsMinimumEnforced(true)
      } else {
        setIsMinimumEnforced(false)
        setMinimumCost(null)
      }
    }

    checkMinimumRequirement()
  }, [showenrichConfirmModal, userData, processedData])

  // Use minimum cost if enforced, otherwise use creditCost
  const displayLeadCount =
    isMinimumEnforced && minimumCost
      ? minimumCost?.creditsToReceive || 100
      : creditCost?.leadCount || processedData?.length
  const displayPricePerLead =
    isMinimumEnforced && minimumCost
      ? minimumCost?.pricePerLead || minimumCost?.pricing?.agencyPrice || '0.05'
      : creditCost?.pricePerLead || creditCost?.pricing?.agencyPrice || '0.05'
  const displayTotalCost =
    isMinimumEnforced && minimumCost
      ? minimumCost?.totalCharge || 0
      : creditCost?.totalCharge ||
        creditCost?.pricePerLead * creditCost?.leadCount

  return (
    <Dialog
      open={showenrichConfirmModal}
      onClose={() => setShowenrichConfirmModal(true)}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '24px',
          width: '500px',
          maxWidth: '90%',
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={() => setShowenrichConfirmModal(false)}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: '#000',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Modal Title */}
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '20px', mt: 1 }}>
        Confirm Lead Enrichment
      </DialogTitle>

      {/* Info Box */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          // gap: 1.5,
          backgroundColor: '#F6F0FF',
          padding: '8px 12px',
          borderRadius: '8px',
          mb: 1,
        }}
      >
        {isMinimumEnforced && minimumCost && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: '8px',
              mb: 0,
              width: '100%',
            }}
          >
            <InfoOutlinedIcon sx={{ color: '#7902DF', fontSize: 20 }} />
            <Typography
              sx={{ fontSize: '14px', color: '#000', fontWeight: '600' }}
            >
              {`${processedData?.length} leads selected. Minimum payment is for 100 leads.`}
            </Typography>
          </Box>
        )}
        {!isMinimumEnforced && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                // backgroundColor: "#F6F0FF",
                // padding: "12px 16px",
                borderRadius: '8px',
                mb: 0,
              }}
            >
              <InfoOutlinedIcon sx={{ color: '#7902DF', fontSize: 20 }} />
              <Typography sx={{ fontSize: '14px', color: '#000' }}>
                {`Enrichment is $${displayPricePerLead} / lead `}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                // backgroundColor: "#F6F0FF",
                // padding: "12px 16px",
                borderRadius: '8px',
                mb: 0,
              }}
            >
              <InfoOutlinedIcon sx={{ color: 'transparent', fontSize: 20 }} />
              <Typography sx={{ fontSize: '14px', color: '#000' }}>
                {`If less than 10 leads, it's $1.`}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Modal Content */}
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Total Leads
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            {displayLeadCount}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Cost Per Lead
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            ${displayPricePerLead}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            pt: 1,
            borderTop: '1px solid #ddd',
          }}
        >
          <Typography sx={{ color: '#000', fontSize: '16px' }}>
            Total Cost
          </Typography>
          <Typography sx={{ fontWeight: 'medium', fontSize: '16px' }}>
            $
            {typeof displayTotalCost === 'number'
              ? displayTotalCost.toFixed(2)
              : displayLeadCount <= 10
                ? '1.00'
                : (displayPricePerLead * displayLeadCount).toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: 'space-between', mt: 3 }}>
        <div
          onClick={() => setShowenrichConfirmModal(false)}
          className=" flex w-[45%] text-[#6b7280]font-bold text-[16px]  py-3 rounded-lg
                     items-center justify-center"
          style={{ textTransform: 'none', cursor: 'pointer' }}
        >
          Cancel
        </div>
        {Loader ? (
          <CircularProgress size={27} />
        ) : (
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              handleAddLead(true)
            }}
            style={{
              borderColor: '#ddd',
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'none',
              padding: '0.8rem',
              borderRadius: '10px',
              width: '45%',
            }}
          >
            Confirm & Pay
          </div>
        )}
        {/* <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={onConfirm}
            style={{
              borderColor: "#ddd",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              padding: "0.8rem",
              borderRadius: "10px",
              width: "45%",
            }}
          >
            Confirm
          </div> */}
      </DialogActions>
    </Dialog>
  )
}
