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
        console.error(`Error in batch ${batchIndex + 1}`)
        break
      }
    } catch (err) {
      console.error(`Upload failed on batch ${batchIndex + 1}`, err)
      break
    }
  }

  // Done
  localStorage.removeItem(PersistanceKeys.leadUploadState)
  setUploading(false)
  if (onComplete) onComplete()
}
