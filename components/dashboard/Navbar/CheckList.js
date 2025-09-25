import { ArrowDown, ArrowUp, CaretDown, CaretRight, CaretUp, } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import Image from 'next/image';
import { Box, Modal } from '@mui/material';
import AddNewCalendar from '@/components/onboarding/extras/AddNewCalendar';
import { useRouter } from 'next/navigation';
import ClaimNumber from '../myagentX/ClaimNumber';
import CalendarModal from '../myagentX/CalenderModal';
import { AddCalendarApi } from '@/apiservicescomponent/addcalendar/AddCalendarApi';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';
import UpgradeModal from '@/constants/UpgradeModal';
import { useUser } from '@/hooks/redux-hooks';

const CheckList = ({ userDetails, setWalkthroughWatched }) => {

    const router = useRouter();
    const { user: reduxUser } = useUser();

    // console.log("User data recieved to check list is", userDetails?.user?.checkList?.checkList);
    const [showList, setShowList] = useState(true);
    const [progressValue, setProgressValue] = useState(0);
    const [checkList, setCheckList] = useState([]);

    //sadd calendar popup
    const [showAddCalendar, setShowAddCalendar] = useState(false);

    //calim popup
    const [showClaimPopup, setShowClaimPopup] = useState(false);

    //variables for add calendar
    const [calenderLoader, setCalenderLoader] = useState(false);
    const [googleCalenderLoader, setGoogleCalenderLoader] = useState(false);
    const [calenderTitle, setCalenderTitle] = useState("");
    const [calenderApiKey, setCalenderApiKey] = useState("");
    const [eventId, setEventId] = useState("");
    const [selectTimeZone, setSelectTimeZone] = useState("");
    const [calendarType, setCalendarType] = useState("");
    //add calendar variables object
    const [addCalendarValues, setAddCalendarValues] = useState({});
    //add calendar snack message
    const [snackMessage, setSnackMessage] = useState({
        type: SnackbarTypes.Success,
        message: "Calendar added successfully!",
        isVisible: false,
    });
    const [selectedTimeDurationLocal, setSelectedTimeDurationLocal] = useState("");
    //selected ghl calendar
    const [selectGHLCalendar, setSelectGHLCalendar] = useState(null);
    const [gHLCalenderLoader, setGHLCalenderLoader] = useState(false);

    //calendar upgrade modal
    const [showCalendarUpgradeModal, setShowCalendarUpgradeModal] = useState(false);

    // Check calendar plan capabilities
    const checkCalendarPlanCapabilities = () => {
        const user = reduxUser || userDetails?.user;
        console.log("user", user);
        if (!user) return true;

        const currentCalendars = user?.currentUsage?.maxCalendars || 0;
        const maxCalendars = user?.planCapabilities?.maxCalendars || 1;

        console.log("currentCalendars", currentCalendars);
        console.log("maxCalendars", maxCalendars);

        return currentCalendars < maxCalendars;
    };

    const getChecklist = () => {
        const D = localStorage.getItem("User");
        if (D) {
            const LocalData = JSON.parse(D);
            const T = LocalData?.user?.checkList?.checkList;
            console.log("Check list on main check list screen is", T);
            let percentage = 14.29;

            for (let key in T) {
                if (T[key]) {
                    percentage += 14.29;
                }
            }

            // setProgressValue(percentage.toFixed(2));
            //safe for number value
            setProgressValue(parseFloat(percentage.toFixed(2)));

            console.log("percentage of check list is", percentage);   // Output: 60

            // Get calendar usage info
            const user = reduxUser || LocalData?.user;
            const currentCalendars = user?.currentUsage?.maxCalendars || 0;
            const maxCalendars = user?.planCapabilities?.maxCalendars || 1;
            const calendarUsageText = maxCalendars >= 1000 ? "Unlimited" : `${currentCalendars}/${maxCalendars}`;

            setCheckList([
                { id: 1, label: 'Create your agent', status: T?.agentCreated, route: "/createagent" },
                { id: 2, label: 'Review your script', status: T?.scriptReviewed, route: "/dashboard/myAgentX" },
                { id: 3, label: 'Intro video', status: LocalData?.user?.walkthroughWatched, route: "" },
                { 
                    id: 4, 
                    label: 'Connect a calendar', 
                    status: T?.calendarCreated, 
                    route: "/pipeline",
                    usageText: calendarUsageText,
                    isAtLimit: !checkCalendarPlanCapabilities()
                },
                { id: 5, label: 'Upload leads', status: T?.leadCreated, route: "/dashboard/leads" },
                { id: 6, label: 'Start calling', status: T?.callsCreated, route: "/dashboard/leads" },
                { id: 7, label: 'Claim a number', status: T?.numberClaimed, route: "" },
            ]);
        }
    }

    useEffect(() => {
        const checklistData = userDetails?.user?.checkList?.checkList;
        getChecklist();
        window.addEventListener("UpdateCheckList", getChecklist);

        return () => {
            document.removeEventListener("UpdateCheckList", getChecklist); // Clean up
        };


    }, []);

    //update the add calendar object values
    useEffect(() => {

        const addCalendarValues = {
            calenderTitle: calenderTitle,
            calenderApiKey: calenderApiKey,
            eventId: eventId,
            selectTimeZone: selectTimeZone,
            calendarType: calendarType
        }

        setAddCalendarValues(addCalendarValues);

    }, [calenderLoader, calenderTitle, calenderApiKey, eventId, selectTimeZone])

    //close claim popup
    const handleCloseClaimPopup = () => {
        setShowClaimPopup(false);
    };

    //add calendar api
    const handleAddCalendar = async (calendar) => {
        try {
            let response = null;
            if (calendar?.isFromAddGoogleCal) {
                console.log("Is from google cal", calendar?.isFromAddGoogleCal);
                response = await AddCalendarApi(calendar);
                setGoogleCalenderLoader(true);
            } else if (calendar?.isFromAddGHLCal) {
                console.log("Is not from google cal");
                response = await AddCalendarApi(calendar);
                setGHLCalenderLoader(true);
            } else {
                console.log("Is not from google cal");
                response = await AddCalendarApi(addCalendarValues);
                setCalenderLoader(true);
            }

            if (response.status === true) {
                getChecklist();
                setShowAddCalendar(false);
                setSnackMessage({
                    message: response.message,
                    type: SnackbarTypes.Success,
                    isVisible: true,
                });
                setCalenderLoader(false);
                setGoogleCalenderLoader(false);
                setGHLCalenderLoader(false);
            } else {
                console.log("error");
                setSnackMessage({
                    message: response.message,
                    type: SnackbarTypes.Error,
                    isVisible: true,
                });
                setCalenderLoader(false);
                setGoogleCalenderLoader(false);
                setGHLCalenderLoader(false);
            }
        } catch (error) {
            console.log("Error occured in add calendar api is", error)
        }
    }

    const styles = {
        text: {
            fontWeight: "500",
            fontSize: 16
        }
    }
    console.log('progressValue', progressValue)
    console.log('checkList', checkList)

    return (
        <div className='w-full'>
            <AgentSelectSnackMessage
                type={snackMessage.type}
                message={snackMessage.message}
                isVisible={snackMessage.isVisible}
                hide={() => {
                    setSnackMessage({
                        message: "",
                        isVisible: false,
                        type: SnackbarTypes.Success,
                    });
                }}
            />
            {
                progressValue < 100 && (
                    <div className='bg-[#F7F7FD] w-full rounded-md mb-2 py-2'>
                        <button
                            className='w-full flex flex-rw items-center justify-between outline-none border-none ps-2'
                            onClick={() => { setShowList(!showList) }}>
                            <div>
                                <div className='font-semibold text-xs sm:text-sm md:text-[13px] lg:text-[15px] whitespace-nowrap overflow-hidden text-ellipsis'>
                                    Agentx Checklist
                                </div>
                                <div className='mt-2'>
                                    <ProgressBar value={progressValue} />
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-2 ps-2'>
                                <p className='bg-purple text-white rounded-md px-2 py-1' style={{ fontWeight: "600", fontSize: "14px" }}>
                                    {progressValue?.toFixed(0)}%
                                </p>
                                {
                                    showList ?
                                        <CaretDown size={20} /> :
                                        <CaretUp size={20} />
                                }
                            </div>
                        </button>
                        {
                            showList && (
                                <div>
                                    {
                                        checkList?.map((item) => (
                                            <button
                                                key={item.id}
                                                className='flex flex-row items-center justify-between mt-4 outline-none border-none w-full'
                                                onClick={() => {
                                                    if (item.label === "Intro video") {
                                                        // setShowAddCalendar(true);
                                                        console.log("show video");
                                                        setWalkthroughWatched(true);
                                                    } else if (item.label === "Connect a calendar") {
                                                        if (checkCalendarPlanCapabilities()) {
                                                            setShowAddCalendar(true);
                                                        } else {
                                                            setShowCalendarUpgradeModal(true);
                                                        }
                                                    } else if (item.label === "Claim a number") {
                                                        setShowClaimPopup(true);
                                                    } else {
                                                        const D = {
                                                            status: true
                                                        }
                                                        localStorage.setItem("isFromCheckList", JSON.stringify(D))
                                                        // window.open(item.route, "_blank");
                                                        router.push(item.route);
                                                    }
                                                }}
                                                // disabled={item.status === true}
                                                disabled={item.status === true && item.label !== 'Intro video'}
                                            >
                                                <div className='flex flex-row items-center gap-4'>
                                                    {item.status === true ? <Image
                                                        className='ms-2'
                                                        src={"/agencyIcons/Check.jpg"}
                                                        alt='*'
                                                        height={20}
                                                        width={20}
                                                    /> :
                                                        <Image
                                                            className='ms-2'
                                                            src={"/agencyIcons/unCheck.jpg"}
                                                            alt='*'
                                                            height={20}
                                                            width={20}
                                                        />}
                                                    <div className="flex flex-col">
                                                        <div
                                                            // style={styles.text}
                                                            // className={`${item.status === true ? "line-through" : ""} font-medium text-base sm:text-lg md:text-xl`}
                                                            // className={`${item.status === true ? "line-through" : ""} font-medium text-sm sm:text-base md:text-lg lg:text-base xl:text-lg`}
                                                            className={`${item.status === true ? "line-through" : ""} font-semibold text-xs sm:text-sm md:text-[13px] lg:text-[15px]`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                    
                                                    </div>
                                                </div>
                                                <CaretRight size={20} />
                                            </button>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                )
            }

            {/* Code for add calendar */}
            {
                showAddCalendar && (
                    <div>
                        {/*<AddNewCalendar
                            handleContinue={() => {
                                getChecklist();
                                setShowAddCalendar(false);
                            }}
                            showModal={showAddCalendar}
                        />*/}
                        <CalendarModal
                            open={showAddCalendar}
                            onClose={() => {
                                // getChecklist();
                                setShowAddCalendar(false);
                            }}
                            calenderLoader={calenderLoader}
                            googleCalenderLoader={googleCalenderLoader}
                            calenderTitle={calenderTitle}
                            setCalenderTitle={setCalenderTitle}
                            calenderApiKey={calenderApiKey}
                            setCalenderApiKey={setCalenderApiKey}
                            setEventId={setEventId}
                            eventId={eventId}
                            selectTimeZone={selectTimeZone}
                            setSelectTimeZone={setSelectTimeZone}
                            handleAddCalendar={(calendar) => {
                                handleAddCalendar(calendar);
                            }}
                            selectedTimeDurationLocal={selectedTimeDurationLocal}
                            setSelectedTimeDurationLocal={setSelectedTimeDurationLocal}
                            gHLCalenderLoader={gHLCalenderLoader}
                            selectGHLCalendar={selectGHLCalendar}
                            setSelectGHLCalendar={setSelectGHLCalendar}
                        />
                    </div>
                )
            }

            {/* Code for claim number */}
            {
                showClaimPopup && (
                    <ClaimNumber
                        showClaimPopup={showClaimPopup}
                        handleCloseClaimPopup={handleCloseClaimPopup}
                    // setOpenCalimNumDropDown={setOpenCalimNumDropDown}
                    // setSelectNumber={setAssignNumber}
                    // setPreviousNumber={setPreviousNumber}
                    // previousNumber={previousNumber}
                    // AssignNumber={AssignNumber}
                    />
                )
            }

            {/* Code for calendar upgrade modal */}
            {
                showCalendarUpgradeModal && (
                    <UpgradeModal
                        open={showCalendarUpgradeModal}
                        handleClose={() => {
                            setShowCalendarUpgradeModal(false);
                        }}
                        title="You've Hit Your Calendar Limit"
                        subTitle="Upgrade to add more Calendars"
                        buttonTitle="No Thanks"
                    />
                )
            }

        </div >
    )
}

export default CheckList
