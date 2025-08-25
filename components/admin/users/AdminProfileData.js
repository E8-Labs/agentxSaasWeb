"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";

import { useRouter, useSearchParams } from "next/navigation";
import AdminBasicInfo from "./AdminProfileData/AdminBasicInfo";
import AdminBilling from "./AdminProfileData/AdminBilling";
import AdminPhoneNumber from "./AdminProfileData/AdminPhoneNumber";
import AdminXbarServices from "./AdminProfileData/AdminXbarServices";
import AdminSendFeedback from "./AdminSendFeedback";
import SubAccountBilling from "@/components/dashboard/subaccount/myAccount/SubAccountBilling";
import DashboardSlider from "@/components/animations/DashboardSlider";
import TwilioTrustHub from "@/components/myAccount/TwilioTrustHub";

function AdminProfileData({ selectedUser, from }) {
    let searchParams = useSearchParams();
    const router = useRouter();

    let manuBar = [
        {
            id: 1,
            heading: "Basic Information",
            subHeading: "Manage personal information ",
            icon: "/otherAssets/profileCircle.png",
        },
        {
            id: 2,
            heading: "Billing",
            subHeading: "Manage your billing and payment methods",
            icon: "/otherAssets/walletIcon.png",
        }, {
            id: 3,
            heading: "Phone Numbers",
            subHeading: "All agent phone numbers",
            icon: "/assets/unSelectedCallIcon.png",
        },
        {
            id: 4,
            heading: "Twilio Trust Hub",
            subHeading: "Caller ID & compliance for trusted calls",
            icon: "/svgIcons/twilioHub.svg",
        },

        {
            id: 5,
            heading: "Bar Services",
            subHeading: "Our version of the genius bar",
            icon: "/assets/X.svg",
        }

    ];



    const [tabSelected, setTabSelected] = useState(1);



    const [selectedManu, setSelectedManu] = useState(manuBar[tabSelected]);
    const [showNotificationDrawer, setShowNotificationDrawer] = useState(false)


    const renderComponent = () => {
        // setTabSelected(selectedMenuId);

        switch (tabSelected) {
            case 1:
                return <AdminBasicInfo selectedUser={selectedUser} />;
            case 2:
                // return <AdminBilling selectedUser={selectedUser} from={from} />;
                return (
                    <div>
                        {
                            from === "subaccount" ? (
                                <SubAccountBilling hideBtns={true} selectedUser={selectedUser} />
                            ) : (
                                <AdminBilling selectedUser={selectedUser} from={from} />
                            )
                        }
                    </div>
                );
            case 3:
                return <AdminPhoneNumber selectedUser={selectedUser} />;
            case 5:
                return <AdminXbarServices selectedUser={selectedUser} />;
            case 4 :
                return <TwilioTrustHub selectedUser = {selectedUser}/>

            default:
                return <div>Please select an option.</div>;
        }
    };

    return (
        // <Suspense>
        <div
            className="w-full flex flex-col items-center"
            style={{ overflow: "hidden", height: "100vh" }}
        >
            {/* Slider code */}
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0
                }}>
                <DashboardSlider
                    needHelp={false} />
            </div>
            <div
                className=" w-full flex flex-row justify-between items-center py-4 px-10"
                style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
            >
                <div style={{ fontSize: 24, fontWeight: "600" }}>My Account</div>


            </div>
            <div className="w-12/12">
            </div>
            <div className="w-full flex flex-row item-center pl-4">
                <div className="w-4/12 items-center flex flex-col pt-4 pr-2 overflow-y-auto h-[90%]"
                    style={{scrollbarWidth:"none"}}
                >
                    {manuBar.map((item, index) => (
                        <div key={item.id} className="w-full">
                            <button
                                className="w-full outline-none"
                                style={{
                                    textTransform: "none", // Prevents uppercase transformation
                                    fontWeight: "normal", // Optional: Adjust the font weight
                                }}
                                onClick={() => {
                                    //   setSelectedManu(index + 1);
                                    setTabSelected(index + 1);
                                }}
                            >
                                <div
                                    className="p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full"
                                    style={{
                                        backgroundColor:
                                            index === tabSelected - 1 ? "#402FFF10" : "transparent",
                                    }}
                                >
                                    <Image src={item.icon} height={24} width={24} alt="icon" />
                                    <div
                                        className="flex flex-col gap-1 items-start"
                                        style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "700",
                                                color: "#000",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.heading}
                                        </div>

                                        <div
                                            style={{ fontSize: 15, fontWeight: "500", color: "#000" }}
                                        >
                                            {item.subHeading}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>

                <div
                    className="w-8/12 "
                    style={{
                        overflow: "auto",
                        height: "60vh",
                        borderLeftWidth: 1,
                        borderBottomColor: "#00000010",
                    }}
                >
                    {renderComponent()}
                </div>
            </div>
        </div>
        // </Suspense>
    );
}

export default AdminProfileData;