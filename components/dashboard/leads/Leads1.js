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
  Tooltip,
  Typography,
} from '@mui/material'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'

import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import {
  SnackMessageTitles,
  getUserLocalData,
} from '@/components/constants/constants'
import IntroVideoModal from '@/components/createagent/IntroVideoModal'
import VideoCard from '@/components/createagent/VideoCard'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import FileUpload from '@/components/test/FileUpload'
import ReadFile from '@/components/test/ReadFile'
import {
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
} from '@/constants/Constants'
import {
  LeadDefaultColumns,
  LeadDefaultColumnsArray,
} from '@/constants/DefaultLeadColumns'
import { useUser } from '@/hooks/redux-hooks'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from './AgentSelectSnackMessage'
import EnrichConfirmModal from './EnrichCofirmModal'
import EnrichModal from './EnrichModal'
import LeadLoading from './LeadLoading'
import TagsInput from './TagsInput'
import Userleads from './Userleads'
import ConfirmPerplexityModal from './extras/CofirmPerplexityModal'
import { LeadProgressBanner } from './extras/LeadProgressBanner'
import { uploadBatchSequence } from './extras/UploadBatch'

const Leads1 = () => {
  const addColRef = useRef(null)
  const bottomRef = useRef(null)

  //code for the new ui add lead modal
  const [addNewLeadModal, setAddNewLeadModal] = useState(false)

  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [SelectedFile, setSelectedFile] = useState(null)
  const [selectedfileLoader, setSelectedfileLoader] = useState(false)
  const [ShowUploadLeadModal, setShowUploadLeadModal] = useState(false)
  const [columnAnchorEl, setcolumnAnchorEl] = React.useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [UpdateHeader, setUpdateHeader] = useState(null)
  const [updateColumnValue, setUpdateColumnValue] = useState('')
  const [showPopUp, setShowPopUp] = useState(false)
  const [sheetName, setSheetName] = useState('')
  const [Loader, setLoader] = useState(false)
  const [userLeads, setUserLeads] = useState('loading')
  //state to setdata when it is true;
  const [setData, setSetData] = useState(false)
  const [SuccessSnack, setSuccessSnack] = useState(null)
  const [showSuccessSnack, setShowSuccessSnack] = useState(false)
  const [initialLoader, setInitialLoader] = useState(false)
  //File handling
  const [processedData, setProcessedData] = useState([])
  const [columnMappingsList, setColumnMappingsList] = useState([])
  const [introVideoModal, setIntroVideoModal] = useState(false)
  //popup for deleting the column
  const [ShowDelCol, setShowDelCol] = useState(false)

  //functions for add custom stage list
  const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false)

  const [isInbound, setIsInbound] = useState(false)
  const [isEnrich, setIsEnrich] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [inputs, setInputs] = useState([
    { id: 1, value: 'First Name' },
    { id: 2, value: 'Last Name' },
    { id: 3, value: 'Phone Number' },
    { id: 4, value: '' },
    { id: 5, value: '' },
    { id: 6, value: '' },
  ])
  const [showaddCreateListLoader, setShowaddCreateListLoader] = useState(false)

  //code for adding tags
  const [tagsValue, setTagsValue] = useState([])

  //code for warning modal
  const [warningModal, setWarningModal] = useState(false)

  //warning snack
  const [errSnack, setErrSnack] = useState(null)
  const [errSnackTitle, setErrSnackTitle] = useState(null)
  const [showerrSnack, setShowErrSnack] = useState(null)

  //my custom logic
  //This variable will contain all columns from the sheet that we will obtain from the sheet or add new
  let [NewColumnsObtained, setNewColumnsObtained] = useState([])
  //This will have the default columns only
  const [defaultColumns, setDefaultColumns] = useState(LeadDefaultColumns)
  const [defaultColumnsArray, setDefaultColumnsArray] = useState(
    LeadDefaultColumnsArray,
  )

  const [showenrichModal, setShowenrichModal] = useState(false)
  const [showenrichConfirmModal, setShowenrichConfirmModal] = useState(false)
  const [showenrichConfirmModal2, setShowenrichConfirmModal2] = useState(false)
  //enrich toggle value
  const [isEnrichToggle, setIsEnrichToggle] = useState(false)
  const [creditCost, setCreditCost] = useState(0)

  // Add state for batch upload persistence and progress
  const [uploading, setUploading] = useState(false)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [user, setUser] = useState(null)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUser(data.user)
    }
  }, [])

  // //test code
  // useEffect(() => {
  //   console.log("UpdateHeader is updated is", UpdateHeader);
  // }, [UpdateHeader]);

  useEffect(() => {
    //console.log;
    if (ShowUploadLeadModal == false) {
      //console.log;
      setSelectedFile(null)
      setSheetName('')
      setProcessedData([])
      setNewColumnsObtained([])
      setDefaultColumns({ ...LeadDefaultColumns })
      setDefaultColumnsArray([...LeadDefaultColumnsArray])
      // defaultColumns = LeadDefaultColumns;
      // defaultColumnsArray = LeadDefaultColumnsArray;

      //console.log;
    }
  }, [ShowUploadLeadModal])

  // On component mount, check for upload state
  useEffect(() => {
    const savedUpload = localStorage.getItem(PersistanceKeys.leadUploadState)
    if (savedUpload) {
      const savedLeads = JSON.parse(savedUpload)

      if (savedLeads.uploading && savedLeads.data?.length) {
        setUploading(true)
        setCurrentBatch(savedLeads.currentBatch)
        setTotalBatches(savedLeads.totalBatches)
        setUploadProgress(
          Math.floor((savedLeads.currentBatch / savedLeads.totalBatches) * 100),
        )

        // Send custom event to hide dashboard slider for resumed upload
        window.dispatchEvent(new CustomEvent('leadUploadStart'))
      }
      let resumeData = {
        data: savedLeads.data,
        sheetName: savedLeads.sheetName,
        columnMappings: savedLeads.columnMappings,
        tags: savedLeads.tagsValue,
        enrich: savedLeads.enrich,
      }

      console.log('trying to resume leads from batch ', savedLeads.currentBatch)
      handleAddLead(true, savedLeads.currentBatch, resumeData)
    }
  }, [])

  //function to scroll to the bottom when add new column
  useEffect(() => {
    // Scroll to the bottom when inputs change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [inputs])

  // Handle change in input field
  const handleInputChange = (id, value) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, value } : input)),
    )
  }

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id))
  }

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1
    setInputs([...inputs, { id: newId, value: '' }])
  }

  //function to match column
  const matchColumn = (columnName, mappings, columnsMatched = []) => {
    const lowerCaseName = columnName.toLowerCase()
    // //console.log;
    //// //console.log;
    //// //console.log;
    for (const key in mappings) {
      const isAlreadyMatched = columnsMatched.some(
        (matchedColumn) => matchedColumn.dbName === key,
      )
      //// //console.log;
      let includes = columnsMatched.includes(key)
      //// //console.log;
      //lowerCaseName.includes(alias)
      if (
        mappings[key].mappings.some((alias) => lowerCaseName == alias) &&
        !isAlreadyMatched
      ) {
        // matched. Check if the column name
        //// //console.log;
        return key
      }
    }
    //// //console.log;
    return null
  }

  const open = Boolean(columnAnchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    getUserLeads()
  }, [])

  //auto focus the add column input field
  useEffect(() => {
    if (showPopUp) {
      // //console.log;
      setTimeout(() => {
        if (addColRef.current) {
          addColRef.current.focus()
        }
      }, 500)
    }
  }, [showPopUp])

  useEffect(() => {
    try {
      setSelectedfileLoader(true)
      if (SelectedFile) {
        const timer = setTimeout(() => {
          setShowUploadLeadModal(true)
          setShowAddLeadModal(false)
          setSelectedFile(null)
        }, 1000)
        return () => clearTimeout(timer)
      }
    } catch (error) {
      // console.error("Error occured in selecting file is :", error);
    } finally {
      setSelectedfileLoader(false)
    }
  }, [SelectedFile])

  const getUserLeads = async () => {
    try {
      setInitialLoader(true)
    } catch (error) {
      // console.error("Error occured in getVoices api is:", error);
    } finally {
      setInitialLoader(false)
    }
  }

  const handleShowAddLeadModal = (status) => {
    setAddNewLeadModal(status)
  }

  //code for csv file drag and drop
  const onDrop = useCallback((acceptedFiles) => {
    ////////console.log;
    setSelectedFile(acceptedFiles)
    // Handle the uploaded files
    setSheetName(acceptedFiles[0].name.split('.')[0])
    acceptedFiles.forEach((file) => {
      handleFileUpload(file)
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'text/tab-separated-values': ['.tsv'],
    },
  })

  const handleColumnPopoverClick = (event) => {
    setcolumnAnchorEl(event.currentTarget)
  }

  const handleColumnPopoverClose = () => {
    setcolumnAnchorEl(null)
    setSelectedItem(null)
    setShowPopUp(false)
  }

  useEffect(() => {
    //console.log;
  }, [NewColumnsObtained])

  //donot match the custom column with matching array //just compare with the default 5 columns we have
  function ChangeColumnName(UpdatedColumnName) {
    let ColumnToUpdate = UpdateHeader
    console.log('Updated column value passed is', UpdatedColumnName)
    console.log('Update header is', ColumnToUpdate)
    if (UpdatedColumnName == null) {
      console.log('Update columns name are null')
      console.log('New columns obtained list is', NewColumnsObtained)
      let updatedColumns = NewColumnsObtained.map((item) => {
        if (item.ColumnNameInSheet == ColumnToUpdate.ColumnNameInSheet) {
          item.matchedColumn = null
          item.UserFacingName = null
          console.log('Conditional column name is', item)
          return item
        }
        console.log('Non conditional column nam is', item)
        return item
      })
      console.log('Updated columns list is', updatedColumns)
      setNewColumnsObtained(updatedColumns)
    } else {
      console.log('Update columns name exists')
      console.log('New columns obtained from the sheet are', NewColumnsObtained)
      let updatedColumns = NewColumnsObtained.map((item) => {
        if (item.ColumnNameInSheet == ColumnToUpdate.ColumnNameInSheet) {
          // First check if any default column matches this name (prioritize default mappings)
          let matchedColumnKey = Object.keys(LeadDefaultColumns).find(
            (key) =>
              LeadDefaultColumns[key].UserFacingName.toLowerCase() ===
              UpdatedColumnName.toLowerCase(),
          )

          console.log('Matched column keys are', matchedColumnKey)

          if (matchedColumnKey) {
            // Check if this default column is already mapped to another sheet column
            // We need to check the current state, not the old state
            const alreadyExists = NewColumnsObtained.some(
              (existingItem) =>
                existingItem.ColumnNameInSheet !== item.ColumnNameInSheet &&
                existingItem?.matchedColumn?.dbName === matchedColumnKey,
            )

            console.log(
              `Checking if default column '${matchedColumnKey}' is already used...`,
            )
            console.log(
              'Currently mapped columns:',
              NewColumnsObtained.map((col) => ({
                sheet: col.ColumnNameInSheet,
                matched: col.matchedColumn?.dbName,
                custom: col.UserFacingName,
              })),
            )
            console.log(`Already exists: ${alreadyExists}`)

            if (alreadyExists) {
              // Default column already used, treat this as custom column instead
              console.log(
                `Default column ${matchedColumnKey} already used, treating "${UpdatedColumnName}" as custom column`,
              )

              // Check if custom name already exists
              const customNameExists = NewColumnsObtained.some(
                (existingItem) =>
                  existingItem.ColumnNameInSheet !== item.ColumnNameInSheet &&
                  existingItem?.UserFacingName?.toLowerCase() ===
                    UpdatedColumnName.toLowerCase(),
              )

              if (customNameExists) {
                setErrSnack('Column name already exists.')
                setShowErrSnack(true)
                return item // Don't update if already exists
              } else {
                // Create as custom column
                item.matchedColumn = null
                item.UserFacingName = UpdatedColumnName
              }
            } else {
              // Default column is available, use it
              console.log('Default column is available, mapping it.')
              let defaultColumn = { ...LeadDefaultColumns[matchedColumnKey] }
              item.matchedColumn = defaultColumn
              item.UserFacingName = null
            }
          } else {
            // No default column matches, check if custom name already exists
            const customNameExists = NewColumnsObtained.some(
              (existingItem) =>
                existingItem.ColumnNameInSheet !== item.ColumnNameInSheet &&
                existingItem?.UserFacingName?.toLowerCase() ===
                  UpdatedColumnName.toLowerCase(),
            )

            if (customNameExists) {
              setErrSnack('Custom column name already exists.')
              setShowErrSnack(true)
              return item // Don't update if already exists
            } else {
              console.log('Creating custom column:', UpdatedColumnName)
              item.matchedColumn = null
              item.UserFacingName = UpdatedColumnName
            }
          }
        }
        return item
      })
      setNewColumnsObtained(updatedColumns)
    }

    setShowPopUp(false)
    setcolumnAnchorEl(null)
    setSelectedItem(null)
  }

  // function ChangeColumnName(UpdatedColumnName) {
  //   let ColumnToUpdate = UpdateHeader;

  //   if (UpdatedColumnName == null) {
  //     console.log("Log 1 running");
  //     let updatedColumns = NewColumnsObtained.map((item) => {
  //       if (item.ColumnNameInSheet === ColumnToUpdate.ColumnNameInSheet) {
  //         item.matchedColumn = null;
  //         item.UserFacingName = null;
  //       }
  //       return item;
  //     });
  //     setNewColumnsObtained(updatedColumns);
  //   } else {
  //     console.log("Log 2 running");

  //     let matchedColumnKey = Object.keys(LeadDefaultColumns).find((key) =>
  //       LeadDefaultColumns[key].mappings.includes(
  //         UpdatedColumnName.toLowerCase()
  //       )
  //     );

  //     let isAlreadyMapped = matchedColumnKey
  //       ? NewColumnsObtained.some(
  //         (item) =>
  //           item.matchedColumn?.dbName === matchedColumnKey &&
  //           item.ColumnNameInSheet !== ColumnToUpdate.ColumnNameInSheet // skip current row
  //       )
  //       : false;

  //     if (isAlreadyMapped) {
  //       console.warn(`Duplicate match attempt for: ${matchedColumnKey}`);
  //       setWarningModal(true);
  //       setShowPopUp(false);
  //       setcolumnAnchorEl(null);
  //       setSelectedItem(null);
  //       return;
  //     }

  //     let updatedColumns = NewColumnsObtained.map((item) => {
  //       if (item.ColumnNameInSheet === ColumnToUpdate.ColumnNameInSheet) {
  //         if (matchedColumnKey) {
  //           console.log(
  //             `Matched with default column: ${matchedColumnKey} -`,
  //             LeadDefaultColumns[matchedColumnKey]
  //           );
  //           let defaultColumn = {
  //             ...LeadDefaultColumns[matchedColumnKey],
  //             dbName: matchedColumnKey,
  //           };
  //           item.matchedColumn = defaultColumn;
  //           item.UserFacingName = null;
  //         } else {
  //           item.matchedColumn = null;
  //           item.UserFacingName = UpdatedColumnName;
  //         }
  //       }
  //       return item;
  //     });

  //     setNewColumnsObtained(updatedColumns);
  //   }

  //   setShowPopUp(false);
  //   setcolumnAnchorEl(null);
  //   setSelectedItem(null);
  // }

  const validateColumns = () => {
    //console.log;

    // const requiredColumns = ["phone", "firstName", "lastName"];
    const hasFullName =
      NewColumnsObtained.some(
        (col) => col.matchedColumn?.dbName === 'fullName',
      ) ||
      NewColumnsObtained.some(
        (col) => col.matchedColumn?.dbName === 'firstName',
      )
    // NewColumnsObtained.some((col) => col.dbName === "lastName"));
    //////console.log;
    const hasPhone = NewColumnsObtained.some(
      (col) => col.matchedColumn?.dbName === 'phone',
    )
    // //console.log;
    // return hasPhone && hasFullName;

    if (hasPhone && hasFullName) {
      return true
      // handleAddLead();
      // //console.log;
    } else {
      // //console.log;
      if (!hasPhone) {
        setErrSnack(SnackMessageTitles.ErrorMessagePhoneRequiredLeadImport)
        setErrSnackTitle(SnackMessageTitles.ErrorTitlePhoneRequiredLeadImport)
        setShowErrSnack(true)
      }
      if (!hasFullName) {
        setErrSnack(SnackMessageTitles.ErrorMessageFirstNameRequiredLeadImport)
        setErrSnackTitle(
          SnackMessageTitles.ErrorTitleFirstNameRequiredLeadImport,
        )
        setShowErrSnack(true)
      }
    }
    return false
  }

  //File readi
  const handleFileUpload = useCallback(
    (file) => {
      const reader = new FileReader()
      const isCSV = file.name.toLowerCase().endsWith('.csv')
      reader.onload = (event) => {
        const binaryStr = event.target.result
        // const workbook = XLSX.read(binaryStr, { type: "binary" });

        const workbook = XLSX.read(binaryStr, {
          type: 'binary',
          cellDates: false,
          cellText: true, // important
          raw: true, // VERY important for CSVs
        })

        // Extract data from the first sheet
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        // const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header included
        const data = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: isCSV, // This forces Excel dates to be converted to readable format
        })
        if (data.length > 1) {
          // const headers = data[0]; // First row as headers
          // const rows = data.slice(1); // Data without headers

          // let mappedColumns = headers.map((header) => {
          //   // Find matching column from LeadDefaultColumns
          //   let matchedColumnKey = Object.keys(LeadDefaultColumns).find((key) =>
          //     LeadDefaultColumns[key].mappings.includes(header.toLowerCase())
          //   );
          //   console.log(
          //     `Matched column ${header.toLowerCase} with `,
          //     matchedColumnKey
          //   );

          //   return {
          //     ColumnNameInSheet: header, // Original header from the file
          //     matchedColumn: matchedColumnKey
          //       ? { ...LeadDefaultColumns[matchedColumnKey] }
          //       : null, // Default column if matched
          //     UserFacingName: null, // Can be updated manually by user
          //   };
          // });

          const headers = data[0] // First row as headers
          const rows = data.slice(1) // Data without headers

          const usedKeys = new Set() // Keep track of already matched default columns

          let mappedColumns = headers.map((header) => {
            // Find the first unused matching column
            let matchedColumnKey = Object.keys(LeadDefaultColumns).find(
              (key) => {
                return (
                  !usedKeys.has(key) &&
                  LeadDefaultColumns[key].mappings.includes(
                    header.toLowerCase(),
                  )
                )
              },
            )

            if (matchedColumnKey) {
              usedKeys.add(matchedColumnKey) // Mark as used
            }

            // console.log(
            //   `Matched column "${header.toLowerCase()}" with "${matchedColumnKey}"`
            // );

            return {
              ColumnNameInSheet: header, // Original header from the file
              matchedColumn: matchedColumnKey
                ? { ...LeadDefaultColumns[matchedColumnKey] }
                : null, // Default column if matched
              UserFacingName: null, // Can be updated manually by user
            }
          })

          // Transform rows based on the new column mapping
          const transformedData = rows.map((row) => {
            let transformedRow = {}
            // //console.log;

            mappedColumns.forEach((col, index) => {
              transformedRow[col.ColumnNameInSheet] = row[index] || null
              // if (col.matchedColumn) {
              //   transformedRow[col.matchedColumn.dbName] = row[index] || null;
              // } else {
              //   // Handle extra/unmatched columns
              //   if (!transformedRow.extraColumns)
              //     transformedRow.extraColumns = {};
              //   transformedRow.extraColumns[col.ColumnNameInSheet] =
              //     row[index] || null;
              // }
            })
            //console.log;

            return transformedRow
          })

          // Update state
          // console.log("Transformed data (first 10):", JSON.stringify(transformedData.slice(0, 10), null, 2));
          setProcessedData(transformedData)
          setNewColumnsObtained(mappedColumns) // Store the column mappings
        }
      }

      reader.readAsBinaryString(file)
    },
    [LeadDefaultColumns],
  )

  //csv file code ends

  //restrict user to only edit name of csv file

  const handleSheetNameChange = (e) => {
    const baseName = sheetName.split('.')[0] // Get the current base name
    const extension = sheetName.split('.').slice(1).join('.') // Keep the extension
    const newBaseName = e.target.value // Get the user's input for the base name

    // Ensure we keep the extension constant
    // setSheetName(`${newBaseName}.${extension}`);
    setSheetName(e)
  }

  const processEnrichmentPayment = async () => {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }
    const response = await axios.post(
      Apis.processPayment,
      {
        totalLeadsCount: processedData.length,
      },
      {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      },
    )
    if (response.data) {
      return response.data
    }
  }

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      console.log('🔄 [LEADS] Refreshing user data after plan upgrade...')
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        console.log('🔄 [LEADS] Fresh user data received after upgrade')

        // Update Redux with fresh data
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)
        setUser(updatedUserData)
        localStorage.setItem('User', JSON.stringify(updatedUserData))

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [LEADS] Error refreshing user data:', error)
      return false
    }
  }

  const handleAddLead = async (
    enrich = false,
    startIndex = 0,
    resumeData = null,
  ) => {
    let pd = processedData
    let data = []

    // Build full data array
    pd.forEach((item) => {
      let row = { extraColumns: {} }
      NewColumnsObtained.forEach((col) => {
        if (col.matchedColumn) {
          row[col.matchedColumn.dbName] = item[col.ColumnNameInSheet]
        } else if (col.UserFacingName) {
          row.extraColumns[col.UserFacingName] = item[col.ColumnNameInSheet]
        }
      })
      data.push(row)
    })

    setLoader(true)

    if (isEnrichToggle) {
      let enrichmentPayment = await processEnrichmentPayment()
      console.log('enrichmentPayment', enrichmentPayment)

      if (enrichmentPayment.status === false) {
        setShowErrSnack(enrichmentPayment.message)
        setLoader(false)
        return
      }
    }

    // return
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    const ApiPath = Apis.createLead
    const BATCH_SIZE = 250
    const totalBatches = Math.ceil(
      resumeData ? resumeData.data.length : data.length / BATCH_SIZE,
    )
    setUploading(true)
    setCurrentBatch(startIndex)
    setTotalBatches(totalBatches)
    setUploadProgress(Math.floor((startIndex / totalBatches) * 100))
    console.log('data', data)
    console.log(
      `Uploading ${resumeData ? resumeData.data.length : data.length} leads in ${totalBatches} batches of ${BATCH_SIZE}...`,
    )

    // Send custom event to hide dashboard slider
    window.dispatchEvent(
      new CustomEvent('leadUploadStart', { detail: { update: true } }),
    )

    let uploadData = {
      uploading: true,
      currentBatch: startIndex,
      totalBatches: totalBatches,
      sheetName: resumeData?.sheetName || sheetName,
      columnMappings: resumeData?.columnMappings || NewColumnsObtained,
      tagsValue: resumeData?.tags || tagsValue,
      enrich: resumeData?.enrich ?? isEnrichToggle,
      data: data.resumeData ? resumeData.data : data,
    }

    console.log('leads data', uploadData)
    // return
    localStorage.setItem(
      PersistanceKeys.leadUploadState,
      JSON.stringify(uploadData),
    )

    setTimeout(() => {
      setShowUploadLeadModal(false)
      setAddNewLeadModal(false)
    }, 2000)

    await uploadBatchSequence({
      data: resumeData ? resumeData.data : data,
      sheetName: resumeData?.sheetName || sheetName,
      columnMappings: resumeData?.columnMappings || NewColumnsObtained,
      tagsValue: resumeData?.tags || tagsValue,
      enrich: resumeData?.enrich ?? isEnrichToggle,
      startIndex,
      AuthToken,
      setUploading,
      setUploadProgress,
      setCurrentBatch,
      setUserLeads,
      onComplete: () => {
        localStorage.removeItem(PersistanceKeys.leadUploadState)
        setShowUploadLeadModal(false)
        setSelectedFile(null)
        setShowenrichModal(false)
        setIsEnrichToggle(false)
        setShowenrichConfirmModal(false)
        setAddNewLeadModal(false)
        setSetData(true)
        setSuccessSnack('Leads uploaded successfully')
        setShowSuccessSnack(true)
        setLoader(false)
        refreshUserData()

        // Send custom event to show dashboard slider
        window.dispatchEvent(
          new CustomEvent('leadUploadComplete', { detail: { update: true } }),
        )
      },
    })

    window.dispatchEvent(
      new CustomEvent('UpdateCheckList', { detail: { update: true } }),
    )
  }

  //code to check if lead sheets exists or not
  const handleShowUserLeads = (status) => {
    setUserLeads(status)
  }

  const DefaultHeadigs = [
    {
      id: 1,
      title: 'First Name',
    },
    {
      id: 2,
      title: 'Last Name',
    },
    {
      id: 3,
      title: 'Email',
    },
    {
      id: 4,
      title: 'Address',
    },
    {
      id: 5,
      title: 'Phone Number',
    },
  ]

  const styles = {
    headingStyle: {
      fontSize: 17,
      fontWeight: '700',
    },
    subHeadingStyle: {
      fontSize: 15,
      fontWeight: '700',
    },
    paragraph: {
      fontSize: 15,
      fontWeight: '500',
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  function GetDefaultColumnsNotMatched() {
    // Extract all default column dbNames from LeadDefaultColumns
    const allDefaultDbNames = Object.keys(LeadDefaultColumns).map(
      (colKey) => LeadDefaultColumns[colKey].dbName,
    )

    // Extract matched columns from NewColumnsObtained
    const matchedDbNames = NewColumnsObtained.filter(
      (col) => col.matchedColumn !== null,
    ).map((col) => col.matchedColumn.dbName)

    console.log('All default db names:', allDefaultDbNames)
    console.log('Currently matched db names:', matchedDbNames)

    // Find default columns that were NOT matched
    const columnsNotMatched = allDefaultDbNames
      .filter((dbName) => !matchedDbNames.includes(dbName))
      .map((dbName) =>
        Object.values(LeadDefaultColumns).find((col) => col.dbName === dbName),
      )

    console.log('Available default columns for dropdown:', columnsNotMatched)
    return columnsNotMatched
  }

  //code to add new sheet list
  const handleAddSheetNewList = async () => {
    try {
      setShowaddCreateListLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
        inbound: isInbound,
        enrich: isEnrich,
      }
      // //console.log;

      const ApiPath = Apis.addSmartList
      // //console.log;

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // setSheetsList([...SheetsList, response.data.data]);
          setIsInbound(false)
          setUserLeads(response.data.data)
          setSetData(true)
          setAddNewLeadModal(false)
          setShowAddNewSheetModal(false)
          setInputs([
            { id: 1, value: 'First Name' },
            { id: 2, value: 'Last Name' },
            { id: 3, value: 'Phone Number' },
            { id: 4, value: '' },
            { id: 5, value: '' },
            { id: 6, value: '' },
          ])
          setNewSheetName('')
        }
      }
    } catch (error) {
      // console.error("Error occured in adding new list api is:", error);
    } finally {
      setShowaddCreateListLoader(false)
    }
  }

  // const handleToogleChange = async (event) => {
  //   const checked = event.target.checked;

  //   if (checked) {
  //     let user = await getProfileDetails();
  //     if (user) {
  //       console.log("user credits are", user.data.data.enrichCredits);
  //       if (user.data.data.enrichCredits === 0) {
  //         setShowenrichConfirmModal2(true);
  //         return;
  //       }
  //     }
  //   }

  //   setIsEnrich(checked);
  // };

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  return (
    <div className="w-full">
      {/* {
        initialLoader ? (
          // <LeadLoading />
        ) : ( */}
      <>
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

        <LeadProgressBanner
          uploading={uploading}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          uploadProgress={uploadProgress}
        />

        {
          // !uploading && (
          // <div
          //   style={{
          //     position: "absolute",
          //     right: 0,
          //     bottom: 0
          //   }}>
          //   <DashboardSlider
          //     needHelp={false} />
          // </div>
          // )
        }

        {/* <EnrichConfirmModal /> */}

        <div className="w-full">
          {userLeads ? (
            <div className="h-screen w-full">
              <Userleads
                handleShowAddLeadModal={handleShowAddLeadModal}
                handleShowUserLeads={handleShowUserLeads}
                newListAdded={userLeads}
                shouldSet={setData}
                setSetData={setSetData}
                reduxUser={reduxUser}
                uploading={uploading}
              />
            </div>
          ) : (
            <div className="h-screen flex flex-col">
              {reduxUser?.planCapabilities?.maxLeads < 10000000 &&
                reduxUser?.plan?.planId != null && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: '400',
                      color: '#0000080',
                      padding: 20,
                    }}
                  >
                    {`${formatFractional2(reduxUser?.currentUsage?.maxLeads)}/${formatFractional2(reduxUser?.planCapabilities?.maxLeads || 0)} used`}
                  </div>
                )}

              <div className="h-[95%] flex flex-col">
                <div className="flex flex-row items-start justify-center  mt-48 w-full">
                  <Image
                    src={'/assets/placeholder.png'}
                    height={100}
                    width={710}
                    alt="*"
                  />
                </div>
                <div
                  className="mt-12 ms-8 text-center"
                  style={{ fontSize: 30, fontWeight: '700' }}
                >
                  {`Looks like you don't have any leads yet`}
                </div>

                <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                  <div className="">
                    <button
                      className="flex flex-row gap-2 bg-brand-primary text-white h-[50px] w-[177px] rounded-lg items-center justify-center"
                      onClick={() => {
                        setShowAddLeadModal(true)
                      }}
                    >
                      <Image
                        src={'/assets/addManIcon.png'}
                        height={20}
                        width={20}
                        alt="*"
                      />
                      <span style={styles.headingStyle}>Upload Leads</span>
                    </button>
                  </div>
                  <div className="">
                    <button
                      className="flex flex-row gap-2 bg-brand-primary text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                      onClick={() => {
                        setShowAddNewSheetModal(true)
                      }}
                    >
                      <Image
                        src={'/assets/smartlistIcn.svg'}
                        height={24}
                        width={24}
                        alt="*"
                      />
                      <span style={styles.headingStyle}>Create Smartlist</span>
                    </button>
                  </div>
                </div>

                <div
                  className="w-full flex flex-row justify-center mt-4"
                  // style={{
                  //   position: "absolute",
                  //   bottom: "70px",
                  //   left: "50%",
                  //   transform: "translateX(-50%)",
                  // }}
                >
                  <VideoCard
                    duration={(() => {
                      const tutorial = getTutorialByType(
                        HowToVideoTypes.LeadsAndContacts,
                      )
                      return tutorial?.description || '11:27'
                    })()}
                    horizontal={false}
                    playVideo={() => {
                      setIntroVideoModal(true)
                    }}
                    title={
                      getTutorialByType(HowToVideoTypes.LeadsAndContacts)
                        ?.title || 'Learn how to add leads to your CRM'
                    }
                  />
                </div>
              </div>
            </div>
            // </div>
          )}
        </div>

        {/* Modal to add lead */}
        <Modal
          open={showAddLeadModal}
          // onClose={() => setShowAddLeadModal(false)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box
            className="lg:w-6/12 sm:w-9/12 w-10/12"
            sx={{
              height: 'auto',
              bgcolor: 'transparent',
              // p: 2,
              mx: 'auto',
              my: '50vh',
              transform: 'translateY(-50%)',
              borderRadius: 2,
              border: 'none',
              outline: 'none',
            }}
          >
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                  // height: window.innerHeight * 0.6
                }}
              >
                <div className="flex flex-row justify-end">
                  <CloseBtn
                    onClick={() => {
                      setShowAddLeadModal(false)
                      setSelectedFile(null)
                    }}
                  />
                </div>
                <div className="mt-2" style={styles.subHeadingStyle}>
                  Import Leads
                </div>

                {/* CSV File drag and drop logic */}

                <div
                  className="w-10/12 h-[40vh] flex flex-col justify-center "
                  {...getRootProps()}
                  style={{
                    border: '2px dashed #ddd',
                    padding: '20px',
                    textAlign: 'center',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    // width: "430px",
                    margin: 'auto',
                    marginTop: '20px',
                    backgroundColor: '#F4F0F5',
                  }}
                >
                  <input {...getInputProps()} />
                  <div
                    className="w-full flex-row flex justify-center"
                    style={{ marginBottom: '15px' }}
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
                      color: '#888',
                      marginTop: '10px',
                      fontWeight: '500',
                    }}
                  >
                    Works with only a CSV, TSV or Excel files
                  </p>
                  <button className="w-full flex flex-row justify-center mt-6 outline-none">
                    <div className="border border-brand-primary rounded-[10px]">
                      <div
                        className="bg-brand-primary text-white flex flex-row items-center justify-center w-fit-content px-4 rounded-[10px]"
                        style={{
                          fontWeight: '500',
                          fontSize: 12,
                          height: '32px',
                          margin: '2px',
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
                      className="bg-brand-primary text-white flex flex-row items-center justify-center rounded-lg gap-2"
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
                  backgroundColor: '#00000020',
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
                    className="text-brand-primary"
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
          // onClose={() => setShowUploadLeadModal(false)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="lg:w-7/12 sm:w-10/12 w-10/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full h-[90svh]"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <div className="flex flex-row justify-end">
                  <CloseBtn
                    onClick={() => {
                      setShowUploadLeadModal(false)
                    }}
                  />
                </div>
                <div className="mt-2" style={styles.subHeadingStyle}>
                  Leads
                </div>

                <div className="flex flex-row items-center justify-between gap-2 mt-8">
                  <span style={styles.subHeadingStyle}>List Name</span>{' '}
                  <div className="flex flex-row items-center gap-2 ">
                    <Switch
                      checked={isEnrichToggle}
                      // color="#7902DF"
                      // exclusive
                      onChange={(event) => {
                        //console.log;
                        if (isEnrichToggle === true) {
                          setIsEnrichToggle(false)
                        } else {
                          setIsEnrichToggle(true)
                          setShowenrichModal(true)
                        }
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#7902DF',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                          {
                            backgroundColor: 'hsl(var(--brand-primary))',
                          },
                      }}
                    />

                    <Tooltip
                      title="Our AI will search the web to pull all current data on your leads."
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: '#ffffff', // Ensure white background
                            color: '#333', // Dark text color
                            fontSize: '16px',
                            fontWeight: '500',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                          },
                        },
                        arrow: {
                          sx: {
                            color: '#ffffff', // Match tooltip background
                          },
                        },
                      }}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <div style={{ fontSize: 14, fontWeight: '500' }}>
                          Enrich Leads
                        </div>
                        <Image
                          src={'/svgIcons/infoIcon.svg'}
                          height={16}
                          width={16}
                          alt="*"
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <div className="w-full mt-4" style={styles.subHeadingStyle}>
                  <input
                    className="outline-none rounded-lg p-2 w-full"
                    style={{
                      borderColor: '#00000020',
                    }}
                    value={sheetName} // Only show the base name in the input.split(".")[0]
                    // onChange={handleSheetNameChange}
                    onChange={(e) => {
                      const value = e.target.value
                      ////////console.log;
                      setSheetName(value)
                    }}
                    placeholder="Enter sheet name"
                  />
                </div>

                <div style={{ fontWeight: '500', fontSize: 15, marginTop: 20 }}>
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
                  style={{ ...styles.paragraph, color: '#00000070' }}
                >
                  <div className="w-2/12">Matched</div>
                  <div className="w-3/12">Column Header from File</div>
                  <div className="w-3/12">Preview Info</div>
                  <div className="w-3/12">Column Fields</div>
                  <div className="w-1/12">Action</div>
                </div>

                <div
                  className="overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-[55px]"
                  style={{ height: 'calc(100vh - 500px)' }}
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
                              src={'/assets/checkDone.png'}
                              alt="*"
                              height={24}
                              width={24}
                            />
                          ) : (
                            <Image
                              className="ms-4"
                              src={'/assets/warning.png'}
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
                                handleColumnPopoverClose()
                              } else {
                                // if (index > 4) {
                                setSelectedItem(index)
                                ////////console.log;
                                // //console.log;
                                // console.log(
                                //   "Array selected is :",
                                //   NewColumnsObtained
                                // );
                                setUpdateColumnValue(item.columnNameTransformed)
                                handleColumnPopoverClick(event)
                                console.log('dropdown clicking item is', item)
                                setUpdateHeader(item)
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
                            className="underline text-brand-primary w-1/12 outline-none ps-4"
                            onClick={() => {
                              console.log('Clicking crss item is', item)
                              setUpdateHeader(item)
                              setShowDelCol(true)
                              // setUpdateHeader(item)
                              // ChangeColumnName(null)
                            }}
                          >
                            <Image
                              src={'/assets/blackBgCross.png'}
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
                    )
                  })}
                </div>

                <div
                  className=""
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {Loader ? (
                    <CircularProgress size={27} />
                  ) : (
                    <button
                      className="bg-brand-primary text-white rounded-lg h-[50px] w-4/12"
                      onClick={() => {
                        // validateColumns();
                        let validated = validateColumns()

                        console.log('Validated', validated)
                        // return;
                        if (validated) {
                          console.log('Show enrich')
                          handleAddLead()
                        }
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

        {/* Enrich modal */}

        <EnrichModal
          showenrichModal={showenrichModal}
          setShowenrichConfirmModal={(value) => {
            setShowenrichConfirmModal(value)
            // setIsEnrich(value)
          }}
          setShowenrichModal={setShowenrichModal}
          setIsEnrichToggle={setIsEnrichToggle}
          handleAddLead={handleAddLead}
          Loader={Loader}
          processedData={processedData}
          setCreditCost={setCreditCost}
          creditCost={creditCost}
        />
        <EnrichConfirmModal
          showenrichConfirmModal={showenrichConfirmModal}
          setShowenrichConfirmModal={setShowenrichConfirmModal}
          handleAddLead={(value) => {
            if (value === true) {
              console.log('Value passed is', value)
              setIsEnrich(value)
              setShowenrichModal(false)
              setShowenrichConfirmModal(false)
            }
          }}
          processedData={processedData}
          Loader={Loader}
          creditCost={creditCost}
        />

        <ConfirmPerplexityModal
          showConfirmPerplexity={showenrichConfirmModal2}
          setshowConfirmPerplexity={(value) => {
            console.log('value', value)
            setShowenrichConfirmModal2(value)
            setIsEnrich(value)
          }}
          handleEnrichLead={(value) => {
            setIsEnrichToggle(value)
            setShowenrichConfirmModal2(false)
          }}
          loading={Loader}
        />

        {/* Delete Column Modal */}
        <Modal
          open={ShowDelCol}
          onClose={() => setShowDelCol(false)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
          }}
        >
          <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <div className="font-bold text-xl mt-6">
                  Are you sure you want to delete this column
                </div>
                <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                  <button
                    className="w-1/2 font-bold text-xl text-[#6b7280] h-[50px]"
                    onClick={() => {
                      setShowDelCol(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-1/2 text-red font-bold text-xl text-[#6b7280] h-[50px]"
                    onClick={() => {
                      ChangeColumnName(null)
                      setShowDelCol(false)
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
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center', // Ensures the Popover's top right corner aligns with the anchor point
          }}
          PaperProps={{
            elevation: 1, // This will remove the shadow
            style: {
              boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
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
                        ChangeColumnName(item.UserFacingName)
                      }}
                    >
                      {item.UserFacingName}
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              className="underline text-brand-primary p-2 hover:bg-brand-primary/10 w-full text-start"
              onClick={() => {
                setShowPopUp(true)
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
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(5px)",
            },
          }}
        >
          <Box className="lg:w-4/12 sm:w-6/12 w-10/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <div className="flex flex-row justify-end">
                  <CloseBtn
                    onClick={() => {
                      setShowPopUp(false)
                    }}
                  />
                </div>
                <div
                  className="w-full text-center mt-2"
                  style={{ fontSize: 22, fontWeight: '600' }}
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
                    const regex = /^[a-zA-Z0-9_ ]*$/ // Allow only alphabets
                    if (regex.test(e.target.value)) {
                      setUpdateColumnValue(e.target.value)
                    }
                  }}
                  placeholder="Type here..."
                  style={{ border: '1px solid #00000020' }}
                />

                <button
                  className="w-full h-[50px] rounded-xl bg-brand-primary text-white mt-8"
                  style={{
                    ...styles.subHeadingStyle,
                    backgroundColor: !updateColumnValue ? '#00000020' : '',
                    color: !updateColumnValue ? 'black' : '',
                  }}
                  disabled={!updateColumnValue}
                  onClick={() => {
                    // Check if custom column name already exists
                    const customNameExists = NewColumnsObtained?.some(
                      (item) =>
                        item?.UserFacingName?.toLowerCase() ===
                        updateColumnValue?.toLowerCase(),
                    )

                    // Check if trying to use a default column name that's already mapped
                    const defaultColumnExists = Object.keys(
                      LeadDefaultColumns,
                    ).find(
                      (key) =>
                        LeadDefaultColumns[key].UserFacingName.toLowerCase() ===
                        updateColumnValue?.toLowerCase(),
                    )

                    const defaultAlreadyMapped =
                      defaultColumnExists &&
                      NewColumnsObtained?.some(
                        (item) =>
                          item?.matchedColumn?.dbName === defaultColumnExists,
                      )

                    if (customNameExists) {
                      setErrSnack('Custom column name already exists.')
                      setShowErrSnack(true)
                    } else if (defaultAlreadyMapped) {
                      setErrSnackTitle('Column already mapped')
                      setErrSnack(
                        'This default column is already mapped to another column.',
                      )
                      setShowErrSnack(true)
                    } else {
                      console.log('Column name is valid, proceeding...')
                      ChangeColumnName(updateColumnValue)
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
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(2px)",
            },
          }}
        >
          <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                }}
              >
                <div className="font-bold text-xl text-center mt-6 text-red">
                  Column already exists
                </div>
                <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                  <button
                    className="w-full bg-brand-primary font-bold text-white text-xl rounded-xl h-[50px]"
                    onClick={() => {
                      setWarningModal(false)
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
          // Prevent closing on backdrop click and escape key
          onClose={() => {}}
          closeAfterTransition
          disableEscapeKeyDown
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="md:w-[627px] w-8/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-full w-full"
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: '13px',
                  height: '579px',
                }}
              >
                <div className="flex flex-row justify-between">
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: 15,
                    }}
                  >
                    New List
                  </div>
                  <button
                    onClick={() => {
                      setAddNewLeadModal(false)
                    }}
                  >
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div className="flex flex-row items-center w-full justify-center mt-12">
                  <Image
                    src={'/assets/placeholder.png'}
                    height={140}
                    width={490}
                    alt="*"
                  />
                </div>

                <div
                  className="text-center sm:font-24 font-16 mt-12"
                  style={{ fontWeight: '600', fontSize: 29 }}
                >
                  How do you want to add leads?
                </div>

                <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                  <div className="">
                    <button
                      className="flex flex-row gap-2 bg-brand-primary text-white h-[50px] w-[177px] rounded-lg items-center justify-center"
                      onClick={() => {
                        setShowAddLeadModal(true)
                      }}
                    >
                      <Image
                        src={'/assets/addManIcon.png'}
                        height={20}
                        width={20}
                        alt="*"
                      />
                      <span style={styles.headingStyle}>Upload Leads</span>
                    </button>
                  </div>
                  <div className="">
                    <button
                      className="flex flex-row gap-2 bg-brand-primary text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                      onClick={() => {
                        setShowAddNewSheetModal(true)
                      }}
                    >
                      <Image
                        src={'/assets/smartlistIcn.svg'}
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
          videoTitle={
            getTutorialByType(HowToVideoTypes.LeadsAndContacts)?.title ||
            'Learn how to add leads to your CRM'
          }
          videoUrl={
            getVideoUrlByType(HowToVideoTypes.LeadsAndContacts) ||
            HowtoVideos.Leads
          }
          duratuin={11}
        />
        {/* Modal to add custom sheet When no leads are added */}
        <div>
          <Modal
            open={showAddNewSheetModal}
            closeAfterTransition
            BackdropProps={{
              sx: {
                backgroundColor: '#00000020',
                // //backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box
              className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto rounded-3xl h-[70vh]"
              sx={{
                ...styles.modalsStyle,
                scrollbarWidth: 'none',
                backgroundColor: 'white',
              }}
            >
              <div
                className="w-full flex flex-col items-center h-full justify-between"
                style={{ backgroundColor: 'white' }}
              >
                <div className="w-full">
                  <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
                    <div style={{ fontWeight: '500', fontSize: 15 }}>
                      New SmartList
                    </div>
                    <button
                      onClick={() => {
                        setShowAddNewSheetModal(false)
                        setNewSheetName('')
                        setInputs([
                          { id: 1, value: 'First Name' },
                          { id: 2, value: 'Last Name' },
                          { id: 3, value: 'Phone Number' },
                          { id: 4, value: '' },
                          { id: 5, value: '' },
                          { id: 6, value: '' },
                        ])
                      }}
                    >
                      <Image
                        src={'/assets/crossIcon.png'}
                        height={40}
                        width={40}
                        alt="*"
                      />
                    </button>
                  </div>

                  <div className="px-4 w-full">
                    <div className="flex flex-row items-end justify-between mt-6 gap-2">
                      <span style={styles.paragraph}>List Name</span>

                      <div className="flex flex-col items-end ">
                        <div className="">
                          <span>Inbound?</span>
                          <Switch
                            checked={isInbound}
                            // color="#7902DF"
                            // exclusive
                            onChange={(event) => {
                              //console.log;
                              setIsInbound(event.target.checked)
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#7902DF',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                {
                                  backgroundColor: 'hsl(var(--brand-primary))',
                                },
                            }}
                          />
                        </div>

                        {/* <div className="">
                          <span>Enrich Lead?</span>
                          <Switch
                            checked={isEnrich}
                            // color="#7902DF"
                            // exclusive
                            onChange={(event) => {
                              handleToogleChange(event);
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
                        </div> */}
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
                          setNewSheetName(e.target.value)
                        }}
                        placeholder="Enter list name"
                        className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px]"
                        style={{
                          ...styles.paragraph,
                          border: '1px solid #00000020',
                        }}
                      />
                    </div>
                    <div className="mt-8" style={styles.paragraph}>
                      Create Columns
                    </div>
                    <div
                      className="max-h-[30vh] overflow-auto mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                      style={{ scrollbarWidth: 'none' }}
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
                              width: '95%',
                              borderColor: '#00000020',
                            }}
                            placeholder={`Column Name`}
                            value={input.value}
                            readOnly={index < 3}
                            disabled={index < 3}
                            onChange={(e) => {
                              if (index > 2) {
                                handleInputChange(input.id, e.target.value)
                              }
                            }}
                          />
                          <div style={{ width: '5%' }}>
                            {index > 2 && (
                              <button
                                className="outline-none border-none"
                                onClick={() => handleDelete(input.id)}
                              >
                                <Image
                                  src={'/assets/blackBgCross.png'}
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
                    <div style={{ height: '50px' }}>
                      {/*
                                                        inputs.length < 3 && (
                                                            <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-brand-primary rounded-lg underline' style={{
                                                                fontSize: 15,
                                                                fontWeight: "700"
                                                            }}>
                                                                Add New
                                                            </button>
                                                        )
                                                    */}
                      <button
                        onClick={handleAddInput}
                        className="mt-4 p-2 outline-none border-none text-brand-primary rounded-lg underline"
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
                          ? 'bg-brand-primary text-white'
                          : 'bg-btngray text-gray-600 cursor-not-allowed' // Disabled state styling
                      }`}
                      style={{
                        fontWeight: '600',
                        fontSize: 16.8,
                      }}
                      onClick={handleAddSheetNewList}
                      disabled={newSheetName == null || newSheetName === ''}
                    >
                      Create List
                    </button>
                  )}
                </div>
              </div>
            </Box>
          </Modal>
        </div>
      </>
      {/* )
      } */}
    </div>
  )
}

export default Leads1
