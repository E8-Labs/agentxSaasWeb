import { Box, CircularProgress, Modal } from '@mui/material'
import { Check } from '@phosphor-icons/react'
import axios from 'axios'
import { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import UserType from '@/components/onboarding/UserType'

import { AuthToken } from '../plan/AuthDetails'
// Optional: replace with your own icon
import { getXBarOptions } from './GetPlansList'

export default function SetXBarOptions({
  onClose,
  selectedMonthlyPlans,
  xBars,
  formData,
  closeModal,
  selectedUserType,
  selectedAgency,
}) {
  const [xBarPlans, setXBarPlans] = useState([])
  const [selectedXBarPlans, setSelectedXBarPlans] = useState([])
  const [subAccountLoader, setSubAccountLoader] = useState(false)

  const [loading, setLoading] = useState(false)
  const [showErrorSnack, setShowErrorSnack] = useState(null)

  //getting the plans list
  useEffect(() => {
    console.log(formData)
    console.log('Xbar plan passed is', xBars)
    setSelectedXBarPlans(xBars)
    getPlansList()
  }, [])

  //function to get plans list
  const getPlansList = async () => {
    try {
      setLoading(true)
      const plans = await getXBarOptions(selectedAgency)
      setLoading(false)
      console.log('x bar Plans list recieved is', plans)
      setXBarPlans(plans)
    } catch (error) {
      console.error('Error occured in getting plans on  sub act is', error)
    }
  }

  //select the plan
  const toggleSelection = (index) => {
    setSelectedXBarPlans((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  //code to create sub acoount
  const handleCreateSubAccount = async () => {
    // Validate that at least one xbar plan is selected
    if (selectedXBarPlans.length === 0) {
      setShowErrorSnack('Please select at least one XBar plan')
      return
    }

    try {
      setSubAccountLoader(true)

      const Token = AuthToken()
      const ApiPath = Apis.CreateAgencySubAccount //add path

      let seatscount = null
      if (formData.seats) {
        seatscount = Number(formData.seats)
      }

      let ApiData = {
        name: formData.subAccountName,
        phone: formData.userPhoneNumber,
        email: formData.userEmail,
        userType: selectedUserType,
        agencyAccountName: formData.fullName,
        // costPerSeat: seatscount,
        costPerSeat: isNaN(Number(seatscount)) ? 0 : Number(seatscount),
        teams: formData.teamMembers
          .filter((item) => item.name && item.email && item.phone) // Filter members with all fields present
          .map((item) => ({
            name: item.name,
            phone: `+${item.phone}`,
            email: item.email,
          })),
        monthlyPlans: selectedMonthlyPlans,
        xbarPlans: selectedXBarPlans,
        smartRefill: formData.isSmartRefill,
        allowSubaccountTwilio: formData.allowSubaccountTwilio,
        isInternalAccount: formData.isInternalAccount || false,
        isAgencyUse: formData.isAgencyUse || false,
      }
      if (selectedAgency) {
        ApiData = {
          ...ApiData,
          userId: selectedAgency.id,
        }
      }
      console.log('Api data is', ApiData)
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('responese of create sub account api is', response.data)
        if (response.data.status === true) {
          //update the subaccounts state on localstorage to update checklist
          const localData = localStorage.getItem('User')
          if (localData) {
            let D = JSON.parse(localData)
            D.user.checkList.checkList.subaccountAdded = true
            
            // Update hasInternalAccount if an internal account was created
            if (formData.isInternalAccount) {
              D.user.hasInternalAccount = true
            }
            
            localStorage.setItem('User', JSON.stringify(D))
          }
          window.dispatchEvent(
            new CustomEvent('UpdateAgencyCheckList', {
              detail: { update: true },
            }),
          )
          closeModal()
        }
      }
    } catch (error) {
      console.error('Error occured in create sub account api is', error)
      setSubAccountLoader(false)
    } finally {
      console.log('Sub account created')
      setSubAccountLoader(false)
    }
  }

  const handleBack = () => {
    onClose(selectedXBarPlans)
  }

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={showErrorSnack != null ? true : false}
        hide={() => setShowErrorSnack(null)}
        type={SnackbarTypes.Error}
        message={showErrorSnack}
      />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Select XBar Options
        </h2>
      </div>

      <div
        className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide"
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {loading ? (
          <div className="w-full flex flex-row items-center justify-center">
            <CircularProgress size={35} />
          </div>
        ) : (
          xBarPlans.map((plan, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
              onClick={() => toggleSelection(plan.id)}
            >
              <div className="w-[80%]">
                <h3 className="font-semibold text-gray-900">
                  {plan.title} | {plan.minutes || 'X'} Credits
                </h3>
                <p className="text-sm text-gray-500">{plan.planDescription}</p>
                <p className="mt-1 font-medium text-lg text-gray-800">
                  ${plan.discountedPrice}/
                  <span className="text-sm text-gray-400">Mo*</span>
                </p>
              </div>

              <div
                className="w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-all duration-150 ease-in-out"
                style={{
                  borderColor: selectedXBarPlans?.includes(plan.id)
                    ? 'hsl(var(--brand-primary))'
                    : '#ccc',
                  backgroundColor: selectedXBarPlans?.includes(plan.id)
                    ? 'hsl(var(--brand-primary))'
                    : 'transparent',
                }}
              >
                {selectedXBarPlans?.includes(plan.id) && (
                  <Check size={16} color="#fff" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            handleBack()
          }}
          className="text-brand-primary font-medium w-2/6 rounded-lg border border-brand-primary"
        >
          Back
        </button>
        {subAccountLoader ? (
          <CircularProgress size={30} />
        ) : (
          <button
            onClick={() => {
              console.log('close all')
              handleCreateSubAccount()
            }}
            disabled={selectedXBarPlans.length === 0}
            className={`px-8 py-2 rounded-lg w-1/2 ${selectedXBarPlans.length === 0 ? 'bg-[#00000020] text-black cursor-not-allowed' : 'bg-brand-primary text-white'}`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
