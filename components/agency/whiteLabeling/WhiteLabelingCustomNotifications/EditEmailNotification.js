import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, Typography } from '@mui/material';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
    () => import('@/components/common/RichTextEditor'),
    { ssr: false }
);

const EditEmailNotification = ({
    isOpen,
    onClose,
    notificationData,
    onSave
}) => {
    const richTextEditorRef = useRef(null);
    const [selectedVariable, setSelectedVariable] = useState('');
    const [formData, setFormData] = useState({
        emailSubject: '',
        emailBody: '',
        cta: ''
    });

    // Update form data when notificationData changes
    useEffect(() => {
        if (notificationData) {
            setFormData({
                emailSubject: notificationData.emailNotficationTitle || notificationData.subject || '',
                emailBody: notificationData.emailNotficationBody || notificationData.subjectDescription || '',
                cta: notificationData.emailNotficationCTA || notificationData.CTA || ''
            });
        }
    }, [notificationData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onSave({
            emailSubject: formData.emailSubject,
            emailBody: formData.emailBody,
            cta: formData.cta
        });
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="edit-email-notification-modal"
            aria-describedby="edit-email-notification-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: {
                        xs: '80%',
                        sm: '70%',
                        md: '600px',
                        lg: '680px',
                    },
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                    height: '80vh',
                }}
            >
                <div
                    className="scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-scrollBarPurple pb-12 px-4"
                    style={{ display: 'flex', flexDirection: 'column', gap: 4, height: "90%", overflow: "auto" }}
                >
                    {/* Modal Header */}
                    <div className="w-full flex flex-row items-center justify-between mt-4">
                        <Typography id="edit-email-notification-modal" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Email Notification
                        </Typography>
                        <CloseBtn onClick={onClose} />
                    </div>

                    {/* Section Title */}
                    {/* <div className="mt-4">
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#7902DF", marginBottom: "16px" }}>
                            Email Notification
                        </h3>
                    </div> */}

                    {/* Email Subject Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Subject
                        </label>
                        <input
                            placeholder="Email subject line"
                            value={formData.emailSubject}
                            onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                            className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                            autoFocus={false}
                        />
                    </div>

                    {/* Email Body / Description Field */}
                    <div className="space-y-2">
                        <div className="flex flex-row items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Body
                            </label>
                            {notificationData?.availableVariables && notificationData.availableVariables.length > 0 && (
                                <div className="variable-dropdown-inline">
                                    <select
                                        value={selectedVariable}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSelectedVariable('');
                                            if (value && richTextEditorRef.current) {
                                                richTextEditorRef.current.insertVariable(value);
                                            }
                                        }}
                                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 outline-none focus:border-purple focus:ring-0"
                                    >
                                        <option value="">Insert Variable...</option>
                                        {notificationData.availableVariables.map((variable, index) => (
                                            <option key={index} value={variable}>
                                                {variable}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <RichTextEditor
                            ref={richTextEditorRef}
                            value={formData.emailBody}
                            onChange={(html) => handleInputChange('emailBody', html)}
                            placeholder="Enter email body with rich formatting..."
                            availableVariables={[]}
                        />
                    </div>

                    {/* CTA Field - Only show if notification supports CTA */}
                    {notificationData?.supportsCTA && formData?.cta !== undefined && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                CTA
                            </label>
                            <input
                                placeholder="Call to action button"
                                value={formData.cta}
                                onChange={(e) => handleInputChange('cta', e.target.value)}
                                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-row items-center justify-between h-[10%] px-4">
                    <button
                        onClick={onClose}
                        className="px-6 border-none outline-none text-gray-500"
                        style={styles.mediumRegular}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 bg-purple-600 hover:bg-purple-700 text-white h-[50px] w-[100px] text-center rounded-lg"
                    >
                        Save
                    </button>
                </div>
            </Box>
        </Modal>
    );
};

export default EditEmailNotification;

const styles = {
    semiBoldHeading: { fontSize: 16, fontWeight: "600" },
    mediumRegular: { fontSize: 16, fontWeight: "400" },
    smallRegular: { fontSize: 12, fontWeight: "400" },
    inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};

