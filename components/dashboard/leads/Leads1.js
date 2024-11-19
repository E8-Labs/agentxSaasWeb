import Apis from '@/components/apis/Apis';
import FileUpload from '@/components/test/FileUpload';
import ReadFile from '@/components/test/ReadFile';
import { Alert, Box, CircularProgress, Fade, Modal, Popover, Snackbar, Typography } from '@mui/material';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Userleads from './Userleads';

const Leads1 = () => {

    const [showAddLeadModal, setShowAddLeadModal] = useState(false);
    const [SelectedFile, setSelectedFile] = useState(null);
    const [ShowUploadLeadModal, setShowUploadLeadModal] = useState(false);
    const [columnAnchorEl, setcolumnAnchorEl] = React.useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [UpdateHeader, setUpdateHeader] = useState(null);
    const [updateColumnValue, setUpdateColumnValue] = useState("");
    const [showPopUp, setShowPopUp] = useState(false);
    const [sheetName, setSheetName] = useState("");
    const [Loader, setLoader] = useState(false);
    const [userLeads, setUserLeads] = useState(null);
    const [SuccessSnack, setSuccessSnack] = useState(null);
    const [initialLoader, setInitialLoader] = useState(false);
    //File handling
    const [processedData, setProcessedData] = useState([]);
    const [columnMappingsList, setColumnMappingsList] = useState([]);

    const defaultColumns = {
        firstName: ["first name", "firstname"],
        lastName: ["last name", "lastname"],
        email: ["email", "email address", "mail"],
        phone: ["cell no", "phone no", "phone", "phone number", "contact number"],
        address: ["address", "location", "address line"],
    };

    const open = Boolean(columnAnchorEl);
    const id = open ? 'simple-popover' : undefined;


    useEffect(() => {
        getUserLeads()
    }, []);

    const getUserLeads = async () => {
        try {
            setInitialLoader(true);
        } catch (error) {
            console.error("Error occured in getVoices api is:", error);
        } finally {
            setInitialLoader(false);
        }
    }

    //code for csv file drag and drop
    const onDrop = useCallback((acceptedFiles) => {
        console.log(acceptedFiles);
        setSelectedFile(acceptedFiles);
        // Handle the uploaded files
        setSheetName(acceptedFiles[0].name);
        acceptedFiles.forEach((file) => {
            handleFileUpload(file)
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls", ".xlsx"],
        },
    });


    const handleColumnPopoverClick = (event) => {
        setcolumnAnchorEl(event.currentTarget);
    };

    const handleColumnPopoverClose = () => {
        setcolumnAnchorEl(null);
        setSelectedItem(null);
        setShowPopUp(false)
    };


    //File reading logic


    const matchColumn = (columnName, mappings) => {
        const lowerCaseName = columnName.toLowerCase();
        for (const key in mappings) {
            if (mappings[key].some((alias) => lowerCaseName.includes(alias))) {
                return key;
            }
        }
        return null;
    };

    const toSnakeCase = (str) =>
        str
            .toLowerCase()
            .replace(/[\s\-]/g, "_")
            .replace(/[^\w]/g, "");

    const handleFileUpload = (file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryStr = event.target.result;

            // Use XLSX to parse the file
            const workbook = XLSX.read(binaryStr, { type: "binary" });

            // Extract data from the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header included
            // setSheetName(sheetName);

            if (data.length > 1) {
                const headers = data[0]; // First row as headers
                const rows = data.slice(1); // Data without headers

                const columnMappings = {};
                const extraColumns = [];
                const mappingsList = [];

                // Map headers to default columns or extra columns
                headers.forEach((header) => {
                    const matchedColumn = matchColumn(header, defaultColumns);

                    if (matchedColumn) {
                        columnMappings[matchedColumn] = header;
                        mappingsList.push({
                            columnNameInSheet: header,
                            columnNameTransformed: matchedColumn,
                        });
                    } else {
                        const transformedName = toSnakeCase(header);
                        extraColumns.push({
                            columnNameInSheet: header,
                            columnNameTransformed: transformedName,
                        });
                        mappingsList.push({
                            columnNameInSheet: header,
                            columnNameTransformed: transformedName,
                        });
                    }
                });

                columnMappings["extraColumns"] = extraColumns;

                // Transform data rows based on column mappings
                const transformedData = rows.map((row) => {
                    const transformedRow = {};

                    headers.forEach((header, index) => {
                        const matchedColumn = matchColumn(header, defaultColumns);
                        if (matchedColumn) {
                            transformedRow[matchedColumn] = row[index] || null;
                        } else {
                            const transformedName = toSnakeCase(header);
                            if (!transformedRow["extraColumns"]) {
                                transformedRow["extraColumns"] = {};
                            }
                            transformedRow["extraColumns"][transformedName] = row[index] || null;
                        }
                    });

                    return transformedRow;
                });

                // Update state
                setProcessedData(transformedData);
                setColumnMappingsList(mappingsList);

                console.log("Transformed Data:", transformedData);
                console.log("Column Mappings List:", mappingsList);

                // Example API Call
                // sendLeadsToAPI(transformedData, mappingsList);
            }
        };

        reader.readAsBinaryString(file);
    };
    //csv file code ends

    //restrict user to only edit name of csv file
    const handleSheetNameChange = (e) => {
        const baseName = sheetName.split(".")[0]; // Get the current base name
        const extension = sheetName.split(".").slice(1).join("."); // Keep the extension
        const newBaseName = e.target.value; // Get the user's input for the base name

        // Ensure we keep the extension constant
        setSheetName(`${newBaseName}.${extension}`);
    };


    //code to call api
    const handleAddLead = async () => {
        try {
            setLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }
            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                sheetName: sheetName,
                leads: processedData,
                columnMappings: columnMappingsList
            }

            const ApiPath = Apis.createLead;
            console.log("Api path is :", ApiPath);

            console.log("Apidata sending in Addlead api is :", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of ad lead api is :", response.data.data);
                if (response.data.status === true) {
                    setShowUploadLeadModal(false);
                    localStorage.setItem("userLeads", JSON.stringify(response.data.data));
                    setUserLeads(response.data.data);
                    setSuccessSnack(response.data.message);
                }
            }

        } catch (error) {
            console.error("Error occured in add lead api is :", error);
        } finally {
            setLoader(false);
        }
    }

    const styles = {
        headingStyle: {
            fontSize: 17, fontWeight: "700"
        },
        subHeadingStyle: {
            fontSize: 15, fontWeight: "700"
        },
        paragraph: {
            fontSize: 15, fontWeight: "500"
        },
        modalsStyle: {
            height: "auto",
            bgcolor: "transparent",
            // p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }



    return (
        <div className='w-full'>
            {
                initialLoader ?
                    <div className='w-full flex flex-row justify-center'>
                        <CircularProgress size={35} />
                    </div> :
                    <div className='w-full'>
                        {
                            !userLeads ?
                                <div className='h-screen w-full'>
                                    <Userleads />
                                </div> :
                                <div>
                                    <Image src={"/assets/placeholder.png"} height={145} width={710} alt='*' />
                                    <div className='mt-12 ms-8 text-center' style={{ fontSize: 30, fontWeight: "700", }}>
                                        {`Looks like you don't have any leads yet`}
                                    </div>
                                    <div className='w-full flex flex-row justify-center mt-10'>
                                        <button
                                            className='flex flex-row gap-2 bg-purple text-white h-[50px] w-[177px] rounded-lg items-center justify-center'
                                            onClick={() => { setShowAddLeadModal(true) }}
                                        >
                                            <Image src={"/assets/addManIcon.png"} height={20} width={20} alt='*' />
                                            <span style={styles.headingStyle}>
                                                Add Leads
                                            </span>
                                        </button>
                                    </div>

                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "70px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                        }}
                                    >
                                        <div className='flex flex-row items-center gap-2'>
                                            <Image src={"/assets/youtubeplay.png"} height={93} width={127} alt='*' />
                                            <div>
                                                <div style={styles.subHeadingStyle}>
                                                    Learn how to add leads to your pipeline
                                                </div>
                                                <div style={styles.subHeadingStyle}>
                                                    2 mins
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal to add lead */}
                                    <Modal
                                        open={showAddLeadModal}
                                        // onClose={() => setShowAddLeadModal(false)}
                                        closeAfterTransition
                                        BackdropProps={{
                                            timeout: 1000,
                                            sx: {
                                                backgroundColor: "#00000020",
                                                // backdropFilter: "blur(20px)",
                                            },
                                        }}
                                    >
                                        <Box className="lg:w-6/12 sm:w-9/12 w-10/12" sx={styles.modalsStyle}>
                                            <div className="flex flex-row justify-center w-full">
                                                <div
                                                    className="w-full"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        padding: 20,
                                                        borderRadius: "13px",
                                                    }}
                                                >
                                                    <div className='flex flex-row justify-end'>
                                                        <button onClick={() => { setShowAddLeadModal(false) }}>
                                                            <Image src={"/assets/cross.png"} height={14} width={14} alt='*' />
                                                        </button>
                                                    </div>
                                                    <div className='mt-2' style={styles.subHeadingStyle}>
                                                        Import Leads
                                                    </div>

                                                    {/* CSV File drag and drop logic */}
                                                    {/* <ReadFile /> */}
                                                    {/* {
                                        SelectedFile ?
                                            <div>
                                                File here:
                                            </div> :
                                            <div
                                                {...getRootProps()}
                                                style={{
                                                    border: "2px dashed #ddd",
                                                    padding: "20px",
                                                    textAlign: "center",
                                                    borderRadius: "10px",
                                                    cursor: "pointer",
                                                    width: "400px",
                                                    margin: "auto",
                                                    marginTop: "20px"
                                                }}
                                            >
                                                <input {...getInputProps()} />
                                                <div className="w-full flex-row flex justify-center" style={{ marginBottom: "10px" }}>
                                                    <Image
                                                        src="/assets/docIcon.png"
                                                        alt="Upload Icon"
                                                        height={30}
                                                        width={30}
                                                        style={{ marginBottom: "10px" }}
                                                    />
                                                </div>
                                                <p style={{ ...styles.subHeadingStyle, }}>
                                                    Drag & drop your leads
                                                </p>
                                                <p style={{ ...styles.subHeadingStyle, }}>or</p>
                                                <button className='underline outline-none border-none'
                                                    style={{
                                                        ...styles.subHeadingStyle,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Browse your Computer
                                                </button>
                                                <p style={{ fontSize: 12, color: "#888", marginTop: "10px", fontWeight: '500' }}>
                                                    Upload only a CSV or Excel file
                                                </p>
                                            </div>
                                    } */}

                                                    <div className='w-8/12 h-[40vh] flex flex-col justify-center '
                                                        {...getRootProps()}
                                                        style={{
                                                            border: "2px dashed #ddd",
                                                            padding: "20px",
                                                            textAlign: "center",
                                                            borderRadius: "10px",
                                                            cursor: "pointer",
                                                            // width: "430px",
                                                            margin: "auto",
                                                            marginTop: "20px"
                                                        }}
                                                    >
                                                        <input {...getInputProps()} />
                                                        <div className="w-full flex-row flex justify-center" style={{ marginBottom: "15px" }}>
                                                            <Image
                                                                src="/assets/docIcon.png"
                                                                alt="Upload Icon"
                                                                height={30}
                                                                width={30}
                                                            // style={{ marginBottom: "10px" }}
                                                            />
                                                        </div>
                                                        <p style={{ ...styles.subHeadingStyle, }}>
                                                            Drag & drop your leads
                                                        </p>
                                                        <p style={{ ...styles.subHeadingStyle, }}>or</p>
                                                        <button className='underline outline-none border-none'
                                                            style={{
                                                                ...styles.subHeadingStyle,
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            Browse your Computer
                                                        </button>
                                                        <p style={{ fontSize: 12, color: "#888", marginTop: "10px", fontWeight: '500' }}>
                                                            Upload only a CSV or Excel file
                                                        </p>
                                                    </div>

                                                    <div className='mt-8' style={{ height: "50px" }}>
                                                        {
                                                            SelectedFile && (
                                                                <div className='w-full mt-4 flex flex-row justify-center'>
                                                                    <button
                                                                        className='bg-purple text-white flex flex-row items-center justify-center rounded-lg gap-2'
                                                                        style={{ ...styles.subHeadingStyle, height: "50px", width: "170px" }}
                                                                        onClick={() => {
                                                                            setShowUploadLeadModal(true);
                                                                            setShowAddLeadModal(false);
                                                                        }}
                                                                    >
                                                                        <Image src={"/assets/addLeadIcon.png"} height={24} width={24} alt='*' />
                                                                        <span>
                                                                            Add Leads
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            )
                                                        }
                                                    </div>


                                                    {/* Can be use full to add shadow */}
                                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                                </div>
                                            </div>
                                        </Box>
                                    </Modal>

                                    {/* modal to upload lead */}
                                    <Modal
                                        open={ShowUploadLeadModal}
                                        onClose={() => setShowUploadLeadModal(false)}
                                        closeAfterTransition
                                        BackdropProps={{
                                            timeout: 1000,
                                            sx: {
                                                backgroundColor: "#00000020",
                                                // backdropFilter: "blur(20px)",
                                            },
                                        }}
                                    >
                                        <Box className="lg:w-6/12 sm:w-9/12 w-10/12" sx={styles.modalsStyle}>
                                            <div className="flex flex-row justify-center w-full">
                                                <div
                                                    className="w-full"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        padding: 20,
                                                        borderRadius: "13px",
                                                    }}
                                                >
                                                    <div className='flex flex-row justify-end'>
                                                        <button onClick={() => { setShowUploadLeadModal(false) }}>
                                                            <Image src={"/assets/cross.png"} height={14} width={14} alt='*' />
                                                        </button>
                                                    </div>
                                                    <div className='mt-2' style={styles.subHeadingStyle}>
                                                        Leads
                                                    </div>

                                                    <div className='flex flex-row items-center gap-2 mt-2'>
                                                        <span style={styles.subHeadingStyle}>List Name</span> <Image src={"/assets/infoIcon.png"} height={18} width={18} alt='*' />
                                                    </div>

                                                    <div className='border rounded p-2 w-full mt-4' style={styles.subHeadingStyle}>
                                                        <input
                                                            className="outline-none border-roundedp-2 w-full"
                                                            value={sheetName.split(".")[0]} // Only show the base name in the input
                                                            onChange={handleSheetNameChange}
                                                            placeholder="Enter sheet name"
                                                        />
                                                    </div>

                                                    <div className='mt-4' style={styles.paragraph}>
                                                        Match columns in your file to column fields
                                                    </div>

                                                    <div className='flex flex-row items-center mt-4' style={{ ...styles.paragraph, color: "#00000070" }}>
                                                        <div className='w-2/12'>Matched</div>
                                                        <div className='w-4/12'>Column Header from File</div>
                                                        <div className='w-3/12'>Preview Info</div>
                                                        <div className='w-3/12'>Column Fields</div>
                                                    </div>

                                                    <div className='max-h-[40vh] overflow-auto'>
                                                        {
                                                            columnMappingsList.map((item, index) => {
                                                                const matchingValue = processedData.find((data) =>
                                                                    Object.keys(data).includes(item.columnNameTransformed)
                                                                );
                                                                return (
                                                                    <div key={index} className='flex flex-row items-center mt-4' style={{ ...styles.paragraph }}>
                                                                        <div className='w-2/12'>
                                                                            {
                                                                                matchingValue ?
                                                                                    <Image className='ms-4' src={"/assets/checkDone.png"} alt='*' height={24} width={24} /> :
                                                                                    <Image className='ms-4' src={"/assets/warning.png"} alt='*' height={24} width={24} />
                                                                            }
                                                                            {/* <Image className='ms-4' src={"/assets/checkDone.png"} alt='*' height={24} width={24} /> */}
                                                                        </div>
                                                                        <div className='w-4/12'>
                                                                            {item.columnNameInSheet}
                                                                        </div>
                                                                        <div className='w-3/12'>
                                                                            {matchingValue
                                                                                ? matchingValue[item.columnNameTransformed]
                                                                                : "N/A"}
                                                                        </div>
                                                                        <div className='w-3/12 border rounded p-2'>
                                                                            <button className='flex flex-row items-center justify-between w-full' onClick={(event) => {
                                                                                if (columnAnchorEl) {
                                                                                    handleColumnPopoverClose();
                                                                                } else {
                                                                                    if (index > 4) {
                                                                                        setSelectedItem(index);
                                                                                        console.log("Selected index is", index)
                                                                                        console.log('Item selected is :', item)
                                                                                        setUpdateColumnValue(item.columnNameTransformed)
                                                                                        handleColumnPopoverClick(event);
                                                                                        setUpdateHeader(item);
                                                                                    }
                                                                                }
                                                                            }}>
                                                                                <p>{item.columnNameTransformed}</p>
                                                                                {
                                                                                    selectedItem === index ?
                                                                                        <CaretUp size={20} weight='bold' /> :
                                                                                        <CaretDown size={20} weight='bold' />
                                                                                }
                                                                            </button>
                                                                            <Popover
                                                                                id={id}
                                                                                open={open}
                                                                                anchorEl={columnAnchorEl}
                                                                                onClose={handleColumnPopoverClose}
                                                                                anchorOrigin={{
                                                                                    vertical: 'bottom',
                                                                                    horizontal: 'center',
                                                                                }}
                                                                                transformOrigin={{
                                                                                    vertical: 'top',
                                                                                    horizontal: 'center', // Ensures the Popover's top right corner aligns with the anchor point
                                                                                }}
                                                                                PaperProps={{
                                                                                    elevation: 0, // This will remove the shadow
                                                                                    style: {
                                                                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                                                                                    },
                                                                                }}
                                                                            >
                                                                                <div className='w-[170px] p-2' style={styles.paragraph}>
                                                                                    <div>Option 1</div>
                                                                                    <div>Option 2</div>
                                                                                    <button className='underline text-purple' onClick={() => {
                                                                                        setShowPopUp(true);
                                                                                    }}>Add New column</button>
                                                                                </div>
                                                                            </Popover>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>

                                                    <div className='mt-4 flex flex-row justify-center'>
                                                        {
                                                            Loader ?
                                                                <CircularProgress size={27} /> :
                                                                <button className='bg-purple text-white rounded-lg h-[50px] w-4/12' onClick={handleAddLead}>
                                                                    Continue
                                                                </button>
                                                        }
                                                    </div>

                                                    {/* <div className="max-h-[40vh] overflow-auto">
                                        {columnMappingsList.map((item, index) => {
                                            // Find the first matching object in `processedData` based on the transformed column name
                                            const matchingValue = processedData.find((data) =>
                                                Object.keys(data).includes(item.columnNameTransformed)
                                            );
        
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-row items-center mt-4"
                                                    style={{ ...styles.paragraph }}
                                                >
                                                    <div className="w-2/12">
                                                        <Image
                                                            className="ms-4"
                                                            src={
                                                                matchingValue ? "/assets/checkDone.png" : "/assets/warning.png"
                                                            }
                                                            alt={matchingValue ? "Check" : "Warning"}
                                                            height={24}
                                                            width={24}
                                                        />
                                                    </div>
                                                    <div className="w-4/12">
                                                        {item.columnNameInSheet}
                                                    </div>
                                                    <div className="w-3/12">
                                                        {matchingValue
                                                            ? matchingValue[item.columnNameTransformed]
                                                            : "Not Found"}
                                                    </div>
                                                    <div className="w-3/12 border rounded p-2">
                                                        <button
                                                            className="flex flex-row items-center justify-between w-full"
                                                            onClick={(event) => {
                                                                if (columnAnchorEl) {
                                                                    handleColumnPopoverClose();
                                                                } else {
                                                                    handleColumnPopoverClick(event);
                                                                }
                                                            }}
                                                        >
                                                            <p>{item.columnNameTransformed}</p>
                                                            {columnAnchorEl ? (
                                                                <CaretUp size={20} weight="bold" />
                                                            ) : (
                                                                <CaretDown size={20} weight="bold" />
                                                            )}
                                                        </button>
                                                        <Popover
                                                            id={id}
                                                            open={open}
                                                            anchorEl={columnAnchorEl}
                                                            onClose={handleColumnPopoverClose}
                                                            anchorOrigin={{
                                                                vertical: "bottom",
                                                                horizontal: "center",
                                                            }}
                                                            transformOrigin={{
                                                                vertical: "top",
                                                                horizontal: "center",
                                                            }}
                                                            PaperProps={{
                                                                elevation: 0,
                                                                style: {
                                                                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.08)",
                                                                },
                                                            }}
                                                        >
                                                            <div className="w-[170px] p-2">Hey there</div>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div> */}



                                                    {/* Can be use full to add shadow */}
                                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                                </div>
                                            </div>
                                        </Box>
                                    </Modal>

                                    {/* Modal to update header */}
                                    <Modal
                                        open={showPopUp}
                                        onClose={() => setShowPopUp(false)}
                                        closeAfterTransition
                                        BackdropProps={{
                                            timeout: 1000,
                                            sx: {
                                                backgroundColor: "#00000020",
                                                backdropFilter: "blur(5px)",
                                            },
                                        }}
                                    >
                                        <Box className="lg:w-6/12 sm:w-9/12 w-10/12" sx={styles.modalsStyle}>
                                            <div className="flex flex-row justify-center w-full">
                                                <div
                                                    className="w-full"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        padding: 20,
                                                        borderRadius: "13px",
                                                    }}
                                                >
                                                    <div className='flex flex-row justify-end'>
                                                        <button onClick={() => { setShowPopUp(false) }}>
                                                            <Image src={"/assets/cross.png"} height={14} width={14} alt='*' />
                                                        </button>
                                                    </div>
                                                    <div className='mt-2' style={styles.subHeadingStyle}>
                                                        Update Column
                                                    </div>

                                                    <input
                                                        className='border outline-none rounded p-2 mt-2 w-full'
                                                        value={updateColumnValue}
                                                        // onChange={(e) => { setUpdateColumnValue(e.target.value) }}
                                                        onChange={(e) => {
                                                            const regex = /^[a-zA-Z_]*$/; // Allow only alphabets
                                                            if (regex.test(e.target.value)) {
                                                                setUpdateColumnValue(e.target.value);
                                                            }
                                                        }}
                                                    />

                                                    <button className='w-full h-[50px] rounded-xl bg-purple text-white mt-8' style={styles.subHeadingStyle}
                                                        onClick={() => {
                                                            console.log("Change column name here", updateColumnValue)
                                                            console.log("Old column value ", UpdateHeader.columnNameTransformed)
                                                            let pd = processedData
                                                            let mappingList = columnMappingsList
                                                            for (let i = 0; i < pd.length; i++) {
                                                                let d = pd[i]
                                                                let value = d.extraColumns[UpdateHeader.columnNameTransformed]
                                                                delete d.extraColumns[UpdateHeader.columnNameTransformed]
                                                                // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
                                                                d.extraColumns[updateColumnValue] = value;
                                                                pd[i] = d;
                                                            }


                                                            for (let i = 0; i < mappingList.length; i++) {
                                                                let map = mappingList[i];
                                                                if (map.columnNameTransformed == UpdateHeader.columnNameTransformed) {
                                                                    // update the column
                                                                    map.columnNameTransformed = updateColumnValue;
                                                                }
                                                                mappingList[i] = map;
                                                            }
                                                            console.log(`Processed data changed`, pd)
                                                            setProcessedData(pd)
                                                            setColumnMappingsList(mappingList)
                                                            console.log("Mapping list changed", mappingList)
                                                            if (pd && mappingList) {
                                                                setShowPopUp(false);
                                                                setcolumnAnchorEl(null);
                                                                setSelectedItem(null);
                                                            }

                                                        }}
                                                    >
                                                        Save & Close
                                                    </button>


                                                    {/* Can be use full to add shadow */}
                                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                                </div>
                                            </div>
                                        </Box>
                                    </Modal>



                                    <div>
                                        <Snackbar
                                            open={SuccessSnack}
                                            autoHideDuration={3000}
                                            onClose={() => {
                                                setSuccessSnack(null);
                                            }}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center'
                                            }}
                                            TransitionComponent={Fade}
                                            TransitionProps={{
                                                direction: 'center'
                                            }}
                                        >
                                            <Alert
                                                onClose={() => {
                                                    setSuccessSnack(null);
                                                }} severity="success"
                                                // className='bg-purple rounded-lg text-white'
                                                sx={{ width: 'auto', fontWeight: '700', fontFamily: 'inter', fontSize: '22' }}
                                            >
                                                {SuccessSnack}
                                            </Alert>
                                        </Snackbar>
                                    </div>

                                </div>
                        }
                    </div>
            }
        </div>
    )
}

export default Leads1