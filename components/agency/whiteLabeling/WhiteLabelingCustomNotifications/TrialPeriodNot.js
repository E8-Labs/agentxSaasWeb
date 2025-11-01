import { Tooltip } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import EditNotifications from './EditNotifications';
import { GamificationNotificationList, PostTrialPeriodNotificationsList, TrialPeriodNotificationsList } from './WhiteLabelNotificationExtras';

const TrialPeriodNot = ({ notificationsListArray }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationsList, setNotificationsList] = useState(notificationsListArray === "TrialPeriod" ? TrialPeriodNotificationsList : notificationsListArray === "PostTrialPeriod" ? PostTrialPeriodNotificationsList : GamificationNotificationList);

    const handleEditClick = (notification) => {
        // console.log("Selected notification is", notification)
        setSelectedNotification(notification);
        setIsEditModalOpen(true);
    };

    const handleSaveNotification = (updatedData) => {
        // Update the notifications list with the edited data
        setNotificationsList(prevList =>
            prevList.map(item => {
                if (item.id === selectedNotification.id) {
                    // Check if we're editing App Notification or Email Template
                    if (selectedNotification.notificationType === 'App Notification') {
                        return {
                            ...item,
                            title: updatedData.title,
                            appNotficationTitle: updatedData.subject,
                            appNotficationBody: updatedData.description,
                            appNotficationCTA: updatedData.cta
                        };
                    } else if (selectedNotification.notificationType === 'Email Template') {
                        return {
                            ...item,
                            title: updatedData.title,
                            emailNotficationTitle: updatedData.subject,
                            emailNotficationBody: updatedData.description,
                            emailNotficationCTA: updatedData.cta
                        };
                    }
                }
                return item;
            })
        );
        console.log('Updated notification data:', updatedData);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedNotification(null);
    };

    return (
        <>
            {notificationsList.map((item) => {
                return (
                    <div
                        key={item.id}
                        className="w-full border-b px-4 pb-4 mb-4"
                    >
                        {/* Day/Trigger Header */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <div className="flex flex-row items-center gap-2">
                                <Tooltip
                                    title={item.tootTip}
                                    placement="top"
                                    arrow
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#ffffff",
                                                color: "#333",
                                                fontSize: "14px",
                                                padding: "10px 15px",
                                                borderRadius: "8px",
                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                                            },
                                        },
                                        arrow: {
                                            sx: {
                                                color: "#ffffff",
                                            },
                                        },
                                    }}
                                >
                                    <Image
                                        src="/otherAssets/infoLightDark.png"
                                        alt="info"
                                        width={12}
                                        height={12}
                                        className="cursor-pointer rounded-full"
                                    />
                                </Tooltip>
                                <div style={styles.smallRegular}>
                                    {`${item.description || "{{ When email is sent }}"}`}
                                </div>
                            </div>
                        </div>

                        {/* App Notification */}
                        <div className="bg-[#F9F9F9] p-4 rounded-lg mb-4">
                            <div className="flex flex-row items-center justify-between">
                                <div>
                                    <span style={styles.semiBoldHeading}>Title:</span>
                                    <span className="ms-2" style={styles.smallRegular}>{item.appNotficationTitle}</span>
                                </div>
                                <button
                                    className="rounded-md bg-[#7804DF10] text-purple w-[105px] h-[25px] outline-none border-none"
                                    style={styles.smallRegular}
                                >
                                    <i>App Notification</i>
                                </button>
                            </div>
                            <div style={styles.mediumRegular} className="mt-4">
                                {item.appNotficationBody}
                            </div>
                            <div className="flex flex-row items-center justify-between mt-4">
                                <div>
                                    {
                                        item.appNotficationCTA && (
                                            <div>
                                                <span style={styles.semiBoldHeading}>CTA:</span>
                                                <span className="ms-2 text-purple underline" style={styles.mediumRegular}>{item.appNotficationCTA}</span>
                                            </div>
                                        )
                                    }
                                </div>
                                <button
                                    className="outline-none border-none"
                                    style={styles.smallRegular}
                                    onClick={() => handleEditClick({ ...item, notificationType: 'App Notification', subject: item.appNotficationTitle, subjectDescription: item.appNotficationBody, CTA: item.appNotficationCTA })}
                                >
                                    <Image
                                        src={"/agencyIcons/purplePen.png"}
                                        alt="edit"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Email Template */}
                        {
                            item.emailNotficationTitle && (
                                <div className="bg-[#F9F9F9] p-4 rounded-lg">
                                    <div className="flex flex-row items-center justify-between">
                                        <div>
                                            <span style={styles.semiBoldHeading}>Subject:</span>
                                            <span className="ms-2" style={styles.smallRegular}>{item.emailNotficationTitle}</span>
                                        </div>
                                        <button
                                            className="rounded-md bg-[#7804DF10] text-purple w-[105px] h-[25px] outline-none border-none"
                                            style={styles.smallRegular}
                                        >
                                            <i>Email Template</i>
                                        </button>
                                    </div>
                                    <div style={styles.mediumRegular} className="mt-4 whitespace-pre-line">
                                        {item.emailNotficationBody}
                                    </div>
                                    <div className="flex flex-row items-center justify-between mt-4">
                                        <div>
                                            <span style={styles.semiBoldHeading}>CTA:</span>
                                            <span className="ms-2 text-purple underline" style={styles.mediumRegular}>{item.emailNotficationCTA}</span>
                                        </div>
                                        <button
                                            className="outline-none border-none"
                                            style={styles.smallRegular}
                                            onClick={() => handleEditClick({ ...item, notificationType: 'Email Template', subject: item.emailNotficationTitle, subjectDescription: item.emailNotficationBody, CTA: item.emailNotficationCTA })}
                                        >
                                            <Image
                                                src={"/agencyIcons/purplePen.png"}
                                                alt="edit"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                )
            })}

            {/* Edit Notifications Modal */}
            <EditNotifications
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                notificationData={selectedNotification}
                onSave={handleSaveNotification}
            />
        </>
    )
}

export default TrialPeriodNot

const styles = {
    semiBoldHeading: { fontSize: 16, fontWeight: "600" },
    mediumRegular: { fontSize: 16, fontWeight: "400" },
    smallRegular: { fontSize: 12, fontWeight: "400" },
    inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};
