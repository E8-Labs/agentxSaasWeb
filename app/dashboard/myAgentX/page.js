'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Box, Drawer } from '@mui/material'

function Page() {

  const [openTestAiModal, setOpenTestAiModal] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [budget, setBudget] = useState("")
  const [showDrawer, setShowDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState("Agent Info");


  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          My Agents
        </div>

        <botton className='pr-10'>
          <img src='/otherAssets/notificationIcon.png'
            style={{ height: 24, width: 24 }}
            alt='notificationIcon'
          />
        </botton>
      </div>

      <div className='w-9/12 pt-10 items-center ' style={{}}>
        <div className='w-full px-10 py-2' style={{
          borderWidth: 1, borderColor: '#15151510', backgroundColor: '#FBFCFF',
          borderRadius: 20
        }}>
          <div className='w-12/12 flex flex-row items-center justify-between'>
            <div className='flex flex-row gap-5 items-center'>

              <div className='flex flex-row items-end'>
                <Image src={'/assets/colorCircle.png'}
                  height={90}
                  width={90}
                  alt='profile'
                />

                <button style={{ marginLeft: -35 }}>
                  <Image src={'/otherAssets/cameraBtn.png'}

                    height={36}
                    width={36}
                    alt='profile'
                  />
                </button>
              </div>


              <div className='flex flex-col gap-1'>

                <div className='flex flex-row gap-3 items-center'>
                  <button onClick={() => {
                    setShowDrawer(true)
                  }}>

                    <div style={{ fontSize: 24, fontWeight: '600', color: '#000' }}>
                      Anna ai
                    </div>
                  </button>
                  <div style={{ fontSize: 11, fontWeight: '600', color: '#000' }}>
                    Community update
                  </div>
                </div>
                <div className='flex flex-row gap-3 items-center'>
                  <button>
                    <div style={{ fontSize: 11, fontWeight: '600', color: '#402FFF' }}>
                      View Scropt
                    </div>
                  </button>

                  <div style={{ fontSize: 11, fontWeight: '600', color: '#402FFF' }}>
                    |
                  </div>

                  <button>
                    <div style={{ fontSize: 11, fontWeight: '600', color: '#402FFF' }}>
                      More info
                    </div>
                  </button>
                </div>
              </div>

            </div>


            <button className='bg-purple px-4 py-2 rounded-lg'
              onClick={() => {
                setOpenTestAiModal(true)
              }}
            >
              <div style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                Test AI
              </div>
            </button>

          </div>


          <div style={{ marginTop: 20 }} className='w-9.12 bg-white p-6 rounded-lg '>
            <div className='w-full flex flex-row items-center justify-between'>

              <Card
                name="Calls"
                value={98}
                icon='/assets/selectedCallIcon.png'
                bgColor="bg-blue-100"
                iconColor="text-blue-500"
              />
              <Card
                name="Convos >10 Sec"
                value={43}
                icon='/otherAssets/convosIcon2.png'
                bgColor="bg-purple-100"
                iconColor="text-purple-500"
              />
              <Card
                name="Hot Leads"
                value={22}
                icon='/otherAssets/hotLeadsIcon2.png'
                bgColor="bg-orange-100"
                iconColor="text-orange-500"
              />

              <Card
                name="Booked Meetings"
                value={22}
                icon='/otherAssets/greenCalenderIcon.png'
                bgColor="green"
                iconColor="text-orange-500"
              />

              <Card
                name="Live Transfers"
                value={22}
                icon='/otherAssets/transferIcon.png'
                bgColor="green"
                iconColor="text-orange-500"
              />
            </div>
          </div>
        </div>

        <button
          className="w-full py-6 rounded-lg flex justify-center items-center"
          style={{
            marginTop: 20,
            borderWidth: 1,
            borderColor: '#402FFF',
            boxShadow: '0px 3px 6px rgba(64, 47, 255, 0.2)',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#000',
            }}
          >
            +  Add New Agent
          </div>
        </button>

      </div>

      {/* Test ai modal */}

      <Modal
        open={openTestAiModal}
        onClose={() => setOpenTestAiModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: "#00000030",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-6/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
              style={{
                backgroundColor: "#ffffff",

                borderRadius: "13px",
              }}
            >
              <div className='flex flex-row justify-between'>
                <div className='flex flex-row gap-3'>
                  <Image
                    src={'/otherAssets/testAiIcon.png'}
                    height={19} width={19} alt='icon'
                  />
                  <div style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    Test
                  </div>
                </div>
                <button onClick={() => { setOpenTestAiModal(false) }}>
                  <Image src={"/otherAssets/crossIcon.png"} height={24} width={24} alt='*' />
                </button>
              </div>

              <div style={{ fontSize: 24, fontWeight: '700', color: '#000', marginTop: 20 }}>
                Tryout (Agent name)
              </div>


              <div className='pt-5' style={styles.headingStyle}>
                Who are you calling
              </div>
              <input
                placeholder="Name"
                className='w-full border rounded p-2 outline-none'
                style={styles.inputStyle}
                value={name}
                onChange={(e) => { setName(e.target.value) }}
              />

              <div className='pt-5' style={styles.headingStyle}>
                Phone Number
              </div>
              <input
                placeholder="Phone Number"
                className='w-full border rounded p-2 outline-none'
                style={styles.inputStyle}
                value={phone}
                onChange={(e) => { setPhone(e.target.value) }}
              />

              <div className='pt-5' style={styles.headingStyle}>
                Address
              </div>
              <input
                placeholder="Address"
                className='w-full border rounded p-2 outline-none'
                style={styles.inputStyle}
                value={address}
                onChange={(e) => { setAddress(e.target.value) }}
              />


              <div className='pt-5' style={styles.headingStyle}>
                Budget
              </div>
              <input
                placeholder="$ 0.00"
                className='w-full border rounded p-2 outline-none'
                style={styles.inputStyle}
                value={budget}
                onChange={(e) => { setBudget(e.target.value) }}
              />

              <button style={{ marginTop: 20 }} className='w-full flex bg-purple p-3 rounded-lg items-center justify-center'>
                <div style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>
                  Test AI
                </div>
              </button>



              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* drawer */}

      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "50%", // Adjust the width as per your design
            padding: "60px", // Add padding for internal spacing
          },
        }}
      >
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-row items-center justify-between mb-8">

            <div className="flex flex-row items-center gap-4 ">
              <div className="flex items-end">
                <Image
                  src={"/assets/colorCircle.png"}
                  height={90}
                  width={90}
                  alt="profile"
                />
                <button style={{ marginLeft: -35 }}>
                  <Image
                    src={"/otherAssets/cameraBtn.png"}
                    height={36}
                    width={36}
                    alt="camera"
                  />
                </button>
              </div>
              <div className='flex flex-col gap-1 items-start '>
                <div className='flex flex-row gap-2 items-center '>
                  <div style={{ fontSize: 24, fontWeight: "600" }}>Anna ai</div>
                  <div style={{ fontSize: 11, fontWeight: "600", color: "#666" }}>
                    Community update
                  </div>

                  <Image src={'/otherAssets/blueUpdateIcon.png'}
                    height={24}
                    width={24}
                    alt='icon'
                  />
                </div>

                <div style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                  +341 (806) 765-5836
                </div>

                <div className='flex flex-row gap-2 items-center '>
                  <div style={{ fontSize: 11, fontWeight: "500", color: "#666" }}>
                    Created on:
                  </div>
                  <div style={{ fontSize: 11, fontWeight: "500", color: "#000" }}>
                    May 18, 2024
                  </div>

                </div>
              </div>
            </div>
            <button>
              <div className='flex flex-row gap-2 items-center '>
                <Image src={'/otherAssets/redDeleteIcon.png'}
                  height={24}
                  width={24}
                  alt='del'
                />

                <div style={{ fontSize: 15, fontWeight: '600', color: 'red', textDecorationLine: 'underline' }}>
                  Delete Agent
                </div>
              </div>
            </button>
          </div>



          <div className="grid grid-cols-3 gap-6 border p-8 flex-row justify-between w-full rounded-lg mb-6">
            <Card
              name="Number of Calls"
              value={98}
              icon="/assets/selectedCallIcon.png"
              bgColor="bg-blue-100"
              iconColor="text-blue-500"
            />
            <Card
              name="Convos >10 Sec"
              value={43}
              icon="/otherAssets/convosIcon2.png"
              bgColor="bg-purple-100"
              iconColor="text-purple-500"
            />
            <Card
              name="Hot Leads"
              value={22}
              icon="/otherAssets/hotLeadsIcon2.png"
              bgColor="bg-orange-100"
              iconColor="text-orange-500"
            />
            <Card
              name="Booked Meetings"
              value={9}
              icon="/otherAssets/greenCalenderIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
            <Card
              name="Live Transfers"
              value={12}
              icon="/otherAssets/transferIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
          </div>

          <div className="flex gap-8 pb-2 mb-4">
            {["Agent Info", "Contact", "Stages"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab ? "text-purple border-b-2 border-purple" : "text-black-500"
                  }`} style={{ fontSize: 15, fontWeight: '500' }}
              >
                {tab}
              </button>
            ))}

          </div>





          <div className='w-full flex items-end justify-end mb-5'>
            <button style={{ color: '#7902DF', fontSize: 15, fontWeight: '600' }}>
              Save Changes
            </button>
          </div>


          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Name</div>
              <div>Anna ai</div>
            </div>
            <div className="flex justify-between">
              <div>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Task</div>

              </div>
              <div>Making Outbound Calls</div>
            </div>
            <div className="flex justify-between">
              <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Role</div>
              <div>Senior Property Acquisition Specialist</div>
            </div>
            <div className="flex justify-between">
              <div className='flex flex-row gap-3'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Call Objective</div>
                <Image src={'/otherAssets/updateIcon.png'}
                  height={15}
                  width={20}

                  alt='call'
                />
              </div>
              <div>Community Update</div>
            </div>

            <div className="flex justify-between">
              <div className='flex flex-row gap-3'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Assigned Pipeline</div>
                <Image src={'/otherAssets/updateIcon.png'}
                  height={15}
                  width={20}

                  alt='call'
                />
              </div>
              <div>Default</div>
            </div>
          </div>

        </div>
      </Drawer>

    </div >
  )
}


const Card = ({ name, value, icon, bgColor, iconColor }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Icon */}
      <Image src={icon}
        height={24}
        color={bgColor}
        width={24}
        alt='icon'
      />

      <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>{name}</div>
      <div style={{ fontSize: 20, fontWeight: '700', color: '#000' }}>{value}</div>
    </div>
  );
};


export default Page


const styles = {
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    // p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-55%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: "700"
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10
  }
}

