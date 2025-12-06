import { Box, Button, CircularProgress, Modal, TextField } from '@mui/material'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { getBusinessProfile } from '@/apiservicescomponent/twilioapis/GetBusinessProfile'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
// import { useRouter } from "next/navigation";
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'

import AddTwilio from './AddTwilio'
import SelectCnam from './selectTrustProducts/SelectCnam'
import SelectStir from './selectTrustProducts/SelectStir'
import SelectVoiceIntegrity from './selectTrustProducts/SelectVoiceIntegrity'

const boxVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.4,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0.4,
  }),
}

const AddTwilioAnimation = ({
  showAddTwilio,
  handleClose,
  getProfileData,
  selectedUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  //snack messages
  const [snackMessage, setSnackMessage] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  //twilio api response
  const [trustProducts, setTrustProducts] = useState(null)
  const [getProfileLoader, setGetProfileLoader] = useState(false)

  const [showAnimation, setShowAnimation] = useState(false)
  const [closeLoader, setCloseLoader] = useState(false)

  // useEffect(() => {
  //     getProfile();
  // }, [])

  // const getProfile = async () => {
  //     const response = await getBusinessProfile();
  //     setTrustProducts(response.data.trustProducts);
  //     setShowAnimation(true);
  // }

  const handleContinue = (formData) => {
    if (formData) {
      console.log(formData)
    }
    setDirection(1)
    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => prevIndex - 1)
  }

  //handle continue after add the twilio, trust products
  const handleContinueTrustProduct = async (d, from) => {
    console.log('Api response is', d)
    setGetProfileLoader(true)
    const response = await getBusinessProfile()
    console.log(
      'Response of get business profile is',
      response.data.trustProducts[from].all.length > 0,
    )
    if (response.data.trustProducts[from].all.length > 0) {
      setTrustProducts(response.data.trustProducts)
      handleContinue()
    } else {
      handleClose(d)
    }
    setGetProfileLoader(false)
  }

  //clsoe when click on save
  const handleSaveExit = async (d) => {
    try {
      setCloseLoader(true)
      // const response = await getBusinessProfile();
      // setTrustProducts(response.data.trustProducts);
      getProfileData()
      handleClose(d)
      setCloseLoader(false)
      setShowAnimation(false)
    } catch (error) {
      setCloseLoader(false)
      console.log('Error occured in api is', error)
    }
  }

  return (
    <Modal
      open={true} //showAddTwilio
      // onClose={() => { handleClose() }}
      BackdropProps={{
        timeout: 200,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(20px)',
        },
      }}
      sx={{
        zIndex: 1300,
        // backgroundColor: "red"
      }}
    >
      <Box
        className="rounded-xl  w-5/12 shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col" //h-[70vh]
      >
        <div className="h-[100%]">
          <AgentSelectSnackMessage
            type={snackMessage.type}
            message={snackMessage.message}
            isVisible={snackMessage.isVisible}
            hide={() => {
              setSnackMessage({
                message: '',
                isVisible: false,
                type: SnackbarTypes.Success,
              })
            }}
          />
          <AnimatePresence initial={false} custom={direction}>
            {currentIndex === 0 && (
              <motion.div
                key="box1"
                custom={direction}
                variants={boxVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0 }}
                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                // style={styles.motionDiv}
              >
                <div className="h-[100%] w-full">
                  <AddTwilio
                    handleContinue={async (d) => {
                      // handleContinueTrustProduct(d, "cnam");
                      if (d) {
                        handleClose(d)
                      }
                    }}
                    handleClose={handleClose}
                    profileLoader={getProfileLoader}
                    closeLoader={closeLoader}
                    selectedUser={selectedUser}
                  />
                </div>
              </motion.div>
            )}

            {currentIndex === 1 && (
              <motion.div
                key="box2"
                custom={direction}
                variants={boxVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0 }}
                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                // style={styles.motionDiv}
              >
                <div className="h-[100%] w-full">
                  <SelectCnam
                    trustProducts={trustProducts}
                    handleContinue={async (d) => {
                      handleContinueTrustProduct(d, 'shakenStir')
                    }}
                    handleClose={handleSaveExit}
                    profileLoader={getProfileLoader}
                  />
                </div>
              </motion.div>
            )}

            {currentIndex === 2 && (
              <motion.div
                key="box3"
                custom={direction}
                variants={boxVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0 }}
                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
              >
                <div className="h-[100%] w-full">
                  <SelectStir
                    trustProducts={trustProducts}
                    handleContinue={async (d) => {
                      handleContinueTrustProduct(d, 'voiceIntegrity')
                    }}
                    handleClose={handleSaveExit}
                    profileLoader={getProfileLoader}
                  />
                </div>
              </motion.div>
            )}

            {currentIndex === 3 && (
              <motion.div
                key="box4"
                custom={direction}
                variants={boxVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0 }}
                className="p-6 rounded-lg w-[100%] shadow-lg bg-white border-none outline-none h-[100%]"
              >
                <SelectVoiceIntegrity
                  trustProducts={trustProducts}
                  handleContinue={(d) => {
                    getProfileData()
                    handleClose(d)
                  }}
                  handleClose={handleSaveExit}
                  profileLoader={getProfileLoader}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Box>
    </Modal>
  )
}

export default AddTwilioAnimation

const styles = {
  text: {
    fontSize: 15,
    color: '#00000090',
    fontWeight: '600',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  motionDiv: {
    // position: 'relative', // Ensures the boxes are stacked on top of each other
    // top: '0',
    // left: 0,
    // right: 0,
    // bottom: 0,
    // backgroundColor: "",
    // height: "20vh",
    // marginLeft: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
    // marginInline: 10,
  },
}
