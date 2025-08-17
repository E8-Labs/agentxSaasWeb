import { ArrowDown, ArrowUp, CaretDown, CaretRight, CaretUp } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import Image from 'next/image';
import { Box, CircularProgress, Modal } from '@mui/material';
import AddNewCalendar from '@/components/onboarding/extras/AddNewCalendar';
import { useRouter } from 'next/navigation';
import ClaimNumber from '../myagentX/ClaimNumber';
import Link from 'next/link';
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService';

const AgencyChecklist = ({ userDetails }) => {

    const router = useRouter();

    // console.log("User data recieved to check list on agency side is", userDetails?.user?.checkList?.checkList);
    const [showList, setShowList] = useState(true);
    const [loader, setLoader] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [checkList, setCheckList] = useState([]);

    //sadd calendar popup
    const [showAddCalendar, setShowAddCalendar] = useState(false);

    //calim popup
    const [showClaimPopup, setShowClaimPopup] = useState(false);

    const getChecklist = () => {
        const D = localStorage.getItem("User");
        if (D) {
            const LocalData = JSON.parse(D);
            const LD = LocalData?.user;
            const T = LocalData?.user?.checkList?.checkList;
            console.log("Agency checklist is", T);
            // const T = userDetails?.checkList?.checkList;
            console.log("Check list on main check list screen is", T);
            let percentage = 0;

            for (let key in T) {
                if (T[key]) {
                    percentage += 25; //16.67;
                }
            }

            // setProgressValue(percentage.toFixed(2));
            //safe for number value
            setProgressValue(parseFloat(percentage.toFixed(2)));

            console.log("percentage of check list is", percentage);   // Output: 60

            setCheckList([
                { id: 1, label: 'Add Stripe', status: LD?.canAcceptPaymentsAgencyccount, route: "/agency/dashboard/integration" },
                { id: 2, label: 'Add Twilio Keys', status: T?.twilioConnected, route: "/agency/dashboard/integration" },
                { id: 3, label: 'Add Pricing Plans', status: T?.plansAdded, route: "/agency/dashboard/plans" },
                { id: 4, label: 'Add XBar Options', status: T?.plansXbarAdded, route: "/agency/dashboard/plans" },
                { id: 5, label: 'Add Subaccount', status: T?.subaccountAdded, route: "/agency/dashboard/subAccounts" },
                // { id: 5, label: 'Start calling', status: T?.callsCreated, route: "/dashboard/leads" },
                // { id: 6, label: 'Claim a number', status: false, route: "" }
            ]);
        }
    }

    useEffect(() => {
        const checklistData = userDetails?.user?.checkList?.checkList;
        getChecklist();
        window.addEventListener("UpdateAgencyCheckList", getChecklist);

        return () => {
            window.removeEventListener("UpdateAgencyCheckList", getChecklist); // Clean up
        };

    }, []);

    //close claim popup
    const handleCloseClaimPopup = () => {
        setShowClaimPopup(false);
    };

    const styles = {
        text: {
            fontWeight: "500",
            fontSize: 16
        }
    }

    return (
        <div className='w-full'>
            {
                progressValue < 100 && (
                    <div className='bg-[#F7F7FD] w-full rounded-md mb-2 py-2'>
                        <button
                            className='w-full flex flex-rw items-center justify-between outline-none border-none ps-2'
                            onClick={() => { setShowList(!showList) }}>
                            <div>
                                <div className='font-semibold text-xs sm:text-sm md:text-[13px] lg:text-[15px] whitespace-nowrap overflow-hidden text-ellipsis'>
                                    Agency Checklist
                                </div>
                                <div>
                                    <ProgressBar value={progressValue} />
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-2 ps-2'>
                                <p className='bg-purple text-white rounded-md p-2' style={{ fontWeight: "600", fontSize: "14px" }}>
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
                                                // href={item.route}
                                                key={item.id}
                                                className='flex flex-row items-center justify-between mt-4 outline-none border-none w-full border-none outline-none'
                                                onClick={async () => {
                                                    if (item.label === "Add Stripe") {
                                                        await getStripeLink(setLoader);
                                                    } else {
                                                        window.location.href = item.route
                                                    }
                                                }}
                                                disabled={item.status === true}
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
                                                    <div
                                                        // style={styles.text}
                                                        // className={`${item.status === true ? "line-through" : ""} font-medium text-base sm:text-lg md:text-xl`}
                                                        // className={`${item.status === true ? "line-through" : ""} font-medium text-sm sm:text-base md:text-lg lg:text-base xl:text-lg`}
                                                        className={`${item.status === true ? "line-through" : ""} font-semibold text-xs sm:text-sm md:text-[13px] lg:text-[15px]`}
                                                    >
                                                        {item.label}
                                                    </div>
                                                </div>
                                                {
                                                    item.label === "Add Stripe" && loader ? (
                                                        <CircularProgress size={15} />
                                                    ) : (
                                                        <CaretRight size={20} />
                                                    )
                                                }
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
                        <AddNewCalendar
                            handleContinue={() => {
                                getChecklist();
                                setShowAddCalendar(false);
                            }}
                            showModal={showAddCalendar}
                        />
                    </div>
                )
            }

            {/* Code for claim number */}
            {showClaimPopup && (
                <ClaimNumber
                    showClaimPopup={showClaimPopup}
                    handleCloseClaimPopup={handleCloseClaimPopup}
                // setOpenCalimNumDropDown={setOpenCalimNumDropDown}
                // setSelectNumber={setAssignNumber}
                // setPreviousNumber={setPreviousNumber}
                // previousNumber={previousNumber}
                // AssignNumber={AssignNumber}
                />
            )}

        </div>
    )
}

export default AgencyChecklist;
