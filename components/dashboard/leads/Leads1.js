import Apis from "@/components/apis/Apis";
import FileUpload from "@/components/test/FileUpload";
import ReadFile from "@/components/test/ReadFile";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Popover,
  Snackbar,
  Typography,
} from "@mui/material";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Userleads from "./Userleads";

const Leads1 = () => {
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [SelectedFile, setSelectedFile] = useState(null);
  const [selectedfileLoader, setSelectedfileLoader] = useState(false);
  const [ShowUploadLeadModal, setShowUploadLeadModal] = useState(false);
  const [columnAnchorEl, setcolumnAnchorEl] = React.useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [UpdateHeader, setUpdateHeader] = useState(null);
  const [updateColumnValue, setUpdateColumnValue] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);
  const [sheetName, setSheetName] = useState("");
  const [Loader, setLoader] = useState(false);
  const [userLeads, setUserLeads] = useState("loading");
  const [SuccessSnack, setSuccessSnack] = useState(null);
  const [initialLoader, setInitialLoader] = useState(false);
  //File handling
  const [processedData, setProcessedData] = useState([]);
  const [columnMappingsList, setColumnMappingsList] = useState([]);
  const [introVideoModal, setIntroVideoModal] = useState(false);

  //my custom logic
  //This variable will contain all columns from the sheet that we will obtain from the sheet or add new
  let [NewColumnsObtained, setNewColumnsObtained] = useState([]);
  //This will have the default columns only
  let defaultColumns = {
    firstName: {
      UserFacingName: "First Name",
      mappings: ["first name", "firstname"],
      ColumnNameInSheet: "",
      dbName: "firstName",
    },
    lastName: {
      UserFacingName: "Last Name",
      mappings: ["last name", "lastname"],
      ColumnNameInSheet: "",
      dbName: "lastName",
    },
    fullName: {
      UserFacingName: "Full Name",
      mappings: ["full name", "name"],
      ColumnNameInSheet: "",
      dbName: "fullName",
    },
    email: {
      UserFacingName: "Email",
      mappings: ["email", "email address", "mail"],
      ColumnNameInSheet: "",
      dbName: "email",
    },
    phone: {
      UserFacingName: "Phone Number",
      mappings: [
        "cell no",
        "phone no",
        "phone",
        "phone number",
        "contact number",
      ],
      ColumnNameInSheet: "",
      dbName: "phone",
    },
    address: {
      UserFacingName: "Address",
      mappings: ["address", "location", "address line"],
      ColumnNameInSheet: "",
      dbName: "address",
    },
  };
  let defaultColumnsArray = [
    {
      UserFacingName: "First Name",
      mappings: ["first name", "firstname"],
      ColumnNameInSheet: "",
      dbName: "firstName",
    },
    {
      UserFacingName: "Last Name",
      mappings: ["last name", "lastname"],
      ColumnNameInSheet: "",
      dbName: "lastName",
    },
    {
      UserFacingName: "Full Name",
      mappings: ["full name", "name"],
      ColumnNameInSheet: "",
      dbName: "fullName",
    },
    {
      UserFacingName: "Email",
      mappings: ["email", "email address", "mail"],
      ColumnNameInSheet: "",
      dbName: "email",
    },
    {
      UserFacingName: "Phone Number",
      mappings: [
        "cell no",
        "phone no",
        "phone",
        "phone number",
        "contact number",
      ],
      ColumnNameInSheet: "",
      dbName: "phone",
    },
    {
      UserFacingName: "Address",
      mappings: ["address", "location", "address line"],
      ColumnNameInSheet: "",
      dbName: "address",
    },
  ];
  const matchColumn = (columnName, mappings, columnsMatched = null) => {
    const lowerCaseName = columnName.toLowerCase();
    // console.log("----------------------------------------\n\n");
    // console.log("Col Matched ", columnsMatched);
    // console.log("Col name ", columnName);

    for (const key in mappings) {
      // console.log("Key ", key);
      if (
        mappings[key].mappings.some((alias) => lowerCaseName.includes(alias))
      ) {
        if (columnsMatched) {
          columnsMatched.forEach((item) => {
            if (item.dbName == key) {
              // console.log("----------------------------------------\n\n");
              return null;
            }
          });
        }
        // console.log("----------------------------------------\n\n");
        return key;
      }
    }
    // console.log("----------------------------------------\n\n");
    return null;
  };

  const open = Boolean(columnAnchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    getUserLeads();
  }, []);

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
      console.error("Error occured in selecting file is :", error);
    } finally {
      setSelectedfileLoader(false);
    }
  }, [SelectedFile]);

  const getUserLeads = async () => {
    try {
      setInitialLoader(true);
    } catch (error) {
      console.error("Error occured in getVoices api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  const handleShowAddLeadModal = (status) => {
    setShowAddLeadModal(status);
  };

  //code for csv file drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    //console.log(acceptedFiles);
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
    },
  });

  const handleColumnPopoverClick = (event) => {
    setcolumnAnchorEl(event.currentTarget);
  };

  const handleColumnPopoverClose = () => {
    setcolumnAnchorEl(null);
    setSelectedItem(null);
    setShowPopUp(false);
  };

  //code to update column
  function ChangeColumnName(UpdatedColumnName) {
    console.log("Updating ", UpdateHeader);
    console.log("New Name ", UpdatedColumnName);

    let defaultColumnsDbNames = [
      "First Name",
      "Last Name",
      "Full Name",
      "Phone Number",
      "Email",
      "Address",
    ];
    let isDefaultColumn = false;

    if (
      defaultColumnsDbNames.includes(UpdateHeader.UserFacingName) ||
      defaultColumnsDbNames.includes(UpdateHeader.dbName)
    ) {
      isDefaultColumn = true;
      console.log("changing default column");
    } else {
      console.log("changing extra column");
    }
    // return;
    //console.log("Change column name here", UpdatedColumnName);
    //console.log("Old column value ", UpdateHeader.columnNameTransformed);
    let pd = processedData;
    let dc = null;
    let keys = Object.keys(defaultColumns);
    // console.log("Keys ", keys);
    // console.log("Updated Col Name ", UpdatedColumnName);
    keys.forEach((key) => {
      let col = defaultColumns[key];
      // console.log(
      // `Matching ${col.UserFacingName} with ${UpdatedColumnName} OR ${col.dbName}`
      // );
      if (
        col.UserFacingName == UpdatedColumnName ||
        col.dbName == UpdatedColumnName
      ) {
        dc = col;
      }
    });
    // if (UpdateHeader.dbName) {
    // let val = defaultColumns[UpdateHeader.dbName];
    // dc = val;
    // }
    for (let i = 0; i < pd.length; i++) {
      let d = pd[i];
      if (isDefaultColumn) {
        // changing the default column
        if (dc) {
          console.log("Updated name is default column");
          let value = d[UpdateHeader.dbName];
          delete d[UpdateHeader.dbName];
          // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
          d[UpdatedColumnName] = value;
          pd[i] = d;
        } else {
          console.log("Updated name is not default column");
          //mmove it to extra column

          let value = d[UpdateHeader.dbName];
          d.extraColumns[UpdatedColumnName] = value;
          delete d[UpdateHeader.dbName];
          // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
          // d[UpdatedColumnName] = value;
          pd[i] = d;
        }
      } else {
        //we are changing the extra column

        // defaultColumns.forEach((col) => {
        // if (col.UserFacingName == UpdatedColumnName) {
        // dc = col;
        // }
        // });
        //The updated name is in default column list
        if (dc) {
          // console.log("Updated name is default column", UpdatedColumnName);
          let value =
            d.extraColumns[
            UpdateHeader.dbName
              ? UpdateHeader.dbName
              : UpdateHeader.ColumnNameInSheet
            ];
          delete d.extraColumns[
            UpdateHeader.dbName
              ? UpdateHeader.dbName
              : UpdateHeader.ColumnNameInSheet
          ];
          // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
          d[dc.dbName] = value;
          pd[i] = d;
        } else {
          // console.log(
          // "the updated name is not in default column list",
          // UpdatedColumnName
          // );
          // the updated name is not in default column list
          let colName = UpdateHeader.dbName
            ? UpdateHeader.dbName
            : UpdateHeader.ColumnNameInSheet;
          let value = d.extraColumns[colName];
          // console.log(`Value for colum ${colName} `, value);
          delete d.extraColumns[colName];
          // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
          d.extraColumns[UpdatedColumnName] = value;

          pd[i] = d;
        }
      }
    }

    let NewCols = NewColumnsObtained;
    NewCols.forEach((item) => {
      console.log("Match ", item);
      console.log("Match ", UpdateHeader);

      if (item.dbName == UpdateHeader.dbName && isDefaultColumn) {
        item.dbName = UpdatedColumnName;
        item.UserFacingName = UpdatedColumnName;
      } else if (item.ColumnNameInSheet == UpdateHeader.ColumnNameInSheet) {
        //changing extra column
        if (dc) {
          console.log("New column name is default Column", dc);
          item.dbName = dc.dbName;
          item.UserFacingName = UpdatedColumnName;
        } else {
          item.dbName = UpdatedColumnName;
          item.UserFacingName = UpdatedColumnName;
        }
      }
    });
    console.log("New Cols", NewCols);
    // for (let i = 0; i < mappingList.length; i++) {
    // let map = mappingList[i];
    // if (map.columnNameTransformed == UpdateHeader.columnNameTransformed) {
    // // update the column
    // map.columnNameTransformed = UpdatedColumnName;
    // }
    // mappingList[i] = map;
    // }
    console.log(`Processed data changed`, pd);
    setProcessedData(pd);
    // setColumnMappingsList(mappingList);
    //console.log("Mapping list changed", mappingList);
    // if (pd && mappingList) {
    setShowPopUp(false);
    setcolumnAnchorEl(null);
    setSelectedItem(null);
    // }
  }

  const validateColumns = () => {
    console.log("New Col Obtained ", NewColumnsObtained);

    const requiredColumns = ["phone"];
    const hasFullName =
      NewColumnsObtained.some((col) => col.dbName === "fullName") ||
      (NewColumnsObtained.some((col) => col.dbName === "firstName") &&
        NewColumnsObtained.some((col) => col.dbName === "lastName"));
    console.log("Has Full Name ", hasFullName);
    const hasPhone = NewColumnsObtained.some((col) => col.dbName === "phone");
    console.log("Has Phone Num", hasPhone);
    return hasPhone && hasFullName;
  };

  //File reading logic

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
        let allColumns = [];
        let matched = [];
        headers.forEach((header) => {
          const matchedColumn = matchColumn(header, defaultColumns, allColumns);
          console.log("Matched Col ", matchedColumn);
          if (matchedColumn) {
            if (!matched.includes(matchedColumn)) {
              let col = defaultColumns[matchedColumn];
              col.ColumnNameInSheet = header;
              allColumns.push(col);
              matched.push(matchedColumn);
            } else {
              console.log("Already matched");
              allColumns.push({
                UserFacingName: null,
                mappings: [header],
                ColumnNameInSheet: header,
                dbName: null,
              });
            }

            // defaultColumns[matchedColumn].ColumnNameInSheet = header;
            // columnMappings[matchedColumn] = header;
            // mappingsList.push({
            // columnNameInSheet: header,
            // columnNameTransformed: matchedColumn,
            // });
          } else {
            allColumns.push({
              UserFacingName: null,
              mappings: [header],
              ColumnNameInSheet: header,
              dbName: null,
            });

            // const transformedName = null; //toSnakeCase(header);
            // extraColumns.push({
            // columnNameInSheet: header,
            // columnNameTransformed: transformedName,
            // });
            // mappingsList.push({
            // columnNameInSheet: header,
            // columnNameTransformed: transformedName,
            // });
          }
        });

        // columnMappings["extraColumns"] = extraColumns;

        // Transform data rows based on column mappings
        const transformedData = rows.map((row) => {
          const transformedRow = {};
          const matched = []; // Reset for each row

          headers.forEach((header, index) => {
            const matchedColumn = matchColumn(header, defaultColumns);

            // console.log("-------------------------------------\n\n");
            // console.log("Matching column ", header);
            // console.log("Matched column ", matchedColumn);
            // console.log("Already Matched Cols ", matched);

            if (matchedColumn) {
              // If matchedColumn is found and hasn't been added to matched array yet
              if (!matched.includes(matchedColumn)) {
                console.log(`First Time pushing data ${index} => ${header}`);
                matched.push(matchedColumn); // Mark this column as matched

                transformedRow[matchedColumn] = row[index] || null;
              } else {
                console.log(`Already Found data ${index} => ${header}`);
                const transformedName = header; // Or use toSnakeCase(header);
                if (!transformedRow["extraColumns"]) {
                  transformedRow["extraColumns"] = {};
                }
                // Add to extraColumns if it's the first time
                transformedRow["extraColumns"][transformedName] =
                  row[index] || null;
                // If it's already matched, add to the main object
              }
            } else {
              // If no match is found, add to extraColumns
              const transformedName = header; // Or use toSnakeCase(header);
              if (!transformedRow["extraColumns"]) {
                transformedRow["extraColumns"] = {};
              }
              transformedRow["extraColumns"][transformedName] =
                row[index] || null;
            }

            console.log("-------------------------------------\n\n");
          });

          return transformedRow;
        });

        // Update state
        setProcessedData(transformedData);
        // setColumnMappingsList(mappingsList);

        console.log("Default Cols:", allColumns);
        setNewColumnsObtained(allColumns);
        console.log("Processed Data", transformedData);

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
    // setSheetName(`${newBaseName}.${extension}`);
    setSheetName(e);
  };

  //code to call api
  const handleAddLead = async () => {
    let validated = validateColumns();

    console.log("Columns validated", validated);
    if (!validated) {
      return;
    }
    let pd = processedData;
    console.log(pd);
    NewColumnsObtained.forEach((col) => {
      pd.forEach((item, index) => {
        // if (item.extraColumns[col.ColumnNameInSheet]) {
        if (!col.dbName) {
          console.log("Column not needed so deleteing.");
          delete item.extraColumns[col.ColumnNameInSheet];
        } else {
          let val = item.extraColumns[col.ColumnNameInSheet];
        }
        // }
      });
    });
    console.log(pd);

    console.log("New Columns");
    console.log(NewColumnsObtained);

    // return;
    try {
      setLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }
      //console.log("Auth token is :--", AuthToken);

      const ApiData = {
        sheetName: sheetName,
        leads: processedData,
        columnMappings: columnMappingsList,
      };

      const ApiPath = Apis.createLead;
      //console.log("Api path is :", ApiPath);

      console.log("Apidata sending in Addlead api is :", ApiData);
      // return;
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log("Response of ad lead api is :", response.data.data);
        if (response.data.status === true) {
          setShowUploadLeadModal(false);
          setSelectedFile(null);
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
  };

  //code to check if lead sheets exists or not
  const handleShowUserLeads = (status) => {
    setUserLeads(status);
  };

  const DefaultHeadigs = [
    {
      id: 1,
      title: "First Name",
    },
    {
      id: 2,
      title: "Last Name",
    },
    {
      id: 3,
      title: "Email",
    },
    {
      id: 4,
      title: "Address",
    },
    {
      id: 5,
      title: "Phone Number",
    },
  ];

  const styles = {
    headingStyle: {
      fontSize: 17,
      fontWeight: "700",
    },
    subHeadingStyle: {
      fontSize: 15,
      fontWeight: "700",
    },
    paragraph: {
      fontSize: 15,
      fontWeight: "500",
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
  };

  function GetDefaultColumnsNotMatched(data) {
    let columns = Object.keys(data);
    // console.log("Columns GetDefaultColumnsNotMatched ", columns);
    // const ColumnsNotMatched = DefaultHeadigs.filter(
    // (value) => !columns.includes(value.title)
    // );
    const ColumnsNotMatched = defaultColumnsArray.filter(
      (value) => !columns.includes(value.dbName)
    );
    //defaultColumns
    //console.log("Columns in Processed Data ", columns);
    //console.log("Columns in Default Headings ", DefaultHeadigs);
    // console.log("Columns not matched ", ColumnsNotMatched);
    return ColumnsNotMatched;
  }

  return (
    <div className="w-full">
      {initialLoader ? (
        <div className="w-full flex flex-row justify-center">
          <CircularProgress size={35} />
        </div>
      ) : (
        <div className="w-full">
          {userLeads ? (
            <div className="h-screen w-full">
              <Userleads
                handleShowAddLeadModal={handleShowAddLeadModal}
                handleShowUserLeads={handleShowUserLeads}
              />
            </div>
          ) : (
            <div>
              <div className="flex flex-row items-center justify-center w-full">
                <Image
                  src={"/assets/placeholder.png"}
                  height={145}
                  width={710}
                  alt="*"
                />
              </div>
              <div
                className="mt-12 ms-8 text-center"
                style={{ fontSize: 30, fontWeight: "700" }}
              >
                {`Looks like you don't have any leads yet`}
              </div>
              <div className="w-full flex flex-row justify-center mt-10">
                <button
                  className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[177px] rounded-lg items-center justify-center"
                  onClick={() => {
                    setShowAddLeadModal(true);
                  }}
                >
                  <Image
                    src={"/assets/addManIcon.png"}
                    height={20}
                    width={20}
                    alt="*"
                  />
                  <span style={styles.headingStyle}>Add Leads</span>
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
                <button
                  className="flex flex-row items-center gap-2"
                  onClick={() => {
                    setIntroVideoModal(true);
                  }}
                >
                  <Image
                    src={"/assets/youtubeplay.png"}
                    height={93}
                    width={127}
                    alt="*"
                  />
                  <div>
                    <div style={styles.subHeadingStyle}>
                      Learn how to add leads to your pipeline
                    </div>
                    <div style={styles.subHeadingStyle} className="text-start">
                      2 mins
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                className="w-8/12 h-[40vh] flex flex-col justify-center "
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
                }}
              >
                <input {...getInputProps()} />
                <div
                  className="w-full flex-row flex justify-center"
                  style={{ marginBottom: "15px" }}
                >
                  <Image
                    src="/assets/docIcon.png"
                    alt="Upload Icon"
                    height={30}
                    width={30}
                  // style={{ marginBottom: "10px" }}
                  />
                </div>
                <p style={{ ...styles.subHeadingStyle }}>
                  Drag & drop your leads
                </p>
                <p style={{ ...styles.subHeadingStyle }}>or</p>
                <button
                  className="underline outline-none border-none"
                  style={{
                    ...styles.subHeadingStyle,
                    cursor: "pointer",
                  }}
                >
                  Browse your Computer
                </button>
                <p
                  style={{
                    fontSize: 12,
                    color: "#888",
                    marginTop: "10px",
                    fontWeight: "500",
                  }}
                >
                  Upload only a CSV or Excel file
                </p>
              </div>

              <div className="mt-8" style={{ height: "50px" }}>
                {SelectedFile && (
                  <div className="w-full mt-4 flex flex-row justify-center">
                    <button
                      className="bg-purple text-white flex flex-row items-center justify-center rounded-lg gap-2"
                      style={{
                        ...styles.subHeadingStyle,
                        height: "50px",
                        width: "170px",
                      }}
                      onClick={() => {
                        setShowUploadLeadModal(true);
                        setShowAddLeadModal(false);
                        setSelectedFile(null);
                      }}
                    >
                      <Image
                        src={"/assets/addLeadIcon.png"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                      <span>Add Leads</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
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
                backdropFilter: "blur(2px)",
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
        <Box className="lg:w-7/12 sm:w-10/12 w-10/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setShowUploadLeadModal(false);
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
                Leads
              </div>

              <div className="flex flex-row items-center gap-2 mt-2">
                <span style={styles.subHeadingStyle}>List Name</span>{" "}
                <Image
                  src={"/assets/infoIcon.png"}
                  height={18}
                  width={18}
                  alt="*"
                />
              </div>

              <div className="w-full mt-4" style={styles.subHeadingStyle}>
                <input
                  className="outline-none border-none rounded-lg p-2 w-full"
                  value={sheetName} // Only show the base name in the input.split(".")[0]
                  // onChange={handleSheetNameChange}
                  onChange={(e) => {
                    const value = e.target.value;
                    //console.log("Updated sheet name :", value);
                    setSheetName(value);
                  }}
                  placeholder="Enter sheet name"
                />
              </div>

              <div className="mt-4" style={styles.paragraph}>
                Match columns in your file to column fields
              </div>

              <div
                className="flex flex-row items-center mt-4"
                style={{ ...styles.paragraph, color: "#00000070" }}
              >
                <div className="w-2/12">Matched</div>
                <div className="w-4/12">Column Header from File</div>
                <div className="w-3/12">Preview Info</div>
                <div className="w-3/12">Column Fields</div>
              </div>

              <div
                className="max-h-[40vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                style={{ scrollbarWidth: "none" }}
              >
                {NewColumnsObtained.map((item, index) => {
                  const matchingValue = processedData.find((data) =>
                    Object.keys(data).includes(item.dbName)
                  );

                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center mt-4"
                      style={{ ...styles.paragraph }}
                    >
                      <div className="w-2/12">
                        {matchingValue ? (
                          <Image
                            className="ms-4"
                            src={"/assets/checkDone.png"}
                            alt="*"
                            height={24}
                            width={24}
                          />
                        ) : (
                          <Image
                            className="ms-4"
                            src={"/assets/warning.png"}
                            alt="*"
                            height={24}
                            width={24}
                          />
                        )}
                        {/* <Image className='ms-4' src={"/assets/checkDone.png"} alt='*' height={24} width={24} /> */}
                      </div>
                      <div className="w-4/12">{item.ColumnNameInSheet}</div>
                      <div className="w-3/12 truncate">
                        {matchingValue ? (
                          matchingValue[item.dbName]
                        ) : (
                          <div>
                            {item.dbName
                              ? processedData[0].extraColumns[item.dbName]
                              : processedData[0].extraColumns[
                              item.ColumnNameInSheet
                              ]}
                          </div>
                        )}
                      </div>
                      <div className="w-3/12 border rounded p-2">
                        <button
                          className="flex flex-row items-center justify-between w-full outline-none"
                          onClick={(event) => {
                            if (columnAnchorEl) {
                              handleColumnPopoverClose();
                            } else {
                              // if (index > 4) {
                              setSelectedItem(index);
                              //console.log("Selected index is", index);
                              //console.log("Item selected is :", item);
                              setUpdateColumnValue(item.columnNameTransformed);
                              handleColumnPopoverClick(event);
                              setUpdateHeader(item);
                              // }
                            }
                          }}
                        >
                          <p className="truncate">{item.UserFacingName}</p>
                          {selectedItem === index ? (
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
                            horizontal: "center", // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.08)",
                            },
                          }}
                        >
                          <div
                            className="w-[170px] p-2"
                            style={styles.paragraph}
                          >
                            <div>
                              {/* {
 DefaultHeadigs.map((item, index) => (
 <div key={index}>
 {item.title}
 </div>
 ))
 } */}
                              <div className="flex flex-col text-start">
                                {GetDefaultColumnsNotMatched(
                                  processedData[0]
                                ).map((item, index) => {
                                  return (
                                    <button
                                      className="text-start"
                                      key={index}
                                      onClick={() => {
                                        ChangeColumnName(item.UserFacingName);
                                      }}
                                    >
                                      {item.UserFacingName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <button
                              className="underline text-purple"
                              onClick={() => {
                                setShowPopUp(true);
                              }}
                            >
                              Add New column
                            </button>
                            <button
                              className="underline text-purple"
                              onClick={() => {
                                ChangeColumnName(null);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </Popover>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-row justify-center">
                {Loader ? (
                  <CircularProgress size={27} />
                ) : (
                  <button
                    className="bg-purple text-white rounded-lg h-[50px] w-4/12"
                    onClick={handleAddLead}
                  >
                    Continue
                  </button>
                )}
              </div>

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
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setShowPopUp(false);
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
              <div
                className="w-full text-center mt-2"
                style={{ fontSize: 25, fontWeight: "700" }}
              >
                Add Column
              </div>
              <div className="mt-2" style={styles.subHeadingStyle}>
                Update Column
              </div>

              <input
                className="border outline-none rounded p-2 mt-2 w-full focus:ring-0"
                value={updateColumnValue}
                // onChange={(e) => { setUpdateColumnValue(e.target.value) }}
                onChange={(e) => {
                  const regex = /^[a-zA-Z_ ]*$/; // Allow only alphabets
                  if (regex.test(e.target.value)) {
                    setUpdateColumnValue(e.target.value);
                  }
                }}
                placeholder="Update column"
                style={{ border: "1px solid #00000020" }}
              />

              <button
                className="w-full h-[50px] rounded-xl bg-purple text-white mt-8"
                style={styles.subHeadingStyle}
                onClick={() => {
                  ChangeColumnName(updateColumnValue);
                }}
              >
                Create
              </button>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for video */}
      <Modal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setIntroVideoModal(false);
                  }}
                >
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <div
                className="text-center sm:font-24 font-16"
                style={{ fontWeight: "700" }}
              >
                Learn more about assigning leads
              </div>

              <div className="mt-6">
                <iframe
                  src="https://www.youtube.com/embed/Dy9DM5u_GVg?autoplay=1&mute=1" //?autoplay=1&mute=1 to make it autoplay
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                  // className='w-20vh h-40vh'
                  style={{
                    width: "100%",
                    height: "50vh",
                    borderRadius: 15,
                  }}
                />
              </div>

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
            vertical: "top",
            horizontal: "center",
          }}
          TransitionComponent={Fade}
          TransitionProps={{
            direction: "center",
          }}
        >
          <Alert
            onClose={() => {
              setSuccessSnack(null);
            }}
            severity="success"
            // className='bg-purple rounded-lg text-white'
            sx={{
              width: "auto",
              fontWeight: "700",
              fontFamily: "inter",
              fontSize: "22",
            }}
          >
            {SuccessSnack}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Leads1;
