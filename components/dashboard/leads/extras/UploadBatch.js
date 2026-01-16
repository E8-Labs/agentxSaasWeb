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
  const ApiPath = Apis.createLead
  const BATCH_SIZE = 250
  const totalBatches = Math.ceil(data.length / BATCH_SIZE)

  for (let batchIndex = startIndex; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE
    const end = start + BATCH_SIZE
    const batchLeads = data.slice(start, end)

    try {
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

      if (response?.data?.status === true) {
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

        console.log('batch uploaded at index', nextIndex)

        if (setUserLeads) {
          localStorage.setItem('userLeads', JSON.stringify(response.data.data))
          setUserLeads(response.data.data)
        }
      } else {
        // Handle API error response - use message from response.data.message
        const errorMessage = response.data?.message || `Error in batch ${batchIndex + 1}`
        console.error(`Error in batch ${batchIndex + 1}:`, errorMessage)
        
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
      console.error(`Upload failed on batch ${batchIndex + 1}`, err)
      
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
  localStorage.removeItem(PersistanceKeys.leadUploadState)
  setUploading(false)
  if (onComplete) onComplete()
}
