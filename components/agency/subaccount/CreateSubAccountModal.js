import { useEffect, useRef, useState } from 'react';
import { Modal, Box, Switch, Tooltip } from '@mui/material';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import PhoneInput from "react-phone-input-2";
import { getLocalLocation } from '@/components/onboarding/services/apisServices/ApiService';
import { PersistanceKeys } from "@/constants/Constants";
import parsePhoneNumberFromString from 'libphonenumber-js';
import 'react-phone-input-2/lib/style.css';
import SetPricing from './SetPricing';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import agents from '@/components/onboarding/extras/AgentsList';
import SellSeatsModal from '@/components/onboarding/extras/SellSeatsModal';

export default function CreateSubAccountModal({ onClose, onContinue, formData }) {

    const timerRef = useRef(null);

    const defaultMembers = [
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
    ]

    //array of user types
    const userType = [
        {
            id: 1,
            title: "Real Estate Agent",
            agentType: "Real Estate Agent",
            icon: "/usertype/avt1.png",
            areaOfFocusTitle: "What area of real estate do you focus on?",
            userType: "RealEstateAgent",
            roundedImage: false,
        },
        {
            id: 2,
            title: "Sales Dev Agent",
            agentType: "SDR/BDR Agent",
            icon: "/usertype/avt2.png",
            areaOfFocusTitle: "What area of sales do you focus on?",
            userType: "SalesDevRep",
            roundedImage: false,
        },
        {
            id: 3,
            title: "Solar Agent",
            agentType: "Solar Agent",
            icon: "/usertype/avt3.png",
            areaOfFocusTitle: "What area of solar do you focus on?",
            userType: "SolarRep",
            roundedImage: false,
        },
        {
            id: 4,
            title: "Insurance Agent",
            agentType: "Insurance Agent",
            icon: "/usertype/avt4.png",
            areaOfFocusTitle: "What area of insurance do you focus on?",
            userType: "InsuranceAgent",
            roundedImage: false,
        },
        {
            id: 5,
            title: "Marketer",
            agentType: "Marketer Agent",
            icon: "/usertype/avt5.png",
            areaOfFocusTitle: "What area of marketing do you focus on?",
            userType: "MarketerAgent",
            roundedImage: false,
        },

        {
            id: 7,
            title: "Recruiter Agentt",
            agentType: "Recruiter Agent",
            icon: "/usertype/avt8.png",
            areaOfFocusTitle: "What industries do you specialize in?",
            userType: "RecruiterAgent",
            roundedImage: false,
        },
        {
            id: 8,
            title: "Tax Agent",
            agentType: "Tax Agent",
            icon: "/usertype/avt9.png",
            areaOfFocusTitle: "What type of clients do you primarily serve?",
            userType: "TaxAgent",
            roundedImage: false,
        },
        {
            id: 9,
            title: "Debt Collector Agent",
            agentType: "Debt Collector Agent",
            icon: "/usertype/debtcollectoragent.svg",
            areaOfFocusTitle: "What type of clients do you primarily serve?",
            userType: "DebtCollectorAgent",
            roundedImage: false,
        },
        {
            id: 11,
            title: "Med Spa Agent",
            agentType: "Med Spa Agent",
            icon: "/usertype/avt8.png",
            areaOfFocusTitle: "What types of services do you primarily offer",
            userType: "MedSpaAgent",
            roundedImage: false,
        },
        {
            id: 12,
            title: "Law Agent",
            agentType: "Law Agent",
            icon: "/usertype/avt4.png",
            areaOfFocusTitle: "What area of law do you primarily practice?",
            userType: "LawAgent",
            roundedImage: false,
        },
        {
            id: 13,
            title: "Loan Officer Agent",
            agentType: "Loan Officer Agent",
            icon: "/usertype/avt2.png",
            areaOfFocusTitle: "What type of loans do you primarily work with?",
            userType: "LoanOfficerAgent",
            roundedImage: false,
        },
        {
            id: 100,
            title: "Website Agent",
            agentType: "Website Agent",
            icon: "/agentXOrb.gif",
            areaOfFocusTitle: "How would you use AgentX?",
            userType: "WebsiteAgent",
            roundedImage: true,
        },
    ];

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

    const [showErrorSnack, setShowErrorSnack] = useState(null)

    //selected usertype
    const [selectedUserType, setSelectedUserType] = useState(null);

    //team members fields
    const [teamMembers, setTeamMembers] = useState([defaultMembers]);

    //continue restriction
    const [shouldContinue, setShouldContinue] = useState(false);

    //code for seats check list
    const [alowSellSeats, setAlowSellSeats] = useState(false);
    const [showSellSeatsModal, setShowSellSeatsModal] = useState(false);
    const [fullName, setFullName] = useState("");
    const [seats, setSeats] = useState("");

    //show sell seats modal
    useEffect(() => {
        console.log("trigered");
        console.log("Allow sell seats ", alowSellSeats);
        if (alowSellSeats === true) {
            console.log("Show modal");
            setShowSellSeatsModal(true);
        } else if (alowSellSeats === false) {
            setSeats("");
            console.log("no show modal");
            setShowSellSeatsModal(false);
        }
    }, [alowSellSeats])

    //check if can continue
    useEffect(() => {
        const hasEmptyTeamMember = teamMembers.some(member =>
            member?.name?.trim() === "" ||
            member?.email?.trim() === "" ||
            member?.phone?.trim() === ""
        );

        if (
            subAccountName?.trim() === "" ||
            userEmail?.trim() === "" ||
            userPhoneNumber?.trim() === "" ||
            selectedUserType?.trim() === "" ||
            fullName?.trim() === ""
            // hasEmptyTeamMember
        ) {
            console.log("Cannot continue");
            setShouldContinue(true);
        } else {
            setShouldContinue(false);
        }
    }, [subAccountName, userEmail, userPhoneNumber, selectedUserType, fullName]);



    useEffect(() => {
        const resetValues = () => {
            setSubAccountName("")
            setUserEmail("")
            setUserPhoneNumber("")
            setSelectedUserType(null)
            setTeamMembers(defaultMembers)
            setErrorMessage("")
            setValidEmail("")
            setFullName("");
            setSeats("");
            setAlowSellSeats(false);
        }
        if (formData) {
            setSubAccountName(formData.subAccountName);
            setUserEmail(formData.userEmail);
            setUserPhoneNumber(formData.userPhoneNumber);
            // setSelectedUserType(formData.selectedUserType);
            setTeamMembers(formData.teamMembers);
            setFullName(formData.fullName);
            setSeats(formData.seats);
            setAlowSellSeats(false);
            setErrorMessage("");
            setValidEmail("");
        } else {
            resetValues()
        }
    }, [])



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


    const handleContinue = () => {

        console.log('selectedtype', selectedUserType)

        // return

        // if (!subAccountName) {
        //     setShowErrorSnack("Enter SubAccount Name")
        //     return
        // }

        // if (!userEmail) {
        //     setShowErrorSnack("Enter SubAccount Email")
        //     return
        // }
        // if (!userPhoneNumber) {
        //     setShowErrorSnack("Enter SubAccount Phone Number")
        //     return
        // }
        // if (!selectedUserType) {
        //     setShowErrorSnack("Select SubAccount Agent Type")
        //     return
        // }

        const fromData = {
            userEmail: userEmail,
            userPhoneNumber: userPhoneNumber,
            teamMembers: teamMembers,
            subAccountName: subAccountName,
            fullName: fullName,
            seats: seats
        }

        // console.log(fromData);
        onContinue(fromData)


    }

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
        subheading: {
            fontWeight: "500",
            fontSize: 15
        },
    }

    return (
        <div className='h-[85vh]'>

            <div className='overflow-y-auto h-[92%] scrollbar-hide'
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>

                <AgentSelectSnackMessage
                    isVisible={showErrorSnack != null ? true : false}
                    hide={() => setShowErrorSnack(null)}
                    type={SnackbarTypes.Error} message={showErrorSnack}

                />
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create SubAccount</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>

                <div style={styles.headings}>
                    Account Owner Name
                </div>
                <input
                    type="text"
                    className="w-full mt-2 mb-4 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                    placeholder="Type here..."
                    style={styles.inputs}
                    value={subAccountName}
                    onChange={(e) => { setSubAccountName(e.target.value) }}
                />

                <div
                    className='mb-4'
                    style={styles.headings}>
                    Sub Account Name
                </div>

                <div className='w-full flex flex-row items-center gap-2'>
                    <div className='w-4/12'>
                        <div style={styles.inputs}>
                            Full Name
                        </div>
                        <div>
                            <input
                                type="email"
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                placeholder="Type here..."
                                value={fullName}
                                onChange={(e) => { setFullName(e.target.value) }}
                                style={styles.inputs}
                            />
                        </div>
                    </div>
                    {/* Sub Acc Email */}
                    <div className='w-4/12'>
                        <div className="flex flex-row items-center w-full justify-between">
                            <div style={styles.inputs}>
                                Email
                            </div>
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
                        <div>
                            <input
                                type="email"
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
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
                        </div>
                    </div>
                    {/* Sub Acc Phone */}
                    <div className='w-4/12'>
                        <div className='flex flex-row items-center justify-between'>
                            <div style={styles.inputs}>
                                Phone Number
                            </div>
                            <div className=''>
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
                        </div>
                        <div className='mt-2'>
                            <PhoneInput
                                specialLabel=""
                                className="border outline-none bg-white"
                                country={countryCode} // Set the default country
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
                                countryCodeEditable={true}
                                defaultMask={loading ? "Loading..." : undefined}
                            />
                        </div>
                    </div>
                </div>



                {/* Code for allow sell seats */}
                <div className='flex flex-row items-center justify-between w-full py-1 px-4 bg-[#D9D9D92B] rounded-md mt-4'>
                    <div style={styles.inputs}>
                        {
                            seats ? (
                                <div>
                                    Sell Seats(${seats}/seat)
                                </div>
                            ) : (
                                <div>
                                    Sell Seats / Month
                                </div>
                            )
                        }
                    </div>

                    <Tooltip
                        title="If the lead has given consent, no need to run against DNC"
                        arrow
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: "#ffffff", // Ensure white background
                                    color: "#333", // Dark text color
                                    fontSize: "14px",
                                    padding: "10px 15px",
                                    borderRadius: "8px",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                },
                            },
                            arrow: {
                                sx: {
                                    color: "#ffffff", // Match tooltip background
                                },
                            },
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: "#000000",
                                cursor: "pointer",
                            }}
                        >
                            Maximize revenue by selling seats per month to any org.
                        </div>
                    </Tooltip>

                    <div className='flex flex-row items-center gap-4'>

                        <Switch
                            checked={alowSellSeats}
                            onChange={(e) => setAlowSellSeats(e.target.checked)}
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

                {/* Sell Seats Modal
                        <SellSeatsModal
                            seats={seats}
                            showModal={showSellSeatsModal}
                            closeModal={(d) => {
                                if (d) {
                                    setShowSellSeatsModal(false);
                                    setSeats(d);
                                } else {
                                    setShowSellSeatsModal(false);
                                    setAlowSellSeats(false);
                                }
                            }}
                        /> */}
                {
                    showSellSeatsModal && (
                        <div>
                            <div style={styles.subheading} className='mt-2'>
                                Amount per month
                            </div>
                            <div className='border border-gray-200 rounded px-2 py-0 mt-2 flex flex-row items-center w-full'>
                                <div className='' style={styles.subheading}>
                                    $
                                </div>
                                <input
                                    style={styles.subheading}
                                    // className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                    className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                                    type="number"
                                    placeholder="00"
                                    value={seats}
                                    onChange={(e) => { setSeats(e.target.value) }}
                                />
                            </div>
                        </div>
                    )
                }


                <div className="mb-4">
                    <p
                        className="mb-2 mt-4"
                        style={styles.headings}
                    >
                        Invite Team Members
                    </p>
                    <p className="mb-2"
                        style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#00000060"
                        }}>
                        {`Members invited in the list below won’t pay for seats.`}
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
                                                country={countryCode}
                                                value={member.phone}
                                                onChange={(value, countryData, e) => {
                                                    handleChange(index, 'phone', value);
                                                    // if (e?.type === 'input') {
                                                    validateMemberPhone(index, value, countryCode);
                                                    // }
                                                }}
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

                    <div className='w-full flex flex-row items-center justify-start pe-4'>
                        <button
                            onClick={handleAddMember}
                            className="mt-3 text-purple border-b boder-2 border-purple60 text-sm"
                        >
                            + New Member
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button onClick={onClose} className="w-1/4 text-center text-purple">Cancel</button>
                <button
                    disabled={shouldContinue}
                    className={`w-1/3 hover:bg-purple-700 px-6 py-2 rounded-lg ${shouldContinue ? "bg-[#00000020] text-black" : "bg-purple text-white"}`}
                    onClick={() => { handleContinue() }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
