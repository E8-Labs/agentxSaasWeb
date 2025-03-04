import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Apis from '@/components/apis/Apis';
import axios from 'axios';

function AdminEngagments() {

    const [loading, setLoading] = useState(false)
    const [engagmentData, setEngagmentData] = useState("")


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

    const progressData = [
        { name: "Churn Rate", value: engagmentData?.churnRate },
        { name: "Retention Rate", value: engagmentData?.retentionRate },
        { name: "5Cohort Retention Rate", value: engagmentData?.cohortRetention[0]?.retentionRate },
        { name: "Cohort Implementation Request", value: 0 },
        { name: "Stickiness Ratio (DAU/MAU)", value: engagmentData?.stickinessRatio }
    ];

    useEffect(() => {
        getEngagmentData()
    }, [])

    const getEngagmentData = async (offset = 0,) => {
        try {
            setLoading(true);
            const data = localStorage.getItem("User");

            if (data) {
                let u = JSON.parse(data);

                let path = Apis.adminEngagements
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

    return (
        <div className='w-full flex flex-col items-center' style={{ alignSelf: 'center' }}>
            <div className='w-11/12'>
                <div className='w-full flex flex-row items-center justify-between'>
                    <div style={{ fontSize: 30, fontWeight: '400' }}>
                        Retention & Engagement
                    </div>

                    <div className='flex flex-row items-center gap-4'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="
                                    px-4 py-2 border-2 border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                    flex flex-row items-center gap-1
                                "
                                >
                                    <p>
                                        {/* {selectedSubRange
                                        ? selectedSubRange */}
                                        Select Plan
                                        {/* } */}
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
                                className="bg-white border-2 rounded-lg shadow-md"
                                style={{ minWidth: "8rem", width: "100%" }} // Match button width
                            >
                                <DropdownMenuGroup style={{ cursor: "pointer" }}>
                                    {
                                        plans.map((item) => (
                                            <DropdownMenuItem key={item.id}
                                                className="hover:bg-gray-100 px-3"

                                            >
                                                {item.plan}
                                            </DropdownMenuItem>
                                        ))
                                    }
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="
                                    px-4 py-2 border-2 border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                    flex flex-row items-center gap-1
                                "
                                >
                                    <p>
                                        {/* {selectedSubRange
                                        ? selectedSubRange */}
                                        Select Period
                                        {/* } */}
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
                                className="bg-white border-2 rounded-lg shadow-md"
                                style={{ minWidth: "8rem", width: "100%" }} // Match button width
                            >
                                <DropdownMenuGroup style={{ cursor: "pointer" }}>
                                    {
                                        periods.map((item) => (
                                            <DropdownMenuItem key={item.id}
                                                className="hover:bg-gray-100 px-3"

                                            >
                                                {item.name}
                                            </DropdownMenuItem>
                                        ))
                                    }
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                    {engagmentData?.usersWithAgentsPercentage?.usersWithAgentsPercentage}%
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
                                    {engagmentData?.usersWithLeadsPercentage?.usersWithLeadsPercentage}%
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
                                    {engagmentData?.usersWhoSentCallsPercentage?.usersWhoSentCallsPercentage}%
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
                            {engagmentData?.retentionRate}%
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
                            {engagmentData?.cohortRetention[0]?.retentionRate}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            {engagmentData?.cohortRetention[0]?.retentionRate}
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
                            hello
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            hello
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
                            {engagmentData?.stickinessRatio}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            hello
                        </div>


                    </div>


                </div>

                <div className="p-6 bg-[#ffffff68] border-2 border-white rounded-xl  w-full mt-4">

                    <div className='flex flex-row items-center justify-between w-full'>
                        <div style={{ fontSize: 16, fontWeight: '600' }}>
                            Engagement Graph
                        </div>
                        <div className='flex flex-row items-center gap-4'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                    px-4 py-2 border-2 border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                    flex flex-row items-center gap-1
                                "
                                    >
                                        <p>
                                            {/* {selectedSubRange
                                        ? selectedSubRange */}
                                            Select Plan
                                            {/* } */}
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
                                    className="bg-white border-2 rounded-lg shadow-md"
                                    style={{ minWidth: "8rem", width: "100%" }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer" }}>
                                        {
                                            plans.map((item) => (
                                                <DropdownMenuItem key={item.id}
                                                    className="hover:bg-gray-100 px-3"

                                                >
                                                    {item.plan}
                                                </DropdownMenuItem>
                                            ))
                                        }
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                    px-4 py-2 border-2 border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                    flex flex-row items-center gap-1
                                "
                                    >
                                        <p>
                                            {/* {selectedSubRange
                                        ? selectedSubRange */}
                                            Select Period
                                            {/* } */}
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
                                    className="bg-white border-2 rounded-lg shadow-md"
                                    style={{ minWidth: "8rem", width: "100%" }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer" }}>
                                        {
                                            periods.map((item) => (
                                                <DropdownMenuItem key={item.id}
                                                    className="hover:bg-gray-100 px-3"

                                                >
                                                    {item.name}
                                                </DropdownMenuItem>
                                            ))
                                        }
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
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

        </div>
    )
}

export default AdminEngagments