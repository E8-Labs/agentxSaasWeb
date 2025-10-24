import { Tooltip } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import EditNotifications from './EditNotifications';

const StandardNot = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationsList, setNotificationsList] = useState(NotificationsList);

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


const NotificationsList = [
    {
        id: 1,
        title: "Team member Invite email",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Welcome to the AgentX Team! 🎉",
        subjectDescription: "Hi [First Name], [Admin First Name] has invited you to join their team on AgentX! Click the link below to accept your invitation and get access. [Accept Invitation] If you have any questions, feel free to reach out to the person who invited you directly or contact our support team for assistance. Welcome to the team! Best, The AgentX Team",
        CTA: "View Your Team Dashboard"
    },
    {
        id: 2,
        title: "30 mins added for using {Agent Code}",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "You've Just Earned 30 More Minutes! ✨",
        subjectDescription: "Hi [Name], Congratulations! You've just unlocked 30 additional minutes of AI talk time using your Agent Code: {Agent Code}. This bonus time will help you reach more prospects and close more deals. Make the most of this opportunity by uploading fresh leads and starting your calls right away. Best regards, The AgentX Team",
        CTA: "Upload Leads and Start Calling"
    },
    {
        id: 3,
        title: "{Teamname} accepted your invite",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "[Teamname] joined AgentX!",
        subjectDescription: "Hi [Name], Great news! Your team, {Teamname}, has officially joined AgentX. What's next? You can now collaborate with your team members, share leads, and work together to maximize your success. Welcome aboard! Best, The AgentX Team",
        CTA: "View Your Team Dashboard"
    },
    {
        id: 4,
        title: "{Leadname} is a hot lead 🔥",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "New Hot Lead Alert: {Leadname}",
        subjectDescription: "Hi [Name], Exciting news—your AI has identified a hot lead! Here are the details: Lead Name: {Leadname} This lead has shown high engagement and interest. Don't miss this opportunity to connect and convert. Best regards, The AgentX Team",
        CTA: "View Hot Lead and Take Action"
    },
    {
        id: 5,
        title: "{Leadname} booked a meeting 🗓️",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Meeting Booked: {Leadname}",
        subjectDescription: "Hi [Name], Exciting news! {Leadname} has just booked a meeting. This is a perfect opportunity to make progress toward closing the deal. Make sure you're prepared for the meeting and follow up promptly. Best regards, The AgentX Team",
        CTA: "View Lead and Meeting Details"
    },
    {
        id: 6,
        title: "Urgent! Payment method failed",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Urgent: Payment Method Failed—Action Required 🚨",
        subjectDescription: "Hi [Name], We noticed an issue with your payment method, and your account is currently unable to process calls. To keep your AI up and running, please update your payment details immediately. Don't let this interrupt your success! Best regards, The AgentX Team",
        CTA: "Update Payment Method Now"
    },
    {
        id: 7,
        title: "Your calls have stopped for 3 days. Need help?",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Your Calls Have Stopped—Let's Get Back on Track! 📞",
        subjectDescription: "Hi [Name], We noticed your AI hasn't made any calls for 3 days. Is everything okay? Don't worry, we're here to help you get back on track. Join our live webinar to learn best practices and get your AI calling again. Best regards, The AgentX Team",
        CTA: "Join the Live Webinar Now"
    },
    {
        id: 8,
        title: "USE ON DESKTOP EMAIL",
        description: "{{ When email is sent }}",
        tootTip: "Test tool",
        subject: "Welcome to AgentX! Continue on Desktop",
        subjectDescription: "Hey Visionary, Welcome to AgentX, where we redefine what's possible in real estate. You've just taken the first step toward building your own AI—a tool so powerful, it could reshape how you do business. Continue your journey on desktop for the full experience. Best regards, The AgentX Team",
        CTA: "Continue on Desktop"
    },
]

