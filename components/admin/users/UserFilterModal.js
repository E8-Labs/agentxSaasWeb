import {
  Box,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Slider,
  Snackbar,
  TextareaAutosize,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'

import { CalendarPicker } from './CalendarPicker'

const styles = {
  heading: {
    fontWeight: '700',
    fontSize: 17,
  },
  paragraph: {
    fontWeight: '500',
    fontSize: 15,
  },
  modalsStyle: {
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
  subHeading: {
    fontWeight: '500',
    fontSize: 12,
    color: '#00000060',
  },
  heading2: {
    fontWeight: '500',
    fontSize: 15,
    color: '#00000080',
  },
  chip: {
    margin: 2,
    backgroundColor: 'hsl(var(--brand-primary))',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  unselectedChip: {
    margin: 2,
    backgroundColor: '#F0F0F0',
    color: 'black',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))',
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
  },
}

// //console.log

export function UserFilterModal({
  showFilterModal,
  filters,
  updateFilters,
  onDismissCallback,
}) {
  //CreatedAt Date
  const [selectedCreatedFromDate, setSelectedCreatedFromDate] = useState(
    filters.selectedCreatedFromDate || null,
  )
  const [selectedCreatedToDate, setSelectedCreatedToDate] = useState(
    filters.selectedCreatedToDate || null,
  )
  const [renewalFromDate, setRenewalFromDate] = useState(
    filters.renewalFromDate || null,
  )
  const [renewalToDate, setRenewalToDate] = useState(
    filters.renewalToDate || null,
  )
  const [leads, setLeads] = useState(filters.leads || [0, 1000000])
  const [teams, setTeams] = useState(filters.teams || [0, 100])
  const [totalSpent, setTotalSpent] = useState(
    filters.totalSpent || [0, 1000000],
  )
  const [minsUsed, setMinsUsed] = useState(filters.minsUsed || [0, 1000000])
  const [agent, setAgent] = useState(filters.agent || [0, 1000000])
  const [balance, setBalance] = useState(filters.minsBalance || [0, 1000000])
  const [selectedPlans, setSelectedPlans] = useState(
    filters.selectedPlans || [],
  )
  const [loading, setLoading] = useState(false)

  const [affiliatesList, setAffiliatesList] = useState([])
  const [selectedAffiliates, setSelectedAffiliates] = useState(
    filters.selectedAffiliates || [],
  )

  const planOptions = ['Trial', 'plan30', 'plan120', 'plan360', 'plan720']

  const togglePlanSelection = (plan) => {
    setSelectedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan],
    )
    updateFilters({
      ...filters,
      selectedPlans: selectedPlans.includes(plan)
        ? selectedPlans.filter((p) => p !== plan)
        : [...selectedPlans, plan],
    })
  }

  const handleApplyFilters = () => {
    setLoading(true)
    updateFilters({
      selectedCreatedFromDate,
      selectedCreatedToDate,
      renewalFromDate,
      renewalToDate,
      leads,
      teams,
      totalSpent,
      minsUsed,
      agent,
      balance,
      selectedPlans,
      selectedAffiliates,

      finalUpdate: true, //to call api
    })

    setTimeout(() => setLoading(false), 500)
  }

  const handleResetFilters = (filters) => {
    updateFilters({
      selectedCreatedFromDate: null,
      selectedCreatedToDate: null,
      renewalFromDate: null,
      renewalToDate: null,
      leads: null,
      teams: null,
      totalSpent: null,
      minsUsed: null,
      agent: null,
      balance: null,
      selectedPlans: null,
      selectedAffiliates: null,

      finalUpdate: true, //to call api
    })
  }

  useEffect(() => {
    getAffiliates()
  }, [])

  const getAffiliates = async (offset = 0) => {
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let path = `${Apis.getAffiliate}?offset=${offset}`

        const response = await axios.get(path, {
          headers: { Authorization: 'Bearer ' + u.token },
        })

        if (response.data.status === true) {
          //console.log
          setAffiliatesList(response.data.data)
        }
      }
    } catch (e) {
      //console.log;
    }
  }

  const handleAffiliateChange = (event) => {
    setSelectedAffiliates(event.target.value)
    updateFilters({ ...filters, selectedAffiliates: event.target.value })
  }

  return (
    <Modal
      open={showFilterModal}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
          maxHeight: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Box
        className="flex flex-row justify-center items-start lg:w-4/12 sm:w-7/12 w-8/12 py-2 px-6 w-auto min-w-0"
        sx={{
          ...styles.modalsStyle,
          scrollbarWidth: 'none',
          backgroundColor: 'transparent',
          '@keyframes addPipelineModalEntry': {
            from: { transform: 'scale(0.95) translateY(-55%)', opacity: 0 },
            to: { transform: 'scale(1) translateY(-55%)', opacity: 1 },
          },
          animation: 'addPipelineModalEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <div
          className="w-[500px] flex flex-col gap-3 p-0 pb-0 overflow-hidden max-h-[75svh] overflow-auto md:overflow-auto"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            borderRadius: 12,
          }}
        >
        <div className="w-full flex flex-col items-center justify-start gap-0.5">
          <div className="flex flex-row items-center justify-between w-full p-4 border-b bg-white" style={{ borderColor: '#eaeaea' }}>
            <div className="text-[18px] font-semibold">Filter</div>
            <CloseBtn
              onClick={() => {
                onDismissCallback()
              }}
            />
          </div>
            <div className="mt-2 w-full overflow-y-auto px-4 pb-5 text-[14px] h-[400px] min-h-0">
            <div className="w-full flex flex-row items-start gap-3">
              <div className="w-1/2 h-full">
                <div
                  className="h-full"
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.8)',
                    marginTop: 10,
                  }}
                >
                  From
                </div>
                <div>
                  <CalendarPicker onSelectDate={setSelectedCreatedFromDate} />
                </div>
              </div>

              <div className="w-1/2 h-full">
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.8)',
                    marginTop: 10,
                  }}
                >
                  To
                </div>
                <div>
                  <CalendarPicker onSelectDate={setSelectedCreatedToDate} />
                </div>
              </div>
            </div>

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Leads
            </div>
            <Slider
              value={leads}
              onChange={(e, v) => {
                setLeads(v)
                updateFilters({ ...filters, selectdLeads: v })
              }}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Teams
            </div>
            <Slider
              value={teams}
              onChange={(e, v) => {
                setTeams(v)
                updateFilters({ ...filters, selectdTeams: v })
              }}
              valueLabelDisplay="auto"
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Total Spent
            </div>
            <Slider
              value={totalSpent}
              onChange={(e, v) => {
                setTotalSpent(v)
                updateFilters({ ...filters, selectedTotalSpents: v })
              }}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Mins Used
            </div>
            <Slider
              min={0}
              max={1000000}
              value={minsUsed}
              onChange={(e, v) => {
                setMinsUsed(v)
                updateFilters({ ...filters, selectedMinsUsed: v })
              }}
              valueLabelDisplay="auto"
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Balance
            </div>
            <Slider
              value={balance}
              onChange={(e, v) => {
                setBalance(v)
                updateFilters({ ...filters, balacne: v })
              }}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Agents
            </div>
            <Slider
              min={0}
              max={1000000}
              value={agent}
              onChange={(e, v) => {
                updateFilters({ ...filters, agent: v })
                setAgent(v)
              }}
              valueLabelDisplay="auto"
              sx={{
                color: 'hsl(var(--brand-primary))',
              }}
            />

            <div className="flex flex-row items-start gap-3">
              <div className="w-1/2 h-full">
                <div
                  className="h-full"
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.8)',
                    marginTop: 10,
                  }}
                >
                  From
                </div>
                <div>
                  <CalendarPicker onSelectDate={setRenewalFromDate} />
                </div>
              </div>

              <div className="w-1/2 h-full">
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.8)',
                    marginTop: 10,
                  }}
                >
                  To
                </div>
                <div>
                  <CalendarPicker onSelectDate={setRenewalToDate} />
                </div>
              </div>
            </div>

            <div
                style={{
                  fontWeight: '500',
                  fontSize: 14,
                  color: 'rgba(0,0,0,0.8)',
                  marginTop: 10,
                }}
            >
              Closer
            </div>

            <FormControl fullWidth>
              <Select
                multiple
                value={selectedAffiliates}
                onChange={handleAffiliateChange}
                renderValue={(selected) => (
                  <div>
                    {selected.map((value) => (
                      <Chip key={value} label={value} sx={{ margin: 0.5 }} />
                    ))}
                  </div>
                )}
              >
                {affiliatesList.map((affiliate) => (
                  <MenuItem key={affiliate.id} value={affiliate.name}>
                    {affiliate.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="mt-2 w-full">
              <label className="block text-gray-600 mt-4">Plan</label>
              <div style={styles.gridContainer}>
                {planOptions.map((plan) => (
                  <div
                    key={plan}
                    onClick={() => togglePlanSelection(plan)}
                    style={
                      selectedPlans.includes(plan)
                        ? styles.chip
                        : styles.unselectedChip
                    }
                  >
                    {plan}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center w-full justify-between m-0 p-4 h-auto bg-white">
            <button
              className="outline-none w-[105px]"
              style={{ fontSize: 16.8, fontWeight: '600' }}
              onClick={() => {
                handleResetFilters(filters)
              }}
            >
              Reset
            </button>

            <button
              className="bg-brand-primary h-[45px] w-[140px] bg-brand-primary text-white rounded-xl outline-none"
              style={{
                fontSize: 16.8,
                fontWeight: '600',
                // backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
              }}
              onClick={() => {
                handleApplyFilters(filters)
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>
        </div>
      </Box>
    </Modal>
  )
}

// export default UserFilterModal;
