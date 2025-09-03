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
    const [showManu, setShowMenu] = useState(null)

    useEffect(() => {
        getColumns()
    }, [open])

    // Check if save button should be disabled
    const isSaveDisabled = !body?.trim() || saveSmsLoader || !selectedPhone


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
            // Add your save logic here
            let data = {
                communicationType: communicationType,
                templateName: "Sms temp",
                content: body,
                phone:selectedPhone.phone
            }
            let response = null
            let IsdefaultCadence = localStorage.getItem(PersistanceKeys.isDefaultCadenceEditing)
            if (isEditing &&!IsdefaultCadence) {
                response = await updateTemplete(data,editingRow.templateId)
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
                        phone:selectedPhone
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
                <div className='flex flex-col w-4/12  px-8 py-6 bg-white max-h-[70vh] rounded-2xl'>

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
                            {isEditing ? "Update" : "New"} Text
                        </div>

                        <CloseBtn onClick={onClose} />
                    </div>
                    {
                        phoneLoading ? (
                            <CircularProgress size={30} />
                        ) : (
                            <FormControl>
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
                                    }
                                </Select>
                            </FormControl>
                        )}

                    <div className='w-full flex flex-col items-ceter  p-2 bg-[#7902DF10] rounded-lg mt-4'>

                        <div className='flex flex-row items-center justify-between w-full'>
                            <div className='text-purple text-[14] font-[700]'>
                                Note
                            </div>

                            <div className="relative">
                                <button
                                    className='text-[14px] font-[700] text-purple underline flex flex-row items-center gap-1'
                                    onClick={(event) => setShowMenu(event.currentTarget)}
                                    type="button"
                                >
                                    <div>
                                        see all.
                                    </div>
                                    <Image src={'/otherAssets/blueDownArrow.png'}
                                        height={24} width={24} alt='*'
                                    />
                                </button>
                                <Menu
                                    anchorEl={showManu}
                                    open={Boolean(showManu)}
                                    onClose={() => setShowMenu(null)}
                                    sx={{
                                        maxHeight: '30vh'
                                    }}
                                >
                                    {uniqueColumns.map((a) => (
                                        <MenuItem
                                            key={a}
                                            sx={{
                                                '&:hover .action-icon': {
                                                    display: 'none',
                                                },
                                                '&:hover .action-icon-hover': {
                                                    display: 'block',
                                                },
                                            }}
                                            onClick={() => {
                                                // Copy the column name to clipboard in curly braces
                                                if (navigator && navigator.clipboard) {
                                                    navigator.clipboard.writeText(`{${a}}`);
                                                }
                                                setShowMenu(null);
                                            }}
                                        >
                                            <div className='flex flex-row items-cetner w-full justify-between'>
                                                <div className='text-[15] font-[500]'>
                                                    {a}
                                                </div>

                                                <Image src={"/otherAssets/copyIcon.png"}
                                                    height={16} width={20} alt='*'
                                                />

                                            </div>
                                        </MenuItem>

                                    ))}
                                </Menu>
                            </div>
                        </div>

                        <div className='text-[13px] font-[400] text-black'>
                            You can add variables like <span className='text-purple'>{`{First Name}, {Address}.`}</span>
                        </div>
                    </div>
                    <div className=' mt-4'>
                        <PromptTagInput
                            promptTag={body}
                            // kycsList={kycsData}
                            uniqueColumns={uniqueColumns}
                            tagValue={setBody}
                            showSaveChangesBtn={body}
                            from={"Template"}
                            saveUpdates={async () => {
                            }}
                            limit={160}
                        />
                    </div>

                    <div className='text-[10px] font-[500] w-full mt-2' style={{
                        textAlign: 'end'
                    }}>
                        {body.length} Characters <br />
                        1 credit used out of <span className="text-purple"> 500</span>
                    </div>

                    <div className='w-full flex  flex-row items-center w-full gap-6 mt-4'>
                        <button className='w-1/2 h-[53px] text-[15px] font-[700] border rounded-lg'
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
                                {isEditing ? "Update" : "Save"} Message
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