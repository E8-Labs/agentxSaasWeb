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
  Radio,
  Snackbar,
  Switch,
  ToggleButton,
  Typography,
} from "@mui/material";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Userleads from "./Userleads";
import TagsInput from "./TagsInput";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "./AgentSelectSnackMessage";
import { SnackMessageTitles } from "@/components/constants/constants";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import VideoCard from "@/components/createagent/VideoCard";
import { HowtoVideos } from "@/constants/Constants";
import {
  LeadDefaultColumns,
  LeadDefaultColumnsArray,
} from "@/constants/DefaultLeadColumns";

const Leads1 = () => {
  const addColRef = useRef(null);
  const bottomRef = useRef(null);

  //code for the new ui add lead modal
  const [addNewLeadModal, setAddNewLeadModal] = useState(false);

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
  //state to setdata when it is true;
  const [setData, setSetData] = useState(false);
  const [SuccessSnack, setSuccessSnack] = useState(null);
  const [showSuccessSnack, setShowSuccessSnack] = useState(false);
  const [initialLoader, setInitialLoader] = useState(false);
  //File handling
  const [processedData, setProcessedData] = useState([]);
  const [columnMappingsList, setColumnMappingsList] = useState([]);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  //popup for deleting the column
  const [ShowDelCol, setShowDelCol] = useState(false);

  //functions for add custom stage list
  const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false);

  const [isInbound, setIsInbound] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [inputs, setInputs] = useState([
    { id: 1, value: "First Name" },
    { id: 2, value: "Last Name" },
    { id: 3, value: "Phone Number" },
    { id: 4, value: "" },
    { id: 5, value: "" },
    { id: 6, value: "" },
  ]);
  const [showaddCreateListLoader, setShowaddCreateListLoader] = useState(false);

  //code for adding tags
  const [tagsValue, setTagsValue] = useState([]);

  //code for warning modal
  const [warningModal, setWarningModal] = useState(false);

  //warning snack
  const [errSnack, setErrSnack] = useState(null);
  const [errSnackTitle, setErrSnackTitle] = useState(null);
  const [showerrSnack, setShowErrSnack] = useState(null);

  //my custom logic
  //This variable will contain all columns from the sheet that we will obtain from the sheet or add new
  let [NewColumnsObtained, setNewColumnsObtained] = useState([]);
  //This will have the default columns only
  const [defaultColumns, setDefaultColumns] = useState(LeadDefaultColumns);
  const [defaultColumnsArray, setDefaultColumnsArray] = useState(
    LeadDefaultColumnsArray
  );

  useEffect(() => {
    console.log("Show upload lead modal", ShowUploadLeadModal);
    if (ShowUploadLeadModal == false) {
      console.log("Clearing data");
      setSelectedFile(null);
      setSheetName("");
      setProcessedData([]);
      setNewColumnsObtained([]);
      setDefaultColumns({ ...LeadDefaultColumns });
      setDefaultColumnsArray([...LeadDefaultColumnsArray]);
      // defaultColumns = LeadDefaultColumns;
      // defaultColumnsArray = LeadDefaultColumnsArray;

      console.log("Default columns after update", defaultColumns);
    }
  }, [ShowUploadLeadModal]);

  useEffect(() => {
    console.log("Updated defaultColumns:", defaultColumns);
  }, [defaultColumns]); // This will log when `defaultColumns` actually updates

  //function to scroll to the bottom when add new column
  useEffect(() => {
    // Scroll to the bottom when inputs change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [inputs]);

  // Handle change in input field
  const handleInputChange = (id, value) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, value } : input))
    );
  };

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
    setInputs([...inputs, { id: newId, value: "" }]);
  };

  //function to match column
  const matchColumn = (columnName, mappings, columnsMatched = []) => {
    const lowerCaseName = columnName.toLowerCase();
    // console.log("Mappings are ", mappings);
    //// console.log(`Already Matched `, columnsMatched);
    //// console.log("Matching Header ", columnName);
    for (const key in mappings) {
      const isAlreadyMatched = columnsMatched.some(
        (matchedColumn) => matchedColumn.dbName === key
      );
      //// console.log(`Matching with `, key);
      let includes = columnsMatched.includes(key);
      //// console.log(`Columns matched include ${key}`, isAlreadyMatched);
      //lowerCaseName.includes(alias)
      if (
        mappings[key].mappings.some((alias) => lowerCaseName == alias) &&
        !isAlreadyMatched
      ) {
        // matched. Check if the column name
        //// console.log("---------------Matched key-----------------", key);
        return key;
      }
    }
    //// console.log("--------------Returning null------------------");
    return null;
  };

  const open = Boolean(columnAnchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    getUserLeads();
  }, []);

  //auto focus the add column input field
  useEffect(() => {
    if (showPopUp) {
      // console.log("Should auto focus the field");
      setTimeout(() => {
        if (addColRef.current) {
          addColRef.current.focus();
        }
      }, 500);
    }
  }, [showPopUp]);

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

  const getUserLeads = async () => {
    try {
      setInitialLoader(true);
    } catch (error) {
      // console.error("Error occured in getVoices api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  const handleShowAddLeadModal = (status) => {
    setAddNewLeadModal(status);
  };

  //code for csv file drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    //////console.log(acceptedFiles);
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

  const handleColumnPopoverClick = (event) => {
    setcolumnAnchorEl(event.currentTarget);
  };

  const handleColumnPopoverClose = () => {
    setcolumnAnchorEl(null);
    setSelectedItem(null);
    setShowPopUp(false);
  };

  //code to update column
  // function ChangeColumnName(UpdatedColumnName) {
  //   ////console.log("Updating ", UpdateHeader);
  //   ////console.log("New Name ", UpdatedColumnName);

  //   let defaultColumnsDbNames = [
  //     "First Name",
  //     "Last Name",
  //     // "Full Name",
  //     "Phone Number",
  //     "Email",
  //     "Address",
  //   ];
  //   let isDefaultColumn = false;

  //   if (
  //     defaultColumnsDbNames.includes(UpdateHeader.UserFacingName) ||
  //     defaultColumnsDbNames.includes(UpdateHeader.dbName)
  //   ) {
  //     isDefaultColumn = true;
  //     // console.log("changing default column");
  //   } else {
  //     // console.log("changing extra column");
  //   }
  //   // return;
  //   //////console.log("Change column name here", UpdatedColumnName);
  //   //////console.log("Old column value ", UpdateHeader.columnNameTransformed);
  //   let pd = processedData;
  //   let dc = null;
  //   let keys = Object.keys(defaultColumns);
  //   // ////console.log("Keys ", keys);
  //   // ////console.log("Updated Col Name ", UpdatedColumnName);
  //   keys.forEach((key) => {
  //     let col = defaultColumns[key];
  //     // console.log(
  //     //   `Matching ${col.UserFacingName} with ${UpdatedColumnName} OR ${col.dbName}`
  //     // );
  //     if (
  //       col.UserFacingName == UpdatedColumnName ||
  //       col.dbName == UpdatedColumnName
  //     ) {
  //       dc = col;
  //     }
  //   });
  //   // if (UpdateHeader.dbName) {
  //   // let val = defaultColumns[UpdateHeader.dbName];
  //   // dc = val;
  //   // }
  //   for (let i = 0; i < pd.length; i++) {
  //     let d = pd[i];
  //     if (isDefaultColumn) {
  //       // changing the default column
  //       if (dc) {
  //         // console.log("Updated name is default column");
  //         let value = d[UpdateHeader.dbName];
  //         delete d[UpdateHeader.dbName];
  //         // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
  //         d[UpdatedColumnName] = value;
  //         pd[i] = d;
  //       } else {
  //         // console.log("Updated name is not default column");
  //         //mmove it to extra column

  //         let value = d[UpdateHeader.dbName];
  //         d.extraColumns[
  //           UpdatedColumnName
  //             ? UpdatedColumnName
  //             : UpdateHeader.ColumnNameInSheet
  //         ] = value;
  //         delete d[UpdateHeader.dbName];
  //         // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
  //         // d[UpdatedColumnName] = value;
  //         pd[i] = d;
  //       }
  //     } else {
  //       //we are changing the extra column

  //       // defaultColumns.forEach((col) => {
  //       // if (col.UserFacingName == UpdatedColumnName) {
  //       // dc = col;
  //       // }
  //       // });
  //       //The updated name is in default column list
  //       if (dc) {
  //         // console.log("Updated name is default column", UpdatedColumnName);
  //         let value =
  //           d.extraColumns[
  //             UpdateHeader.dbName
  //               ? UpdateHeader.dbName
  //               : UpdateHeader.ColumnNameInSheet
  //           ];
  //         delete d.extraColumns[
  //           UpdateHeader.dbName
  //             ? UpdateHeader.dbName
  //             : UpdateHeader.ColumnNameInSheet
  //         ];
  //         // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
  //         d[dc.dbName] = value;
  //         pd[i] = d;
  //       } else {
  //         // ////console.log(
  //         // "the updated name is not in default column list",
  //         // UpdatedColumnName
  //         // );
  //         // the updated name is not in default column list
  //         let colName = UpdateHeader.dbName
  //           ? UpdateHeader.dbName
  //           : UpdateHeader.ColumnNameInSheet;
  //         let value = d.extraColumns[colName];
  //         // console.log(`Value for colum ${colName} `, value);
  //         delete d.extraColumns[colName];
  //         // d.extraColumns[UpdateHeader.columnNameTransformed] = null;
  //         d.extraColumns[
  //           UpdatedColumnName
  //             ? UpdatedColumnName
  //             : UpdateHeader.ColumnNameInSheet
  //         ] = value;

  //         pd[i] = d;
  //       }
  //     }
  //   }

  //   let NewCols = NewColumnsObtained;
  //   NewCols.forEach((item) => {
  //     ////console.log("Match ", item);
  //     ////console.log("Match ", UpdateHeader);

  //     if (item.dbName == UpdateHeader.dbName && isDefaultColumn) {
  //       item.dbName = UpdatedColumnName;
  //       item.UserFacingName = UpdatedColumnName;
  //     } else if (item.ColumnNameInSheet == UpdateHeader.ColumnNameInSheet) {
  //       //changing extra column
  //       if (dc) {
  //         ////console.log("New column name is default Column", dc);
  //         item.dbName = dc.dbName;
  //         item.UserFacingName = UpdatedColumnName;
  //       } else {
  //         item.dbName = UpdatedColumnName;
  //         item.UserFacingName = UpdatedColumnName;
  //       }
  //     }
  //   });
  //   console.log("New Cols", NewCols);
  //   // for (let i = 0; i < mappingList.length; i++) {
  //   // let map = mappingList[i];
  //   // if (map.columnNameTransformed == UpdateHeader.columnNameTransformed) {
  //   // // update the column
  //   // map.columnNameTransformed = UpdatedColumnName;
  //   // }
  //   // mappingList[i] = map;
  //   // }
  //   console.log(`Default Columns Now`, defaultColumns);
  //   setProcessedData(pd);
  //   // setColumnMappingsList(mappingList);
  //   //////console.log("Mapping list changed", mappingList);
  //   // if (pd && mappingList) {
  //   setShowPopUp(false);
  //   setcolumnAnchorEl(null);
  //   setSelectedItem(null);
  //   // }
  // }

  useEffect(() => {
    console.log("NewColumnsObtained changed ", NewColumnsObtained);
  }, [NewColumnsObtained]);

  function ChangeColumnName(UpdatedColumnName) {
    let ColumnToUpdate = UpdateHeader;
    if (UpdatedColumnName == null) {
      let updatedColumns = NewColumnsObtained.map((item) => {
        if (item.ColumnNameInSheet == ColumnToUpdate.ColumnNameInSheet) {
          item.matchedColumn = null;
          item.UserFacingName = null;
          return item;
        }
        return item;
      });
      setNewColumnsObtained(updatedColumns);
    } else {
      let updatedColumns = NewColumnsObtained.map((item) => {
        if (item.ColumnNameInSheet == ColumnToUpdate.ColumnNameInSheet) {
          //check if the new column Name matches a column
          let matchedColumnKey = Object.keys(LeadDefaultColumns).find((key) =>
            LeadDefaultColumns[key].mappings.includes(
              UpdatedColumnName.toLowerCase()
            )
          );

          if (matchedColumnKey) {
            let defaultColumn = { ...LeadDefaultColumns[matchedColumnKey] };
            item.matchedColumn = defaultColumn;
            item.UserFacingName = null;
          } else {
            item.matchedColumn = null;
            item.UserFacingName = UpdatedColumnName;
          }
        }
        return item;
      });
      setNewColumnsObtained(updatedColumns);
    }

    setShowPopUp(false);
    setcolumnAnchorEl(null);
    setSelectedItem(null);
  }

  const validateColumns = () => {
    console.log("New Col Obtained ", NewColumnsObtained);

    // const requiredColumns = ["phone", "firstName", "lastName"];
    const hasFullName =
      NewColumnsObtained.some(
        (col) => col.matchedColumn?.dbName === "fullName"
      ) ||
      NewColumnsObtained.some(
        (col) => col.matchedColumn?.dbName === "firstName"
      );
    // NewColumnsObtained.some((col) => col.dbName === "lastName"));
    ////console.log("Has Full Name ", hasFullName);
    const hasPhone = NewColumnsObtained.some(
      (col) => col.matchedColumn?.dbName === "phone"
    );
    // console.log("Has Phone Num", hasPhone);
    // return hasPhone && hasFullName;

    if (hasPhone && hasFullName) {
      handleAddLead();
      // console.log("Al credentials valid");
    } else {
      // console.log("Al credentials not valid");
      if (!hasPhone) {
        setErrSnack(SnackMessageTitles.ErrorMessagePhoneRequiredLeadImport);
        setErrSnackTitle(SnackMessageTitles.ErrorTitlePhoneRequiredLeadImport);
        setShowErrSnack(true);
      }
      if (!hasFullName) {
        setErrSnack(SnackMessageTitles.ErrorMessageFirstNameRequiredLeadImport);
        setErrSnackTitle(
          SnackMessageTitles.ErrorTitleFirstNameRequiredLeadImport
        );
        setShowErrSnack(true);
      }
    }
  };

  //File reading logic

  const toSnakeCase = (str) =>
    str
      .toLowerCase()
      .replace(/[\s\-]/g, "_")
      .replace(/[^\w]/g, "");

  const handleFileUpload = useCallback(
    (file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });

        // Extract data from the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header included

        if (data.length > 1) {
          const headers = data[0]; // First row as headers
          const rows = data.slice(1); // Data without headers

          let mappedColumns = headers.map((header) => {
            // Find matching column from LeadDefaultColumns
            let matchedColumnKey = Object.keys(LeadDefaultColumns).find((key) =>
              LeadDefaultColumns[key].mappings.includes(header.toLowerCase())
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
            // console.log("Row is ", row);

            mappedColumns.forEach((col, index) => {
              transformedRow[col.ColumnNameInSheet] = row[index] || null;
              // if (col.matchedColumn) {
              //   transformedRow[col.matchedColumn.dbName] = row[index] || null;
              // } else {
              //   // Handle extra/unmatched columns
              //   if (!transformedRow.extraColumns)
              //     transformedRow.extraColumns = {};
              //   transformedRow.extraColumns[col.ColumnNameInSheet] =
              //     row[index] || null;
              // }
            });
            console.log("TransformedRow is ", transformedRow);

            return transformedRow;
          });

          // Update state
          setProcessedData(transformedData);
          setNewColumnsObtained(mappedColumns); // Store the column mappings

          console.log("Mapped Columns:", mappedColumns);
          console.log("Transformed Data:", transformedData);
        }
      };

      reader.readAsBinaryString(file);
    },
    [LeadDefaultColumns]
  );

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
    // let validated = validateColumns();

    //console.log("Columns validated", validated);
    // if (!validated) {

    //   return;
    // }
    let pd = processedData;

    let data = [];

    ////console.log(pd);

    pd.forEach((item, index) => {
      let row = { extraColumns: {} };
      // console.log("Checking item", item);
      NewColumnsObtained.forEach((col) => {
        if (col.matchedColumn) {
          //
          row[col.matchedColumn.dbName] = item[col.ColumnNameInSheet];
        } else if (col.UserFacingName) {
          row.extraColumns[col.UserFacingName] = item[col.ColumnNameInSheet];
        }
      });
      data.push(row);
    });
    console.log("Data to send in api is ", data);
    // return;

    ////console.log("New Columns");
    ////console.log(NewColumnsObtained);

    // return;
    try {
      setLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }
      //////console.log("Auth token is :--", AuthToken);

      // const tagsList = tagsValue.map((tag))

      const ApiData = {
        sheetName: sheetName,
        leads: data,
        columnMappings: NewColumnsObtained,
        tags: tagsValue,
      };

      const ApiPath = Apis.createLead;
      // console.log("Api data is :", JSON.stringify(ApiData));
      // return
      //console.log("Apidata sending in Addlead api is :", ApiData);
      // return;
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log("Response of ad lead api is :", response.data.data);
        if (response.data.status === true) {
          let sheet = response.data.data;
          let leads = response.data.leads;
          // let sheetsList =
          // console.log("Response of add lead list api is:", response.data.data);
          setShowUploadLeadModal(false);
          setSelectedFile(null);
          localStorage.setItem("userLeads", JSON.stringify(response.data.data));
          setUserLeads(sheet);

          setAddNewLeadModal(false);
          setSetData(true);
          setSuccessSnack(response.data.message);
          setShowSuccessSnack(true);
        }
      }
    } catch (error) {
      // console.error("Error occured in add lead api is :", error);
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
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  function GetDefaultColumnsNotMatched() {
    // Extract all default column dbNames from LeadDefaultColumns
    const allDefaultDbNames = Object.keys(LeadDefaultColumns).map(
      (colKey) => LeadDefaultColumns[colKey].dbName
    );

    // Extract matched columns from NewColumnsObtained
    const matchedDbNames = NewColumnsObtained.filter(
      (col) => col.matchedColumn !== null
    ).map((col) => col.matchedColumn.dbName);

    // Find default columns that were NOT matched
    const columnsNotMatched = allDefaultDbNames
      .filter((dbName) => !matchedDbNames.includes(dbName))
      .map((dbName) =>
        Object.values(LeadDefaultColumns).find((col) => col.dbName === dbName)
      );

    console.log("Columns not matched ", columnsNotMatched);
    return columnsNotMatched;
  }

  //code to add new sheet list
  const handleAddSheetNewList = async () => {
    try {
      setShowaddCreateListLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // console.log("Auth token is :--", AuthToken);

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
        inbound: isInbound,
      };
      // console.log("Data to send in api is:", ApiData);

      const ApiPath = Apis.addSmartList;
      // console.log("Api Path is", ApiPath);

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Response of add new smart list api is :", response);
        if (response.data.status === true) {
          // setSheetsList([...SheetsList, response.data.data]);
          setIsInbound(false);
          setUserLeads(response.data.data);
          setSetData(true);
          setAddNewLeadModal(false);
          setShowAddNewSheetModal(false);
          setInputs([
            { id: 1, value: "First Name" },
            { id: 2, value: "Last Name" },
            { id: 3, value: "Phone Number" },
            { id: 4, value: "" },
            { id: 5, value: "" },
            { id: 6, value: "" },
          ]);
          setNewSheetName("");
        }
      }
    } catch (error) {
      // console.error("Error occured in adding new list api is:", error);
    } finally {
      setShowaddCreateListLoader(false);
    }
  };

  return (
    <div className="w-full">
      <AgentSelectSnackMessage
        isVisible={showSuccessSnack}
        message={SuccessSnack}
        hide={() => setShowSuccessSnack(false)}
        type={SnackbarTypes.Success}
      />
      <AgentSelectSnackMessage
        isVisible={showerrSnack}
        message={errSnack}
        hide={() => setShowErrSnack(false)}
        type={SnackbarTypes.Error}
        title={errSnackTitle}
      />
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
                newListAdded={userLeads}
                shouldSet={setData}
                setSetData={setSetData}
              />
            </div>
          ) : (
            <div className="h-screen">
              <div className="flex flex-row items-start justify-center mt-48 w-full">
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

              <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                <div className="">
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
                    <span style={styles.headingStyle}>Upload Leads</span>
                  </button>
                </div>
                <div className="">
                  <button
                    className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                    onClick={() => {
                      setShowAddNewSheetModal(true);
                    }}
                  >
                    <Image
                      src={"/assets/smartlistIcn.svg"}
                      height={24}
                      width={24}
                      alt="*"
                    />
                    <span style={styles.headingStyle}>Create Smartlist</span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: "70px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <VideoCard
                  duration={"11 min 27 sec"}
                  horizontal={false}
                  playVideo={() => {
                    setIntroVideoModal(true);
                  }}
                  title=" Learn how to add leads to your CRM"
                />
              </div>
            </div>
            // </div>
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

              {/* <div className="mt-8" style={{ height: "50px" }}>
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
              </div> */}

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

      {/* modal to upload lead */}
      <Modal
        open={ShowUploadLeadModal}
        onClose={() => setShowUploadLeadModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-7/12 sm:w-10/12 w-10/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full h-[90svh]"
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

              <div className="flex flex-row items-center gap-2 mt-8">
                <span style={styles.subHeadingStyle}>List Name</span>{" "}
                {/* <Image
                  src={"/svgIcons/infoIcon.svg"}
                  height={18}
                  width={18}
                  alt="*"
                /> */}
              </div>

              <div className="w-full mt-4" style={styles.subHeadingStyle}>
                <input
                  className="outline-none rounded-lg p-2 w-full"
                  style={{
                    borderColor: "#00000020",
                  }}
                  value={sheetName} // Only show the base name in the input.split(".")[0]
                  // onChange={handleSheetNameChange}
                  onChange={(e) => {
                    const value = e.target.value;
                    //////console.log("Updated sheet name :", value);
                    setSheetName(value);
                  }}
                  placeholder="Enter sheet name"
                />
              </div>

              <div style={{ fontWeight: "500", fontSize: 15, marginTop: 20 }}>
                Create a tag for leads
              </div>

              <div className="mt-4">
                <TagsInput setTags={setTagsValue} />
              </div>

              <div className="mt-4" style={styles.paragraph}>
                Match columns in your file to column fields
              </div>

              <div
                className="flex flex-row items-center mt-4"
                style={{ ...styles.paragraph, color: "#00000070" }}
              >
                <div className="w-2/12">Matched</div>
                <div className="w-3/12">Column Header from File</div>
                <div className="w-3/12">Preview Info</div>
                <div className="w-3/12">Column Fields</div>
                <div className="w-1/12">Action</div>
              </div>

              <div
                className="max-h-[40vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-[55px]"
                style={{ scrollbarWidth: "none" }}
              >
                {NewColumnsObtained.map((item, index) => {
                  // const matchingValue = processedData.find((data) =>
                  //   Object.keys(data).includes(item.dbName)
                  // );
                  // console.log(
                  //   `1342: matching val: ${item.dbName}`,
                  //   matchingValue
                  // );
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center mt-4"
                      style={{ ...styles.paragraph }}
                    >
                      <div className="w-2/12">
                        {item.UserFacingName || item.matchedColumn ? (
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
                      <div className="w-3/12">{item.ColumnNameInSheet}</div>
                      <div className="w-3/12 truncate">
                        {processedData[0][item.ColumnNameInSheet]}
                        {/* {item.matchedColumn ? (
                          processedData[0][item.matchedColumn.dbName]
                        ) : (
                          <div>
                            {item.UserFacingName
                              ? processedData[0].extraColumns[
                                  item.UserFacingName
                                ]
                              : processedData[0].extraColumns[
                                  item.ColumnNameInSheet
                                ]}
                          </div>
                        )} */}
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
                              //////console.log("Selected index is", index);
                              // console.log("Item selected is :", item);
                              // console.log(
                              //   "Array selected is :",
                              //   NewColumnsObtained
                              // );
                              setUpdateColumnValue(item.columnNameTransformed);
                              handleColumnPopoverClick(event);
                              setUpdateHeader(item);
                              // }
                            }
                          }}
                        >
                          <p className="truncate">
                            {item.matchedColumn
                              ? item.matchedColumn.UserFacingName
                              : item.UserFacingName}
                          </p>
                          {selectedItem === index ? (
                            <CaretUp size={20} weight="bold" />
                          ) : (
                            <CaretDown size={20} weight="bold" />
                          )}
                        </button>
                      </div>

                      {item.matchedColumn || item.UserFacingName ? (
                        <button
                          className="underline text-purple w-1/12 outline-none ps-4"
                          onClick={() => {
                            setUpdateHeader(item);
                            setShowDelCol(true);
                            // setUpdateHeader(item)
                            // ChangeColumnName(null)
                          }}
                        >
                          <Image
                            src={"/assets/blackBgCross.png"}
                            height={15}
                            width={15}
                            alt="*"
                          />
                        </button>
                      ) : (
                        <div></div>
                      )}

                      {/* <Modal
                          open = {ShowDelCol}
                          onClose={()=>setShowDelCol(false)}

                      >
                        <div style={{height:50,width:50,backgroundColor:'red'}}>
                              jioprjfdlkm
                        </div>

                      </Modal> */}
                    </div>
                  );
                })}
              </div>

              <div
                className=""
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {Loader ? (
                  <CircularProgress size={27} />
                ) : (
                  <button
                    className="bg-purple text-white rounded-lg h-[50px] w-4/12"
                    onClick={() => {
                      validateColumns();
                    }}
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

      {/* Delete Column Modal */}
      <Modal
        open={ShowDelCol}
        onClose={() => setShowDelCol(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: { backgroundColor: "rgba(0, 0, 0, 0.1)" },
        }}
      >
        <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="font-bold text-xl mt-6">
                Are you sure you want to delete this column
              </div>
              <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                <button
                  className="w-1/2 font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                  onClick={() => {
                    setShowDelCol(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                  onClick={() => {
                    ChangeColumnName(null);
                    setShowDelCol(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Not matched Columns popover */}

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
          elevation: 1, // This will remove the shadow
          style: {
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <div className="w-[170px]" style={styles.paragraph}>
          <div>
            <div className="flex flex-col text-start">
              {GetDefaultColumnsNotMatched().map((item, index) => {
                return (
                  <button
                    className="text-start hover:bg-[#402FFF10] p-2"
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
            className="underline text-purple p-2 hover:bg-[#402fff10] w-full text-start"
            onClick={() => {
              setShowPopUp(true);
            }}
          >
            Add New column
          </button>
        </div>
      </Popover>

      {/* Modal to update header */}
      <Modal
        open={showPopUp}
        onClose={() => setShowPopUp(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-6/12 w-10/12" sx={styles.modalsStyle}>
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
                style={{ fontSize: 22, fontWeight: "600" }}
              >
                Add Column
              </div>
              <div className="mt-2" style={styles.subHeadingStyle}>
                Column Name
              </div>

              <input
                ref={addColRef}
                type="text"
                className="border outline-none rounded p-2 mt-2 w-full focus:ring-0"
                value={updateColumnValue}
                // onChange={(e) => { setUpdateColumnValue(e.target.value) }}
                onChange={(e) => {
                  const regex = /^[a-zA-Z0-9_ ]*$/; // Allow only alphabets
                  if (regex.test(e.target.value)) {
                    setUpdateColumnValue(e.target.value);
                  }
                }}
                placeholder="Type here..."
                style={{ border: "1px solid #00000020" }}
              />

              <button
                className="w-full h-[50px] rounded-xl bg-purple text-white mt-8"
                style={{
                  ...styles.subHeadingStyle,
                  backgroundColor: !updateColumnValue ? "#00000020" : "",
                  color: !updateColumnValue ? "black" : "",
                }}
                disabled={!updateColumnValue}
                onClick={() => {
                  if (
                    NewColumnsObtained?.some(
                      (item) =>
                        item?.UserFacingName?.toLowerCase() ===
                        updateColumnValue?.toLowerCase()
                    )
                  ) {
                    // console.log("Value matched from the array");
                    // return
                    setWarningModal(true);
                  } else {
                    // console.log("Value donot matches from the array");
                    ChangeColumnName(updateColumnValue);
                  }
                }}
              >
                Add
              </button>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Code foor warning modal */}
      <Modal
        open={warningModal}
        onClose={() => setWarningModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(2px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="font-bold text-xl text-center mt-6 text-red">
                Column already exists
              </div>
              <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                <button
                  className="w-full bg-purple font-bold text-white text-xl border border-[#00000020] rounded-xl h-[50px]"
                  onClick={() => {
                    setWarningModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal to add lead or import lead */}
      <Modal
        open={addNewLeadModal}
        onClose={() => setAddNewLeadModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="md:w-[627px] w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
                height: "579px",
              }}
            >
              <div className="flex flex-row justify-between">
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: 15,
                  }}
                >
                  New List
                </div>
                <button
                  onClick={() => {
                    setAddNewLeadModal(false);
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

              <div className="flex flex-row items-center w-full justify-center mt-12">
                <Image
                  src={"/assets/placeholder.png"}
                  height={140}
                  width={490}
                  alt="*"
                />
              </div>

              <div
                className="text-center sm:font-24 font-16 mt-12"
                style={{ fontWeight: "600", fontSize: 29 }}
              >
                How do you want to add leads?
              </div>

              <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                <div className="">
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
                    <span style={styles.headingStyle}>Upload Leads</span>
                  </button>
                </div>
                <div className="">
                  <button
                    className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                    onClick={() => {
                      setShowAddNewSheetModal(true);
                    }}
                  >
                    <Image
                      src={"/assets/smartlistIcn.svg"}
                      height={24}
                      width={24}
                      alt="*"
                    />
                    <span style={styles.headingStyle}>Create Smartlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      <IntroVideoModal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        videoTitle="Learn how to add leads to your CRM"
        videoUrl={HowtoVideos.Leads}
        duratuin={11}
      />
      {/* Modal to add custom sheet When no leads are added */}
      <div>
        <Modal
          open={showAddNewSheetModal}
          closeAfterTransition
          BackdropProps={{
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(5px)",
            },
          }}
        >
          <Box
            className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto rounded-3xl h-[70vh]"
            sx={{
              ...styles.modalsStyle,
              scrollbarWidth: "none",
              backgroundColor: "white",
            }}
          >
            <div
              className="w-full flex flex-col items-center h-full justify-between"
              style={{ backgroundColor: "white" }}
            >
              <div className="w-full">
                <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
                  <div style={{ fontWeight: "500", fontSize: 15 }}>
                    New SmartList
                  </div>
                  <button
                    onClick={() => {
                      setShowAddNewSheetModal(false);
                      setNewSheetName("");
                      setInputs([
                        { id: 1, value: "First Name" },
                        { id: 2, value: "Last Name" },
                        { id: 3, value: "Phone Number" },
                        { id: 4, value: "" },
                        { id: 5, value: "" },
                        { id: 6, value: "" },
                      ]);
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

                <div className="px-4 w-full">
                  <div className="flex flex-row items-center justify-between mt-6 gap-2">
                    <span style={styles.paragraph}>List Name</span>
                    <div className="">
                      <span>Inbound?</span>
                      <Switch
                        checked={isInbound}
                        // color="#7902DF"
                        // exclusive
                        onChange={(event) => {
                          console.log("Inboud sheet ", event.target.checked);
                          setIsInbound(event.target.checked);
                        }}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#7902DF",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#7902DF",
                            },
                        }}
                      />
                    </div>
                    {/* <Image
                      src={"/svgIcons/infoIcon.svg"}
                      height={15}
                      width={15}
                      alt="*"
                    /> */}
                  </div>
                  <div className="mt-4">
                    <input
                      value={newSheetName}
                      onChange={(e) => {
                        setNewSheetName(e.target.value);
                      }}
                      placeholder="Enter list name"
                      className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px]"
                      style={{
                        ...styles.paragraph,
                        border: "1px solid #00000020",
                      }}
                    />
                  </div>
                  <div className="mt-8" style={styles.paragraph}>
                    Create Columns
                  </div>
                  <div
                    className="max-h-[30vh] overflow-auto mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                    style={{ scrollbarWidth: "none" }}
                  >
                    {inputs.map((input, index) => (
                      <div
                        key={input.id}
                        className="w-full flex flex-row items-center gap-4 mt-4"
                      >
                        <input
                          className="border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]"
                          style={{
                            ...styles.paragraph,
                            width: "95%",
                            borderColor: "#00000020",
                          }}
                          placeholder={`Column Name`}
                          value={input.value}
                          readOnly={index < 3}
                          disabled={index < 3}
                          onChange={(e) => {
                            if (index > 2) {
                              handleInputChange(input.id, e.target.value);
                            }
                          }}
                        />
                        <div style={{ width: "5%" }}>
                          {index > 2 && (
                            <button
                              className="outline-none border-none"
                              onClick={() => handleDelete(input.id)}
                            >
                              <Image
                                src={"/assets/blackBgCross.png"}
                                height={20}
                                width={20}
                                alt="*"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Dummy element for scrolling */}
                    <div ref={bottomRef}></div>
                  </div>
                  <div style={{ height: "50px" }}>
                    {/*
                                                        inputs.length < 3 && (
                                                            <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                                fontSize: 15,
                                                                fontWeight: "700"
                                                            }}>
                                                                Add New
                                                            </button>
                                                        )
                                                    */}
                    <button
                      onClick={handleAddInput}
                      className="mt-4 p-2 outline-none border-none text-purple rounded-lg underline"
                      style={styles.paragraph}
                    >
                      New Column
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full pb-8">
                {showaddCreateListLoader ? (
                  <div className="flex flex-row items-center justify-center w-full h-[50px]">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className={`h-[50px] rounded-xl w-full ${
                      newSheetName && newSheetName.length > 0
                        ? "bg-purple text-white"
                        : "bg-btngray text-gray-600 cursor-not-allowed" // Disabled state styling
                    }`}
                    style={{
                      fontWeight: "600",
                      fontSize: 16.8,
                    }}
                    onClick={handleAddSheetNewList}
                    disabled={newSheetName == null || newSheetName === ""}
                  >
                    Create List
                  </button>
                )}
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default Leads1;
