import React, { useEffect, useState } from 'react'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import moment from 'moment';
import Image from 'next/image';
import AddMonthlyPlan from './AddMonthlyPlan';
import AddXBarPlan from './AddXBarPlan';
import { AuthToken } from './AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { Modal, Box, CircularProgress } from '@mui/material';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import DelConfirmationPopup from '@/components/onboarding/extras/DelConfirmationPopup';
import { CheckStripe, formatDecimalValue } from '../agencyServices/CheckAgencyData';
import { copyAgencyOnboardingLink } from '@/components/constants/constants';
import SupportFile from './SupportFile';
import AddMonthlyPlanAnimation from './AddMonthlyPlanAnimation';
import { formatFractional2 } from './AgencyUtilities';
import ConfigureSideUI from './ConfigureSideUI';
import EditPlanWarning from './EditPlanWarning';
import XBarSideUI from './XBarSideUI';


function DashboardPlans({
    selectedAgency
}) {

    const [moreDropdown, setmoreDropdown] = useState(null);

    const [plansList, setPlansList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    const [planType, setPlanType] = useState("monthly");
    const [open, setOpen] = useState(false);
    const [isEditPlan, setIsEditPlan] = useState(false);
    const [initialLoader, setInitialLoader] = useState(true);
    const [canAddPlan, setCanAddPlan] = useState(true);
    //code for snack messages    
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

    //code for confiration modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    //selected plan details
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
    const [customPlanFeatures, setCustomPlanFeatures] = useState([]);

    //agencyp plan cost
    const [agencyPlanCost, setAgencyPlanCost] = useState("");

    const [delLoading, setDelLoading] = useState(false);
    //search bar
    const [searchValue, setSearchValue] = useState("")

    //set custom features
    useEffect(() => {
        if (selectedPlanDetails && planType === "monthly") {

            const featuresObj = selectedPlanDetails?.dynamicFeatures;

            const featuresArray = Object.entries(featuresObj)
                .filter(([_, value]) => value === true) // only true values
                .map(([key, value]) => ({
                    text: key,
                    thumb: value
                }));

            console.log("Features array at dashboard plans is", featuresArray);

            // setCustomPlanFeatures(selectedPlanDetails.customFeatures);
        }
    }, [selectedPlanDetails]);

    //get local user data
    useEffect(() => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const u = JSON.parse(localData);
            const currentPlanId = u.user?.plan?.planId;
            const agencyPlansList = localStorage.getItem("agencyPlansList");
            if (selectedAgency) {
                console.log("Selected agency is", selectedAgency)
                setAgencyPlanCost(selectedAgency.plan.ratePerMin);
            } else {
                if (agencyPlansList) {
                    const u = JSON.parse(agencyPlansList);
                    const matchedPlan = u.find(plan => plan.id === currentPlanId);
                    console.log("Matched plan is", matchedPlan);
                    if (matchedPlan?.capabilities?.aiCreditRate) {
                        console.log("matchedPlan plan is", matchedPlan)
                        // capabilities?.aiCreditRate
                        setAgencyPlanCost(matchedPlan?.capabilities?.aiCreditRate);
                    }
                }
            }
        }
    }, [])

    //auto get the data
    useEffect(() => {
        getPlanApiTrigerer();
    }, [planType]);

    const getPlanApiTrigerer = () => {
        if (planType === "monthly") {
            // setInitialLoader(true);
            getMonthlyPlan();
        } else if (planType === "Xbar") {
            getXBarOptions()
        }
    }

    //check if plan has already trial true
    useEffect(() => {
        console.log("Trigered one 2");
        for (let i = 0; i < plansList?.length; i++) {
            if (plansList[i].hasTrial === true) {
                console.log("hasTrial is true at index", i);
                setCanAddPlan(false);
                break; // Stop looping after the first match
            }
        }

    }, [plansList]);

    //handle add new plan click
    const handleAddPlan = () => {
        let getStripe = null;
        if (selectedAgency) {
            getStripe = selectedAgency?.stripeConnected
        } else {
            getStripe = CheckStripe();
        }
        console.log("Status of stripe is", getStripe);
        if (!getStripe) {
            console.log("Show stripe warning ⚠️");
            setSnackMsg("Stripe needs to be connected");
            setSnackMsgType(SnackbarTypes.Warning);
        } else {
            setOpen(true);
        }
    }

    //plan created
    // const handlePlanCreated = (response) => {
    //     console.log("Response received is:", response);
    //     let newPlan = response?.data?.data;

    //     //get plans from local
    //     let localPlans = null;
    //     if (planType === "monthly") {
    //         const LP = localStorage.getItem("agencyMonthlyPlans");
    //         if(LP){
    //             const d = JSON.parse(LP);
    //             localPlans = d;
    //         }
    //     } else if (planType === "Xbar") {
    //         const LP = localStorage.getItem("XBarOptions");
    //         if(LP){
    //             const d = JSON.parse(LP);
    //             localPlans = d;
    //         }
    //     }
    //     console.log("Local Plans list is", localPlans);



    //     if (planType === "monthly") {
    //         localStorage.setItem("agencyMonthlyPlans", JSON.stringify([...plansList, newPlan]));
    //     } else if (planType === "Xbar") {
    //         localStorage.setItem("XBarOptions", JSON.stringify([...plansList, newPlan]));
    //     }
    //     setPlansList(prev => [...prev, newPlan]);
    // };

    const handlePlanCreated = (response) => {
        console.log("Response received is:", response);
        let newPlan = response?.data?.data;

        // Load existing plans based on type
        let localPlans = [];
        if (planType === "monthly") {
            console.log("")
            const LP = localStorage.getItem("agencyMonthlyPlans");
            if (LP) {
                localPlans = JSON.parse(LP);
            }
        } else if (planType === "Xbar") {
            const LP = localStorage.getItem("XBarOptions");
            if (LP) {
                localPlans = JSON.parse(LP);
            }
        }
        console.log("Local Plans list is", localPlans);

        // Update if exists, otherwise add
        let updatedPlans = [];
        const idToCompare = newPlan.id
        const existingIndex = localPlans.findIndex(plan => plan.id === idToCompare);

        if (existingIndex !== -1) {
            // Replace existing plan
            updatedPlans = [...localPlans];
            updatedPlans[existingIndex] = newPlan;
        } else {
            // Add new plan
            updatedPlans = [...localPlans, newPlan];
        }

        console.log("Updated plans are", updatedPlans);
        // Save to localStorage
        if (planType === "monthly") {
            localStorage.setItem("agencyMonthlyPlans", JSON.stringify(updatedPlans));
        } else if (planType === "Xbar") {
            localStorage.setItem("XBarOptions", JSON.stringify(updatedPlans));
        }

        // Update state
        setPlansList(updatedPlans);
        setFilteredList(updatedPlans)
    };


    //code to get the monthly plans

    const getMonthlyPlan = async () => {
        try {

            setInitialLoader(true);
            const localPlans = localStorage.getItem("agencyMonthlyPlans");
            if (localPlans) {
                setPlansList(JSON.parse(localPlans));
                setFilteredList(JSON.parse(localPlans));
                console.log("Plans list is", JSON.parse(localPlans));
            } //else {
            const Token = AuthToken();
            let ApiPath = Apis.getMonthlyPlan;
            if (selectedAgency) {
                ApiPath = ApiPath + `?userId=${selectedAgency.id}`
            }
            console.log("Api path for dashboard monthly plans api is", ApiPath)
            const response = await axios.get(ApiPath,
                {
                    headers: {
                        "Authorization": "Bearer " + Token,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (response) {
                console.log("Response of get monthly plan api is", response.data);
                setPlansList(response.data.data);
                setFilteredList(response.data.data);
                localStorage.setItem("agencyMonthlyPlans", JSON.stringify(response.data.data));
            }
        } catch (error) {
            setInitialLoader(false);
            console.error("Error occured in getting monthly plan", error);
        } finally {
            console.log("data recieved");
            setInitialLoader(false);
        }
    }

    //code to get the XBar Options
    const getXBarOptions = async () => {
        try {
            console.log("trigered xbar plaans api")
            setInitialLoader(true);
            const localXbarPlans = localStorage.getItem("XBarOptions");
            if (localXbarPlans) {
                const d = JSON.parse(localXbarPlans);
                console.log(d);
                setPlansList(JSON.parse(localXbarPlans));
                setFilteredList(JSON.parse(localXbarPlans));
            } //else {
            console.log("Passed here 1")
            const Token = AuthToken();
            let ApiPath = Apis.getXBarOptions;
            if (selectedAgency) {
                ApiPath = ApiPath + `?userId=${selectedAgency.id}`
            }
            console.log("Api path for dashboard monthly plans api is", ApiPath);
            const response = await axios.get(ApiPath,
                {
                    headers: {
                        "Authorization": "Bearer " + Token,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (response) {
                console.log("Response of XBar Option api is", response.data);
                setPlansList(response.data.data);
                setFilteredList(response.data.data);
                localStorage.setItem("XBarOptions", JSON.stringify(response.data.data));
            }
            // }
        } catch (error) {
            setInitialLoader(false);
            console.log("Error occured in getting XBar Option is", error.message);
        } finally {
            setInitialLoader(false);
            console.log("data recieved");
        }
    }

    useEffect(() => {
        console.log("Plan type is", planType);
    }, [planType])

    //code for closing popup
    const handleClosePlanPopUp = (mesg) => {
        setOpen(false);
        console.log("test check 23", mesg);
        if (mesg) {
            setSnackMsg(mesg);
            setSnackMsgType(SnackbarTypes.Success);
            getPlanApiTrigerer();
        }
        setmoreDropdown(null);
        setSelectedPlan(null);
        setSelectedPlanDetails(null);
    }

    //code to del plan
    const handleDeletePlan = async () => {
        try {
            setDelLoading(true)
            const token = AuthToken();
            let ApiPath = "";
            if (planType === "monthly") {
                ApiPath = `${Apis.removeAgencyPlan}/${moreDropdown}`;
            } else if (planType === "Xbar") {
                ApiPath = `${Apis.removeAgencyXBar}/${moreDropdown}`;
            }
            console.log("api path is", ApiPath)
            // return
            let delData = {}
            if (selectedAgency) {
                delData = { userId: selectedAgency.id, }
            }
            const response = await axios.delete(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json",
                },
                data: delData
            });

            if (response) {
                console.log("Response of del plans api is", response.data);
                if (response.data.status === true) {
                    // if (planType === "monthly") {
                    //     // setInitialLoader(true);
                    //     getMonthlyPlan();
                    // } else if (planType === "Xbar") {
                    //     getXBarOptions()
                    // }
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    getPlanApiTrigerer();
                    setSelectedPlan(null);
                    setSelectedPlanDetails(null);
                    setmoreDropdown(null);
                    setShowDeleteModal(false);
                } else if (response.data.status === false) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                }
            }

        } catch (error) {
            console.log("Error found in del plan api is", error)
        }
        finally {
            setDelLoading(false);
        }
    }

    //code to show plan details only
    const showPlanDetails = (item) => {
        console.log("Select plan is", item);
        setSelectedPlanDetails(item);
        // if (planType === "monthly") {
        // } else {
        //     console.log("This is XBas so no details view")
        //     setSelectedPlanDetails(item);
        // }
    }

    //search change
    const handleSearchChange = (value) => {
        setSearchValue(value);

        if (!value) {
            setFilteredList(plansList); // reset if empty
        } else {
            const lower = value.toLowerCase();
            setFilteredList(
                plansList.filter(
                    (item) =>
                        item.title?.toLowerCase().includes(lower)
                    // item.email?.toLowerCase().includes(lower) || // optional
                    // item.phone?.toLowerCase().includes(lower)   // optional
                )
            );
        }
    };

    return (
        <div className='w-full flex flex-col items-center '>
            {/* Code for snack msg */}
            <AgentSelectSnackMessage
                isVisible={snackMsg !== null}
                message={snackMsg}
                hide={() => { setSnackMsg(null) }}
                type={snackMsgType}
            />

            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    {/* AgencyName */}
                    Plans
                </div>

                <div className="flex flex-row items-center gap-2">
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md'>

                <div
                    className="w-full h-[130px] flex flex-row items-center justify-between rounded-lg px-6"
                    style={{
                        backgroundImage: "url('/agencyIcons/plansBannerBg.png')",//plansBannerBg //svgIcons/bg.svg
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // borderRadius:'20px'
                    }}
                >

                    <div style={{
                        fontSize: 29, fontWeight: '700', color: 'white'
                    }}>
                        Total Plans: {filteredList?.length ? filteredList.length : 0}
                    </div>

                    <button
                        className='flex px-5 py-3 bg-white rounded-lg text-purple font-medium'
                        onClick={() => {
                            setIsEditPlan(false);
                            handleAddPlan()
                        }}
                    >
                        New Plan
                    </button>


                </div>

                <div className='w-full flex flex-row items-center justify-between'>
                    <div className='px-4 mt-6 flex flex-row gap-4 border-b' style={{ fontSize: "15", fontWeight: "500", width: "fit-content" }}>
                        <div
                            className={`pb-2 flex flex-row items-center px-4 ${planType === "monthly" ? "text-purple border-b-2 border-purple" : "text-black"} gap-4`}>
                            {
                                planType === "monthly" ?
                                    <Image
                                        alt='focusMonthlyPln'
                                        src={"/agencyIcons/focusMonthlyPln.jpg"}
                                        width={23} height={25}
                                    /> :
                                    <Image
                                        alt='unFocusMonthlyPln'
                                        src={"/agencyIcons/unFocusMonthlyPln.jpg"}
                                        width={23} height={25}
                                    />
                            }
                            <button
                                className={`${planType === "monthly" ? "text-purple" : "text-black"}`}
                                onClick={() => { setPlanType("monthly") }}>
                                Monthly Plans
                            </button>
                        </div>
                        <div
                            className={`pb-4 ${planType === "Xbar" ? "text-purple border-b-2 border-purple px-2" : "text-black"} flex flex-row items-center gap-4`}>
                            {
                                planType === "Xbar" ?
                                    <Image
                                        alt='focusXBar'
                                        src={"/agencyIcons/focusXBar.jpg"}
                                        width={14} height={15}
                                    /> :
                                    <Image
                                        alt='UnFocusXBar'
                                        src={"/agencyIcons/UnFocusXBar.jpg"}
                                        width={14} height={15}
                                    />
                            }
                            <button
                                className={`${planType === "Xbar" ? "text-purple" : "text-black"}`}
                                onClick={() => { setPlanType("Xbar") }}>
                                XBar Options
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-1  w-[22vw] flex-shrink-0 border rounded-full px-4">
                        <input
                            style={{ fontSize: 15 }}
                            type="text"
                            placeholder="Search by name"
                            className="flex-grow outline-none font-[500]  border-none focus:outline-none focus:ring-0 flex-shrink-0 rounded-full"
                            value={searchValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                // handleSearchChange(value);
                                setSearchValue(value);
                                handleSearchChange(value);
                            }}
                        />
                        <Image
                            src={"/otherAssets/searchIcon.png"}
                            alt="Search"
                            width={20}
                            height={20}
                        />
                    </div>
                </div>

                {
                    filteredList?.length > 0 ? (
                        <>
                            <div className="w-full flex flex-row justify-between mt-4">
                                <div className="w-3/12">
                                    <div style={styles.text}>Name</div>
                                </div>
                                <div className="w-3/12">
                                    <div style={styles.text}>Description</div>
                                </div>
                                <div className="w-1/12">
                                    <div style={styles.text}>Price</div>
                                </div>
                                <div className="w-2/12">
                                    <div style={styles.text}>Accounts</div>
                                </div>
                                <div className="w-1/12">
                                    <div style={styles.text}>Minutes</div>
                                </div>
                                <div className="w-1/12">
                                    <div style={styles.text}>Action</div>
                                </div>
                            </div>

                            <div
                                className={`h-[71vh] overflow-auto w-full`}
                                id="scrollableDiv1"
                                style={{ scrollbarWidth: "none" }}
                            >
                                <div className='w-full'>
                                    {
                                        initialLoader ?
                                            <div className='w-full flex flex-row items-center justify-center'>
                                                <CircularProgress size={30} />
                                            </div> :
                                            <div className='w-full'>

                                                <div>
                                                    {filteredList.slice().reverse().map((item) => (
                                                        <div
                                                            key={item.id}
                                                            style={{ cursor: "pointer" }}
                                                            className="w-full flex flex-row justify-between items-center mt-5 hover:bg-[#402FFF05] py-2"
                                                        >
                                                            <div
                                                                className="w-3/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                                                                onClick={() => {
                                                                    showPlanDetails(item);
                                                                }}
                                                            >
                                                                <div style={{ ...styles.text2, ...{ width: "80%", } }}>
                                                                    {item.title}{" "}{item.hasTrial == true && (`| ${item.trialValidForDays} Day Free Trial`)}
                                                                </div>
                                                            </div>
                                                            <div className="w-3/12"
                                                                onClick={() => {
                                                                    showPlanDetails(item);
                                                                }}>
                                                                <div style={styles.text2}>
                                                                    {item.planDescription}
                                                                </div>
                                                            </div>
                                                            <div className="w-1/12"
                                                                onClick={() => {
                                                                    showPlanDetails(item);
                                                                }}>
                                                                <div style={styles.text2}>
                                                                    ${formatFractional2(item.discountedPrice) || 0}
                                                                </div>
                                                            </div>
                                                            <div className="w-2/12"
                                                                onClick={() => {
                                                                    showPlanDetails(item);
                                                                }}>
                                                                <div style={styles.text2}>
                                                                    {item.subscriberCount || 0}
                                                                </div>
                                                            </div>
                                                            <div className="w-1/12"
                                                                onClick={() => {
                                                                    console.log("Item is", item)
                                                                    showPlanDetails(item);
                                                                }}>
                                                                {item.minutes || "X"}-Mins
                                                            </div>

                                                            <div className="w-1/12 relative">
                                                                <button
                                                                    id={`dropdown-toggle-${item.id}`}
                                                                    onClick={() => {
                                                                        setmoreDropdown(
                                                                            moreDropdown === item.id ? null : item.id
                                                                        );
                                                                        setSelectedPlan(selectedPlan === item ? null : item);
                                                                    }}
                                                                >
                                                                    <Image src={'/svgIcons/threeDotsIcon.svg'} height={24} width={24} alt="menu" />
                                                                </button>

                                                                {moreDropdown === item.id && (
                                                                    <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg z-50 w-[200px]">
                                                                        <div>
                                                                            <button
                                                                                className="px-4 py-2 hover:bg-purple10 w-full text-start bg-transparent cursor-pointer text-sm font-medium text-gray-800"
                                                                                onClick={() => {
                                                                                    // setmoreDropdown(null)
                                                                                    if (selectedPlan.subscriberCount > 0) {
                                                                                        setSnackMsg("Cannot edit plan with active subscriptions.");
                                                                                        setSnackMsgType(SnackbarTypes.Warning);
                                                                                    } else {
                                                                                        setIsEditPlan(true);
                                                                                        setOpen(true);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start bg-transparent"
                                                                            onClick={() => {
                                                                                setShowDeleteModal(true);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                        {
                                                                            showDeleteModal && (
                                                                                <DelConfirmationPopup
                                                                                    showDeleteModal={showDeleteModal}
                                                                                    handleClose={() => {
                                                                                        setShowDeleteModal(false);
                                                                                    }}
                                                                                    delLoading={delLoading}
                                                                                    handleDelete={() => {
                                                                                        // console.log('planType', planType)
                                                                                        handleDeletePlan()
                                                                                    }}
                                                                                    selectedPlan={selectedPlan}
                                                                                />
                                                                            )
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                    }
                                </div>
                            </div>

                        </>
                    ) : (
                        <div
                            className="text-center mt-4"
                            style={{ fontWeight: "bold", fontSize: 20 }}
                        >
                            {
                                planType === "monthly" ? (
                                    <div className='h-full w-full flex flex-col items-center justify-center'>
                                        <Image
                                            alt='*'
                                            src={"/agencyIcons/nomonthlyplan.jpg"}
                                            height={230}
                                            width={420}
                                        />
                                        <div className='-mt-32' style={{ fontWeight: "600", fontSize: 22 }}>
                                            No Plans
                                        </div>
                                        <div className='mt-4' style={{ fontWeight: "600", fontSize: 16 }}>
                                            You have no monthly plans created
                                        </div>
                                        <button
                                            className='mt-3 bg-purple text-white rounded-lg h-[50px] w-[209px]'
                                            style={{ fontWeight: "500", fontSize: 15 }}
                                            Create New Plan
                                            onClick={() => {
                                                setIsEditPlan(false);
                                                handleAddPlan();
                                            }}
                                        >
                                            Create New Plan
                                        </button>
                                    </div>
                                ) : (
                                    <div className='h-full w-full flex flex-col items-center justify-center'>
                                        <Image
                                            alt='*'
                                            src={"/agencyIcons/noXBarPlans.jpg"}
                                            height={230}
                                            width={420}
                                        />
                                        <div className='-mt-32' style={{ fontWeight: "600", fontSize: 22 }}>
                                            No Xbar
                                        </div>
                                        <div className='mt-4' style={{ fontWeight: "600", fontSize: 16 }}>
                                            You have no Xbars created
                                        </div>
                                        <button
                                            className='mt-3 bg-purple text-white rounded-lg h-[50px] w-[209px]'
                                            style={{ fontWeight: "500", fontSize: 15 }}
                                            onClick={handleAddPlan}>
                                            Create Xbar
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    )
                }


                {/* code for modals */}

                {
                    planType === "monthly" ?
                        <AddMonthlyPlanAnimation
                            open={open}
                            handleClose={handleClosePlanPopUp} onPlanCreated={handlePlanCreated}
                            canAddPlan={canAddPlan}
                            agencyPlanCost={agencyPlanCost}
                            isEditPlan={isEditPlan}
                            selectedPlan={selectedPlan}
                            selectedAgency={selectedAgency}
                        /> :
                        <AddXBarPlan
                            open={open}
                            handleClose={handleClosePlanPopUp}
                            onPlanCreated={handlePlanCreated}
                            agencyPlanCost={agencyPlanCost}
                            isEditPlan={isEditPlan}
                            selectedPlan={selectedPlan}
                            selectedAgency={selectedAgency}
                        />
                }

                {/* Code for plan details */}
                {
                    selectedPlanDetails && (
                        <Modal
                            open={selectedPlanDetails !== null}
                            onClose={() => { setSelectedPlanDetails(null) }}
                        >
                            <Box className="bg-transparent rounded-xl max-w-[80%] w-[34%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                {
                                    planType === "monthly" ? (
                                        <ConfigureSideUI
                                            handleClose={() => { setSelectedPlanDetails(null) }}
                                            // handleResetValues={handleResetValues}
                                            allowedFeatures={selectedPlanDetails?.features}
                                            noOfAgents={selectedPlanDetails?.maxAgents}
                                            noOfContacts={selectedPlanDetails?.maxLeads}
                                            basicsData={selectedPlanDetails}
                                            // features={features}
                                            allowTrial={selectedPlanDetails?.dynamicFeatures?.allowTrial}
                                            trialValidForDays={selectedPlanDetails?.trialValidForDays}
                                            from={"dashboard"}
                                        />
                                    ) : (
                                        <XBarSideUI
                                            handleClose={() => { setSelectedPlanDetails(null) }}
                                            title={selectedPlanDetails?.title}
                                            tag={selectedPlanDetails?.tag}
                                            planDescription={selectedPlanDetails?.planDescription}
                                            originalPrice={selectedPlanDetails?.discountedPrice}
                                            discountedPrice={selectedPlanDetails?.originalPrice}
                                            minutes={selectedPlanDetails?.minutes}
                                            from={"dashboard"}
                                        />
                                    )
                                }
                            </Box>
                        </Modal>
                    )
                }

                {/* Warning popup */}
                <EditPlanWarning
                    open={false}
                // handleClose={handleClosePlanPopUp}
                />

            </div>

            {/*
                <SupportFile />
            */}

        </div >
    )
}

export default DashboardPlans


const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "600",
        // textAlign: "start",
        // backgroundColor: "red"
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    planTypeHeading: {
        fontWeight: "600",
        fontSize: "18px"
    }
}