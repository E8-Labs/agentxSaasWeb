import { Box, Button, CircularProgress, Modal, TextField } from '@mui/material'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
// import { useRouter } from "next/navigation";
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'

import BusinessInfo from '../customerprofile/BusinessInfo'
import ContactPoint from '../customerprofile/ContactPoint'
import GeneralInfo from '../customerprofile/GeneralInfo'
import BrandInfo from './BrandInfo'
import BrandedCallsBasicInfo from './BrandedCallsBasicInfo'
import BrandedCallsVerifiction from './BrandedCallsVerifiction'

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

const BrandedCallsAnimation = ({ showVoiceIntegration, handleClose }) => {
  const [loader, setLoader] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  //store basic info
  const [basicInfoData, setBasicInfoData] = useState({
    outboundVoiceService: '',
    complaintCalling: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  //snack messages
  const [snackMessage, setSnackMessage] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })
  // const [loader, setLoader] = useState(false);

  const handleContinue = (formData) => {
    if (formData) {}
    setDirection(1)
    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  const handleBack = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => prevIndex - 1)
  }

  //reset value on modal close
  // const resetValues = () => {
  //     setCurrentIndex(0);
  //     setDirection(0);
  //     setLegalBusinessName("");
  //     setProfileFriendlyName("");
  //     setCountry("");
  //     setStreet1("");
  //     setStreet2("");
  //     setCity("");
  //     setProvience("");
  //     setPostalCode("");
  //     setCustomerType("");
  //     setBusinessType("");
  //     setBusinessIndustry("");
  //     setBusinessRegIdType("");
  //     setBusinessRegNumber("");
  //     setBusinessOperatingRegion("");
  //     setFirstName("");
  //     setLastName("");
  //     setBusinessTitle("2");
  //     setJobPosition("");
  //     setAgreeTerms(false);
  // }

  //create trust hub profile

  return (
    <Modal
      open={showVoiceIntegration}
      onClose={() => {
        handleClose()
      }}
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
        className="rounded-xl max-w-2xl h-[70svh] w-full shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
        // className="w-full h-[100%]"
      >
        <AnimatePresence initial={false} custom={direction}>
          {currentIndex === 0 && (
            <motion.div
              key="box1"
              custom={direction}
              variants={boxVariants}
              initial="center"
              animate="center"
              exit="exit"
              transition={{ duration: 0 }}
              className="rounded-lg w-[100%] bg-white border-none outline-none h-[100%]"
              // style={styles.motionDiv}
            >
              <div className="h-[100%] w-full">
                <BrandedCallsBasicInfo
                  basicDetails={basicInfoData}
                  handleContinue={(d) => {
                    if (d) {
                      setBasicInfoData({
                        outboundVoiceService: d.outboundVoiceService,
                        complaintCalling: d.complaintCalling,
                        firstName: d.firstName,
                        lastName: d.lastName,
                        email: d.email,
                        phone: d.phone,
                      })
                    }
                    handleContinue()
                  }}
                />
              </div>
            </motion.div>
          )}

          {/*currentIndex === 2 && (
                        <motion.div
                            key="box3"
                            custom={direction}
                            variants={boxVariants}
                            initial="center"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0 }}
                            className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                        // style={styles.motionDiv}
                        >
                            <div className="h-[100%] w-full">
                                <BrandedCallsVerifiction
                                    handleContinue={handleContinue}
                                    handleBack={handleBack}
                                />
                            </div>
                        </motion.div>
                    )*/}

          {currentIndex === 1 && (
            <motion.div
              key="box2"
              custom={direction}
              variants={boxVariants}
              initial="center"
              animate="center"
              exit="exit"
              transition={{ duration: 0 }}
              className="rounded-lg w-[100%] bg-white border-none outline-none h-[100%]"
            >
              <div className="h-[100%] w-full">
                <BrandInfo
                  handleBack={(d) => {
                    handleBack()
                  }}
                  handleContinue={(d) => {
                    // setTimeout(() => {
                    // }, 100);
                    // handleCreateTrusthubProfile();
                    console.alert('Working in progress')
                  }}
                  basicInfoData={basicInfoData}
                />
              </div>
            </motion.div>
          )}

          {currentIndex === 3 && (
            <motion.div
              key="box4"
              custom={direction}
              variants={boxVariants}
              initial="center"
              animate="center"
              exit="exit"
              transition={{ duration: 0 }}
              className="p-6 rounded-lg w-[100%] shadow-lg bg-white border-none outline-none"
            >
              S_4
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Modal>
  )
}

export default BrandedCallsAnimation

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

// <Modal
//             open={true}
//             // onClose={() => {
//             //     handleClose();
//             // }}
//             // BackdropProps={{
//             //     timeout: 200,
//             //     sx: {
//             //         backgroundColor: "#00000020",
//             //         zIndex: 1200, // Keep backdrop below Drawer
//             //     },
//             // }}
//             sx={{
//                 zIndex: 1300,
//                 // backgroundColor: "red"
//             }}
//         >
//             <Box
//                 // className="rounded-xl max-w-2xl w-full shadow-lg h-[100%] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col"
//                 className="w-full h-[100%]"
//             >
//             </Box>
//         </Modal>
// <AgentSelectSnackMessage
//                 type={snackMessage.type}
//                 message={snackMessage.message}
//                 isVisible={snackMessage.isVisible}
//                 hide={() => {
//                     setSnackMessage({
//                         message: "",
//                         isVisible: false,
//                         type: SnackbarTypes.Success,
//                     });
//                 }}
//             />
