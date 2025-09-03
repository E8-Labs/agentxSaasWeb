import ChipInput from '@/constants/ChipsInput';
import { Button, FormControl, Menu, MenuItem, Modal, Select, Box, CircularProgress } from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react'
import { createTemplete, deleteTemplete, getGmailAccounts, getTempleteDetails, getTempletes, updateTemplete } from './TempleteServices';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';
import { PromptTagInput } from './tagInputs/PromptTagInput';
import { getUniquesColumn } from '../globalExtras/GetUniqueColumns';
import { Plus } from 'lucide-react';
import { GoogleOAuth } from '../auth/socialllogins/AuthServices';
import { GreetingTagInput } from './tagInputs/GreetingTagInput';
import { PersistanceKeys } from '@/constants/Constants';

function EmailTempletePopup({
    open,
    onClose,
    // templetes,
    // setTempletes,
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
    const [subjectChanged, setSubjectChanged] = useState(false)
    const [bodyChanged, setBodyChanged] = useState(false)
    const [ccEmailsChanged, setccEmailsChanged] = useState(false)
    const [attachmentsChanged, setAttachmentsChanged] = useState(false);
    const [accountChanged, setAccountChanged] = useState(false);
    const [tempNameChanged,setTempNameChanged] = useState(false)
    


    const [selectedTemp, setSelectedTemp] = useState(null)
    const [saveEmailLoader, setSaveEmailLoader] = useState(false)

    const [detailsLoader, setDetailsLoader] = useState(null)

    const [delTempLoader, setDelTempLoader] = useState(null)
    const [templetes, setTempletes] = useState([])
    const [loginLoader, setLoginLoader] = useState(false)

    const [scrollOffset, setScrollOffset] = useState({
        scrollTop: 0,
        scrollLeft: 0,
      });

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
    const [uniqueColumns, setUniqueColumns] = useState([])

    const [shouldUpdate,setShouldUpdate] = useState(false)

    useEffect(() => {
        getColumns()
        templatesForSelectedType()
    }, [open])

    const templatesForSelectedType = async () => {
        let temp = await getTempletes("email")
        setTempletes(temp)
    }

    const getColumns = async () => {
        let res = await getUniquesColumn()
        // console.log('res', res)
        if (res) {
            setUniqueColumns(res)
        }
    }

    useEffect(() => {
        if (bodyRef.current && body) {
            bodyRef.current.innerHTML = body;
        }
    }, [open, body]);

    // Auto-fill form when editing
    useEffect(() => {
        console.log("trying to edit", isEditing, editingRow)
        if (isEditing && editingRow && open) {
            // Load template details if templateId existstest

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
        setTempName(t.templateName || "");
        setSubject(t.subject || "");
        setBody(t.content || "");
        setccEmails(t.ccEmails || []);
        setAttachments(t.attachments || []);

        
        // if (!isEditing && addRow) {
        //     addRow({
        //         templateId: t.id,
        //         emailAccountId: selectedGoogleAccount?.id,
        //         communicationType: 'email',
        //     });
        // } else {
        //     onUpdateRow(editingRow.id, {
        //         templateId: t.id,
        //         emailAccountId: selectedGoogleAccount?.id,
        //         communicationType: 'email',
        //     })
        // }
        // onClose();
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
        // const pdfs = files.filter((f) => f.type === "application/pdf");
        setAttachments((prev) => [...prev, ...files]);
        setAttachmentsChanged(true)
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
        setAttachmentsChanged(true)
    };


    useEffect(() => {
        if(selectedTemp){
            setShouldUpdate(true)
        }
    },[tempNameChanged,subjectChanged,bodyChanged,ccEmailsChanged,attachmentsChanged,accountChanged])



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

        // console.log('attechments', attachments)
        let response = null

        let IsdefaultCadence = localStorage.getItem(PersistanceKeys.isDefaultCadenceEditing)

        // if(IsdefaultCadence){
            console.log('IsdefaultCadence', IsdefaultCadence)
        // }
        // return
        if (isEditing &&!IsdefaultCadence) {
            let id
            if(selectedTemp){
               id= selectedTemp.id
            }else{
                id=editingRow.templateId
            }

            console.log('id', selectedTemp)
            response = await updateTemplete(data,id )
        } else {
            response = await createTemplete(data)
        }

        if (response.data.status === true) {

            const createdTemplate = response?.data?.data
            if (createdTemplate) {
                setTempletes((prev) => (Array.isArray(prev) ? [...prev, createdTemplate] : [createdTemplate]))
            }

            if ((isEditing && onUpdateRow && editingRow)) {
                // Update existing row with new template data
                onUpdateRow(editingRow.id, {
                    templateId: createdTemplate.id,
                    templateName: tempName,
                    subject: subject,
                    content: body,
                    ccEmails: ccEmails,
                    attachments: attachments,
                    communicationType: 'email',
                });
            } else {
                // Add new row
               
                    if (addRow) {
                        addRow({
                            templateId: createdTemplate.id,
                            emailAccountId: selectedGoogleAccount?.id,
                            communicationType: 'email',
                        });
                    }
               
            }

          
                onClose();
           
        } else {
            setShowSnackBar({
                message: response.data.message,
                type: SnackbarTypes.Error,
            })
        }
        setSaveEmailLoader(false)
    }

    const getAccounts = async () => {
        setGoogleAccountLoader(true)
        let acc = await getGmailAccounts()
        setGoogleAccounts(acc)
        setGoogleAccountLoader(false)

    }


    const addNewAccount = async () => {
        let response = await GoogleOAuth({
            setLoginLoader,
            setShowSnackBar
        })

        if (response) {
            console.log('response', response);

            setGoogleAccounts((prev) => [...prev, response]);

            setSelectedGoogleAccount(response);

            setShowChangeManu(null);
        }
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
                    style={{ scrollbarWidth: 'none' }}
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
                            {(isEditing || selectedTemp) ? 'Edit Email' : 'Email'}
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
                                                <CircularProgress key={item.id} size={20} />
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
                                    <div className="w-[10vw] ml-2">
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
                                                setAccountChanged(true)
                                                setSelectedGoogleAccount(a)
                                                setShowChangeManu(null)
                                            }}
                                        >
                                            <div className='text-[15] font-[500]'>
                                                {a.email}
                                            </div>
                                        </MenuItem>

                                    ))
                            }

                            <MenuItem
                                onClick={addNewAccount}
                                // key={a.id}
                                sx={{
                                    '&:hover .action-icon': {
                                        display: 'none',
                                    },
                                    '&:hover .action-icon-hover': {
                                        display: 'block',
                                    },
                                }}>
                                <div className='flex flex-row gap-2 text-purple'>
                                    <Plus weight="bold" size={22} className='text-purple' />
                                    Change Account
                                </div>
                            </MenuItem>
                        </Menu>

                    </div>

                    <div className="h-12 mt-2 rounded-[5px] px-[10px] py-7 border-2 rounded-lg border-[#00000010] flex flex-row items-center">
                        <div className="text-[#00000070] text-[15px] font-normal">CC:</div>
                        <ChipInput ccEmails={ccEmails} setccEmails={(text)=>{
                            setccEmails(text)
                            setccEmailsChanged(true)
                        }} />
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
                        onChange={(event) => { setTempName(event.target.value)
                            setTempNameChanged(true)
                        }}
                    />


                    <div className=' mt-4'>
                   <GreetingTagInput
                    // promptTag={subject}
                    // isSubject={true}
                    // placeholder="Subject"
                    // // kycsList={kycsData}
                    // uniqueColumns={uniqueColumns}
                    // tagValue={setSubject}
                    // showSaveChangesBtn={subject}
                    // // from={"Template"}
                    // saveUpdates={async () => {

                    // }}
                    // limit={343}
                    greetTag={subject}
                    // kycsList={kycsData}
                    uniqueColumns={uniqueColumns}
                    tagValue={(text) => {
                        setSubject(text);
                        setSubjectChanged(true)
                    }}
                    scrollOffset={scrollOffset}
                    placeholder="Subject"
                    limit={343}
                />
                    </div>

                    <div className=' mt-4'>
                        <PromptTagInput
                            promptTag={body}
                            // kycsList={kycsData}
                            uniqueColumns={uniqueColumns}
                            tagValue={(t)=>{
                                setBody(t);
                                setBodyChanged(true)
                            }}
                            showSaveChangesBtn={body}
                            // from={"Template"}
                            saveUpdates={async () => {

                            }}
                            limit={343}
                        />
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
                                accept="
                                image/*,
                                application/pdf,
                                application/msword,
                                application/vnd.openxmlformats-officedocument.wordprocessingml.document
                              "
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                        {attachments?.map((file, idx) => (
                            <div key={idx} className="flex flex-row gap-4 items-center p-2 text-sm">

                                <span>{file.name || file.originalName}</span>
                                <button onClick={() => removeAttachment(idx)}>
                                    <Image src={'/assets/cross.png'} height={14} width={14} alt="remove" />
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