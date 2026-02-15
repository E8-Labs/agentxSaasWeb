import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import Check from '@mui/icons-material/Check'
import React, { useEffect, useState } from 'react'

import { getAgencySelectMenuProps } from '@/components/agency/agencySelectMenuConfig'
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
    }
  }
  //status

  return (
    <Modal
      open={open}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0,0,0,0.6)' },
      }}
    >
      <Box
        className="bg-white w-[500px] max-w-[95vw] h-auto border-none outline-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 rounded-2xl overflow-hidden"
        sx={{
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.3)',
        }}
      >
        <div className="w-full flex flex-col items-center justify-between gap-3 min-h-[550px] h-auto">
          <div className="w-full h-full overflow-auto scrollbar-hide flex flex-col gap-3 p-0 rounded-2xl">
            <div className="w-full flex flex-row items-center justify-between border-b border-[#EDEDED] py-4 px-4">
              <div className="text-lg font-semibold" style={{ letterSpacing: '-0.5px' }}>Filter Sub Accounts</div>
              <CloseBtn onClick={handleClose} />
            </div>
            <div className="flex flex-row gap-3 px-4">
              <div className="w-1/2">
                <label style={styles.regular}>Min Spent</label>
                <div className="overflow-hidden rounded-lg border border-gray-200 px-2 py-0 mt-1 flex flex-row items-center w-full focus-within:border-2 focus-within:border-brand-primary transition-colors">
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
                <div className="overflow-hidden rounded-lg border border-gray-200 px-2 py-0 mt-1 flex flex-row items-center w-full focus-within:border-2 focus-within:border-brand-primary transition-colors">
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
            <div className="flex flex-row gap-3 px-4">
              {/* MinBalance */}
              <div className="w-1/2">
                <label style={styles.regular}>Min Credits</label>
                <div className="overflow-hidden rounded-lg border border-gray-200 px-2 py-0 mt-1 flex flex-row items-center w-full focus-within:border-2 focus-within:border-brand-primary transition-colors">
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
                <div className="overflow-hidden rounded-lg border border-gray-200 px-2 py-0 mt-1 flex flex-row items-center w-full focus-within:border-2 focus-within:border-brand-primary transition-colors">
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
            <div className="flex flex-col gap-2">
              <div className="px-4 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.8)' }}>
                Select SubAccount Status
              </div>
              <div className="w-full px-4">
                <FormControl sx={{}} className="w-full h-[50px]">
                  <Select
                    value={accountStatus}
                  // label="Age"
                  onChange={(event) => {
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
                      py: 0,
                      fontSize: 14,
                    },
                  }}
                  MenuProps={getAgencySelectMenuProps()}
                >
                  <MenuItem className="w-full" value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>None</span>
                    </Box>
                  </MenuItem>
                  {subAccountStatus?.map((item, index) => {
                    return (
                      <MenuItem
                        className="w-full"
                        value={item.value}
                        key={index}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <span>{item.title}</span>
                          {accountStatus === item.value && (
                            <Check sx={{ fontSize: 16, color: 'hsl(var(--brand-primary))' }} />
                          )}
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="px-4 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.8)' }}>
                Select Plan
              </div>
              <div className="w-full px-4">
                <FormControl sx={{}} className="w-full h-[50px]">
                  <Select
                    value={selectPlanId}
                  // label="Age"
                  onChange={(event) => {
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
                      py: 0,
                      fontSize: 14,
                    },
                  }}
                  MenuProps={getAgencySelectMenuProps()}
                >
                  <MenuItem className="w-full" value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span>None</span>
                    </Box>
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
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span>{item.title}</span>
                            {selectPlanId === item.id && (
                              <Check sx={{ fontSize: 16, color: 'hsl(var(--brand-primary))' }} />
                            )}
                          </Box>
                        </MenuItem>
                      )
                    })}
                </Select>
              </FormControl>
              </div>
            </div>
            </div>
          <div className="w-full h-auto flex flex-col justify-center py-4 px-4" style={{ fontSize: 14 }}>
            {initialLoader ? (
              <div className="flex flex-row items-center justify-center h-[40px] w-full">
                <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
              </div>
            ) : (
              <button
                className="w-full h-[40px] rounded-lg bg-brand-primary text-white text-sm font-medium border-none outline-none shadow-md transition-shadow transition-transform duration-200 ease-out active:scale-[0.98] hover:shadow-lg"
                style={{
                  fontSize: 14,
                  boxShadow: '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px hsl(var(--brand-primary) / 0.25), 0 4px 6px -4px hsl(var(--brand-primary) / 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)'
                }}
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
  );
}

export default SubAccountFilters

const styles = {
  regular: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(0,0,0,0.8)',
  },
  inputs: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(0,0,0,0.8)',
  },
}
