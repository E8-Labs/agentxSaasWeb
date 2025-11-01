import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Paperclip, Smile, Bold, Underline, List, ListOrdered, Quote } from 'lucide-react';
import { Modal, Box, Typography } from '@mui/material';
import CloseBtn from '@/components/globalExtras/CloseBtn';

const EditNotifications = ({
    isOpen,
    onClose,
    notificationData,
    onSave
}) => {
    const [formData, setFormData] = useState({
        pushTitle: '',
        pushBody: '',
        emailSubject: '',
        emailBody: '',
        cta: ''
    });

    const [showVariables, setShowVariables] = useState(false);
    const titleInputRef = useRef(null);

    // Update form data when notificationData changes
    useEffect(() => {
        if (notificationData) {
            setFormData({
                pushTitle: notificationData.appNotficationTitle || '',
                pushBody: notificationData.appNotficationBody || '',
                emailSubject: notificationData.emailNotficationTitle || notificationData.subject || '',
                emailBody: notificationData.emailNotficationBody || notificationData.subjectDescription || '',
                cta: notificationData.emailNotficationCTA || notificationData.CTA || ''
            });
        }
    }, [notificationData]);

    // Prevent auto-selection when modal opens
    useEffect(() => {
        if (isOpen && titleInputRef.current) {
            // Small delay to ensure the modal is fully rendered
            setTimeout(() => {
                // Move cursor to end instead of selecting all text
                const input = titleInputRef.current;
                const length = input.value.length;
                input.setSelectionRange(length, length);
                input.blur();
            }, 100);
        }
    }, [isOpen]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const insertVariable = (variable) => {
        const currentDescription = formData.emailBody;
        const newDescription = currentDescription + `${variable}`;
        handleInputChange('emailBody', newDescription);
        setShowVariables(false);
    };

    const formatText = (format) => {
        // Basic text formatting implementation
        // This would need to be enhanced based on your specific requirements
        console.log(`Format text: ${format}`);
    };

    const handleTitleFocus = (e) => {
        // Prevent auto-selection on focus
        setTimeout(() => {
            const input = e.target;
            const length = input.value.length;
            input.setSelectionRange(length, length);
        }, 0);
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="edit-notification-modal"
            aria-describedby="edit-notification-description"
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
                        <Typography id="edit-notification-modal" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Edit Notification
                        </Typography>
                        <CloseBtn
                            onClick={onClose}
                        />
                    </div>

                    {/* Modal Body */}
                    {/* Push Title Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Push Title
                        </label>
                        <input
                            ref={titleInputRef}
                            placeholder="Push notification title"
                            value={formData.pushTitle}
                            onChange={(e) => handleInputChange('pushTitle', e.target.value)}
                            onFocus={handleTitleFocus}
                            className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                            autoFocus={false}
                        />
                    </div>

                    {/* Push Body Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Push Body
                        </label>
                        <input
                            placeholder="Push notification body"
                            value={formData.pushBody}
                            onChange={(e) => handleInputChange('pushBody', e.target.value)}
                            className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                            autoFocus={false}
                        />
                    </div>

                    {/* Email Subject Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Email Subject
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
                        <label className="text-sm font-medium text-gray-700">
                            Email Body
                        </label>
                        <div className="relative border rounded-md p-2">
                            <textarea
                                placeholder="Enter email body..."
                                value={formData.emailBody}
                                onChange={(e) => handleInputChange('emailBody', e.target.value)}
                                className="w-full min-h-[120px] resize-none border-none outline-none focus:outline-none focus:ring-0 focus:border-none bg-transparent"
                            />

                            <div className="flex flex-row items-center justify-between mt-2">
                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-2 p-2">
                                    <button
                                        type="button"
                                        onClick={() => formatText('attachment')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('emoji')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <Smile className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('bold')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('underline')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <Underline className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('bullet')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('numbered')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <ListOrdered className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => formatText('quote')}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <Quote className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Variables Popover */}
                                <Popover open={showVariables} onOpenChange={setShowVariables}>
                                    <PopoverTrigger asChild>
                                        <button
                                            className="text-purple"
                                            style={styles.mediumRegular}
                                        >
                                            + Add variable
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2" style={{ zIndex: 9999 }}>
                                        <div className="space-y-1">
                                            {notificationData?.availableVariables?.map((variable) => (
                                                <button
                                                    key={variable}
                                                    onClick={() => insertVariable(variable)}
                                                    className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                                                >
                                                    {variable}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                        </div>
                    </div>

                    {/* CTA Field */}
                    {
                        formData?.cta !== undefined && (
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
                        )
                    }

                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-row items-center justify-between h-[10%] px-4">
                    <button
                        onClick={handleCancel}
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

export default EditNotifications;


const styles = {
    semiBoldHeading: { fontSize: 16, fontWeight: "600" },
    mediumRegular: { fontSize: 16, fontWeight: "400" },
    smallRegular: { fontSize: 12, fontWeight: "400" },
    inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};