import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { PersistanceKeys } from '@/constants/Constants'

import Cnammain from '../cnamtab/Cnammain'
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus'
import ShowResubmitBtn from '../twilioExtras/ShowResubmitBtn'
import TestTwilioBtn from '../twilioExtras/TestTwilioBtn'
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip'
import LockDetailsView from './LockDetailsView'

const CenamDetails = ({
  twilioHubData,
  trustProducts,
  profileStatus,
  getProfileData,
  businessProfileData,
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showAddCNAM, setShowAddCNAM] = useState(false)
  //temporary CNAM Status
  const [cnamStatus, setCnamStatus] = useState('')
  // display name while in-review (before server returns or until approved/rejected)
  const [cnamPendingDisplayName, setCnamPendingDisplayName] = useState('')
  //show success snack
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })
  //allow add details btn
  const [allowAddDetails, setAllowAddDetails] = useState(true)

  useEffect(() => {
    checkCnamStatus()
    if (twilioHubData) {
      setAllowAddDetails(false)
    } else {
      setAllowAddDetails(true)
    }
  }, [twilioHubData])

  const checkCnamStatus = () => {
    const Data = localStorage.getItem('CNAMStatusReview')
    // When server data is empty (e.g. just added), show "added" state from localStorage
    if (!twilioHubData) {
      if (Data) {
        const data = JSON.parse(Data)
        setCnamStatus(data.status)
        setCnamPendingDisplayName(data.displayName || '')
        return
      }
      setCnamStatus('')
      setCnamPendingDisplayName('')
      localStorage.removeItem('CNAMStatusReview')
      return
    }
    if (!twilioHubData?.status && Data) {
      const data = JSON.parse(Data)
      setCnamStatus(data.status)
      setCnamPendingDisplayName(data.displayName || '')
      return
    }
    if (twilioHubData?.status) {
      setCnamStatus(twilioHubData?.status)
      setCnamPendingDisplayName('')
      localStorage.removeItem('CNAMStatusReview')
    } else {
      setCnamStatus('')
      setCnamPendingDisplayName('')
    }
  }

  //styles
  const styles = {
    fontSemiBold: {
      fontWeight: '700',
      fontSize: 18,
    },
    mediumfontLightClr: {
      fontWeight: '500',
      fontSize: 15,
      color: '#15151560',
    },
    mediumfontDarkClr: {
      fontWeight: '500',
      fontSize: 15,
      color: '#151515',
    },
    addBntStyles: {
      fontSize: 14,
      fontWeight: '500',
    },
  }

  return (
    <div className="border rounded-lg w-full">
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: '',
            isVisible: true,
            type: SnackbarTypes.Success,
          })
        }}
      />
      <div
        className={`flex flex-row items-center justify-between w-full ${showDetails && 'border-b-[1px]'}`}
      >
        <div className="w-full flex flex-row items-center justify-between px-4 py-2">
          <div className="flex flex-row items-center gap-2">
            <Image
              src={'/twiliohubassets/cnam.jpg'}
              alt="*"
              height={19}
              width={19}
            />
            <div style={styles.fontSemiBold}>CNAM</div>
            <div>
              <TwilioProfileToolTip
                toolTip={
                  "CNAM is the name that shows up on someone's phone when you call them — like AssignX Real Estate” or “John from ABC Corp.”"
                }
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            {(twilioHubData?.status || cnamStatus) && (
              <ShowResubmitBtn
                status={twilioHubData?.status || cnamStatus}
                handleOpenModal={() => {
                  setShowAddCNAM(true)
                }}
              />
            )}
            {/*
                            <TestTwilioBtn
                                handleClick={() => {
                                    setShowAddCNAM(true);
                                    console.log("test twilio btn clicked");
                                }}
                            />
                        */}
            <button
              className="border p-2 rounded-full"
              disabled={!twilioHubData && !cnamStatus}
              onClick={() => {
                setShowDetails(!showDetails)
              }}
            >
              {showDetails ? <CaretUp size={12} /> : <CaretDown size={12} />}
            </button>
          </div>
        </div>
      </div>
      {cnamStatus ? (
        <ShowRequestStatus status={cnamStatus} twilioData={twilioHubData} />
      ) : (
        <LockDetailsView
          profileStatus={profileStatus}
          handleShowAddModal={() => {
            setShowAddCNAM(true)
          }}
          businessProfileData={businessProfileData}
          twilioData={twilioHubData}
          unLockDescription="Add CNAM."
        />
      )}
      {showDetails && (
        <div className="w-full">
          <div className="w-full px-4 mb-4">
            <div className="flex flex-row items-center mt-2">
              <div className="w-1/2" style={styles.mediumfontLightClr}>
                CNAM display name
              </div>
              <div className="w-1/2" style={styles.mediumfontDarkClr}>
                {twilioHubData?.friendlyName ||
                  cnamPendingDisplayName ||
                  'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddCNAM && (
        <Cnammain
          friendlyName={businessProfileData}
          showAddCNAM={showAddCNAM}
          trustProducts={trustProducts}
          handleClose={(d) => {
            setShowAddCNAM(false)
            if (d) {
              const displayName =
                d.displayName ?? d.data?.friendlyName ?? ''
              const data = {
                message: 'CNAM is being reviewed',
                status: 'in-review',
                displayName,
              }
              localStorage.setItem('CNAMStatusReview', JSON.stringify(data))
              setCnamPendingDisplayName(displayName)
              checkCnamStatus()
              getProfileData(d)
              setShowSnack({
                type: SnackbarTypes.Success,
                message: d.message,
                isVisible: false,
              })
            }
          }}
        />
      )}
    </div>
  )
}

export default CenamDetails
