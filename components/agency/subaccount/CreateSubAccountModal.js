import { useEffect, useRef, useState } from 'react';
import { Modal, Box } from '@mui/material';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import PhoneInput from "react-phone-input-2";
import { getLocalLocation } from '@/components/onboarding/services/apisServices/ApiService';
import { PersistanceKeys } from "@/constants/Constants";
import parsePhoneNumberFromString from 'libphonenumber-js';
import 'react-phone-input-2/lib/style.css';
import SetPricing from './SetPricing';

export default function CreateSubAccountModal({ isOpen, onClose }) {

    const timerRef = useRef(null);

    const [subAccountName, setSubAccountName] = useState("");

    //user email
    const [userEmail, setUserEmail] = useState("");
    const [emailCheckResponse, setEmailCheckResponse] = useState(null);
    const [emailLoader, setEmailLoader] = useState(false);
    const [validEmail, setValidEmail] = useState("");

    //user phone
    const [locationLoader, setLocationLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countryCode, setCountryCode] = useState("");
    const [userPhoneNumber, setUserPhoneNumber] = useState("");
    const [phoneNumberLoader, setPhoneNumberLoader] = useState(false);
    const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    //team members fields
    const [teamMembers, setTeamMembers] = useState([
        {
            name: '',
            email: '',
            phone: '',
            emailError: '',
            emailValid: null,
            phoneError: '',
            phoneValid: null,
        },
        {
            name: '',
            email: '',
            phone: '',
            emailError: '',
            emailValid: null,
            phoneError: '',
            phoneValid: null,
        },
    ]);

    //just for adding loader on member email check api
    // const [memberEmailLoader, setMemberEMailLoader] = useState(false);

    //code to open pricing list plan
    const [openPricing, setOpenPricing] = useState(false);


    //auto select location
    useEffect(() => {
        let loc = getLocalLocation();
        setCountryCode(loc);
        let storedData = localStorage.getItem(PersistanceKeys.RegisterDetails);
        if (storedData) {
            let data = JSON.parse(storedData);
            setUserData(data);
        }
    }, []);

    //code for add memeber array input fields

    const handleAddMember = () => {
        setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }]);
    };

    const handleRemoveMember = (index) => {
        const updated = [...teamMembers];
        updated.splice(index, 1);
        setTeamMembers(updated);
    };

    const handleChange = (index, field, value) => {
        const updated = [...teamMembers];
        updated[index][field] = value;
        setTeamMembers(updated);
    };

    //validate member email
    const validateMemberEmail = (index, email) => {
        const updated = [...teamMembers];
        const isValid = validateEmail(email);

        updated[index].emailError = isValid ? '' : 'Invalid';
        updated[index].emailValid = isValid;
        setTeamMembers(updated);

        if (isValid) {
            // Add debounce API call if needed
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                checkTeamMemberEmail(index, email);
            }, 300);
        }
    };

    //member email check
    const checkTeamMemberEmail = async (index, email) => {
        try {
            const response = await axios.post(Apis.CheckEmail, { email });
            const updated = [...teamMembers];

            // console.log("memberEmail check", response);

            if (response.data.status === true) {
                updated[index].emailValid = true;
                updated[index].emailError = '';
            } else {
                updated[index].emailValid = false;
                updated[index].emailError = response.data.message || 'Email not available';
            }

            setTeamMembers(updated);
        } catch (err) {
            console.error("Email check error:", err);
        }
    };

    //validate Member Phone
    const validateMemberPhone = (index, phone, countryCode) => {
        // console.log("Checking phone validation");
        const updated = [...teamMembers];
        const parsed = parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase());
        if (!parsed || !parsed.isValid()) {
            updated[index].phoneError = 'Invalid';
            updated[index].phoneValid = false;
        } else {
            updated[index].phoneError = '';
            updated[index].phoneValid = true;

            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                checkTeamMemberPhone(index, phone);
            }, 300);
        }

        setTeamMembers(updated);
    };

    //member check phone api call
    const checkTeamMemberPhone = async (index, phone) => {
        try {
            const response = await axios.post(Apis.CheckPhone, { phone });
            const updated = [...teamMembers];

            if (response.data.status === true) {
                updated[index].phoneValid = true;
                updated[index].phoneError = '';
            } else {
                updated[index].phoneValid = false;
                updated[index].phoneError = response.data.message || 'Phone not available';
            }

            setTeamMembers(updated);
        } catch (err) {
            console.error("Phone check error:", err);
        }
    };



    //user email validation function
    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Check if email contains consecutive dots, which are invalid
        if (/\.\./.test(email)) {
            return false;
        }

        // Check the general pattern for a valid email
        return emailPattern.test(email);
    };

    //api to check the email availibility
    const checkEmail = async (value) => {
        try {
            setValidEmail("");
            setEmailLoader(true);

            const ApiPath = Apis.CheckEmail;

            const ApiData = {
                email: value,
            };

            // //console.log;

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of check email is", response.data);
                if (response.data.status === true) {
                    // console.log("response of check email", response);
                    setEmailCheckResponse(response.data);
                } else if (response.data.status === false) {
                    setEmailCheckResponse(response.data);
                }
            }
        } catch (error) {
            // console.error("Error occured in check email api is :", error);
        } finally {
            setEmailLoader(false);
        }
    };

    // Handle phone number change and validation
    const handlePhoneNumberChange = (phone, countryData) => {
        setUserPhoneNumber(phone);
        validatePhoneNumber(phone);

        if (!phone) {
            setErrorMessage("");
        }
    };

    // Function to validate phone number
    const validatePhoneNumber = (phoneNumber) => {
        // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
        // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
        const parsedNumber = parsePhoneNumberFromString(
            `+${phoneNumber}`,
            countryCode?.toUpperCase()
        );
        // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
        if (!parsedNumber || !parsedNumber.isValid()) {
            setErrorMessage("Invalid");
        } else {
            setErrorMessage("");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // setCheckPhoneResponse(null);
            // //console.log;

            timerRef.current = setTimeout(() => {
                checkPhoneNumber(phoneNumber);
                // //console.log;
            }, 300);
        }
    };

    //api to check phone
    const checkPhoneNumber = async (value) => {
        try {
            setPhoneNumberLoader(true);
            const ApiPath = Apis.CheckPhone;

            const ApiData = {
                phone: value,
            };

            // //console.log;

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                if (response.data.status === true) {
                    // //console.log;
                    setCheckPhoneResponse(response.data);
                } else {
                    setCheckPhoneResponse(response.data);
                }
            }
        } catch (error) {
            // console.error("Error occured in check phone api is :", error);
        } finally {
            setPhoneNumberLoader(false);
        }
    };

    //styles 
    const styles = {
        inputs: {
            fontWeight: "500",
            fontSize: "15px"
        },
        headings: {
            fontWeight: "600",
            fontSize: "17px"
        },
        errmsg: {
            fontSize: 12,
            fontWeight: "500",
            borderRadius: "7px",
        },
    }

    return (
        <Modal
            open={isOpen}
        // onClose={onClose}
        >
            <Box
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 
                -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
                sx={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create SubAccount</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>

                <label style={styles.headings}>
                    Sub Account Name
                </label>
                <input
                    type="text"
                    className="w-full mt-2 mb-4 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                    placeholder="Type here..."
                    style={styles.inputs}
                    value={subAccountName}
                    onChange={(e) => { setSubAccountName(e.target.value) }}
                />

                <div className="flex flex-row items-center w-full justify-between">
                    <label style={styles.headings}>
                        Enter your email
                    </label>
                    <div>
                        {emailLoader ? (
                            <p className='text-purple' style={{ ...styles.errmsg, }}>
                                Checking ...
                            </p>
                        ) : (
                            <div>
                                {emailCheckResponse ? (
                                    <p
                                        style={{
                                            ...styles.errmsg,
                                            color:
                                                emailCheckResponse.status === true
                                                    ? "green"
                                                    : "red",
                                        }}
                                    >
                                        {emailCheckResponse?.message?.slice(0, 1)
                                            .toUpperCase() +
                                            emailCheckResponse?.message?.slice(1)}
                                    </p>
                                ) : (
                                    <div />
                                )}
                            </div>
                        )}
                        <div style={{ ...styles.errmsg, color: "red" }}>
                            {validEmail}
                        </div>
                    </div>
                </div>

                <input
                    type="email"
                    className="w-full mt-2 mb-4 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                    placeholder="Type here..."
                    style={styles.inputs}
                    value={userEmail}
                    onChange={(e) => {
                        let value = e.target.value;
                        setUserEmail(value);

                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                        }

                        setEmailCheckResponse(null);

                        if (!value) {
                            // //console.log;
                            setValidEmail("");
                            return;
                        }

                        if (!validateEmail(value)) {
                            // //console.log;
                            setValidEmail("Invalid");
                        } else {
                            // //console.log;
                            if (value) {
                                // Set a new timeout
                                timerRef.current = setTimeout(() => {
                                    checkEmail(value);
                                }, 300);
                            } else {
                                // Reset the response if input is cleared
                                setEmailCheckResponse(null);
                                setValidEmail("");
                            }
                        }
                    }}
                />

                <label style={styles.headings}>
                    Enter your phone
                </label>
                <div>
                    {locationLoader && (
                        <p
                            className="text-purple"
                            style={{ ...styles.errmsg, height: "20px" }}
                        >
                            Getting location ...
                        </p>
                    )}
                    {errorMessage ? (
                        <p
                            style={{
                                ...styles.errmsg,
                                color: errorMessage && "red",
                                height: "20px",
                            }}
                        >
                            {errorMessage}
                        </p>
                    ) : (
                        <div>
                            {phoneNumberLoader ? (
                                <p
                                    style={{
                                        ...styles.errmsg,
                                        color: "black",
                                        height: "20px",
                                    }}
                                >
                                    Checking ...
                                </p>
                            ) : (
                                <div>
                                    {checkPhoneResponse ? (
                                        <p
                                            style={{
                                                ...styles.errmsg,
                                                color:
                                                    checkPhoneResponse.status === true
                                                        ? "green"
                                                        : "red",
                                                height: "20px",
                                            }}
                                        >
                                            {checkPhoneResponse?.message?.slice(0, 1)
                                                .toUpperCase() +
                                                checkPhoneResponse?.message?.slice(1)}
                                        </p>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "8px" }}>
                    <PhoneInput
                        specialLabel=""
                        className="border outline-none bg-white"
                        country={"us"} // Set the default country
                        value={userPhoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder={
                            locationLoader
                                ? "Loading location ..."
                                : "Enter Phone Number"
                        }
                        disabled={loading} // Disable input if still loading
                        style={{ borderRadius: "7px" }}
                        inputStyle={{
                            width: "100%",
                            borderWidth: "0px",
                            backgroundColor: "transparent",
                            paddingLeft: "60px",
                            paddingTop: "20px",
                            paddingBottom: "20px",
                        }}
                        buttonStyle={{
                            border: "none",
                            backgroundColor: "transparent",
                            // display: 'flex',
                            // alignItems: 'center',
                            // justifyContent: 'center',
                        }}
                        dropdownStyle={{
                            maxHeight: "150px",
                            overflowY: "auto",
                        }}
                        countryCodeEditable={false}
                        disableDropdown={true}
                        defaultMask={loading ? "Loading..." : undefined}
                    />
                </div>

                <div className="mb-4">
                    <p
                        className="mb-2 mt-4"
                        style={styles.headings}
                    >
                        Invite Team Members
                    </p>
                    <div className='flex fex-row ites-center w-full mb-2'>
                        <div className="w-4/12"
                            style={styles.inputs}>
                            Full Name
                        </div>
                        <div className="w-4/12"
                            style={styles.inputs}>
                            Email Address
                        </div>
                        <div className="w-4/12"
                            style={styles.inputs}>
                            Phone Number
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="gap-4 flex flex-row items-center"
                            // relative grid grid-cols-1 md:grid-cols-3
                            >
                                <input
                                    type="text"
                                    placeholder="Type here..."
                                    className="px-3 py-2 border border-gray-300 rounded-lg w-4/12 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                    value={member.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    style={styles.inputs}
                                />

                                <div className='w-4/12'>
                                    <input
                                        type="email"
                                        placeholder="Type here..."
                                        className="px-3 py-2 w-[90%] border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                        value={member.email}
                                        onChange={(e) => {
                                            handleChange(index, 'email', e.target.value);
                                            validateMemberEmail(index, e.target.value);
                                        }}
                                        style={styles.inputs}
                                    />

                                    {/* Success/Error Message */}
                                    <div>
                                        {member.emailError && (
                                            <p style={{ ...styles.errmsg, color: 'red' }}>{member.emailError}</p>
                                        )}
                                        {member.emailValid && !member.emailError && (
                                            <p style={{ ...styles.errmsg, color: 'green' }}>Valid</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-row items-center overflow-hidden w-4/12">
                                    <div className='w-[90%] flex flex-row items-center'>
                                        <div className="w-full">
                                            <PhoneInput
                                                country={"us"}
                                                value={member.phone}
                                                onChange={(value, countryData, e) => {
                                                    handleChange(index, 'phone', value);
                                                    // if (e?.type === 'input') {
                                                    validateMemberPhone(index, value, "us");
                                                    // }
                                                }}
                                                countryCodeEditable={false}
                                                disableDropdown={true}
                                                specialLabel=""
                                                inputStyle={{
                                                    width: "100%",
                                                    borderWidth: "0px",
                                                    backgroundColor: "transparent",
                                                    paddingLeft: "45px",
                                                    paddingTop: "14px",
                                                    paddingBottom: "14px",
                                                    fontSize: "15px",
                                                    fontWeight: "500"
                                                }}
                                                buttonStyle={{
                                                    border: "none",
                                                    backgroundColor: "transparent"
                                                }}
                                                dropdownStyle={{
                                                    maxHeight: "150px",
                                                    overflowY: "auto",
                                                }}
                                                containerClass="border border-gray-300 rounded-lg w-full"
                                            />
                                            {/* Show validation */}
                                            {member.phoneError && (
                                                <p style={{ ...styles.errmsg, color: 'red' }}>{member.phoneError}</p>
                                            )}
                                            {member.phoneValid && !member.phoneError && (
                                                <p style={{ ...styles.errmsg, color: 'green' }}>Valid</p>
                                            )}
                                        </div>

                                    </div>
                                    {index > 0 && (
                                        <button
                                            onClick={() => handleRemoveMember(index)}
                                            className="text-red-500 hover:text-red-700 text-sm ms-2 text-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddMember}
                        className="mt-3 text-purple border-b boder-2 border-purple60 text-sm"
                    >
                        New Member
                    </button>
                </div>

                <div className="flex justify-between mt-6">
                    <button onClick={onClose} className="w-1/4 text-center text-purple">Cancel</button>
                    <button
                        className="bg-purple w-1/2 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                        onClick={() => { setOpenPricing(true) }}
                    >
                        Continue
                    </button>
                </div>

                {/* Pricing Modal */}
                <SetPricing
                    isOpen={openPricing}
                    onClose={() => setOpenPricing(false)}
                    userEmail={userEmail}
                    userPhoneNumber={userPhoneNumber}
                    teamMembers={teamMembers}
                    subAccountName={subAccountName}
                />

            </Box>
        </Modal>
    );
}
