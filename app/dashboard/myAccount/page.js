'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import BasicInfo from '@/components/myAccount/BasicInfo'
import MyPhoneNumber from '@/components/myAccount/MyPhoneNumber'
import { Button } from '@mui/material'
import SendFeedback from '@/components/myAccount/SendFeedback'
import InviteAgentX from '@/components/myAccount/InviteAgentX'
import Support from '@/components/myAccount/Support'
import Billing from '@/components/myAccount/Billing'

function Page() {


    const manuBar = [
        {
            id: 1,
            heading: 'Basic Information',
            subHeading: 'Manage personal information ',
            icon: '/otherAssets/profileCircle.png'
        }, {
            id: 2,
            heading: 'Billing',
            subHeading: 'Manage your billing and payment methods',
            icon: '/otherAssets/walletIcon.png'
        }, {
            id: 3,
            heading: 'My Phone Numbers',
            subHeading: 'All agent phone numbers',
            icon: '/assets/unSelectedCallIcon.png'
        }, {
            id: 4,
            heading: 'Support',
            subHeading: 'Get in touch with our team and get help',
            icon: '/otherAssets/headPhoneIcon.png'
        }, {
            id: 5,
            heading: 'Send Feedback',
            subHeading: 'Report bugs, new features and more',
            icon: '/otherAssets/feedbackIcon.png'
        }, {
            id: 6,
            heading: 'Invite Agents',
            subHeading: 'Get 60 minutes ',
            icon: '/otherAssets/inviteAgentIcon.png'
        },
    ]

    const [selectedManu, setSelectedManu] = useState(manuBar[0])

    const renderComponent = (selectedMenuId) => {
        switch (selectedMenuId) {
            case 1:
                return <BasicInfo />;
            case 2:
                return <Billing />;
            case 3:
                return <MyPhoneNumber />;
            case 4:
                return <Support />;
            case 5:
                return <SendFeedback />;
            case 6:
                return <InviteAgentX />;
            default:
                return <div>Please select an option.</div>;
        }
    };

    return (
        <div className='w-full flex flex-col items-center' style={{ overflow: 'hidden', height: '100vh' }}>
            <div className=' w-full flex flex-row justify-between items-center py-4 px-10'
                style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
            >
                <div style={{ fontSize: 24, fontWeight: '600' }}>
                    My Account
                </div>
                <button className='pr-10'>
                    <img src='/otherAssets/notificationIcon.png'
                        style={{ height: 24, width: 24 }}
                        alt='notificationIcon'
                    />
                </button>
            </div>

            <div className='w-full flex flex-row item-center pl-4'>
                <div className='w-4/12 items-center flex flex-col pt-4 pr-2'>
                    {
                        manuBar.map((item) => (
                            <div
                                key={item.id}
                                className='w-full'
                            >
                                <button
                                    className='w-full outline-none'
                                    style={{
                                        textTransform: 'none', // Prevents uppercase transformation
                                        fontWeight: 'normal', // Optional: Adjust the font weight
                                    }}
                                    onClick={() => {
                                        setSelectedManu(item)
                                    }}
                                >
                                    <div className='p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full'
                                        style={{ backgroundColor: selectedManu.id === item.id ? '#402FFF10' : 'transparent' }}
                                    >

                                        <Image src={item.icon}
                                            height={24}
                                            width={24}
                                            alt='icon'
                                        />
                                        <div className='flex flex-col gap-1 items-start' style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            <div style={{
                                                fontSize: 16, fontWeight: '700', color: '#000', whiteSpace: 'nowrap',
                                                overflow: 'hidden', textOverflow: 'ellipsis'
                                            }}>
                                                {item.heading}
                                            </div>

                                            <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                                                {item.subHeading}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))
                    }
                </div>

                <div className='w-8/12 ' style={{ overflow: 'auto', height: "92vh", borderLeftWidth: 1, borderBottomColor: '#00000010' }}>
                    {renderComponent(selectedManu.id)}
                </div>




            </div>
        </div>
    )
}

export default Page