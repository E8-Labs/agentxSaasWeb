import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const RenameLead = ({
  showRenameLeadPopup,
  handleClose,
  firstNamePassed = '',
  lastNamePassed = '',
  renameLeadLoader,
  handleRenameLead,
  overlayZIndex = 9999, // elevated (e.g. 5020) when opened from drawer; normal pages use 9999
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    setFirstName((firstNamePassed ?? '').trim())
    setLastName((lastNamePassed ?? '').trim())
  }, [firstNamePassed, lastNamePassed])

  //styles list
  const styles = {
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <Modal
      open={showRenameLeadPopup}
      onClose={() => {
        handleClose()
      }}
      slotProps={{
        root: {
          style: {
            zIndex: overlayZIndex,
          },
        },
      }}
      sx={{ zIndex: overlayZIndex }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          zIndex: overlayZIndex,
        },
      }}
    >
      <Box
        className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
        sx={{ ...styles.modalsStyle, backgroundColor: 'white', zIndex: overlayZIndex, position: 'relative' }}
      >
        <div style={{ width: '100%' }}>
          <div
            className="max-h-[60vh] overflow-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            <div
              style={{
                width: '100%',
                direction: 'row',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* <div style={{ width: "20%" }} /> */}
              <div style={{ fontWeight: '700', fontSize: 22 }}>
                Rename Lead
              </div>
              <div
                style={{
                  direction: 'row',
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <button
                  onClick={() => {
                    handleClose()
                  }}
                  className="outline-none"
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="rename-first-name" className="font-semibold text-sm">
                  First name
                </Label>
                <Input
                  id="rename-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className={cn(
                    'h-12 rounded-lg border-2 border-input bg-transparent outline-none',
                    'focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                    'focus:border-brand-primary focus-visible:border-brand-primary'
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-last-name" className="font-semibold text-sm">
                  Last name
                </Label>
                <Input
                  id="rename-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className={cn(
                    'h-12 rounded-lg border-2 border-input bg-transparent outline-none',
                    'focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                    'focus:border-brand-primary focus-visible:border-brand-primary'
                  )}
                />
              </div>
            </div>
          </div>

          {renameLeadLoader ? (
            <div className="flex flex-row iems-center justify-center w-full mt-4">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className={cn(
                'mt-4 outline-none w-full h-[50px] rounded-[10px] font-semibold text-base',
                'bg-brand-primary text-white',
                'focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2',
                'hover:opacity-90 transition-opacity'
              )}
              onClick={() => handleRenameLead(firstName.trim(), lastName.trim())}
            >
              Update
            </button>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default RenameLead
