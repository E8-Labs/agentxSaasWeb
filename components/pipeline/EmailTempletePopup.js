import ChipInput from '@/constants/ChipsInput';
import { Button, FormControl, Menu, MenuItem, Modal, Select, Box, CircularProgress } from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react'
import { createTemplete, deleteTemplete, getGmailAccounts, getTempleteDetails, getTempletes, updateTemplete } from './TempleteServices';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';

function EmailTempletePopup({
    open,
    onClose,
    templetes,
    setTempletes,
    communicationType,
    addRow,
    isEditing = false,
    editingRow = null,
    onUpdateRow = null,
    selectedGoogleAccount,
    setSelectedGoogleAccount,

}) {

    const bodyRef = useRef(null);

 


    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [ccEmails, setccEmails] = useState([])
    const [attachments, setAttachments] = useState([]);

    const [selectedTemp, setSelectedTemp] = useState(null)
    const [saveEmailLoader, setSaveEmailLoader] = useState(false)

    const [detailsLoader, setDetailsLoader] = useState(null)

    const [delTempLoader, setDelTempLoader] = useState(null)

    // above return
    // disable save if any field is missing or while saving

    const [showSnackBar, setShowSnackBar] = useState({
        message: "",
        type: SnackbarTypes.Error,
    })
    const [tempName, setTempName] = useState(null)

    const [showChangeManu, setShowChangeManu] = useState(null)

    const [googleAccounts, setGoogleAccounts] = useState([])
    const [googleAccountLoader, setGoogleAccountLoader] = useState([])


    useEffect(() => {
        if (bodyRef.current && body) {
          bodyRef.current.innerHTML = body;
        }
      }, [open, body]);

    // Auto-fill form when editing
    useEffect(() => {
        if (isEditing && editingRow && open) {
            // Load template details if templateId exists
            if (editingRow.templateId) {
                loadTemplateDetails(editingRow);
            }
        } else if (!isEditing) {
            // Reset form when not editing
            setTempName("");
            setSubject("");
            setBody("");
            setccEmails([]);
            setAttachments([]);
            setSelectedTemp(null);
        }
    }, [isEditing, editingRow, open]);

    const loadTemplateDetails = async (template) => {
        try {
            setDetailsLoader(template.id);
            const details = await getTempleteDetails(template);
            console.log('details', details)
            if (details) {
                setTempName(details.templateName || "");
                setSubject(details.subject || "");
                setBody(details.content || "");
                setccEmails(details.ccEmails || []);
                setAttachments(details.attachments || []);
            }
        } catch (error) {
            console.error('Error loading template details:', error);
        } finally {
            setDetailsLoader(null);
        }
    };

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const invalidEmails = ccEmails.filter(e => !emailRegex.test(String(e).trim()));


    // console.log("template",templetes)


    const isSaveDisabled =
        !tempName?.trim() ||
        !subject?.trim() ||
        !body?.trim() ||
        ccEmails.length === 0 ||
        saveEmailLoader ||
        invalidEmails.length > 0
        ;


    useEffect(() => {
        if (showChangeManu)
            getAccounts()

    }, [showChangeManu])


    const handleDeleteTemplate = async (template) => {
        console.log('template to delete', template)
        setDelTempLoader(template)
        await deleteTemplete(template)
        setDelTempLoader(null)
        setTempletes((prev) => prev.filter((x) => x.id !== template.id));
    };

    const handleDelete = (e, t) => {
        e.stopPropagation(); // don't trigger select / close
        handleDeleteTemplate(t)
        // setTempletes((prev) => prev.filter((x) => x.id !== t.id));
    };

    const handleSelect = (t) => {
        setSelectedTemp(t)
        if (!isEditing && addRow) {
            addRow({
                templateId: t.id,
                emailAccountId: selectedGoogleAccount?.id,
                communicationType: 'email',
            });
        }
        onClose();
        // getTempDetailsHandler(t)
        // onClose();
    };

    const applyFormat = (format) => {
        if (format === "bold") document.execCommand("bold", false, null);
        if (format === "italic") document.execCommand("italic", false, null);
        if (format === "underline") document.execCommand("underline", false, null);
    };

    const [selectedFormats, setSelectedFormats] = React.useState({
        bold: false,
        italic: false,
        underline: false,
    });

    // Helper to check if a format is currently active in the selection
    const isFormatActive = (format) => {
        if (typeof window === "undefined") return false;
        try {
            return document.queryCommandState(format);
        } catch {
            return false;
        }
    };

    // Handler to apply format and update selected state
    const handleFormatClick = (format) => {
        applyFormat(format);
        setSelectedFormats((prev) => ({
            ...prev,
            [format]: isFormatActive(format),
        }));
    };

    // On mount and on selection change, update selectedFormats
    useEffect(() => {
        const updateFormats = () => {
            setSelectedFormats({
                bold: isFormatActive("bold"),
                italic: isFormatActive("italic"),
                underline: isFormatActive("underline"),
            });
        };
        document.addEventListener("selectionchange", updateFormats);
        // Initial update
        updateFormats();
        return () => {
            document.removeEventListener("selectionchange", updateFormats);
        };
    }, []);


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // only pdf
        const pdfs = files.filter((f) => f.type === "application/pdf");
        setAttachments((prev) => [...prev, ...pdfs]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const saveEmail = async () => {
        setSaveEmailLoader(true)
        let data = {
            communicationType: communicationType,
            subject: subject,
            content: body,
            ccEmails: ccEmails,
            attachments: attachments,
            templateName: tempName
        }
        let response = null
        if (isEditing) {
            response = await updateTemplete(data, editingRow.templateId)
        } else {
            response = await createTemplete(data)
        }

        if (response.data.status === true) {
            setShowSnackBar({
                message: response.data.message,
                type: SnackbarTypes.Success,
            })
            const createdTemplate = response?.data?.data
            if (createdTemplate) {
                setTempletes((prev) => (Array.isArray(prev) ? [...prev, createdTemplate] : [createdTemplate]))
            }

            if (isEditing && onUpdateRow && editingRow) {
                // Update existing row with new template data
                onUpdateRow(editingRow.id, {
                    templateId: createdTemplate.id,
                    templateName: tempName,
                    subject: subject,
                    content: body,
                    ccEmails: ccEmails,
                    attachments: attachments,
                });
            } else {
                // Add new row
                setTimeout(() => {
                    if (addRow) {
                        addRow({
                            templateId: createdTemplate.id,
                            emailAccountId: selectedGoogleAccount?.id,
                            communicationType: 'email',
                        });
                    }
                }, 500);
            }

            setTimeout(() => {
                onClose();
            }, 500);
        } else {
            setShowSnackBar({
                message: response.data.message,
                type: SnackbarTypes.Error,
            })
        }
        setSaveEmailLoader(false)
    }

    const handleBodyInput = (e) => {
        // setBodyHtml(e.currentTarget.innerHTML); // with tags
        setBody(e.currentTarget.innerHTML); // plain text
    };


    const getAccounts = async () => {
        setGoogleAccountLoader(true)
        let acc = await getGmailAccounts()
        setGoogleAccounts(acc)
        setGoogleAccountLoader(false)

    }


    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box
                className="w-full h-[100vh] py-4 flex flex-col items-center justify-center"
                sx={{ ...styles.modalsStyle, }}
            >
                <div className='flex flex-col w-5/12  px-8 py-6 bg-white max-h-[80vh] rounded-2xl gap-2 overflow-y-auto'
                    style={{scrollbarWidth:'none'}}
                >

                    <AgentSelectSnackMessage
                        isVisible={showSnackBar.message}
                        message={showSnackBar.message}
                        type={showSnackBar.type}
                        hide={() => {
                            setShowSnackBar({
                                message: ""
                            })
                        }}
                    />
                    <div className='flex flex-row items-center justify-between '>
                        <div className='text-xl font-semibold color-black'>
                            {isEditing ? 'Edit Email' : 'Email'}
                        </div>

                        <FormControl>
                            <Select
                                Select
                                value={selectedTemp || ""}
                                onChange={(e) => handleSelect(e.target.value)}
                                displayEmpty
                                renderValue={(selected) => selected?.templateName || <div style={{ color: "#aaa" }}>Select from Template</div>}
                                sx={{
                                    border: "none", // Default border
                                    "&:hover": {
                                        border: "none", // Same border on hover
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Remove the default outline
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Remove outline on focus
                                    },
                                    "&.MuiSelect-select": {
                                        py: 0, // Optional padding adjustments
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
                                    templetes?.length > 0 ? (


                                        templetes?.map((item, index) => (

                                            detailsLoader?.id === item.id ? (
                                                <CircularProgress key={item.id}  size={20} />
                                            ) :

                                                <MenuItem key={index}
                                                    // className="hover:bg-[#402FFF10]"
                                                    value={item}
                                                >
                                                    <div className='flex flex-row items-center gap-2'>

                                                        <div className='text-[15] font-[500] w-64'>
                                                            {item.templateName}
                                                        </div>
                                                        {
                                                            delTempLoader?.id === item.id ? (
                                                                <CircularProgress size={20} />
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        handleDelete(e, item)
                                                                    }}
                                                                >
                                                                    <Image src={'/otherAssets/delIcon.png'} alt='*'
                                                                        height={16} width={16}
                                                                    />
                                                                </button>
                                                            )
                                                        }
                                                    </div>

                                                </MenuItem>
                                        ))
                                    ) : (
                                        <div className='ml-2'>
                                            No template found
                                        </div>
                                    )
                                }
                            </Select>
                        </FormControl>
                    </div>

                    <div className='flex flex-row items-center justify-between '>
                        <div className="text-[15px] font-[400] text-[#00000080] mt-4">
                            From: <span className="text-[#00000050] ml-2">
                                {selectedGoogleAccount?.email}
                            </span>
                        </div>

                        <button
                            onClick={(event) => setShowChangeManu(event.currentTarget)}
                        >
                            <div className='text-15 font-[700] underline text-purple'>
                                Change
                            </div>
                        </button>
                        <Menu
                            anchorEl={showChangeManu}
                            open={Boolean(showChangeManu)}
                            onClose={() => setShowChangeManu(null)}
                        >

                            {
                                googleAccountLoader ? (
                                    <div className="w-[10vw]">
                                        <CircularProgress size={20} />
                                    </div>
                                ) :
                                    googleAccounts.map((a) => (
                                        <MenuItem
                                            key={a.id}
                                            sx={{
                                                '&:hover .action-icon': {
                                                    display: 'none',
                                                },
                                                '&:hover .action-icon-hover': {
                                                    display: 'block',
                                                },
                                            }}
                                            onClick={() => {
                                                setSelectedGoogleAccount(a)
                                                setShowChangeManu(null)
                                            }}
                                        >
                                            <div className='text-[15] font-[500]'>
                                                {a.email}
                                            </div>
                                        </MenuItem>

                                    ))}
                        </Menu>

                    </div>

                    <div className="h-12 mt-2 rounded-[5px] px-[10px] py-7 border-2 rounded-lg border-[#00000010] flex flex-row items-center">
                        <div className="text-[#00000070] text-[15px] font-normal">CC:</div>
                        <ChipInput ccEmails={ccEmails} setccEmails={setccEmails} />
                    </div>

                    {invalidEmails.length > 0 && (
                        <div className="mt-1 text-red text-xs">
                            Invalid email {/* {invalidEmails.length > 1 ? 's' : ''}: {invalidEmails.join(', ')}*/}
                        </div>
                    )}


                    <input
                        className='w-full h-12 px-[10px] py-7 mt-3 border-2 rounded-lg border-[#00000010]  outline-none focus:outline-none focus:border-[#00000010] focus:ring-0  '
                        placeholder='Template Name'
                        value={tempName}
                        onChange={(event) => { setTempName(event.target.value) }}
                    />

                    <input
                        className='w-full h-12 px-[10px] py-7 mt-3 border-2 rounded-lg border-[#00000010]  outline-none focus:outline-none focus:border-[#00000010] focus:ring-0  '
                        placeholder='Subject'
                        value={subject}
                        onChange={(event) => { setSubject(event.target.value) }}
                    />


                    <div
                    id="bodyInput"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleBodyInput}
                    // dangerouslySetInnerHTML={{ __html: body }}
                    className="outline-none bg-transparent w-full h-[15vh] mt-3 p-2"
                    style={{
                      border: "1px solid #00000020",
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10,
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                      direction: "ltr",         // 👈 force left-to-right
                      unicodeBidi: "plaintext", // 👈 prevent auto-RTL flipping
                      minHeight:'20vh'
                    }}
                    dir="ltr"
                  />

                    <div className="flex gap-2 p-2 -mt-2"
                        style={{ border: "1px solid #00000020", borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                    >
                        <button
                            className={`text-[15px] font-[ ${selectedFormats.bold ? "bg-gray-200" : ""} rounded transition-colors`}
                            style={selectedFormats.bold ? { background: "#e5e7eb" } : {}}
                            onClick={() => handleFormatClick("bold")}
                            type="button"
                        >
                            <Image src={"/otherAssets/boldIcon.png"} alt='*'
                                height={28} width={28}
                            />
                        </button>
                        <button
                            className={`text-[15px] font-[ ${selectedFormats.italic ? "bg-gray-200" : ""} rounded transition-colors`}
                            style={selectedFormats.italic ? { background: "#e5e7eb" } : {}}
                            onClick={() => handleFormatClick("italic")}
                            type="button"
                        >
                            <Image src={"/otherAssets/italicIcon.png"} alt='*'
                                height={28} width={28}
                            />
                        </button>
                        <button
                            className={`text-[15px] font-[ ${selectedFormats.underline ? "bg-gray-200" : ""} rounded transition-colors`}
                            style={selectedFormats.underline ? { background: "#e5e7eb" } : {}}
                            onClick={() => handleFormatClick("underline")}
                            type="button"
                        >
                            <Image src={"/otherAssets/underLineIcon.png"} alt='*'
                                height={28} width={28}
                            />
                        </button>

                        <label className="cursor-pointer">
                            <Image src={"/otherAssets/attechmentIcon.png"} alt='*'
                                height={28} width={28}
                            />
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>




                    <div className="mt-3">
                        <label className="flex flex-row items-center gap-2 cursor-pointer">
                            <div className="text-[15px] font-[500] text-purple underline">
                                Add Attachments
                            </div>
                            <Image
                                src={"/otherAssets/blueAttechmentIcon.png"}
                                alt="*"
                                height={24}
                                width={24}
                            />
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                        {attachments?.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex flex-row gap-4 items-center p-2 text-sm"
                            >
                                <span>{file.name}</span>
                                <button
                                    onClick={() => removeAttachment(idx)}
                                >
                                    <Image src={'/assets/cross.png'}
                                        height={14} width={14} alt='*'
                                    />
                                </button>
                            </div>
                        ))}
                    </div>


                    <div className='w-full flex flex-row items-center w-full gap-6 mt-4'>
                        <button className='w-1/2 h-[53px] border rounded-lg text-[15px] font-[700]'
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        {
                            saveEmailLoader ? (
                                <CircularProgress size={30} />
                            ) : (
                                <button className={`w-1/2 h-[53px] text-[15px] font-[700] 
                                    ${isSaveDisabled ? 'bg-black/50' : 'bg-purple'} rounded-lg text-white`}
                                    disabled={isSaveDisabled}
                                    onClick={saveEmail}
                                >
                                    {isEditing ? 'Update' : 'Save Email'}
                                </button>
                            )
                        }
                    </div>

                </div>
            </Box>
        </Modal >
    )
}


const styles = {

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

export default EmailTempletePopup