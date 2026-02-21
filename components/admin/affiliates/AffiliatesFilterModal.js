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

import CustomSlider from './CustomSlider'

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
    backgroundColor: '#7902DF',
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
export function AffiliatesFilterModal({
  showFilterModal,
  filters,
  updateFilters,
  onDismissCallback,
}) {
  const [users, setusers] = useState([0, 1000000])
  const [revenue, setrevenue] = useState([0, 1000000])
  const [xBar, setXBar] = useState([0, 1000000])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setusers(filters.users || [0, 1000])
    setrevenue(filters.revenue || [0, 10000])
    setXBar(filters.xBar || [0, 10000])
  }, [showFilterModal]) // Reset filters every time the modal opens

  const handleApplyFilters = () => {
    setLoading(true)
    updateFilters({
      users,
      revenue,
      xBar,
      finalUpdate: true, //to call api
    })
    setTimeout(() => setLoading(false), 500)
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
            <CustomSlider
              min={0}
              max={10000}
              step={50}
              defaultValue={xBar}
              label="X-Bar"
              onChange={(value) => {
                //console.log
                setXBar(value)
              }}
            />

            <CustomSlider
              min={0}
              max={1000}
              step={50}
              defaultValue={users}
              label="Users"
              onChange={(value) => {
                //console.log
                setusers(value)
              }}
            />

            <CustomSlider
              min={0}
              max={10000}
              step={50}
              defaultValue={revenue}
              label="Revenue"
              onChange={(value) => {
                //console.log
                setrevenue(value)
              }}
            />
          </div>

          <div className="flex flex-row items-center w-full justify-between m-0 p-4 h-auto bg-white">
            <button
              className="outline-none w-[105px]"
              style={{ fontSize: 16.8, fontWeight: '600' }}
              onClick={() => {
                updateFilters(filters)
              }}
            >
              Reset
            </button>

            <button
              className="bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none"
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
