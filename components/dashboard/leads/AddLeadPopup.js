import React, { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import * as XLSX from "xlsx";
import { styles } from '@/components/globalsstyles/Stles';
import {
    LeadDefaultColumns,
    LeadDefaultColumnsArray,
} from "@/constants/DefaultLeadColumns";
import { useDropzone } from "react-dropzone";
import UploadLeadModal from './UploadLeadModal';


const AddLeadPopup = ({
    showAddLeadModal,
    setShowAddLeadModal,
    setSelectedfileLoader,
    setSheetName,
    setProcessedData,
    setNewColumnsObtained,
    setShowUploadLeadModal
}) => {

    const [SelectedFile, setSelectedFile] = useState(null);
    // const [selectedfileLoader, setSelectedfileLoader] = useState(false);
    // const [sheetName, setSheetName] = useState("");
    // const [processedData, setProcessedData] = useState([]);
    // let [NewColumnsObtained, setNewColumnsObtained] = useState([]);
    //This will have the default columns only
    const [defaultColumns, setDefaultColumns] = useState(LeadDefaultColumns);
    const [defaultColumnsArray, setDefaultColumnsArray] = useState(
        LeadDefaultColumnsArray
    );
    // const [ShowUploadLeadModal, setShowUploadLeadModal] = useState(false);


    useEffect(() => {
        try {
            setSelectedfileLoader(true);
            if (SelectedFile) {
                const timer = setTimeout(() => {
                    setShowUploadLeadModal(true);
                    setShowAddLeadModal(false);
                    setSelectedFile(null);
                }, 1000);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            // console.error("Error occured in selecting file is :", error);
        } finally {
            setSelectedfileLoader(false);
        }
    }, [SelectedFile]);

    //code for csv file drag and drop
    const onDrop = useCallback((acceptedFiles) => {
        ////////console.log;
        setSelectedFile(acceptedFiles);
        // Handle the uploaded files
        setSheetName(acceptedFiles[0].name.split(".")[0]);
        acceptedFiles.forEach((file) => {
            handleFileUpload(file);
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls", ".xlsx"],
            "text/tab-separated-values": [".tsv"],
        },
    });


    //file upload code
    const handleFileUpload = useCallback(
        (file) => {
            const reader = new FileReader();
            const isCSV = file.name.toLowerCase().endsWith(".csv");
            reader.onload = (event) => {
                const binaryStr = event.target.result;
                // const workbook = XLSX.read(binaryStr, { type: "binary" });

                const workbook = XLSX.read(binaryStr, {
                    type: "binary",
                    cellDates: false,
                    cellText: true, // important
                    raw: true, // VERY important for CSVs
                });

                // Extract data from the first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                // const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header included
                const data = XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    raw: isCSV, // This forces Excel dates to be converted to readable format
                });
                if (data.length > 1) {

                    const headers = data[0]; // First row as headers
                    const rows = data.slice(1); // Data without headers

                    const usedKeys = new Set(); // Keep track of already matched default columns

                    let mappedColumns = headers.map((header) => {
                        // Find the first unused matching column
                        let matchedColumnKey = Object.keys(LeadDefaultColumns).find(
                            (key) => {
                                return (
                                    !usedKeys.has(key) &&
                                    LeadDefaultColumns[key].mappings.includes(
                                        header.toLowerCase()
                                    )
                                );
                            }
                        );

                        if (matchedColumnKey) {
                            usedKeys.add(matchedColumnKey); // Mark as used
                        }

                        console.log(
                            `Matched column "${header.toLowerCase()}" with "${matchedColumnKey}"`
                        );

                        return {
                            ColumnNameInSheet: header, // Original header from the file
                            matchedColumn: matchedColumnKey
                                ? { ...LeadDefaultColumns[matchedColumnKey] }
                                : null, // Default column if matched
                            UserFacingName: null, // Can be updated manually by user
                        };
                    });

                    // Transform rows based on the new column mapping
                    const transformedData = rows.map((row) => {
                        let transformedRow = {};
                        // //console.log;

                        mappedColumns.forEach((col, index) => {
                            transformedRow[col.ColumnNameInSheet] = row[index] || null;
                        });
                        //console.log;

                        return transformedRow;
                    });

                    // Update state
                    setProcessedData(transformedData);
                    setNewColumnsObtained(mappedColumns); // Store the column mappings
                }
            };

            reader.readAsBinaryString(file);
        },
        [LeadDefaultColumns]
    );

    return (
        <div>
            <Modal
                open={showAddLeadModal}
                // onClose={() => setShowAddLeadModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="lg:w-6/12 sm:w-9/12 w-10/12"
                    sx={{
                        height: "auto",
                        bgcolor: "transparent",
                        // p: 2,
                        mx: "auto",
                        my: "50vh",
                        transform: "translateY(-50%)",
                        borderRadius: 2,
                        border: "none",
                        outline: "none",
                    }}
                >
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                                // height: window.innerHeight * 0.6
                            }}
                        >
                            <div className="flex flex-row justify-end">
                                <button
                                    onClick={() => {
                                        setShowAddLeadModal(false);
                                        setSelectedFile(null);
                                    }}
                                >
                                    <Image
                                        src={"/assets/cross.png"}
                                        height={14}
                                        width={14}
                                        alt="*"
                                    />
                                </button>
                            </div>
                            <div className="mt-2" style={styles.subHeadingStyle}>
                                Import Leads
                            </div>

                            {/* CSV File drag and drop logic */}

                            <div
                                className="w-10/12 h-[40vh] flex flex-col justify-center "
                                {...getRootProps()}
                                style={{
                                    border: "2px dashed #ddd",
                                    padding: "20px",
                                    textAlign: "center",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    // width: "430px",
                                    margin: "auto",
                                    marginTop: "20px",
                                    backgroundColor: "#F4F0F5",
                                }}
                            >
                                <input {...getInputProps()} />
                                <div
                                    className="w-full flex-row flex justify-center"
                                    style={{ marginBottom: "15px" }}
                                >
                                    <Image
                                        src="/assets/docIcon2.png"
                                        alt="Upload Icon"
                                        height={30}
                                        width={30}
                                    // style={{ marginBottom: "10px" }}
                                    />
                                </div>
                                <p style={{ ...styles.subHeadingStyle }}>
                                    Drop your file here to upload
                                </p>
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#888",
                                        marginTop: "10px",
                                        fontWeight: "500",
                                    }}
                                >
                                    Works with only a CSV, TSV or Excel files
                                </p>
                                <button className="w-full flex flex-row justify-center mt-6 outline-none">
                                    <div className="border border-purple rounded-[10px]">
                                        <div
                                            className="bg-purple text-white flex flex-row items-center justify-center w-fit-content px-4 rounded-[10px]"
                                            style={{
                                                fontWeight: "500",
                                                fontSize: 12,
                                                height: "32px",
                                                margin: "2px",
                                            }}
                                        >
                                            Choose File
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                    <Modal
                        open={SelectedFile}
                        // onClose={() => setShowAddLeadModal(false)}
                        closeAfterTransition
                        BackdropProps={{
                            timeout: 1000,
                            sx: {
                                backgroundColor: "#00000020",
                                // //backdropFilter: "blur(2px)",
                            },
                        }}
                    >
                        <Box
                            className="lg:w-6/12 sm:w-9/12 w-10/12"
                            sx={styles.modalsStyle}
                        >
                            <div className="w-full flex flex-row items-center justify-center">
                                <CircularProgress
                                    className="text-purple"
                                    size={150}
                                    weight=""
                                    thickness={1}
                                />
                            </div>
                        </Box>
                    </Modal>
                </Box>
            </Modal>

        </div>
    )
}

export default AddLeadPopup
