import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

const SubAccountFilters = ({
  open,
  handleClose,
  handleApplyFilters,
  initialLoader,
  minSpent,
  maxSpent,
  maxBalance,
  minBalance,
  selectPlanId,
  accountStatus,
  setMinSpent,
  setMaxSpent,
  setMaxBalance,
  setMinBalance,
  setSelectPlanId,
  setAccountStatus,
}) => {
  // //balance spent
  // const [minSpent, setMinSpent] = useState("");
  // const [maxSpent, setMaxSpent] = useState("");
  // const [maxBalance, setMaxBalance] = useState("");
  // const [minBalance, setMinBalance] = useState("");
  // //plan id
  // const [selectPlanId, setSelectPlanId] = useState(null);
  // //account status
  // const [accountStatus, setAccountStatus] = useState("");

  //plans
  const [plansList, setPlansList] = useState([])
  //subacc status
  const subAccountStatus = [
    {
      id: 1,
      title: 'Active',
      value: 'active',
    },
    {
      id: 2,
      title: 'Paused',
      value: 'paused',
    },
    {
      id: 3,
      title: 'Pending',
      value: 'pending',
    },
  ]

  useEffect(() => {
    fetchPlans()
  }, [])

  //fetch plans
  const fetchPlans = async () => {
    const localPlans = localStorage.getItem('agencyMonthlyPlans')
    if (localPlans) {
      setPlansList(JSON.parse(localPlans))
      console.log('Plans list is', JSON.parse(localPlans))
    }
  }
  //status

  return (
    <Modal open={open}>
      <Box className="bg-white rounded-xl w-4/12 h-[70vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6">
        <div className="w-full flex flex-col items-center justify-between h-[100%]">
          <div className="w-full h-[90%] overflow-auto scrollbar-hide">
            <div className="w-full flex flex-row items-center justify-between">
              <div className="text-2xl font-bold">Filter Sub Accounts</div>
              <CloseBtn onClick={handleClose} />
            </div>
            <div className="flex flex-row gap-2 mt-2">
              <div className="w-1/2">
                <label style={styles.regular}>Min Spent</label>
                <div className="border border-gray-200 rounded px-2 py-0 mt-1 flex flex-row items-center w-full">
                  <div style={styles.inputs}>$</div>
                  <input
                    style={styles.inputs}
                    type="text"
                    className="w-full border-none outline-none focus:outline-none focus:ring-0"
                    placeholder=""
                    value={minSpent}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setMinSpent(value)
                    }}
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label style={styles.regular}>Max Spent</label>
                <div className="border border-gray-200 rounded px-2 py-0 mt-1 flex flex-row items-center w-full">
                  <div style={styles.inputs}>$</div>
                  <input
                    style={styles.inputs}
                    type="text"
                    className="w-full border-none outline-none focus:outline-none focus:ring-0"
                    placeholder=""
                    value={maxSpent}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setMaxSpent(value)
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 mt-2">
              {/* MinBalance */}
              <div className="w-1/2">
                <label style={styles.regular}>Min Credits</label>
                <div className="border border-gray-200 rounded px-2 py-0 mt-1 flex flex-row items-center w-full">
                  <input
                    style={styles.inputs}
                    type="text"
                    className="w-full border-none outline-none focus:outline-none focus:ring-0"
                    placeholder=""
                    value={minBalance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setMinBalance(value)
                    }}
                  />
                </div>
              </div>

              {/* MaxBalance*/}
              <div className="w-1/2">
                <label style={styles.regular}>Max Credits</label>
                <div className="border border-gray-200 rounded px-2 py-0 mt-1 flex flex-row items-center w-full">
                  <input
                    style={styles.inputs}
                    type="text"
                    className="w-full border-none outline-none focus:outline-none focus:ring-0"
                    placeholder=""
                    value={maxBalance}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      setMaxBalance(value)
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2" style={styles.inputs}>
              Select SubAccount Status
            </div>
            <div className="w-full mt-2">
              <FormControl sx={{}} className="w-full h-[50px]">
                <Select
                  value={accountStatus}
                  // label="Age"
                  onChange={(event) => {
                    console.log('Event is', event.target.value)
                    setAccountStatus(event.target.value)
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <div style={{ color: '#aaa' }}>
                          Select SubAccount Status
                        </div>
                      )
                    }
                    const accountStatus = subAccountStatus.find(
                      (p) => p.value === selected,
                    )
                    return accountStatus ? accountStatus.title : '' // Show title in UI
                  }}
                  sx={{
                    height: '48px',
                    borderRadius: '13px',
                    border: '1px solid #00000020', // Default border
                    '&:hover': {
                      border: '1px solid #00000020', // Same border on hover
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove the default outline
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove outline on focus
                    },
                    '&.MuiSelect-select': {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: '30vh', // Limit dropdown height
                        overflow: 'auto', // Enable scrolling in dropdown
                        scrollbarWidth: 'none',
                        // borderRadius: "10px"
                      },
                    },
                  }}
                >
                  <MenuItem className="w-full" value="">
                    <button onClick={() => {}}>None</button>
                  </MenuItem>
                  {subAccountStatus?.map((item, index) => {
                    return (
                      <MenuItem
                        className="w-full"
                        value={item.value}
                        key={index}
                      >
                        <button onClick={() => {}}>{item.title}</button>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="mt-2" style={styles.inputs}>
              Select Plan
            </div>
            <div className="w-full mt-2">
              <FormControl sx={{}} className="w-full h-[50px]">
                <Select
                  value={selectPlanId}
                  // label="Age"
                  onChange={(event) => {
                    console.log('Event is', event.target.value)
                    setSelectPlanId(event.target.value)
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: '#aaa' }}>Select Plan</div>
                    }
                    const selectedPlan = plansList.find(
                      (p) => p.id === selected,
                    )
                    return selectedPlan ? selectedPlan.title : '' // Show title in UI
                  }}
                  sx={{
                    height: '48px',
                    borderRadius: '13px',
                    border: '1px solid #00000020', // Default border
                    '&:hover': {
                      border: '1px solid #00000020', // Same border on hover
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove the default outline
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: 'none', // Remove outline on focus
                    },
                    '&.MuiSelect-select': {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: '30vh', // Limit dropdown height
                        overflow: 'auto', // Enable scrolling in dropdown
                        scrollbarWidth: 'none',
                        // borderRadius: "10px"
                      },
                    },
                  }}
                >
                  <MenuItem className="w-full" value="">
                    <button onClick={() => {}}>None</button>
                  </MenuItem>
                  {plansList
                    ?.slice()
                    .reverse()
                    .map((item, index) => {
                      return (
                        <MenuItem
                          className="w-full"
                          value={item.id}
                          key={index}
                        >
                          <button onClick={() => {}}>{item.title}</button>
                        </MenuItem>
                      )
                    })}
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="w-full h-[10%]">
            {initialLoader ? (
              <div className="flex flex-row items-center justify-center h-[50px] w-full">
                <CircularProgress size={30} />
              </div>
            ) : (
              <button
                className="w-full h-[50px] rounded-lg bg-purple text-white"
                style={{ fontSize: '15px', fontWeight: '500' }}
                onClick={() => {
                  const filterData = {
                    minSpent: minSpent,
                    maxSpent: maxSpent,
                    minBalance: minBalance,
                    maxBalance: maxBalance,
                    selectPlanId: selectPlanId,
                    accountStatus: accountStatus,
                  }
                  handleApplyFilters(filterData)
                }}
              >
                Apply Filters
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default SubAccountFilters

const styles = {
  regular: {
    fontSize: '15px',
    fontWeight: '500',
  },
  inputs: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#000000',
  },
}
