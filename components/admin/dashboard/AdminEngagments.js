import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CalendarPicker } from '../users/CalendarPicker';
import { Box, Modal } from '@mui/material';
import moment from 'moment';

function AdminEngagments() {

    let currantDate = new Date();


    const [loading, setLoading] = useState(false)
    const [engagmentData, setEngagmentData] = useState("")

    const [showCustomRangePopup, setShowCustomRangePopup] = useState(false);
    const [startDate, setstartDate] =
        useState("2025-01-01");
    const [endDate, setendDate] = useState(
        moment(currantDate).format("YYYY-MM-DD")
    );

    const [selectedDateRange, setselectedDateRange] = useState("All Time");



    const plans = [
        {
            id: 1,
            plan: 'trail'
        }, {
            id: 2,
            plan: 'Plan30'
        }, {
            id: 3,
            plan: 'Plan260'
        }, {
            id: 4,
            plan: 'Plan360'
        }, {
            id: 5,
            plan: 'Plan720'
        },
    ]

    const periods = [
        {
            id: 1,
            name: 'Weekly'
        }, {
            id: 2,
            name: 'Monthly'
        }, {
            id: 3,
            name: 'Yearly'
        },
    ]


    useEffect(() => {
        getEngagmentData()
    }, [])

    const getEngagmentData = async (customRange = false,) => {
        try {
            setLoading(true);
            const data = localStorage.getItem("User");

            if (data) {
                let u = JSON.parse(data);

                let path = Apis.adminEngagements

                if (startDate && endDate) {
                    path =
                        path + "?startDate=" +
                        startDate +
                        "&endDate=" +
                        endDate

                }
                console.log("u", u);

                console.log("path", path);

                const response = await axios.get(path, {
                    headers: {
                        Authorization: "Bearer " + u.token,
                    },
                });

                if (response) {
                    setLoading(false);
                    console.log("get engagment data api data is", response.data.data);

                    if (response.data.status === true) {
                        setEngagmentData(response.data.data);
                    } else {
                        console.log("get engagment data api message is", response.data.message);
                    }
                }
            }
        } catch (e) {
            setLoading(false);

            console.log("error in get engagment data api is", e);
        }
    };

    const handleStartDateSelect = (date) => {
        console.log("date", date);

        let formatedDate = moment(date).format("YYYY-MM-DD");

        if (showCustomRangePopup) {
            setstartDate(formatedDate);
        }
    };

    const handleEndDateSelect = (date) => {
        console.log("date", date);

        let formatedDate = moment(date).format("YYYY-MM-DD");

        if (showCustomRangePopup) {
            setendDate(formatedDate);
        }
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white text-black px-2 py-1 rounded-md shadow-lg text-sm font-semibold">
                    {`${payload[0].value}%`}
                </div>
            );
        }
        return null;
    };


    const progressData = [
        { name: "Churn Rate", value: engagmentData?.churnRate },
        {
            name: "Retention Rate", value: typeof engagmentData?.retentionRate === "object"
                ? engagmentData?.retentionRate?.retentionRate
                : engagmentData?.retentionRate
        },
        { name: "5Cohort Retention Rate", value: engagmentData?.cohortRetention?.length > 0 ? engagmentData?.cohortRetention[0].retentionRate : 0 },
        { name: "Cohort Implementation Request", value: 0 },
        { name: "Stickiness Ratio (DAU/MAU)", value: engagmentData?.stickinessRatio?.stickinessRatio }
    ];


    return (
        <div className='w-full flex flex-col items-center' style={{ alignSelf: 'center' }}>
            <div className='w-11/12'>
                <div className='w-full flex flex-row items-center justify-between'>
                    <div style={{ fontSize: 30, fontWeight: '400' }}>
                        Retention & Engagement
                    </div>

                    <div className='flex flex-row items-center gap-4'>

                        {/* Range date Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="
                                         px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                         flex flex-row items-center gap-1
                                       "
                                >
                                    <p>
                                        {selectedDateRange
                                            ? selectedDateRange
                                            : "Select Range"}
                                    </p>
                                    <Image
                                        src={"/svgIcons/downArrow.svg"}
                                        height={20}
                                        width={24}
                                        alt="*"
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="bg-white border rounded-lg shadow-md"
                                style={{ minWidth: "8rem", width: "100%" }} // Match button width
                            >
                                <DropdownMenuGroup style={{ cursor: "pointer" }}>
                                    <DropdownMenuItem
                                        className="hover:bg-gray-100 px-3"
                                        onClick={() => {
                                            setendDate(
                                                moment(currantDate).format("YYYY-MM-DD")
                                            );
                                            setstartDate("2025-01-01");
                                            setselectedDateRange("All Time");
                                            getEngagmentData(false);
                                        }}
                                    >
                                        All Time
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setShowCustomRangePopup(true);
                                            setselectedDateRange("Custom Range");
                                        }}
                                        className="hover:bg-gray-100 px-3"
                                    >
                                        Custom Range
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {
                            startDate != "2025-01-01" &&
                            <div className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto"
                                style={{ scrollbarColor: "#00000000", scrollbarWidth: "none" }}
                            >

                                <div
                                    className="px-4 py-2 bg-[#402FFF10] text-purple flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                                    style={{ fontWeight: "500", fontSize: 15 }}
                                >
                                    {`${moment(startDate).format("MM-DD-YYYY")} - ${moment(endDate).format("MM-DD-YYYY")}`}

                                    {/* Remove Filter Button */}
                                    <button
                                        className="outline-none"
                                        onClick={() => {
                                            setendDate(moment(currantDate).format("YYYY-MM-DD"))
                                            setstartDate("2025-01-01")
                                            getEngagmentData(false)
                                            setselectedDateRange("All Time")
                                        }}
                                    >
                                        <Image
                                            src={"/otherAssets/crossIcon.png"}
                                            height={20}
                                            width={20}
                                            alt="Remove Filter"
                                        />
                                    </button>
                                </div>
                            </div>
                        }


                    </div>
                </div>

                <div className='w-full flex flex-row items-center gap-2 mt-4'>
                    <div className='flex flex-col items-start justify-between px-2 py-4 bg-[#ffffff68] border-2 border-white rounded-lg h-[242px] w-[404px]'>
                        <div className='bg-white rounded-full p-3 w-10 shadow-lg h-10 flex items-center justify-center'>
                            <img
                                className='w-full h-full object-contain'
                                src={"/svgIcons/engangmentIcon.svg"}
                                alt='*'
                            />
                        </div>

                        <div className='flex flex-row items-center justify-between w-full'>

                            <div className='flex flex-col justify-between h-[150px]'>
                                <div style={{ fontSize: 16, fontWeight: '700' }}>
                                    Build Agent
                                </div>
                                <div style={{ fontSize: 30, fontWeight: '300' }}>
                                    {engagmentData?.usersWithAgentsPercentage?.usersWithAgentsCount}%
                                </div>
                                <div style={{ fontSize: 16, fontWeight: '500' }}>
                                    {engagmentData?.usersWithAgentsPercentage?.total}
                                </div>

                            </div>

                            <div className='flex flex-col  justify-between h-[150px] '>
                                <div style={{ fontSize: 16, fontWeight: '700' }}>
                                    Upload Leads
                                </div>
                                <div style={{ fontSize: 30, fontWeight: '300' }}>
                                    {engagmentData?.usersWithLeadsPercentage?.usersWithLeadsCount}%
                                </div>
                                <div style={{ fontSize: 16, fontWeight: '500' }}>
                                    {engagmentData?.usersWithLeadsPercentage?.total}
                                </div>

                            </div>

                            <div className='flex flex-col justify-between h-[150px] '>
                                <div style={{ fontSize: 16, fontWeight: '700' }}>
                                    Make Calls
                                </div>
                                <div style={{ fontSize: 30, fontWeight: '300' }}>
                                    {engagmentData?.usersWhoSentCallsPercentage?.usersWhoSentCallsCount}%
                                </div>
                                <div style={{ fontSize: 16, fontWeight: '500' }}>
                                    {engagmentData?.usersWhoSentCallsPercentage?.total}
                                </div>

                            </div>
                        </div>



                    </div>
                    <div className='flex flex-col items-start justify-between px-2 py-4 bg-[#ffffff68] border-2 border-white rounded-lg h-[242px] w-[231px]'>
                        <div className='bg-white rounded-full p-3 w-10 shadow-lg h-10 flex items-center justify-center '>
                            <img
                                className='w-full h-full object-contain'
                                src={"/svgIcons/engangmentIcon.svg"}
                                alt='*'
                            />
                        </div>

                        <div className='break-words' style={{ fontSize: 16, fontWeight: '700', width: 164, borderWidth: 0 }}>
                            Retention Rate
                        </div>
                        <div className='break-words' style={{ fontSize: 30, fontWeight: '300' }}>
                            {typeof engagmentData?.retentionRate === "object"
                                ? engagmentData?.retentionRate?.retentionRate
                                : engagmentData?.retentionRate}%
                        </div>
                        <div className='break-words' style={{ fontSize: 16, fontWeight: '500' }}>
                            -
                        </div>


                    </div>

                    <div className='flex flex-col items-start justify-between px-2 py-4 bg-[#ffffff68] border-2 border-white rounded-lg h-[242px] w-[231px]'>
                        <div className='bg-white rounded-full p-3 w-10 shadow-lg h-10 flex items-center justify-center '>
                            <img
                                className='w-full h-full object-contain'
                                src={"/svgIcons/engangmentIcon.svg"}
                                alt='*'
                            />
                        </div>

                        <div className='break-words' style={{ fontSize: 16, fontWeight: '700' }}>
                            Cohort Retention Rate
                        </div>
                        <div style={{ fontSize: 30, fontWeight: '300' }}>
                            {engagmentData?.cohortRetention?.length > 0 ? engagmentData?.cohortRetention[0].retentionRate : 0}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            {engagmentData?.cohortRetention?.length > 0 ? engagmentData?.cohortRetention[0].totalUsers : 0}
                        </div>


                    </div>


                    <div className='flex flex-col items-start justify-between px-2 py-4 bg-[#ffffff68] border-2 border-white rounded-lg h-[242px] w-[231px]'>
                        <div className='bg-white rounded-full p-3 w-10 shadow-lg h-10 flex items-center justify-center '>
                            <img
                                className='w-full h-full object-contain'
                                src={"/svgIcons/engangmentIcon.svg"}
                                alt='*'
                            />
                        </div>

                        <div className='break-words' style={{ fontSize: 16, fontWeight: '700' }}>
                            Cohort Implementation Request
                        </div>
                        <div style={{ fontSize: 30, fontWeight: '300' }}>
                            -
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            -
                        </div>


                    </div>

                    <div className='flex flex-col items-start justify-between px-2 py-4 bg-[#ffffff68] border-2 border-white rounded-lg h-[242px] w-[231px]'>
                        <div className='bg-white rounded-full p-3 w-10 shadow-lg h-10 flex items-center justify-center '>
                            <img
                                className='w-full h-full object-contain'
                                src={"/svgIcons/engangmentIcon.svg"}
                                alt='*'
                            />
                        </div>

                        <div className='break-words' style={{ fontSize: 16, fontWeight: '700' }}>
                            Stickiness Ratio (DAU/MAU)
                        </div>
                        <div style={{ fontSize: 30, fontWeight: '300' }}>
                            {engagmentData?.stickinessRatio?.stickinessRatio}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            -
                        </div>


                    </div>


                </div>

                <div className="p-6 bg-[#ffffff68] border-2 border-white rounded-xl  w-full mt-4">

                    <div className='flex flex-row items-center justify-between w-full'>
                        <div style={{ fontSize: 16, fontWeight: '600' }}>
                            Engagement Graph
                        </div>
                        <div className='flex flex-row items-center gap-4'>
                            
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            layout="vertical"
                            data={progressData}
                            // margin={{ left: 90, right: 20 }}
                            barSize={18} // Thinner bars for better alignment
                        >
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#777" }}
                                axisLine={false} tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 14, fill: "#333", fontWeight: "500" }}
                                axisLine={false} tickLine={false}
                                width={250}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                            <Bar dataKey="value" >
                                {progressData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#7902df" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Custom range popup */}

            <Modal
                open={showCustomRangePopup}
                onClose={() => {
                    setShowCustomRangePopup(false)

                }}

                BackdropProps={{
                    timeout: 200,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div style={{ width: "100%" }}>
                        <div
                            className="max-h-[60vh] overflow-auto"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    direction: "row",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ fontWeight: "500", fontSize: 17 }}>
                                    Select Date
                                </div>

                                <button
                                    onClick={() => {
                                        setShowCustomRangePopup(false);
                                        setselectedDateRange("All Time")
                                    }}
                                >
                                    <Image
                                        src={"/assets/blackBgCross.png"}
                                        height={20}
                                        width={20}
                                        alt="*"
                                    />
                                </button>
                            </div>

                            <div
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    marginTop: 20,
                                }}
                            >
                                <div style={{ fontWeight: "500", fontSize: 14 }}>
                                    Start Date
                                </div>
                                <div className="mt-5">
                                    <CalendarPicker onSelectDate={handleStartDateSelect} />
                                </div>
                            </div>

                            <div style={{ fontWeight: "500", fontSize: 14, marginTop: 20 }}>
                                End Date
                            </div>
                            <div className="mt-5">
                                <CalendarPicker onSelectDate={handleEndDateSelect} />
                            </div>

                            <button
                                className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                                style={{ height: "50px" }}
                                onClick={() => {
                                    getEngagmentData(true);
                                    setShowCustomRangePopup(false);
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default AdminEngagments


const styles = {
    modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
};
