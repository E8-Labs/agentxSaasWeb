import ChipInput from '@/constants/ChipsInput';
import { Button, FormControl, Menu, MenuItem, Modal, Select, Box, CircularProgress } from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import CloseBtn from '../globalExtras/CloseBtn';
import { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage';
import { getUniquesColumn } from '../globalExtras/GetUniqueColumns';
import { PromptTagInput } from './tagInputs/PromptTagInput';
import { createTemplete, getTempleteDetails, updateTemplete } from './TempleteServices';
import { PersistanceKeys } from '@/constants/Constants';
import { Plus } from '@phosphor-icons/react';
import { getUserLocalData } from '../constants/constants';

function SMSTempletePopup({
    open,
    onClose,
    phoneNumbers = [],
    phoneLoading,
    communicationType,
    addRow,
    isEditing = false,
    editingRow = null,
    onUpdateRow = null,
    onSendSMS = null,
    isLeadSMS = false,
    leadPhone = null,
    leadId = null,

}) {

    const [body, setBody] = useState("")
    const [selectedPhone, setSelectedPhone] = useState(null)
    const [uniqueColumns, setUniqueColumns] = useState([])
    const [saveSmsLoader, setSaveSmsLoader] = useState(false)
    const [showSnackBar, setShowSnackBar] = useState({
        message: "",
        type: SnackbarTypes.Error,
    })
    const [showUniqueDropdown, setShowUniqueDropdown] = useState(false)
    const [showManu, setShowMenu] = useState(null);

    const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false);
    const [user, setUser] = useState(null)
    const [IsDefaultCadence, setIsDefaultCadence] = useState(null)
    useEffect(() => {
        let data = getUserLocalData()
        setUser(data.user)
        getColumns()
        let isDefault = localStorage.getItem(PersistanceKeys.isDefaultCadenceEditing)
        console.log('isDefault', isDefault)
        setIsDefaultCadence(isDefault)
    }, [open])

    // Check if save button should be disabled
    const isSaveDisabled = isLeadSMS ? (
        // For lead SMS, only require body content
        !body?.trim() || saveSmsLoader
    ) : (
        // Original validation for pipeline cadence
        !body?.trim() || saveSmsLoader || !selectedPhone
    )


    // Auto-fill form when editing
    useEffect(() => {
        if (isEditing && editingRow && open) {
            // Load template details if templateId exists
            if (editingRow.templateId) {
                loadTemplateDetails(editingRow);
            }
        } else if (!isEditing) {
            // Reset form when not editing
            setBody("");
            setSelectedPhone(null)
        }
    }, [isEditing, editingRow, open]);

    const loadTemplateDetails = async (template) => {
        try {
            // setDetailsLoader(template.id);
            const details = await getTempleteDetails(template);
            console.log('details', details)
            if (details) {
                setBody(details.content || "");
                setSelectedPhone(details.phone);

            }
        } catch (error) {
            console.error('Error loading template details:', error);
        } finally {
            // setDetailsLoader(null);
        }
    };

    const handleSave = async () => {
        if (isSaveDisabled) return

        setSaveSmsLoader(true)
        try {
            // Handle lead SMS sending
            if (isLeadSMS && onSendSMS) {
                console.log('Sending SMS to lead:', leadPhone);

                const smsData = {
                    content: body,
                    phone: leadPhone,
                    smsPhoneNumberId: selectedPhone?.id,
                    leadId: leadId

                };
                console.log('smsData', smsData)
                onSendSMS(smsData);
                return; // Don't close modal yet, let the send function handle it
            }

            // Add your save logic here
            let data = {
                communicationType: communicationType,
                templateName: "Sms temp",
                content: body,
                phone: selectedPhone.phone
            }
            let response = null
            if (isEditing && !IsDefaultCadence) {
                response = await updateTemplete(data, editingRow.templateId)
            } else {
                response = await createTemplete(data)
            }

            if (response.data.status === true) {
                // setShowSnackBar({
                //     message: response.data.message,
                //     type: SnackbarTypes.Success,
                // })
                const createdTemplate = response?.data?.data

                if (isEditing && onUpdateRow && editingRow) {
                    // Update existing row with new template data
                    onUpdateRow(editingRow.id, {
                        templateId: createdTemplate.id,
                        content: body,
                        communicationType: 'sms',
                    });
                } else {
                    addRow({
                        templateId: createdTemplate.id,
                        communicationType: 'sms',
                        phone: selectedPhone
                    });
                }

                // if (addRow && createdTemplate) {
                //     addRow({
                //         templateId: createdTemplate.id,
                //         communicationType: 'sms',
                //     });
                // }
            }
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            console.log('error', error)
            // setShowSnackBar({
            //     message: "Failed to save SMS template",
            //     type: SnackbarTypes.Error,
            // })
        } finally {
            setSaveSmsLoader(false)
        }
    }

    const getColumns = async () => {
        let res = await getUniquesColumn()
        // console.log('res', res)
        if (res) {
            setUniqueColumns(res)
        }
    }

    const handleSelect = (t) => {
        console.log('t', t)
        setSelectedPhone(t);
        // onClose();
    };

    //code for showing more unique columns
    const handleShowUniqueCols = () => {
        setShowMoreUniqueColumns(!showMoreUniqueColumns);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                    padding: 0,
                    margin: 0,
                },
            }}
        >
            <Box
                className="w-full h-full py-4 flex items-center justify-center"
                sx={{ ...styles.modalsStyle, }}
            >
                <div
                    className='flex flex-col w-4/12  px-8 py-6 bg-white max-h-[70vh] rounded-2xl justify-between'
                >
                    <div
                        className='flex flex-col w-full h-[80%] overflow-auto'
                        style={{ scrollbarWidth: 'none' }}
                    >

                        <AgentSelectSnackMessage
                            type={showSnackBar.type}
                            message={showSnackBar.message}
                            isVisible={showSnackBar.message !== ""}
                            hide={() => {
                                setShowSnackBar({
                                    message: "",
                                    type: SnackbarTypes.Success,
                                });
                            }}
                        />

                        <div className='w-full flex flex-row items-center justify-between mb-8'>
                            <div className='text-[15px] font-[700]'>
                                {isLeadSMS ? 'Send Text Message' : (isEditing && !IsDefaultCadence ? "Update Text" : "New Text Message")}
                            </div>

                            <CloseBtn onClick={onClose} />
                        </div>

                        <div className='w-full flex flex-col items-ceter  p-2 bg-[#7902DF10] rounded-lg mb-2'>

                            <div className='flex flex-row items-center justify-between w-full'>
                                <div className='text-purple text-[14] font-[700]'>
                                    Note
                                </div>
                            </div>

                            <div className='text-[13px] font-[400] text-black flex flex-row flex-wrap'>
                                You can add variables like <span className='text-purple'>{`{First Name}, {Address}.`}</span>

                                {uniqueColumns.length > 0 && showMoreUniqueColumns ? (
                                    <div className="flex flex-row flex-wrap gap-2">
                                        {uniqueColumns.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-row items-center gap-2 text-purple"
                                            >
                                                {`{${item}}`},
                                            </div>
                                        ))}
                                        <button
                                            className="text-purple outline-none"
                                            onClick={handleShowUniqueCols}
                                        >
                                            show less
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {uniqueColumns.length > 0 && (
                                            <button
                                                className="text-purple flex flex-row items-center font-bold outline-none"
                                                onClick={() => {
                                                    handleShowUniqueCols();
                                                }}
                                            >
                                                <Plus
                                                    weight="bold"
                                                    size={15}
                                                    style={{
                                                        strokeWidth: 40, // Adjust as needed
                                                    }}
                                                />
                                                {uniqueColumns.length}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {
                            phoneLoading ? (
                                <CircularProgress size={30} />
                            ) : (

                                <div className='flex flex-row gap-3 w-full mt-3 items-center'>

                                    <FormControl sx={{ width: isLeadSMS ? '80%' : '100%', height: '54px' }}>
                                        <Select
                                            value={selectedPhone || ""}
                                            onChange={(event) => handleSelect(event.target.value)}
                                            displayEmpty // Enables placeholder
                                            renderValue={(selected) => selected.phone || <div style={{ color: "#aaa" }}>Select Number</div>}
                                            sx={{
                                                ...styles.dropdownMenu,
                                                backgroundColor: "#FFFFFF",
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "transparent", // Hide focused border color

                                                },

                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: "30vh", // Limit dropdown height
                                                        overflow: "auto", // Enable scrolling in dropdown
                                                        scrollbarWidth: "none",
                                                        // borderRadius: "10px"
                                                    },
                                                },
                                            }}
                                        >
                                            {
                                                phoneNumbers?.length > 0 ? (

                                                    phoneNumbers?.map((item, index) => (
                                                        <MenuItem key={index}
                                                            // className="hover:bg-[#402FFF10]"
                                                            value={item}
                                                        >
                                                            <div className='flex flex-row items-center gap-2'>

                                                                <div className='text-[15] font-[500] w-48'>
                                                                    {item.phone}
                                                                </div>
                                                            </div>

                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <div className='p-2'>
                                                        No number found
                                                    </div>
                                                )
                                            }
                                        </Select>
                                    </FormControl>
                                </div>

                            )
                        }


                        <div className=' mt-4'>
                            <PromptTagInput
                                promptTag={body}
                                // kycsList={kycsData}
                                uniqueColumns={uniqueColumns}
                                tagValue={setBody}
                                showSaveChangesBtn={body}
                                from={"sms"}
                                isEdit={isEditing}
                                editTitle={isEditing && !IsDefaultCadence ? "Edit Text" : "Create Text"}
                                saveUpdates={async () => {
                                }}
                                limit={160}
                            />
                        </div>

                        <div className='text-[10px] font-[500] w-full mt-2' style={{
                            textAlign: 'end'
                        }}>
                            {body.length}/160<br />
                            10 text messages equal 1 credit. Balance:<span className="text-purple"> {(user?.totalSecondsAvailable / 60).toFixed(2)}</span>
                        </div>

                    </div>
                    <div className='w-full flex  flex-row items-center w-full gap-6 mt-4'>
                        <button className='w-1/2 text-gray-600 hover:text-gray-800'
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        {saveSmsLoader ? (
                            <div className='w-1/2 h-[53px] flex items-center justify-center'>
                                <CircularProgress size={30} />
                            </div>
                        ) : (
                            <button
                                className={`w-1/2 h-[53px] text-[15px] font-[700] rounded-lg text-white  ${isSaveDisabled ? 'bg-[#00000050]' : 'bg-purple hover:bg-purple/90'
                                    }`}
                                disabled={isSaveDisabled}
                                onClick={handleSave}
                            >
                                {isLeadSMS ? 'Send' : (isEditing && !IsDefaultCadence ? "Update" : "Create")} Text
                            </button>
                        )}
                    </div>
                </div>

            </Box>
        </Modal>
    )
}


const styles = {
    dropdownMenu: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000000",
    },
    labelStyle: {
        backgroundColor: "white",
        fontWeight: "400",
        fontSize: 10,
    },
    modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
}

export default SMSTempletePopup