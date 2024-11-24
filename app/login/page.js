"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';

const Page = () => {

    const [phoneNumberLoader, setPhoneNumberLoader] = useState(false);
    const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
    const [locationLoader, setLocationLoader] = useState(false);

    const [userPhoneNumber, setUserPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [phoneVerifiedSuccessSnack, setPhoneVerifiedSuccessSnack] = useState(false);

    const handlePhoneNumberChange = (phone) => {
        setUserPhoneNumber(phone);
        validatePhoneNumber(phone);

        if (!phone) {
            setErrorMessage("");
        }

    };

    const getLocation = () => {
        console.log("getlocation trigered")
        const registerationDetails = localStorage.getItem("registerDetails");
        // let registerationData = null;
        setLocationLoader(true);
        if (registerationDetails) {
            const registerationData = JSON.parse(registerationDetails);
            console.log("User registeration data is :--", registerationData);
            setUserData(registerationData);
        } else {
            // alert("Add details to continue");
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
                setLoading(true); // Stop loading if there’s an error
            } finally {
                setLocationLoader(false);
            }
        };

        fetchCountry();
    }

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

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // setCheckPhoneResponse(null);
            console.log("Trigered")

            timerRef.current = setTimeout(() => {
                checkPhoneNumber(phoneNumber);
                console.log('I am hit now');
            }, 300);
        }
    };

    const checkPhoneNumber = async (value) => {
        try {
            setPhoneNumberLoader(true);
            const ApiPath = Apis.CheckPhone;

            const ApiData = {
                phone: value
            }

            console.log("Api data is :", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of check phone api is :", response);
                if (response.data.status === true) {
                    console.log("Response message is :", response.data.message);
                    setCheckPhoneResponse(response.data);
                } else {
                    setCheckPhoneResponse(response.data);
                }
            }

        } catch (error) {
            console.error("Error occured in check phone api is :", error);
        } finally {
            setPhoneNumberLoader(false);
        }
    }


    const backgroundImage = {
        backgroundImage: 'url("/assets/bg2.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundPosition: "50% 50%",
        backgroundPosition: "center",
        width: "940px",
        height: "90vh",
        overflow: "hidden",
    };

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "600"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500", borderRadius: "7px"
        },
        errmsg: {
            fontSize: 12,
            fontWeight: "500", borderRadius: "7px"
        },
    }

    return (
        <div className='flex flex-row w-full items-center h-screen'>
            <div className='w-4/12 ms-8 flex flex-row justify-center ' style={backgroundImage}>
                <div className='w-11/12'>
                    <div className='text-white' style={{ fontSize: 64, fontWeight: "600" }}>
                        Building your persona lead gen assistant
                    </div>
                    <div style={{ fontSize: 15, fontWeight: "500" }}>
                        {`By signing up to the AgentX platform you understand and agree to our Terms and Conditions and Privacy Policy. This site is protected by Google reCAPTCHA to ensure you’re not a bot. Learn more`}
                    </div>
                </div>
            </div>
            <div className='w-6/12 flex flex-row justify-center h-[90vh]'>
                <div className='w-10/12'>
                    <div>
                        <div className='flex flex-row items-center gap-4'>
                            <Image className='hidden md:flex' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' />
                            <Image className='' src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                        </div>
                        <div style={{ fontWeight: "600", fontSize: 24 }}>
                            Welcome to AgentX
                        </div>
                        <div className='mt-4' style={{ fontWeight: "600", fontSize: 17 }}>
                            {`What’s your phone number`}
                        </div>
                        <div className='flex flex-row items-center justify-between w-full mt-6'>
                            <div style={styles.headingStyle}>
                                {`What's your phone number`}
                            </div>
                            {/* Display error or success message */}
                            <div>
                                {
                                    locationLoader && (<p className='text-purple' style={{ ...styles.errmsg, height: '20px' }}>Getting location ...</p>)
                                }
                                {
                                    errorMessage ?
                                        <p style={{ ...styles.errmsg, color: errorMessage && 'red', height: '20px' }}>
                                            {errorMessage}
                                        </p> :
                                        <div>
                                            {
                                                phoneNumberLoader ?
                                                    <p style={{ ...styles.errmsg, color: "black", height: '20px' }}>
                                                        Checking phone number ...
                                                    </p> :
                                                    <div>
                                                        {
                                                            checkPhoneResponse ?
                                                                <p style={{ ...styles.errmsg, color: checkPhoneResponse.status === true ? "green" : 'red', height: '20px' }}>
                                                                    {checkPhoneResponse.message.slice(0, 1).toUpperCase() + checkPhoneResponse.message.slice(1)}
                                                                </p> :
                                                                <div />
                                                        }
                                                    </div>
                                            }
                                        </div>
                                }
                            </div>
                        </div>
                        <div>
                            <div style={{ marginTop: "8px" }}>
                                <PhoneInput
                                    className="border outline-none bg-white"
                                    country={countryCode} // Set the default country
                                    value={userPhoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    onFocus={getLocation}
                                    placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                                    disabled={loading} // Disable input if still loading
                                    style={{ borderRadius: "7px" }}
                                    inputStyle={{
                                        width: '100%',
                                        borderWidth: '0px',
                                        backgroundColor: 'transparent',
                                        paddingLeft: '60px',
                                        paddingTop: "12px",
                                        paddingBottom: "12px",
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
