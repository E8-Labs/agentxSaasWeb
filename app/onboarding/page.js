'use client'

import { Modal } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import ErrorBoundary from '@/components/ErrorBoundary'
import LoaderAnimation from '@/components/animations/LoaderAnimation'
import Apis from '@/components/apis/Apis'
import BackgroundVideo from '@/components/general/BackgroundVideo'
import Congrats from '@/components/onboarding/Congrats'
import DebtCollectorAgentSignUp from '@/components/onboarding/DebtCollectorAgentSignUp'
import FocusArea from '@/components/onboarding/FocusArea'
import SignUpForm from '@/components/onboarding/SignUpForm'
import UserService from '@/components/onboarding/UserService'
import UserType from '@/components/onboarding/UserType'
import { forceApplyBranding } from '@/utilities/applyBranding'
import BasicDetails from '@/components/onboarding/mobileUI/BasicDetails'
import LawAgentSignUpMobile from '@/components/onboarding/mobileUI/LawAgentSignUpMobile'
import LoanOfficerSignUpMobile from '@/components/onboarding/mobileUI/LoanOfficerSignUpMobile'
import MedSpaAgentSignUpMobile from '@/components/onboarding/mobileUI/MedSpaAgentSignUpMobile'
import OtherDetails from '@/components/onboarding/mobileUI/OtherDetails'
import TexAgentSignUpMoble from '@/components/onboarding/mobileUI/TexAgentSignUpMoble'
import DebtCollerterAgentSignUp from '@/components/onboarding/otherAgentsSignUp/DebtCollecterAgentSignUp'
import GeneralAgentSignUp from '@/components/onboarding/otherAgentsSignUp/GeneralAgentSignUp'
import InsuranceAgentSignUp from '@/components/onboarding/otherAgentsSignUp/InsuranceAgentSignUp'
import LawAgentSignUp from '@/components/onboarding/otherAgentsSignUp/LawAgentSignUp'
import LoanOfficerSignUp from '@/components/onboarding/otherAgentsSignUp/LoanOfficerSignUp'
import MarketerAgentSignUp from '@/components/onboarding/otherAgentsSignUp/MarketerAgentSignUp'
import MedSpaAgentSignUp from '@/components/onboarding/otherAgentsSignUp/MedSpaAgentSignUp'
import RecruiterAgentSignUp from '@/components/onboarding/otherAgentsSignUp/RecruiterAgentSignUp'
import SalesDevAgent from '@/components/onboarding/otherAgentsSignUp/SalesDevAgent'
import SolarRepAgentSignUp from '@/components/onboarding/otherAgentsSignUp/SolarRepAgentSignUp'
import TaxAgentSignUp from '@/components/onboarding/otherAgentsSignUp/TaxAgentSignUp'
import WebOwnersAgentSignUp from '@/components/onboarding/otherAgentsSignUp/WebOwnersAgentSignUp'
import CreatorType from '@/components/onboarding/creator/CreatorType'
import CreatorAgentSignUp from '@/components/onboarding/creator/CreatorAgentSignUp'
import HomeServicesAgentSignUp from '@/components/onboarding/homeServices/HomeServicesAgentSignUp'
import { PersistanceKeys } from '@/constants/Constants'
import { UserTypes } from '@/constants/UserTypes'
import ShootingStarLoading from '@/components/animations/ShootingStarLoading'

const Page = ({ params }) => {
  const router = useRouter()
  const [congratsPopup, setCongratsPopup] = useState(false)
  const [userType, setUserType] = useState(UserTypes.RealEstateAgent)
  const [index, setIndex] = useState(0)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [showredirectPopup, setShowredirectPopup] = useState(false)

  let windowSize = 1000
  if (typeof window !== 'undefined') {
    windowSize = window.innerWidth
    // //console.log;
  } else {
    // //console.log;
  }

  const [components, setComponents] = useState([
    UserType,
    UserService,
    FocusArea,
    BasicDetails,
    OtherDetails,
    // UserType, UserService,
    // FocusArea, SignUpForm, Congrats,
    // SalesDevAgent, SolarRepAgentSignUp,
    // InsuranceAgentSignUp, MarketerAgentSignUp,
    // WebOwnersAgentSignUp, RecruiterAgentSignUp,
    // TaxAgentSignUp
  ])

  //variables store userDetails
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
  })

  //function stores the agentDetails
  const handleDetails = (userName, userEmail, userPhoneNumber) => {
    // //console.log;
    setUserDetails({
      name: userName,
      email: userEmail,
      phone: userPhoneNumber,
    })
  }

  let screenWidth = 1000
  useEffect(() => {
    //console.log;
    if (typeof window !== 'undefined') {
      screenWidth = window.innerWidth
    }

    if (screenWidth < 640) {
      let comps = getMobileComponent()
      //console.log;
      if (userType) {
        setComponents(comps.filter(Boolean))
      }
    } else {
      let comps = getComponentToRender()
      // //console.log;
      // console.log(
      //   "🚀 Components from getComponentToRender:",
      //   comps.map((c) => c?.name || "undefined")
      // );
      setComponents(comps.filter(Boolean))
    }
  }, [userType])

  // Ensure branding variables are applied on mount (uses stored branding or fetches if needed)
  useEffect(() => {
    if (typeof window === 'undefined') return
    forceApplyBranding().catch((err) =>
      console.error('Error applying branding on onboarding load:', err),
    )
  }, [])
  // registerDetails  {"serviceID":[102],"focusAreaId":[406],"userType":4,"userTypeTitle":"InsuranceAgent","areaFocusTitle":"What area of insurance do you focus on?","otherFocusArea":""}
  function getComponentToRender() {
    //console.log;
    let agentTitle = userType //userData?.userTypeTitle || null;
    //console.log;

    // Creator flow: UserType -> UserService -> CreatorType -> CreatorAgentSignUp (no FocusArea)
    if (userType === UserTypes.Creator) {
      return [UserType, UserService, CreatorType, CreatorAgentSignUp].filter(Boolean)
    }

    if (userType === UserTypes.HomeServices) {
      return [UserType, UserService, FocusArea, HomeServicesAgentSignUp].filter(Boolean)
    }

    const agentComponents = {
      [UserTypes.RealEstateAgent]: SignUpForm,
      [UserTypes.SalesDevRep]: SalesDevAgent,
      [UserTypes.SolarRep]: SolarRepAgentSignUp,
      [UserTypes.InsuranceAgent]: InsuranceAgentSignUp,
      [UserTypes.MarketerAgent]: MarketerAgentSignUp,
      [UserTypes.WebsiteAgent]: WebOwnersAgentSignUp,
      [UserTypes.RecruiterAgent]: RecruiterAgentSignUp,
      [UserTypes.TaxAgent]: TaxAgentSignUp,
      [UserTypes.DebtCollectorAgent]: DebtCollectorAgentSignUp,
      [UserTypes.MedSpaAgent]: MedSpaAgentSignUp,
      [UserTypes.LawAgent]: LawAgentSignUp,
      [UserTypes.LoanOfficerAgent]: LoanOfficerSignUp,
      [UserTypes.General]: GeneralAgentSignUp,
      [UserTypes.Reception]: GeneralAgentSignUp,
    }

    const selectedComponent = agentComponents[agentTitle] || SignUpForm

    // 🚀 Ensure components are functions, not strings
    const finalComponents = [
      UserType,
      UserService,
      FocusArea,
      selectedComponent,
      // Congrats,
    ].filter(Boolean)

    return finalComponents
  }

  function getMobileComponent() {
    //console.log;
    let agentTitle = userType //userData?.userTypeTitle || null;
    //console.log;

    // Creator flow: same as desktop (UserType -> UserService -> CreatorType -> CreatorAgentSignUp)
    if (userType === UserTypes.Creator) {
      return [UserType, UserService, CreatorType, CreatorAgentSignUp].filter(Boolean)
    }

    if (userType === UserTypes.HomeServices) {
      return [UserType, UserService, FocusArea, HomeServicesAgentSignUp].filter(Boolean)
    }

    const agentComponents = {
      [UserTypes.RealEstateAgent]: BasicDetails,
      [UserTypes.SalesDevRep]: BasicDetails,
      [UserTypes.SolarRep]: BasicDetails,
      [UserTypes.InsuranceAgent]: BasicDetails,
      [UserTypes.MarketerAgent]: BasicDetails,
      [UserTypes.WebsiteAgent]: BasicDetails,
      [UserTypes.RecruiterAgent]: BasicDetails,
      [UserTypes.TaxAgent]: BasicDetails,
      [UserTypes.DebtCollectorAgent]: BasicDetails,
      [UserTypes.MedSpaAgent]: MedSpaAgentSignUpMobile,
      [UserTypes.LawAgent]: LawAgentSignUpMobile,
      [UserTypes.LoanOfficerAgent]: LoanOfficerSignUpMobile,
      [UserTypes.General]: GeneralAgentSignUp,
      [UserTypes.Reception]: GeneralAgentSignUp,
    }

    const selectedComponent = agentComponents[agentTitle] || SignUpForm

    // 🚀 Ensure components are functions, not strings
    const finalComponents = [
      UserType,
      UserService,
      FocusArea,
      BasicDetails,
      OtherDetails,
      Congrats,
    ].filter(Boolean)

    return finalComponents
  }

  let CurrentComp = components[index]

  //function for moving to the other agents sign up pages

  // Function to proceed to the next step
  const handleContinue = () => {
    //console.log;
    setIndex(index + 1)
  }

  //sals dev
  const handleSalesAgentContinue = () => {
    // //console.log;
    setIndex(index + 3)
  }

  const handleSalesAgentBack = () => {
    // //console.log;
    setIndex(index - 3)
  }

  //solar rep
  const handleSolarAgentContinue = () => {
    // //console.log;
    setIndex(index + 4)
  }

  const handleSolarAgentBack = () => {
    // //console.log;
    setIndex(index - 4)
  }

  // insurance
  const handleInsuranceContinue = () => {
    // //console.log;
    setIndex(index + 5)
  }

  const handleInsuranceBack = () => {
    // //console.log;
    setIndex(index - 5)
  }

  // marketer
  const handleMarketerAgentContinue = () => {
    // //console.log;
    setIndex(index + 6)
  }

  const handleMarketerAgentBack = () => {
    // //console.log;
    setIndex(index - 6)
  }

  // website owners
  const handleWebsiteAgentContinue = () => {
    // //console.log;
    setIndex(index + 7)
  }

  const handleWebsiteAgentBack = () => {
    // //console.log;
    setIndex(index - 7)
  }
  // recruiter agent
  const handleRecruiterAgentContinue = () => {
    // //console.log;
    setIndex(index + 8)
  }

  const handleRecruiterAgentBack = () => {
    // //console.log;
    setIndex(index - 8)
  }
  // tax agent
  const handleTaxAgentContinue = () => {
    // //console.log;
    setIndex(index + 9)
  }

  const handleTaxAgentBack = () => {
    // //console.log;
    setIndex(index - 9)
  }

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1)
  }

  //move other agent to wait list
  const handleWaitList = () => {
    router.push('/onboarding/WaitList')
  }

  const handleUserTypeChange = (userType) => {
    //console.log;
    setUserType(userType)
  }

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '100%',
    height: '100svh',
    overflow: 'none',
  }

  if (showredirectPopup) {
    return (
      <div>
        <ShootingStarLoading
          open={showredirectPopup}
          showLogo= {screenWidth > 640 ? false : false}
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div
        // style={backgroundImage}
        className="relative overflow-hidden flex flex-row justify-center items-center h-[100svh]"
      >
        {windowSize > 640 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              // Don't override backgroundColor - let BackgroundVideo handle it
              zIndex: 0, // keep video behind overlay/content
            }}
          >
            <BackgroundVideo />
          </div>
        )}
        <div className="relative z-20 flex w-full justify-center">
          <CurrentComp
            handleContinue={handleContinue}
            handleBack={handleBack}
            handleSalesAgentContinue={handleSalesAgentContinue}
            handleSolarAgentContinue={handleSolarAgentContinue}
            handleInsuranceContinue={handleInsuranceContinue}
            handleMarketerAgentContinue={handleMarketerAgentContinue}
            handleWebsiteAgentContinue={handleWebsiteAgentContinue}
            handleRecruiterAgentContinue={handleRecruiterAgentContinue}
            handleTaxAgentContinue={handleTaxAgentContinue}
            handleSalesAgentBack={handleBack}
            handleSolarAgentBack={handleBack}
            handleInsuranceBack={handleBack}
            handleMarketerAgentBack={handleBack}
            handleWebsiteAgentBack={handleBack}
            handleRecruiterAgentBack={handleBack}
            handleTaxAgentBack={handleBack}
            //move other agents to wait list
            handleWaitList={handleWaitList}
            handleDetails={handleDetails}
            userDetails={userDetails}
            setCongratsPopup={setCongratsPopup}
            handleUserTypeChange={handleUserTypeChange}
            handleShowRedirectPopup={() => {
              setShowredirectPopup(true)
            }}
          />
          <Modal
            open={congratsPopup}
            // onClose={() => setAddKYCQuestion(false)}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: '#00000020',
                ////backdropFilter: "blur(5px)"
              },
            }}
          >
            <Congrats />
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default Page
