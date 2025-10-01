import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { Switch } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'

const AgencySupportAndWidget = () => {

  //snack msg
  const [showSnackMessage, setShowSnackMessage] = useState(null);
  const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
  //phone price
  const [allowSuportWebCalendar, setAllowSuportWebCalendar] = useState(false);
  const [addSuportWebCalendar, setAddSuportWebCalendar] = useState(false);
  const [addSuportWebCalendarLoader, setAddSuportWebCalendarLoader] = useState(false);
  const [suportWebCalendar, setSuportWebCalendar] = useState("");

  return (
    <div className="flex flex-row justify-center h-[73vh] w-full overflow-y-auto">
      <div className='w-11/12 pt-4'>
        <AgentSelectSnackMessage
          isVisible={showSnackMessage}
          hide={() => {
            setShowSnackMessage(null);
          }}
          type={showSnackType}
          message={showSnackMessage}
        />
        <div className="w-full border rounded-xl p-4 rounded-lg border rounded-xl">
          <div style={{ fontWeight: "600", fontSize: "22px", color: "#000000" }}>Support Widget</div>
          <div className='border-b'>
            <div className='border rounded-lg p-4 bg-[#D9D9D917] mb-4 mt-4'>
              <div className='flex flex-row item-center justify-between w-full'>
                <div style={styles.subHeading}>
                  Support webinar calendar
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Switch
                    checked={allowSuportWebCalendar}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAllowSuportWebCalendar(checked);

                      if (allowSuportWebCalendar === false) {
                        setAddSuportWebCalendar(true);
                      } else {
                        setAddSuportWebCalendar(false);
                      }
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#7902DF',
                      },
                    }}
                  />
                </div>
              </div>
              <div className='flex flex-row item-center justify-between w-full mt-4'>
                <div style={styles.subHeading}>
                  URL
                </div>
                <button className="flex flex-row items-center gap-2">
                  <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                  <Image
                    alt="*"
                    src={"/assets/editPen.png"}
                    height={16}
                    width={16}
                  />
                </button>
              </div>
            </div>
            {
              addSuportWebCalendar && (
                <div className="flex flex-row items-center justify-center gap-2 mb-4">
                  <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                    <div className="" style={styles.inputs}>
                      $
                    </div>
                    <input
                      style={styles.inputs}
                      type="text"
                      className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                      placeholder="Enter your URL"
                      value={suportWebCalendar}
                      onChange={(e) => {
                        const value = e.target.value;
                        // // Allow only digits and one optional period
                        // const sanitized = value.replace(/[^0-9.]/g, '');

                        // // Prevent multiple periods
                        // const valid = sanitized.split('.')?.length > 2
                        //   ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                        //   : sanitized;
                        // // setOriginalPrice(valid);
                        setSuportWebCalendar(value);
                      }}
                    />
                  </div>
                  {
                    addSuportWebCalendarLoader ? (
                      <div className="flex flex-row items-center justify-center w-[10%]">
                        <CircularProgress size={30} />
                      </div>
                    ) : (
                      <button onClick={() => { alert("Work In Progress...") }} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                        Save
                      </button>
                    )
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgencySupportAndWidget


const styles = {
  heading: {
    fontWeight: "600", fontSize: 17
  },
  subHeading: {
    fontWeight: "500", fontSize: 15
  }
}