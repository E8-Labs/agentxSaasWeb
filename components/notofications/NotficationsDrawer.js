"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Apis from "../apis/Apis";
import { CircularProgress, Drawer } from "@mui/material";
import { NotificationTypes } from "@/constants/NotificationTypes";
import moment from "moment";

function NotficationsDrawer({ close, }) {



    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState("");

    const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)


    useEffect(() => {
        getNotifications()
    }, [])


    const getNotifications = async () => {
        try {
            const user = localStorage.getItem("User")

            if (user) {
                let u = JSON.parse(user)
                setLoading(true)
                const response = await axios.get(Apis.getNotifications, {
                    headers: {
                        "Authorization": 'Bearer ' + u.token
                    }
                })

                if (response) {
                    setLoading(false)
                    if (response.data.status === true) {
                        console.log('notifications list is', response.data.data)
                        setNotifications(response.data.data.notifications)
                        setUnread(response.data.data.unread)
                    } else {
                        console.log('notification api message is', response.data.message)
                    }
                }
            }
        } catch (e) {
            setLoading(false)
            console.log('error in get notifications is ', e)
        }
    }
    // const notifications = [
    //     {
    //         id: 1,
    //         not: '30 mins added for using {Agent Code}',
    //         time: 'Oct 19  — 1:32 PM'
    //     }, {
    //         id: 2,
    //         not: '30 mins added for using {Agent Code}',
    //         time: 'Oct 19  — 1:32 PM'
    //     }, {
    //         id: 3,
    //         not: '30 mins added for using {Agent Code}',
    //         time: 'Oct 19  — 1:32 PM'
    //     }, {
    //         id: 4,
    //         not: '30 mins added for using {Agent Code}',
    //         time: 'Oct 19  — 1:32 PM'
    //     },
    // ]

    const getNotificationImage = (item) => {
        if (item.type === NotificationTypes.RedeemedAgentXCode) {
            return <Image src={"/svgIcons/minsNotIcon.svg"}
                height={37}
                width={37}
                alt="*"
            />


        } else if (item.type === NotificationTypes.InviteAccepted) {
            return (
                <div className="flex rounded-full justify-center items-center bg-black text-white text-md" style={{ height: 37, width: 37 }}>
                    {item.fromUser?.name[0]}
                </div>
            )
        } else if (item.type === NotificationTypes.Hotlead) {
            return "/svgIcons/hotLeadNotIcon.svg"
        } else if (item.type === NotificationTypes.TotalHotlead) {
            return (
                <div className="flex rounded-full justify-center items-center bg-black text-white text-md" style={{ height: 37, width: 37 }}>
                    {item.lead?.firstName[0]}
                </div>
            )
        } else if (item.type === NotificationTypes.MeetingBooked) {
            return (
                <div className="flex rounded-full justify-center items-center bg-black text-white text-md" style={{ height: 37, width: 37 }}>
                    {item.lead?.firstName[0]}
                </div>
            )
        } else if (item.type === NotificationTypes.PaymentFailed) {
            return "/svgIcons/urgentNotIcon.svg"
        }
    }


    const renderItem = (item, index) => {

        return (
            <div key={index} className="w-full flex flex-row gap-2 items-cneter mt-5">
                {getNotificationImage(item)}

                <div className="flex flex-col gap-1 items-start">
                    <div style={{ fontSize: 15, fontWeight: '500' }}>
                        {item.title}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: '500', color: '#00000060' }}>
                        {moment(item.createdAt).format("MMMM YY — h:mm A")}
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="w-full">
            <button onClick={() => { setShowNotificationDrawer(true) }}>
                <img src='/otherAssets/notificationIcon.png'
                    style={{ height: 24, width: 24 }}
                    alt='notificationIcon'
                />
            </button>
            <Drawer
                anchor="right"
                sx={{
                    "& .MuiDrawer-paper": {
                        width: "30%", // Drawer width
                        boxSizing: "border-box", // Ensure padding doesn't shrink content
                    },
                }}
                open={showNotificationDrawer}
                onClose={() => { setShowNotificationDrawer(false) }}
            >
                <div className="w-full h-full flex flex-col">

                    <div className="flex flex-row items-center justify-between p-6">
                        <div className="flex flex-row gap-2 items-center">
                            <div className='flex flex-row '>
                                <Image
                                    src="/svgIcons/notificationIcon.svg"
                                    height={24}
                                    width={24}
                                    alt="Notification Icon"
                                />
                                <div className="flex bg-red rounded-full w-[18px] py-[1px] flex-row items-center justify-center text-red font-md text-white" style={{ fontSize: 13, marginTop: -13, alignSelf: 'flex-start', marginLeft: -15 }}>
                                    {unread || 2}
                                </div>
                            </div>
                            <div style={{ fontSize: 22, fontWeight: "600" }}>
                                Notifications
                            </div>
                        </div>
                        <button
                            onClick={() => { setShowNotificationDrawer(false) }}>
                            <img
                                src="/svgIcons/cross.svg"
                                style={{ height: 24, width: 24 }}
                                alt="Close"
                            />
                        </button>
                    </div>

                    <div style={{ height: 1, width: '100%', background: '#00000010' }}></div>

                    <div className="flex flex-col justify-center px-6">
                        {
                            loading ? (
                                <div className="flex w-full items-center flex-col mt-10">
                                    <CircularProgress size={35} />
                                </div>
                            ) : (
                                !notifications.length > 0 ? (
                                    <div style={{ fontSize: 20, fontWeight: '700', padding: 20 }}>
                                        No Notification
                                    </div>
                                ) :
                                    notifications.map((item, index) => (
                                        renderItem(item, index)
                                    ))
                            )
                        }
                    </div>
                </div>
            </Drawer>
        </div>


    );
}

export default NotficationsDrawer;
