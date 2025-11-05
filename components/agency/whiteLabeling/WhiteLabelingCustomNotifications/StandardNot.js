import { Tooltip, Switch } from '@mui/material';
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import EditNotifications from './EditNotifications';
import { StandardNotificationsList } from './WhiteLabelNotificationExtras';
import {
    createOrUpdateNotificationCustomization,
    deleteNotificationCustomization,
    toggleNotificationCustomization
} from '@/services/notificationServices/NotificationCustomizationService';

const StandardNot = ({ notificationsData = [], onRefresh, category = 'Standard' }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [toggling, setToggling] = useState(null);

    // Sanitize HTML for safe rendering
    const sanitizeHTML = (html) => {
        if (typeof window === 'undefined') return html; // Skip sanitization on server
        return DOMPurify.sanitize(html || '', {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class']
        });
    };

    // Transform API data to match the expected UI format
    const transformedNotifications = useMemo(() => {
        if (!notificationsData || notificationsData.length === 0) {
            return StandardNotificationsList; // Fallback to hardcoded data
        }

        // Filter notifications by category
        return notificationsData
            .filter(item => item.metadata?.category === category)
            .map((item, index) => ({
                id: index + 1,
                notificationType: item.notificationType,
                title: item.metadata?.name || 'Notification',
                description: item.metadata?.description || '',
                tootTip: item.metadata?.description || '',
                // App Notification (Push) fields
                appNotficationTitle: item.customization?.customPushTitle || item.metadata?.defaultPushTitle || '',
                appNotficationBody: item.customization?.customPushBody || item.metadata?.defaultPushBody || '',
                appNotficationCTA: item.customization?.customEmailCTA || item.metadata?.defaultEmailCTA || '',
                // Email Template fields
                emailNotficationTitle: item.customization?.customEmailSubject || item.metadata?.defaultEmailSubject || '',
                emailNotficationBody: item.customization?.customEmailBody || item.metadata?.defaultEmailBody || '',
                emailNotficationCTA: item.customization?.customEmailCTA || item.metadata?.defaultEmailCTA || '',
                // Legacy fields for backward compatibility
                subject: item.customization?.customEmailSubject || item.metadata?.defaultEmailSubject || '',
                subjectDescription: item.customization?.customEmailBody || item.metadata?.defaultEmailBody || '',
                CTA: item.customization?.customEmailCTA || item.metadata?.defaultEmailCTA || '',
                isActive: item.isActive,
                isCustomized: item.isCustomized,
                availableVariables: item.metadata?.availableVariables || [],
                supportsCTA: item.metadata?.supportsCTA || false,
            }));
    }, [notificationsData, category]);

    const handleEditClick = (notification) => {
        setSelectedNotification(notification);
        setIsEditModalOpen(true);
    };

    const handleSaveNotification = async (updatedData) => {
        try {
            setSaving(true);

            // Prepare data for API with all fields
            const apiData = {
                customPushTitle: updatedData.pushTitle,
                customPushBody: updatedData.pushBody,
                customEmailSubject: updatedData.emailSubject,
                customEmailBody: updatedData.emailBody,
                customEmailCTA: updatedData.cta,
                isActive: true,
            };

            // Call API to save customization
            await createOrUpdateNotificationCustomization(
                selectedNotification.actualNotificationType || selectedNotification.notificationType,
                apiData
            );

            console.log('Notification saved successfully');

            // Refresh the data
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Failed to save notification. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedNotification(null);
    };

    const handleDelete = async (notification) => {
        if (!confirm('Are you sure you want to revert this notification to defaults? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(notification.notificationType);

            await deleteNotificationCustomization(notification.notificationType);

            console.log('Notification customization deleted successfully');

            // Refresh the data
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error deleting notification customization:', error);
            alert('Failed to delete notification customization. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    const handleToggle = async (notification) => {
        try {
            setToggling(notification.notificationType);

            await toggleNotificationCustomization(notification.notificationType);

            console.log('Notification toggled successfully');

            // Refresh the data
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error toggling notification:', error);
            alert('Failed to toggle notification. Please try again.');
        } finally {
            setToggling(null);
        }
    };

    return (
        <>
            {saving && (
                <div className="w-full flex justify-center items-center py-4">
                    <div className="text-purple">Saving...</div>
                </div>
            )}
            {transformedNotifications.map((item) => {
            return (
                <div
                    key={item.id}
                    className="w-full border-b px-4 pb-4 mb-4"
                >
                    <div className="flex flex-row items-center justify-between mb-2">
                        <div style={styles.semiBoldHeading}>
                            {item.title || "Team member Invite email"}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Toggle Switch */}
                            {item.isCustomized && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <Switch
                                        checked={item.isActive}
                                        onChange={() => handleToggle(item)}
                                        disabled={toggling === item.notificationType}
                                        size="small"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#7c3aed',
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#7c3aed',
                                            },
                                        }}
                                    />
                                </div>
                            )}
                            {/* Delete Button */}
                            {item.isCustomized && (
                                <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deleting === item.notificationType}
                                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                                    title="Revert to defaults"
                                >
                                    {deleting === item.notificationType ? 'Deleting...' : 'Revert'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2 mb-4">
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
                                {item.supportsCTA && item.appNotficationCTA && (
                                    <div>
                                        <span style={styles.semiBoldHeading}>CTA:</span>
                                        <span className="ms-2 text-purple underline" style={styles.mediumRegular}>{item.appNotficationCTA}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                className="outline-none border-none"
                                style={styles.smallRegular}
                                onClick={() => handleEditClick(item)}
                                title="Edit this notification"
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

                    {/* Email Template - Only show if notification has email template */}
                    {(item.emailNotficationTitle || item.emailNotficationBody) && (
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
                            <div
                                style={styles.mediumRegular}
                                className="mt-4"
                                dangerouslySetInnerHTML={{ __html: sanitizeHTML(item.emailNotficationBody) }}
                            />
                            <div className="flex flex-row items-center justify-between mt-4">
                                <div>
                                    {item.supportsCTA && item.emailNotficationCTA && (
                                        <div>
                                            <span style={styles.semiBoldHeading}>CTA:</span>
                                            <span className="ms-2 text-purple underline" style={styles.mediumRegular}>{item.emailNotficationCTA}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="outline-none border-none"
                                    style={styles.smallRegular}
                                    onClick={() => handleEditClick(item)}
                                    title="Edit this notification"
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
                    )}
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
