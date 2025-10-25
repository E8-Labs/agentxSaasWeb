import { Tooltip } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import EditNotifications from './EditNotifications';
import { StandardNotificationsList } from './WhiteLabelNotificationExtras';

const StandardNot = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationsList, setNotificationsList] = useState(StandardNotificationsList);

    const handleEditClick = (notification) => {
        setSelectedNotification(notification);
        setIsEditModalOpen(true);
    };

    const handleSaveNotification = (updatedData) => {
        // Update the notifications list with the edited data
        setNotificationsList(prevList => 
            prevList.map(item => 
                item.id === selectedNotification.id 
                    ? {
                        ...item,
                        title: updatedData.title,
                        subject: updatedData.subject,
                        subjectDescription: updatedData.description,
                        CTA: updatedData.cta
                    }
                    : item
            )
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
                    <div style={styles.semiBoldHeading}>
                        {item.title || "Team member Invite email"}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Tooltip
                            title={item.tootTip}
                            placement="top"
                            arrow
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        backgroundColor: "#ffffff", // Ensure white background
                                        color: "#333", // Dark text color
                                        fontSize: "14px",
                                        padding: "10px 15px",
                                        borderRadius: "8px",
                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                    },
                                },
                                arrow: {
                                    sx: {
                                        color: "#ffffff", // Match tooltip background
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
                    <div className="bg-[#F9F9F9] p-4 rounded-lg mt-4">
                        <div className="flex flex-row items-center justify-between">
                            <div>
                                <span style={styles.semiBoldHeading}>Subject:</span>
                                <span className="ms-2" style={styles.smallRegular}>{`${item.subject || "Welcome to the AgentX Team! 🎉"}`}</span>
                            </div>
                            <button
                                className="rounded-md bg-[#7804DF10] text-purple w-[105px] h-[25px] outline-none border-none"
                                style={styles.smallRegular}
                            >
                                <i>Email Template</i>
                            </button>
                        </div>
                        <div style={styles.mediumRegular} className="mt-4">
                            {`
                    ${item.subjectDescription || "Hi [First Name], [Admin First Name] has invited you to join their team on AgentX! Click the link below to accept your invitation and get access. [Accept Invitation] If you have any questions, feel free to reach out to the person who invited you directly or contact our support team for assistance. Welcome to the team! Best, The AgentX Team"}
                    `}
                        </div>
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div>
                                <span style={styles.semiBoldHeading}>CTA:</span>
                                <span className="ms-2 text-purple underline" style={styles.mediumRegular}>{`${item.CTA || "View Your Team Dashboard"}`}</span>
                            </div>
                            <button
                                className="outline-none border-none"
                                style={styles.smallRegular}
                                onClick={() => handleEditClick(item)}
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

export default StandardNot

const styles = {
    semiBoldHeading: { fontSize: 16, fontWeight: "600" },
    mediumRegular: { fontSize: 16, fontWeight: "400" },
    smallRegular: { fontSize: 12, fontWeight: "400" },
    inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};
