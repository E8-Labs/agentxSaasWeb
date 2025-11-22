'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { useEffect } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

const Page = () => {
  const params = useParams()
  const id = params.id

  const [status, setStatus] = useState('')
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recordingLoader, setRecordingLoader] = useState(true)
  const [screenWidth, setScreenWidth] = useState(null)

  useEffect(() => {
    console.log('id is', id)
    const D = localStorage.getItem('User')
    if (D) {
      getRecordings()
    } else {
      setStatus('not-loggedin')
      setRecordingLoader(false)
    }
    setScreenWidth(window.innerWidth)
  }, [id])

  const getRecordings = async () => {
    try {
      const ApiPath = `${Apis.getCallRecordings}/${id}` //1735685636264x683829823473498800
      const token = AuthToken()
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response) {
        const ResponseData = response.data
        console.log('response is', response)
        if (ResponseData.status === true) {
          const data = ResponseData.data
          console.log('data is', data)
          setRecordingUrl(ResponseData.data.recordingUrl)
        }
        setRecordingLoader(false)
      }
    } catch (error) {
      setRecordingLoader(false)
      console.log('error is', error)
      setStatus(error.response.status)
      if (error.response?.status === 404) {
        const errMsg = error.response.data?.error || ''
        if (errMsg === 'Call not found') {
          setStatus('not_found')
        } else if (errMsg === 'Call deleted') {
          setStatus('deleted')
        } else {
          setStatus('unknown_404')
        }
      } else {
        setStatus('error')
      }
    }
  }

  //styles
  const styles = {
    errorText: {
      fontSize: screenWidth > 640 ? '22px' : '18px',
      fontWeight: '600',
      color: '#000000',
    },
  }

  return (
    <div>
      {recordingLoader ? (
        <div className="flex flex-col items-center justify-center h-screen w-full">
          {screenWidth > 640 ? (
            <Image
              src={'/assets/recordingLoader.png'}
              alt="*"
              width={450}
              height={450}
            />
          ) : (
            <Image
              src={'/assets/recordingLoader.png'}
              alt="*"
              width={221}
              height={221}
            />
          )}
          <div
            className="text-center mt-4"
            style={{
              fontSize: screenWidth > 640 ? '22px' : '18px',
              fontWeight: '600',
              color: '#000000',
            }}
          >
            Your call recording is loading ...
          </div>
        </div>
      ) : (
        <div>
          {status === 'not-loggedin' ? (
            <div className="flex flex-col items-center justify-center h-screen w-full">
              <div
                className="text-center"
                style={{
                  fontSize: screenWidth > 640 ? '22px' : '18px',
                  fontWeight: '600',
                  color: '#000000',
                }}
              >
                You are not logged in.
              </div>
              <button
                className="bg-purple mt-4 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                Login to continue
              </button>
            </div>
          ) : status === 'not_found' ? (
            <div className="flex flex-col items-center justify-center h-screen w-full">
              {screenWidth > 640 ? (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={450}
                  height={450}
                />
              ) : (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={221}
                  height={221}
                />
              )}
              <div
                className="text-center mt-4"
                style={{
                  fontSize: screenWidth > 640 ? '22px' : '18px',
                  fontWeight: '600',
                  color: '#000000',
                }}
              >
                Your call was not found.
              </div>
            </div>
          ) : status === 'deleted' ? (
            <div className="flex flex-col items-center justify-center h-screen w-full">
              {screenWidth > 640 ? (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={450}
                  height={450}
                />
              ) : (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={221}
                  height={221}
                />
              )}
              <div
                className="text-center mt-4"
                style={{
                  fontSize: screenWidth > 640 ? '22px' : '18px',
                  fontWeight: '600',
                  color: '#000000',
                }}
              >
                Your call was deleted.
              </div>
            </div>
          ) : status === 'unknown_404' ? (
            <div className="flex flex-col items-center justify-center h-screen w-full">
              {screenWidth > 640 ? (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={450}
                  height={450}
                />
              ) : (
                <Image
                  src={'/assets/recordingLoader.png'}
                  alt="*"
                  width={221}
                  height={221}
                />
              )}
              <div
                className="text-center mt-4"
                style={{
                  fontSize: screenWidth > 640 ? '22px' : '18px',
                  fontWeight: '600',
                  color: '#000000',
                }}
              >
                Call recording not available.
              </div>
            </div>
          ) : status === 'error' ? (
            <div style={styles.errorText}>
              Something went wrong. Please try again.
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-screen w-full">
              {recordingUrl ? (
                <div>
                  <audio src={recordingUrl} controls />
                </div>
              ) : (
                <div style={styles.errorText}>No recording found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Page
