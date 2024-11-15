import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Apis from '../apis/Apis';
import axios from 'axios';
import { Box, Modal } from '@mui/material';

const CreateAccount3 = ({ handleContinue, handleBack }) => {

  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [registerLoader, setRegisterLoader] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  // const [emailErr, setEmailErr] = useState(false);
  const [userFarm, setUserFarm] = useState("");
  const [userBrokage, setUserBrokage] = useState("");
  const [userTransaction, setUserTransaction] = useState("");
  //phone number input variable
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);

  // Function to get the user's location and set the country code
  useEffect(() => {
    const registerationDetails = localStorage.getItem("registerDetails");
    // let registerationData = null;
    if (registerationDetails) {
      const registerationData = JSON.parse(registerationDetails);
      console.log("User registeration data is :--", registerationData);
      setUserData(registerationData);
    } else {
      alert("Add details to continue");
    }
    const fetchCountry = async () => {
      try {
        // Get user's geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          // Fetch country code based on lat and long
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();

          // Set the country code based on the geolocation API response
          setCountryCode(data.countryCode.toLowerCase());
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        setLoading(false); // Stop loading if there’s an error
      }
    };

    fetchCountry();
  }, []);

  // Handle phone number change and validation
  const handlePhoneNumberChange = (phone) => {
    setUserPhoneNumber(phone);
    validatePhoneNumber(phone);
  };

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`, countryCode.toUpperCase());
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Enter valid number');
    } else {
      setErrorMessage('');
    }
  };

  //email validation function
  // const validateEmail = (email) => {
  //   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //   // Check if email contains consecutive dots, which are invalid
  //   if (/\.\./.test(email)) {
  //     return false;
  //   }

  //   // Check the general pattern for a valid email
  //   return emailPattern.test(email);
  // };

  //code for verify number popup
  const handleVerifyPopup = () => {
    console.log("Mike testing 123");
    setShowVerifyPopup(true);
  }

  const handleClose = () => {
    setShowVerifyPopup(false);
  }

  //code for registering user
  const handleRegister = async () => {
    try {
      setRegisterLoader(true);
      const ApiPath = Apis.register;
      const formData = new FormData();
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("phone", userPhoneNumber);
      formData.append("farm", userFarm);
      formData.append("brokerage", userBrokage);
      formData.append("averageTransactionPerYear", userTransaction);
      formData.append("agentService", userData.serviceID);
      formData.append("areaOfFocus", userData.focusAreaId);
      formData.append("userType", "RealEstateAgent");

      console.log("Data for user registeration is :-----");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      return
      const response = await axios.post(ApiPath, formData);
      if (response) {
        console.log("Response of register api is:--", response);
      }

    } catch (error) {
      console.error("Error occured in register api is: ", error);
    } finally {
      setRegisterLoader(false);
    }
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700"
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500"
    },
    verifyPopup: {
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
  }

  return (
    <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
      <div className='bg-gray-100 rounded-lg w-10/12 max-h-[90vh] py-4 overflow-auto'>
        {/* header */}
        <Header />
        {/* Body */}
        <div className='flex flex-col items-center px-4 w-full'>
          <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
            Your Contact Information
          </div>
          <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

            <div style={styles.headingStyle}>
              What's your full name
            </div>
            <input
              placeholder='Name'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
              value={userName}
              onChange={(e) => { setUserName(e.target.value) }}
            />

            <div style={styles.headingStyle}>
              What's your email address
            </div>
            <input
              placeholder='Email address'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
              value={userEmail}
              onChange={(e) => { setUserEmail(e.target.value) }}
            />

            <div style={styles.headingStyle}>
              What's your phone number
            </div>

            {/* <PhoneInput
              className="border-2 rounded outline-none bg-white"
              country={countryCode} // Default to 'us' if countryCode is not yet available
              value={userPhoneNumber}
              onChange={setUserPhoneNumber}
              placeholder="Enter phone number"
              disabled={loading} // Disable input if still loading
              inputStyle={{
                width: '100%',
                borderWidth: '0px',
                backgroundColor: 'transparent',
                paddingLeft: '60px',
                paddingTop: "12px",
                paddingBottom: "12px"
              }}
              buttonStyle={{
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dropdownStyle={{
                maxHeight: '150px',
                overflowY: 'auto'
              }}
              // Conditionally render a loader or the flag
              countryCodeEditable={true}
              defaultMask={loading ? 'Loading...' : undefined}
            /> */}

            <PhoneInput
              className="border-2 rounded outline-none bg-white"
              country={countryCode} // Set the default country
              value={userPhoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Loading location ..."
              disabled={loading} // Disable input if still loading
              inputStyle={{
                width: '100%',
                borderWidth: '0px',
                backgroundColor: 'transparent',
                paddingLeft: '60px',
                paddingTop: "12px",
                paddingBottom: "12px"
              }}
              buttonStyle={{
                border: 'none',
                backgroundColor: 'transparent',
                // display: 'flex',
                // alignItems: 'center',
                // justifyContent: 'center',
              }}
              dropdownStyle={{
                maxHeight: '150px',
                overflowY: 'auto'
              }}
              countryCodeEditable={true}
              defaultMask={loading ? 'Loading...' : undefined}
            />
            {/* Display error or success message */}
            <div style={{ height: "20px" }}>
              {
                errorMessage ?
                  <p style={{ ...styles.inputStyle, color: errorMessage && 'red', height: '20px' }}>
                    {errorMessage}
                  </p> :
                  <div style={{ height: "20px" }} />
              }
            </div>

            <div style={styles.headingStyle}>
              What's your farm
            </div>
            <input
              placeholder='Your territory  '
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
              value={userFarm}
              onChange={(e) => { setUserFarm(e.target.value) }}
            />

            <div style={styles.headingStyle}>
              Your brokerage
            </div>
            <input
              placeholder='Brokerage'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
              value={userBrokage}
              onChange={(e) => { setUserBrokage(e.target.value) }}
            />

            <div style={styles.headingStyle}>
              Average transaction volume per year
            </div>
            <input
              placeholder='Value'
              className='border-2 rounded p-2 outline-none'
              style={styles.inputStyle}
              value={userTransaction}
              onChange={(e) => { setUserTransaction(e.target.value) }}
            />

            <Modal
              open={showVerifyPopup}
              // onClose={() => setAddKYCQuestion(false)}
              closeAfterTransition
              BackdropProps={{
                timeout: 1000,
                sx: {
                  backgroundColor: "#00000020",
                  // backdropFilter: "blur(20px)",
                },
              }}
            >
              <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.verifyPopup}>
                <div className="flex flex-row justify-center w-full">
                  <div
                    className="sm:w-7/12 w-full"
                    style={{
                      backgroundColor: "#ffffff",
                      padding: 20,
                      borderRadius: "13px",
                    }}
                  >
                    <div className='flex flex-row justify-end'>
                      <button onClick={handleClose}>
                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                      </button>
                    </div>
                  </div>
                </div>
              </Box>
            </Modal>

          </div>
        </div>
        <div>
          <ProgressBar value={80} />
        </div>

        <Footer handleContinue={handleVerifyPopup} handleBack={handleBack} registerLoader={registerLoader} />
      </div>
    </div>
  )
}

export default CreateAccount3
