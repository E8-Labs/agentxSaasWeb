import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  Typography,
} from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { getUserLocalData } from '@/components/constants/constants'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'

export default function DncConfirmationPopup({
  open,
  onClose,
  onCancel,
  onConfirm,
  leadsCount,
}) {
  //console.log;
  const stripePromise = getStripe()

  const [userData, setUserData] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [creditCost, setCreditCost] = useState(null)
  const [minimumCost, setMinimumCost] = useState(null)
  const [isMinimumEnforced, setIsMinimumEnforced] = useState(false)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUserData(data)
    }
  }, [])

  const getCreditCost = async () => {
    if (!userData || !leadsCount) return

    const isAgencySubAccount = userData?.user?.userRole === 'AgencySubAccount'

    // Check if we need to enforce minimum for agency subaccount
    if (isAgencySubAccount && leadsCount < 100) {
      // Calculate cost for 100 leads (minimum requirement)
      let minimumData = {
        leadCount: 100,
        type: 'dnc',
      }
      const minimumCostData = await calculateCreditCost(minimumData)
      console.log(
        'DncConfirmationPopup - minimumCostData for 100 leads',
        minimumCostData,
      )
      setMinimumCost(minimumCostData)
      setIsMinimumEnforced(true)

      // Also get the cost for the actual lead count to show comparison
      let data = {
        leadCount: leadsCount,
        type: 'dnc',
      }
      const credit = await calculateCreditCost(data)
      console.log('credit cost is', credit)
      setCreditCost(credit)
    } else {
      // Normal flow - calculate for actual lead count
      let batchSize = leadsCount
      console.log('batchSize is', batchSize)
      const credit = await calculateCreditCost({
        leadCount: batchSize,
        type: 'dnc',
      })
      console.log('credit cost is', credit)
      setCreditCost(credit)
      setIsMinimumEnforced(false)
      setMinimumCost(null)
    }
  }

  useEffect(() => {
    if (open && userData) {
      getCreditCost()
    }
  }, [open, userData, leadsCount])

  // Use minimum cost if enforced, otherwise use creditCost
  const displayLeadCount =
    isMinimumEnforced && minimumCost
      ? minimumCost?.creditsToReceive || 100
      : leadsCount
  const displayPricePerLead =
    isMinimumEnforced && minimumCost
      ? minimumCost?.pricePerLead || minimumCost?.pricing?.agencyPrice || '0.03'
      : creditCost?.pricePerLead || creditCost?.pricing?.agencyPrice || '0.03'
  const displayTotalCost =
    isMinimumEnforced && minimumCost
      ? minimumCost?.totalCharge || 0
      : creditCost?.totalCharge ||
        (leadsCount < 34 ? 1 : leadsCount * (creditCost?.pricePerLead || 0))

  const handleClose = (data) => {
    console.log('data of add card', data)
    if (data) {
      setShowAddCard(false)
      onConfirm()
      // setCards([newCard, ...cards]);
    }
  }
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
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
        <div className="flex w-full justify-end">
          <CloseBtn onClick={onClose} />
        </div>
        {/* Modal Title */}
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '20px', mt: 1 }}>
          Confirm DNC Charges
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
                {`${leadsCount} leads selected. Minimum payment is for 100 leads.`}
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
                  {`DNC Checklist is $${formatDecimalValue(displayPricePerLead)}/number.`}
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
                  {`If less than 20 leads, it's $1.`}
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
              ${formatFractional2(displayPricePerLead)}
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
                : displayLeadCount < 34
                  ? '1.00'
                  : (displayPricePerLead * displayLeadCount).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>

        {/* Buttons */}
        <DialogActions sx={{ justifyContent: 'space-between', mt: 3 }}>
          <div
            onClick={onClose}
            className=" flex w-[45%] text-[#6b7280] font-bold text-[16px]  py-3
                     items-center justify-center"
            style={{ textTransform: 'none', cursor: 'pointer' }}
          >
            Cancel
          </div>

          {/* <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            backgroundColor: "#7902DF",
            color: "white",
            borderRadius: "8px",
            padding: "10px 20px",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Confirm & Pay
        </Button> */}
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-brand-primary font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              if (userData?.user?.cards?.length === 0) {
                setShowAddCard(true)
              } else {
                onConfirm()
              }
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
        </DialogActions>
      </Dialog>

      {/* Add Payment Modal */}
      <Modal
        open={showAddCard} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: '600',
                  }}
                >
                  Payment Details
                </div>
                <button onClick={() => setShowAddCard(false)}>
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  //selectedPlan={selectedPlan}
                  // stop={stop}
                  // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={''}
                  // fromAdmin={true}
                  // selectedUser={selectedUSer}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

const styles = {
  paymentModal: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  claimPopup: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}
