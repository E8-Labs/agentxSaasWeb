import { ArrowDown, ArrowUp, CaretDown, CaretRight, CaretUp } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import Image from 'next/image';

const CheckList = ({ userDetails }) => {


    console.log("User data recieved to check list is", userDetails?.user?.checkList?.checkList);
    const [showList, setShowList] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [checkList, setCheckList] = useState([]);



    useEffect(() => {
        const checklistData = userDetails?.user?.checkList?.checkList;
        console.log("Check list", checklistData);

        let percentage = 0;

        for (let key in checklistData) {
            if (checklistData[key]) {
                percentage += 20;
            }
        }

        setProgressValue(percentage);

        console.log("percentage of check list is", percentage);   // Output: 60

        setCheckList([
            { id: 1, label: 'Create your agent', status: checklistData?.agentCreated, route: "/dashboard/myAgentX" },
            { id: 2, label: 'Review your script', status: checklistData?.scriptReviewed, route: "/dashboard/myAgentX" },
            { id: 3, label: 'Connect a calendar', status: checklistData?.calendarCreated, route: "/pipeline" },
            { id: 4, label: 'Upload leads', status: checklistData?.leadCreated, route: "/dashboard/leads" },
            { id: 5, label: 'Start calling', status: checklistData?.callsCreated, route: "/dashboard/callLog" }
        ]);


    }, []);

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
                                <div style={{ fontWeight: "500", fontSize: "16px" }}>
                                    Agentx Checklist
                                </div>
                                <div>
                                    <ProgressBar value={progressValue} />
                                </div>
                            </div>
                            <div className='flex flex-row items-center gap-2 ps-2'>
                                <p className='bg-purple text-white rounded-md p-2' style={{ fontWeight: "600", fontSize: "14px" }}>
                                    {progressValue}%
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
                                                    const D = {
                                                        status: true
                                                    }
                                                    localStorage.setItem("isFromCheckList", JSON.stringify(D))
                                                    window.open(item.route, "_blank");
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
                                                        style={styles.text}
                                                        className={`${item.status === true ? "line-through" : ""}`}
                                                    >
                                                        {item.label}
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
        </div>
    )
}

export default CheckList
