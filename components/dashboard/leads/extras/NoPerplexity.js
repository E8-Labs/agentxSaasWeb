import { Box, CircularProgress, Modal, Tooltip } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import getProfileDetails from '@/components/apis/GetProfile'
import AddCardDetails from '@/components/createagent/addpayment/AddCardDetails'
import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
  TypographyBodyMedium,
  TypographyTitle,
  TypographyH2,
} from '@/lib/typography'

function NoPerplexity({
  setshowConfirmPerplexity,
  handleEnrichLead,
  loading,
  creditCost,
}) {
  const stripePromise = getStripe()

  const [userLocalData, setUserLocalData] = useState('')

  const [showAddCard, setShowAddCard] = useState(false)

  useEffect(() => {
    const getData = async () => {
      let Authtoken = null
      let localDetails = null
      const localData = localStorage.getItem('User')

      if (localData) {
        const Data = JSON.parse(localData)
        localDetails = Data
        Authtoken = Data.token
        setUserLocalData(Data.user)
      }
      let user = await getProfileDetails()
      if (user) {
        setUserLocalData(user.data.data)
      }
    }

    getData()
  }, [])

  const handleClose = (data) => {
    if (data) {
      setShowAddCard(false)
      if (userLocalData?.enrichCredits > 0) {
        handleEnrichLead()
      } else {
        setshowConfirmPerplexity(true)
      }
      // setCards([newCard, ...cards]);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full h-[40vh] ">
      {/* {
                userLocalData?.enrichCredits > 0 ? ( */}

      <TypographyBodyMedium className="self-end mt-[10px] mb-[30px]">
        Credits: {userLocalData?.enrichCredits || 0}
      </TypographyBodyMedium>
      {/* ) : (
                    <div style={{ marginBottom: '60px' }}></div>
                )
            } */}

      <div
        style={{
          width: 30,
          height: 30,
          backgroundColor: 'hsl(var(--brand-primary))',
          maskImage: 'url(/otherAssets/starsIcon2.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/otherAssets/starsIcon2.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />

      <TypographyTitle>Enrich Leads</TypographyTitle>

      <TypographyBodyMedium className="w-[30vw] text-center">
        {`By enriching this lead, you're giving your AI valuable context — pulling in public data to better understand who this person is and how to engage with them.`}
      </TypographyBodyMedium>

      <div className="flex flex-row items-center gap-2">
        <TypographyBodyMedium className="text-muted-foreground">
          credit cost (${creditCost?.pricePerLead}/lead)
        </TypographyBodyMedium>

        <Tooltip
          title="This is the cost for us to run the enrichment process."
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: '#ffffff', // Ensure white background
                color: '#333', // Dark text color
                fontSize: '16px',
                fontWeight: '500',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
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
            src={'/svgIcons/infoIcon.svg'}
            height={16}
            width={16}
            alt="*"
            style={{ filter: 'brightness(0)' }}
          />
        </Tooltip>
      </div>

      {loading ? (
        <CircularProgress size={27} sx={{ color: 'hsl(var(--brand-primary))' }} />
      ) : (
        <button
          className="h-[53px] p-3 flex flex-row gap-2 rounded-lg bg-brand-primary items-center justify-center text-white"
          onClick={() => {
            if (userLocalData?.cards?.length == 0) {
              setShowAddCard(true)
            } else {
              if (userLocalData?.enrichCredits > 0) {
                handleEnrichLead()
              } else {
                setshowConfirmPerplexity(true)
              }
            }
          }}
        >
          <Image
            src={'/svgIcons/sparklesWhite.svg'}
            height={16}
            width={16}
            alt="*"
          />
          <TypographyBodyMedium className="text-white">Enrich Lead</TypographyBodyMedium>
        </button>
      )}

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
          <TypographyH2>Payment Details</TypographyH2>
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

export default NoPerplexity

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
