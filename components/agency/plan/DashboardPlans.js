import React, { useEffect, useState } from 'react'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import moment from 'moment';
import Image from 'next/image';
import AddMonthlyPlan from './AddMonthlyPlan';
import AddXBarPlan from './AddXBarPlan';
import { AuthToken } from './AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';

function DashboardPlans() {

    const [moreDropdown, setmoreDropdown] = useState(null);

    const [plansList, setPlansList] = useState([]);

    const [planType, setPlanType] = useState("monthly");
    const [open, setOpen] = useState(false);
    const [initialLoader, setInitialLoader] = useState(true);
    const [canAddPlan, setCanAddPlan] = useState(true);
    //code for snack messages    
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

    //auto get the data
    useEffect(() => {
        if (planType === "monthly") {
            // setInitialLoader(true);
            getMonthlyPlan();
        } else if (planType === "Xbar") {
            getXBarOptions()
        }
    }, [planType]);

    //check if plan has already trial true
    useEffect(() => {
        console.log("Trigered one 2");
        for (let i = 0; i < plansList.length; i++) {
            if (plansList[i].hasTrial === true) {
                console.log("hasTrial is true at index", i);
                setCanAddPlan(false);
                break; // Stop looping after the first match
            }
        }

    }, [plansList])

    //handle add new plan click
    const handleAddPlan = () => {
        setOpen(true);
    }

    //plan created
    const handlePlanCreated = (response) => {
        console.log("Response received is:", response);
        let newPlan = response?.data?.data;
        if (planType === "monthly") {
            localStorage.setItem("agencyMonthlyPlans", JSON.stringify([...plansList, newPlan]));
        } else if (planType === "Xbar") {
            localStorage.setItem("XBarOptions", JSON.stringify([...plansList, newPlan]));
        }
        setPlansList(prev => [...prev, newPlan]);
    };

    // const subAcccounts = [
    //     {
    //         id: 1,
    //         name: 'ali',
    //         plan: 'abc',
    //         tag: 'Best Deak',
    //         price: '378',
    //         STPrice: '260',
    //         Sold: 12,
    //         mins: '21',
    //     }
    // ]

    //code to get the monthly plans

    const getMonthlyPlan = async () => {
        try {

            setInitialLoader(true);
            const localPlans = localStorage.getItem("agencyMonthlyPlans");
            if (localPlans) {
                setPlansList(JSON.parse(localPlans));
                console.log(JSON.parse(localPlans));
            } else {
                const Token = AuthToken();
                const ApiPath = Apis.getMonthlyPlan
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
                    localStorage.setItem("agencyMonthlyPlans", JSON.stringify(response.data.data));
                }
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
            setInitialLoader(true);
            const localXbarPlans = localStorage.getItem("XBarOptions");
            if (localXbarPlans) {
                const d = JSON.parse(localXbarPlans);
                console.log(d);
                setPlansList(JSON.parse(localXbarPlans));
            } else {
                const Token = AuthToken();
                const ApiPath = Apis.getXBarOptions
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
                    localStorage.setItem("XBarOptions", JSON.stringify(response.data.data));
                }
            }
        } catch (error) {
            setInitialLoader(false);
            console.error("Error occured in getting XBar Option is", error);
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
        }
    }


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
                </div>

                <div>
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md'>

                <div
                    className="w-full h-[130px] flex flex-row items-center justify-between rounded-lg px-6"
                    style={{
                        backgroundImage: "url('/svgIcons/bg.svg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // borderRadius:'20px'
                    }}
                >

                    <div style={{
                        fontSize: 29, fontWeight: '700', color: 'white'
                    }}>
                        Total Plans: {plansList.length}
                    </div>

                    <button
                        className='flex px-5 py-3 bg-white rounded-lg text-purple font-medium'
                        onClick={handleAddPlan}
                    >
                        New Plan
                    </button>


                </div>

                <div className='w-full'>
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
                </div>

                {
                    planType === "monthly" ?
                        <div style={styles.planTypeHeading} className="mt-4 w-full">
                            Monthly Plans
                        </div>
                        :
                        <div style={styles.planTypeHeading} className="mt-4 w-full">
                            XBar Options
                        </div>
                }

                <div className="w-full flex flex-row justify-between mt-4">
                    <div className="w-2/12">
                        <div style={styles.text}>Name</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Description</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Tag</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Price</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Strikethrough Price</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Minutes</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Action</div>
                    </div>
                </div>

                {/* Code for plans */}


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
                                    {plansList?.length > 0 ? (
                                        <div>
                                            {plansList.slice().reverse().map((item) => (
                                                <div
                                                    key={item.id}
                                                    style={{ cursor: "pointer" }}
                                                    className="w-full flex flex-row justify-between items-center mt-5 hover:bg-[#402FFF05] py-2"
                                                >
                                                    <div
                                                        className="w-2/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                                                        onClick={() => {
                                                            // // //console.log;
                                                            // setselectedLeadsDetails(item);
                                                            // setShowDetailsModal(true);
                                                        }}
                                                    >
                                                        {/*<div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                                {item.name.slice(0, 1).toUpperCase()}
                        </div>*/}
                                                        <div style={{ ...styles.text2, ...{ width: "80%", } }}>
                                                            {item.title}
                                                        </div>
                                                    </div>
                                                    <div className="w-2/12 ">
                                                        <div style={styles.text2}>
                                                            {item.planDescription}
                                                        </div>
                                                    </div>
                                                    <div className="w-2/12">
                                                        {/* (item.LeadModel?.phone) */}
                                                        <div style={styles.text2}>
                                                            {item.tag}
                                                        </div>
                                                    </div>
                                                    <div className="w-1/12">
                                                        <div style={styles.text2}>
                                                            ${item.originalPrice || 0}
                                                        </div>
                                                    </div>
                                                    <div className="w-2/12">
                                                        <div style={styles.text2}>
                                                            ${item.discountedPrice || 0}
                                                        </div>
                                                    </div>
                                                    <div className="w-1/12">
                                                        {item.minutes || "X"}-Mins
                                                    </div>

                                                    <div className="w-1/12 relative">
                                                        <button
                                                            id={`dropdown-toggle-${item.id}`}
                                                            onClick={() =>
                                                                setmoreDropdown(
                                                                    moreDropdown === item.id ? null : item.id
                                                                )
                                                            }
                                                        >
                                                            <Image src={'/svgIcons/threeDotsIcon.svg'} height={24} width={24} alt="menu" />
                                                        </button>

                                                        {moreDropdown === item.id && (
                                                            <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg z-50 w-[200px]">
                                                                <div
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                                    onClick={() => {
                                                                        setmoreDropdown(null)
                                                                    }}
                                                                >
                                                                    View Detail
                                                                </div>
                                                                <div
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                                    onClick={() => {
                                                                        // Handle invite
                                                                    }}
                                                                >
                                                                    Invite Team
                                                                </div>
                                                                <div
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                                    onClick={() => {
                                                                        // Handle view plans
                                                                    }}
                                                                >
                                                                    View Plans
                                                                </div>
                                                                <div
                                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                                    onClick={() => {
                                                                        // Handle redirect
                                                                    }}
                                                                >
                                                                    To the advertisement
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div
                                            className="text-center mt-4"
                                            style={{ fontWeight: "bold", fontSize: 20 }}
                                        >
                                            No plan found
                                        </div>
                                    )}
                                </div>
                        }
                    </div>
                </div>

                {/* code for modals */}

                {
                    planType === "monthly" ?
                        <AddMonthlyPlan open={open}
                            handleClose={handleClosePlanPopUp} onPlanCreated={handlePlanCreated}
                            canAddPlan={canAddPlan}
                        /> :
                        <AddXBarPlan open={open}
                            handleClose={handleClosePlanPopUp} onPlanCreated={handlePlanCreated} />
                }

            </div>

        </div>
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