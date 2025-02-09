"use client";

import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import Image from 'next/image';

import { XAxis, YAxis, Tooltip, LineChart, Line, Bar, BarChart, PieChart, Pie, Cell, } from "recharts"
import { SetMealRounded } from '@mui/icons-material';


function AdminSubscriptions() {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const UpgateRateData = [
        { name: "Segment 1", value: 27, color: "#8E24AA" },
        { name: "Segment 2", value: 30, color: "#FF6600" },
        { name: "Segment 3", value: 43, color: "#402FFF" },
        { name: "Segment 3", value: 43, color: "#FF2D2D" },
    ];

    const totalValue = UpgateRateData.reduce((acc, item) => acc + item.value, 0);
    const UpgradePercentage = Math.round((UpgateRateData[0].value / totalValue) * 100); // First segment percentage



    const manu = [
        {
            id: 1,
            name: 'Trail Plan'
        }, {
            id: 2,
            name: 'From $45'
        }
    ]

    const [selectedManu, setSelectedMau] = useState(manu[0])

    const subscriptionChartData = [
        { month: "January", sales: 400, revenue: 2400, visitors: 800 },
        { month: "February", sales: 300, revenue: 2210, visitors: 900 },
        { month: "March", sales: 200, revenue: 2290, visitors: 700 },
        { month: "April", sales: 278, revenue: 2000, visitors: 600 },
        { month: "May", sales: 189, revenue: 2181, visitors: 750 },
        { month: "June", sales: 239, revenue: 2500, visitors: 850 },
    ];

    const planChartData = [
        { name: "Trial", value: 10 },
        { name: "$45", value: 27, percentage: "27%", count: "23,910" },
        { name: "$99", value: 15 },
        { name: "$270", value: 20 },
        { name: "$480", value: 5 },
    ];


    return (
        <div className="flex flex-col items-center justify-center w-full h-[88vh]"
            style={{ overflow: 'auto', scrollbarWidth: 'none', paddingTop: "45rem", }}>
            <div className="flex flex-col items-start w-11/12 mt-10 gap-3">
                <div style={{ fontSize: 48, fontWeight: '400', color: '#000' }}>
                    Subscription<span style={{ color: '#00000047' }}> Performance</span>
                </div>

                <div className="flex w-full flex-row items-start gap-3 mt-4">

                    <div className='flex flex-col w-8/12'>
                        <div
                            style={{ border: '2px solid white' }}
                            className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                        >
                            <div className="w-full flex flex-row items-center justify-between">
                                <div className='flex flex-col items-start '>
                                    <div
                                        style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            color: '#0E0E0E',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        New Subscriptions{' '}
                                        <span
                                            style={{
                                                fontSize: 13,
                                                fontWeight: '500',
                                                color: '#00000060',
                                            }}
                                        >
                                            Number of new paid users over a period of time
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 48, fontWeight: '300', color: "#000" }}>
                                        11,728
                                    </div>

                                    <div className='flex flex-row items-cneter gap-1'>
                                        <Image src={'svgIcons/greenUpArrow.svg'}
                                            height={16} width={16} alt='*'
                                        />
                                        <div style={{ fontSize: 15, fontWeight: '700', color: '#009C5B' }}>
                                            8%  <span style={{
                                                fontSize: 15, fontWeight: '500', color: '#A5ABB4', marginLeft: "5px"
                                            }}>   vs last month
                                            </span>
                                        </div>

                                    </div>
                                </div>

                                <div className="w-full flex flex-row items-center gap-4 justify-end">
                                    {/* Plan Type Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                            >
                                                <p>
                                                    Plan Type
                                                </p>
                                                <Image src={'/svgIcons/downArrow.svg'}
                                                    height={20} width={24} alt='*'
                                                />

                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border rounded-lg shadow-md"
                                            style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                        >
                                            <DropdownMenuGroup style={{ cursor: 'pointer' }}>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Monthly</DropdownMenuItem>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Weekly</DropdownMenuItem>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Yearly</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Weekly Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                            >
                                                <p>
                                                    Weekly
                                                </p>
                                                <Image src={'/svgIcons/downArrow.svg'}
                                                    height={20} width={24} alt='*'
                                                />

                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border rounded-lg shadow-md"
                                            style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                        >
                                            <DropdownMenuGroup style={{ cursor: 'pointer' }}>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Monthly</DropdownMenuItem>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Weekly</DropdownMenuItem>
                                                <DropdownMenuItem className='hover:bg-gray-100 px-3'>Daily</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className='flex w-full flex-row items-center gap-8 mt-5'>

                                <div className='flex flex-row items-center gap-'>
                                    <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white'></div>
                                    <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                        Trail
                                    </p>
                                </div>

                                <div className='flex flex-row items-center gap-'>
                                    <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#000] border border-white'></div>
                                    <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                        30mins
                                    </p>
                                </div>

                                <div className='flex flex-row items-center gap-'>
                                    <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white'></div>
                                    <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                        120mins
                                    </p>
                                </div>


                                <div className='flex flex-row items-center gap-'>
                                    <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white'></div>
                                    <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                        360mins
                                    </p>
                                </div>

                                <div className='flex flex-row items-center gap-'>
                                    <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2222] border border-white'></div>
                                    <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                        720mins
                                    </p>
                                </div>

                                <div className='flex w-full'>

                                </div>

                            </div>

                            <div className='flex w-full'>
                                <LineChart
                                    width={800}
                                    height={317}
                                    data={subscriptionChartData}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 20,
                                        bottom: 20,
                                    }}
                                >

                                    {/* X-Axis */}
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />

                                    {/* Y-Axis */}
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />

                                    {/* Tooltip */}
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            padding: "10px",
                                        }}
                                        itemStyle={{ color: "#111827" }}
                                        labelStyle={{ color: "#6b7280" }}
                                    />

                                    {/* Legend
                                <Legend verticalAlign="top" height={36} /> */}

                                    {/* Lines */}
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#402FFF"
                                        strokeWidth={2}
                                        dot={false} // No dots
                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(64, 47, 255,  0.2))" }} // Shadow
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#000"
                                        strokeWidth={2}
                                        dot={false} // No dots
                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(5, 5, 5, 0.2))" }} // Shadow
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visitors"
                                        stroke="#FF2222"
                                        strokeWidth={2}
                                        dot={false} // No dots
                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(255, 77, 79, 0.2))" }} // Shadow
                                    />
                                </LineChart>
                            </div>
                        </div>

                        <div className='flex flex-row gap-3 w-full -ml-3 mt-3'>
                            <div
                                style={{ border: '2px solid white' }}
                                className="
                                    flex w-6/12 flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                            >
                                <div className='w-full flex flex-col items-center px-5'>
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                                            Plans
                                        </div>

                                        {/* Plan Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                                >
                                                    <p>
                                                        January
                                                    </p>
                                                    <Image src={'/svgIcons/downArrow.svg'}
                                                        height={20} width={24} alt='*'
                                                    />

                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="bg-white border rounded-lg shadow-md"
                                                style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                            >
                                                <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                                    {months.map((month, index) => (
                                                        <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                            {month}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <BarChart
                                        zIndex={1}
                                        width={400}
                                        height={300}
                                        data={planChartData}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >

                                        {/* X-Axis */}
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                        />

                                        {/* Y-Axis */}
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                        />

                                        {/* Tooltip */}
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                backgroundColor: "white",
                                                border: "1px solid #e5e7eb",
                                                padding: "10px",
                                            }}
                                            formatter={(value, name, props) => {
                                                const { percentage, count } = props.payload;
                                                if (percentage && count) {
                                                    return `${percentage} (${count})`;
                                                }
                                                return value;
                                            }}
                                            labelStyle={{ color: "#6b7280" }}
                                        />

                                        {/* Bars */}
                                        <Bar
                                            zIndex={1}
                                            dataKey="value"
                                            fill="#7902DF"
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </div>
                            </div>

                            <div
                                style={{ border: '2px solid white' }}
                                className="
                                    flex w-6/12 flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                            >
                                <div className='w-full flex flex-col items-center px-5'>
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                                                Reactivation Rate
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: '500', color: '#00000060' }}>
                                                Churned users who return
                                            </div>
                                        </div>
                                        {/* Plan Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                                >
                                                    <p style={{whiteSpace:'nowrap'}}>
                                                        This Year
                                                    </p>
                                                    <Image src={'/svgIcons/downArrow.svg'}
                                                        height={20} width={24} alt='*'
                                                    />

                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="bg-white border rounded-lg shadow-md"
                                                style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                            >
                                                <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                                    {months.map((month, index) => (
                                                        <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                            {month}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <BarChart
                                        zIndex={1}
                                        width={400}
                                        height={300}
                                        data={planChartData}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >

                                        {/* X-Axis */}
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                        />

                                        {/* Y-Axis */}
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fill: "#6b7280" }}
                                        />

                                        {/* Tooltip */}
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: "8px",
                                                backgroundColor: "white",
                                                border: "1px solid #e5e7eb",
                                                padding: "10px",
                                            }}
                                            formatter={(value, name, props) => {
                                                const { percentage, count } = props.payload;
                                                if (percentage && count) {
                                                    return `${percentage} (${count})`;
                                                }
                                                return value;
                                            }}
                                            labelStyle={{ color: "#6b7280" }}
                                        />

                                        {/* Bars */}
                                        <Bar
                                            zIndex={1}
                                            dataKey="value"
                                            fill="#7902DF"
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className='flex w-4/12 flex-col gap-3'>

                        <div style={{ border: '2px solid white' }}
                            className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                        >

                            <div className='flex w-full flex-col '>
                                <div className='w-full flex flex-row justify-between items-center'>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                                            Subscription Upgrade Rate
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: '500', color: '#00000060' }}>
                                            Percentage of users who convert to paid plans.
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                            >
                                                <p style={{whiteSpace:'nowrap'}}>
                                                    This Year
                                                </p>
                                                <Image src={'/svgIcons/downArrow.svg'}
                                                    height={20} width={24} alt='*'
                                                />

                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border rounded-lg shadow-md"
                                            style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                        >
                                            <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                                {months.map((month, index) => (
                                                    <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                        {month}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className='w-full flex flex-row gap-4 items-center mt-4'>
                                    {
                                        manu.map((item) => (
                                            <button key={item.id} onClick={() => {
                                                setSelectedMau(item)
                                            }}>
                                                <div className='flex flex-col items-center'>
                                                    <div>
                                                        {item.name}
                                                    </div>
                                                    {
                                                        selectedManu.id == item.id && (
                                                            <div className='w-full h-[2px] bg-purple'></div>
                                                        )
                                                    }
                                                </div>
                                            </button>
                                        ))
                                    }
                                </div>

                                <div className='w-full flex flex-row items-start gap- mt-8'>
                                    <PieChart width={150} height={150}>
                                        <Pie
                                            data={UpgateRateData}
                                            innerRadius={60}
                                            outerRadius={65}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            paddingAngle={1}
                                        >
                                            {UpgateRateData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>

                                    <div className='flex flex-col gap-2'>
                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2D2D] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>
                                    </div>

                                </div>


                            </div>
                        </div>

                        <div style={{ border: '2px solid white' }}
                            className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                        >

                            <div className='flex w-full flex-col '>
                                <div className='w-full flex flex-row justify-between items-center'>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                                            Cancelled Plans
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: '500', color: '#00000060' }}>
                                            Tracks users discontinuing their subscriptions.
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                            >
                                                <p style={{whiteSpace:'nowrap'}}>
                                                    This Year
                                                </p>
                                                <Image src={'/svgIcons/downArrow.svg'}
                                                    height={20} width={24} alt='*'
                                                />

                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border rounded-lg shadow-md"
                                            style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                        >
                                            <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                                {months.map((month, index) => (
                                                    <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                        {month}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className='w-full flex flex-row items-start gap- mt-8'>
                                    <PieChart width={150} height={150}>
                                        <Pie
                                            data={UpgateRateData}
                                            innerRadius={60}
                                            outerRadius={65}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            paddingAngle={1}
                                        >
                                            {UpgateRateData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>

                                    <div className='flex flex-col gap-2'>
                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>


                                        <div className='flex flex-row items-center gap-'>
                                            <div className='h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2D2D] border border-white'></div>
                                            <p style={{ fontSize: 15, fontWeight: '500', color: "#000" }}>
                                                Trial to $45 -  420 users
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                        <div style={{ border: '2px solid white' }}
                            className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                        >

                            <div className='flex w-full flex-col '>
                                <div className='w-full flex flex-row justify-between items-center'>
                                    <div style={{ fontSize: 18, fontWeight: '700', color: '#000' }}>
                                        Referal Code Rate
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="
                                            px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                            >
                                                <p style={{whiteSpace:'nowrap'}}>
                                                    This Year
                                                </p>
                                                <Image src={'/svgIcons/downArrow.svg'}
                                                    height={20} width={24} alt='*'
                                                />

                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="bg-white border rounded-lg shadow-md"
                                            style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                        >
                                            <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                                {months.map((month, index) => (
                                                    <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                        {month}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>


                                <div style={{ fontSize: 48, fontWeight: 300, color: '#000', }}>
                                    32
                                </div>
                            </div>
                        </div>

                    </div>


                </div>


                <div className='w-full flex flex-row items-center gap-3'>


                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-purple">
                                CLV
                            </h3>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Customer Lifetime Value (CLV)
                        </div>
                    </div>


                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-purple">
                                MRR
                            </h3>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Customer Lifetime Value
                        </div>
                    </div>


                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-purple">
                                ARR
                            </h3>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Annual Recurring Revenue (ARR)
                        </div>
                    </div>
                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-purple">
                                NRR
                            </h3>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Net Revenue Retention (NRR)
                        </div>
                    </div>

                </div>


                <div style={{ fontSize: 48, fontWeight: '300', marginTop: 20 }}>
                    Customer Acquistion
                </div>

                <div className='w-full flex flex-row items-center gap-3 mb-10'>

                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-purple">
                                CLV
                            </h3>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Customer Lifetime Value (CLV)
                        </div>
                    </div>


                    <div style={{ border: '2px solid white' }}
                        className="flex flex-col p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
                    >
                        {/* Title */}
                        <div className="flex items-center justify-between">

                            <div className='h-[30px] w-[30px] rounded-full flex flex-col bg-white items-center justify-center'>
                                <Image src={'/svgIcons/purpleClockIcon.svg'}
                                    height={20} width={20} alt='*'
                                />
                            </div>


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="
                                            px-3 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                                            flex flex-row items-center gap-1
                                            "
                                    >
                                        <p style={{whiteSpace:'nowrap'}}>
                                            This Year
                                        </p>
                                        <Image src={'/svgIcons/downArrow.svg'}
                                            height={20} width={20} alt='*'
                                        />

                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="bg-white border rounded-lg shadow-md"
                                    style={{ minWidth: '8rem', width: '100%' }} // Match button width
                                >
                                    <DropdownMenuGroup style={{ cursor: "pointer", zIndex: 50 }}>
                                        {months.map((month, index) => (
                                            <DropdownMenuItem key={index} className="hover:bg-gray-100 px-3">
                                                {month}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>

                        {/* Value */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 48, fontWeight: '300' }}>
                            $802
                        </div>

                        {/* Subtitle */}
                        <div style={{ whiteSpace: 'nowrap', fontSize: 15, fontWeight: '700', color: '#000' }}>
                            Customer Lifetime Value (CLV)
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default AdminSubscriptions;
