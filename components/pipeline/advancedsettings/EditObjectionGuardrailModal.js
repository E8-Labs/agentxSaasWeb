import { Box, CircularProgress, Modal, TextareaAutosize } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

import { GreetingTagInput } from '../tagInputs/GreetingTagInput'
import { PromptTagInput } from '../tagInputs/PromptTagInput'

const EditModal = ({
  isOpen,
  onClose,
  handleUpdateArray,
  selectedItem,
  editName,
  kycsData,
  uniqueColumns,
  scrollOffset,
}) => {
  const [updateTitle, setUpdatedTitle] = useState('')
  const [updatedDescription, setUpdatedDescription] = useState('')
  //loader
  const [updateLoader, setUpdateLoader] = useState(false)

  useEffect(() => {
    if (selectedItem) {
      setUpdatedTitle(selectedItem.title)
      setUpdatedDescription(selectedItem.description)
    }
  }, [])

  const handleUpdate = async () => {
    try {
      setUpdateLoader(true)
      const Token = AuthToken()
      const ApiPath = Apis.UpdateAdvanceSetting
      const ApiData = {
        title: updateTitle,
        description: updatedDescription,
        id: selectedItem.id,
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setUpdateLoader(false)
        if (response.data.status === true) {
          if (editName === 'Guardrails') {
            const G = localStorage.getItem(PersistanceKeys.GuadrailsList)

            if (G) {
              const P = JSON.parse(G)
              // console.log("List of guadrails", P);

              // Map over array and update matching item
              const updatedP = P.map((item) => {
                if (item.id === selectedItem.id) {
                  // Update title and description
                  return {
                    ...item,
                    title: updateTitle,
                    description: updatedDescription,
                  }
                } else {
                  // No change for other items
                  return item
                }
              })

              // Save updated array back to localStorage
              localStorage.setItem(
                PersistanceKeys.GuadrailsList,
                JSON.stringify(updatedP),
              )
            }
          } else if (editName === 'Objection') {
            const O = localStorage.getItem(PersistanceKeys.ObjectionsList)
            if (O) {
              const P = JSON.parse(O)
              // console.log("List of Objections", P);

              const updatedP = P.map((item) => {
                if (item.id === selectedItem.id) {
                  // Update title and description
                  return {
                    ...item,
                    title: updateTitle,
                    description: updatedDescription,
                  }
                } else {
                  // Keep other items unchanged
                  return item
                }
              })

              // Save updated array back to localStorage
              localStorage.setItem(
                PersistanceKeys.ObjectionsList,
                JSON.stringify(updatedP),
              )
            }
          }
        } else if (response.data.status === false) {}
        handleUpdateArray(response.data)
      }
    } catch (error) {
      setUpdateLoader(false)
      console.error('Error occured in update advancesetting api is', error)
    }
  }

  const styles = {
    heading: {
      fontWeight: '600',
      fontSize: 17,
    },
    inputStyle: {
      fontWeight: '500',
      fontSize: 15,
    },
  }
//Edit modal for Objections and Guardrails | Advanced Settings
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{ timeout: 250, sx: { backgroundColor: '#00000099' } }}
    >
      <Box className="w-[650px] max-w-[90vw]" sx={{ outline: 'none' }}>
        <div
          className="w-full max-h-[90vh] flex flex-col overflow-hidden rounded-[12px] bg-white"
          style={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
          }}
        >
          <div
            className="flex flex-row items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <div className="text-[16px] font-semibold text-black">
              {`Edit ${editName}`}
            </div>
            <button
              type="button"
              className="rounded flex items-center justify-center w-10 h-10 bg-transparent hover:bg-black/5 transition-colors duration-150 ease-out"
              onClick={onClose}
              aria-label="Close"
            >
              <Image alt="Close" src={'/assets/cross.png'} height={16} width={16} />
            </button>
          </div>

          <div className="firecrawl-scrollbar flex-1 overflow-auto px-5 py-5">
            <div className="text-[13px] font-medium text-black/70">
              {editName === 'Objection' ? "What's the objection" : "What's the guardrail"}
            </div>
            <input
              style={styles.inputStyle}
              className="mt-2 h-[42px] w-full rounded-lg border border-black/10 bg-white px-3 text-[14px] font-normal text-black/80 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary"
              placeholder={`Edit ${editName} title`}
              value={updateTitle}
              onChange={(e) => {
                setUpdatedTitle(e.target.value)
              }}
            />

            <div className="mt-4 text-[13px] font-medium text-black/70">
              Response
            </div>
          {/*
                        <GreetingTagInput
                            greetTag={updatedDescription}
                            kycsList={kycsData}
                            uniqueColumns={uniqueColumns}
                            tagValue={(text) => {
                                setUpdatedDescription(text);
                            }}
                            scrollOffset={scrollOffset}
                        />
                    */}

          <PromptTagInput
            promptTag={updatedDescription}
            kycsList={kycsData}
            uniqueColumns={uniqueColumns}
            tagValue={setUpdatedDescription}
            scrollOffset={scrollOffset}
            showSaveChangesBtn={updatedDescription}
            from={editName}
            isEdit={true}
            saveUpdates={async () => {
              // await updateAgent();
              // setShowObjectionsSaveBtn(false);
              // setOldObjective(objective);
            }}
          />

          {/*
                        <TextareaAutosize
                            maxRows={5}
                            className="outline-none focus:outline-none focus:ring-0 p-2 w-full"
                            style={styles.inputStyle}
                            placeholder={`Edit ${editName} description`}
                            value={updatedDescription}
                            onChange={(e) => {
                                setUpdatedDescription(e.target.value);
                            }}
                        />
                    */}
        </div>

          <div
            className="flex flex-row items-center justify-between gap-2 px-5 py-4"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              className="h-[40px] rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98]"
              onClick={onClose}
            >
              Cancel
            </button>
            {updateLoader ? (
              <div className="h-[40px] flex flex-row items-center justify-center px-4">
                <CircularProgress size={18} sx={{ color: 'hsl(var(--brand-primary))' }} />
              </div>
            ) : (
              <button
                type="button"
                className="h-[40px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98]"
                onClick={() => {
                  handleUpdate({
                    title: updateTitle,
                    description: updatedDescription,
                  })
                }}
              >
                Update
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default EditModal
