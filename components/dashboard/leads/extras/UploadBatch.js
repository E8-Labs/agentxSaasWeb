import axios from 'axios'

import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

export const uploadBatchSequence = async ({
  data,
  sheetName,
  columnMappings,
  tagsValue,
  enrich,
  startIndex,
  AuthToken,
  setUploading,
  setUploadProgress,
  setCurrentBatch,
  setUserLeads,
  onComplete,
  onError,
}) => {
  console.log('🔵 [UPLOAD_BATCH] uploadBatchSequence called with:', {
    dataLength: data?.length,
    sheetName,
    columnMappingsCount: columnMappings?.length,
    tagsValue,
    enrich,
    startIndex,
    hasAuthToken: !!AuthToken,
    hasOnComplete: !!onComplete,
    hasOnError: !!onError,
  })

  const ApiPath = Apis.createLead
  const BATCH_SIZE = 250
  const totalBatches = Math.ceil(data.length / BATCH_SIZE)

  console.log('🔵 [UPLOAD_BATCH] Calculated values:', {
    ApiPath,
    BATCH_SIZE,
    totalBatches,
    dataLength: data.length,
    startIndex,
  })

  if (totalBatches === 0) {
    console.warn('⚠️ [UPLOAD_BATCH] No batches to process! data.length =', data.length)
  }

  console.log('🔵 [UPLOAD_BATCH] Starting loop from batchIndex', startIndex, 'to', totalBatches - 1)

  for (let batchIndex = startIndex; batchIndex < totalBatches; batchIndex++) {
    console.log(`🔵 [UPLOAD_BATCH] Processing batch ${batchIndex + 1}/${totalBatches}`)
    const start = batchIndex * BATCH_SIZE
    const end = start + BATCH_SIZE
    const batchLeads = data.slice(start, end)

    console.log(`🔵 [UPLOAD_BATCH] Batch ${batchIndex + 1} details:`, {
      start,
      end,
      batchLeadsCount: batchLeads.length,
      sheetName,
      enrich,
      tagsValueCount: tagsValue?.length || 0,
    })

    try {
      console.log(`🔵 [UPLOAD_BATCH] Making API call for batch ${batchIndex + 1} to:`, ApiPath)
      console.log(`🔵 [UPLOAD_BATCH] Request payload:`, {
        sheetName,
        leadsCount: batchLeads.length,
        columnMappingsCount: columnMappings?.length,
        tagsValue,
        enrich,
      })

      const response = await axios.post(
        ApiPath,
        {
          sheetName,
          leads: batchLeads,
          columnMappings,
          tags: tagsValue,
          enrich,
        },
        {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
            'Content-Type': 'application/json',
          },
        },
      )

      console.log(`🔵 [UPLOAD_BATCH] API response for batch ${batchIndex + 1}:`, {
        status: response?.status,
        dataStatus: response?.data?.status,
        hasData: !!response?.data,
      })

      if (response?.data?.status === true) {
        console.log(`✅ [UPLOAD_BATCH] Batch ${batchIndex + 1} succeeded`)
        const nextIndex = batchIndex + 1
        setCurrentBatch(nextIndex)
        window.dispatchEvent(
          new CustomEvent('UpdateCheckList', { detail: { update: true } }),
        )
        setUploadProgress(Math.floor((nextIndex / totalBatches) * 100))
        localStorage.setItem(
          PersistanceKeys.leadUploadState,
          JSON.stringify({
            uploading: true,
            currentBatch: nextIndex,
            totalBatches,
            data,
            sheetName,
            columnMappings,
            tagsValue,
            enrich,
          }),
        )

        if (setUserLeads) {
          localStorage.setItem('userLeads', JSON.stringify(response.data.data))
          setUserLeads(response.data.data)
          console.log(`🔵 [UPLOAD_BATCH] Updated userLeads state`)
        }
      } else {
        // Handle API error response - use message from response.data.message
        const errorMessage = response.data?.message || `Error in batch ${batchIndex + 1}`
        console.error(`❌ [UPLOAD_BATCH] Error in batch ${batchIndex + 1}:`, errorMessage)
        console.error(`❌ [UPLOAD_BATCH] Response data:`, response.data)
        
        // Done
        localStorage.removeItem(PersistanceKeys.leadUploadState)
        setUploading(false)
        
        if (onError) {
          onError({
            message: errorMessage,
            title: response.data?.message ? null : 'Error Uploading Leads',
            batchIndex: batchIndex + 1,
            totalBatches,
          })
        }
        return
      }
    } catch (err) {
      console.error(`❌ [UPLOAD_BATCH] Upload failed on batch ${batchIndex + 1}`, err)
      console.error(`❌ [UPLOAD_BATCH] Error details:`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        hasRequest: !!err.request,
      })
      
      // Extract error message from response if available - prioritize response.data.message
      let errorMessage = `Failed to upload batch ${batchIndex + 1}. Please try again.`
      let errorTitle = 'Error Uploading Leads'
      
      if (err.response) {
        // Server responded with error status - prioritize message from response.data.message
        const status = err.response.status
        
        // Always use response.data.message if it exists, otherwise try error field, then fallback
        if (err.response.data?.message) {
          errorMessage = err.response.data.message
          // When API provides a message, don't set a title so the message is the focus
          errorTitle = null
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error
          errorTitle = null
        } else {
          // Only set title when we don't have a message from API
          if (status === 403) {
            errorTitle = 'Access Forbidden'
            errorMessage = 'You do not have permission to add leads. Please contact your administrator.'
          } else if (status === 401) {
            errorTitle = 'Unauthorized'
            errorMessage = 'Your session has expired. Please log in again.'
          } else if (status === 400) {
            errorTitle = 'Invalid Request'
            errorMessage = 'The request was invalid. Please check your data and try again.'
          } else if (status >= 500) {
            errorTitle = 'Server Error'
            errorMessage = 'A server error occurred. Please try again later.'
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorTitle = 'Network Error'
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else {
        // Error setting up the request
        errorMessage = err.message || errorMessage
      }
      
      // Done
      localStorage.removeItem(PersistanceKeys.leadUploadState)
      setUploading(false)
      
      if (onError) {
        onError({
          message: errorMessage,
          title: errorTitle,
          batchIndex: batchIndex + 1,
          totalBatches,
          error: err,
        })
      }
      return
    }
  }

  // Done
  console.log('✅ [UPLOAD_BATCH] All batches completed successfully!')
  console.log('🔵 [UPLOAD_BATCH] Cleaning up and calling onComplete')
  localStorage.removeItem(PersistanceKeys.leadUploadState)
  setUploading(false)
  if (onComplete) {
    console.log('🔵 [UPLOAD_BATCH] Calling onComplete callback')
    onComplete()
  } else {
    console.warn('⚠️ [UPLOAD_BATCH] No onComplete callback provided!')
  }
}
