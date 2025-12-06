import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

const DelConfirmationPopup = ({
  showDeleteModal,
  handleClose,
  handleDelete,
  delLoading,
  selectedPlan,
}) => {
  return (
    <div>
      {/* Code to del user */}
      <Modal
        open={showDeleteModal}
        onClose={handleClose}
        BackdropProps={{
          timeout: 200,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
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
                <div style={{ fontWeight: '500', fontSize: 17 }}>
                  Delete Plan
                </div>
                <div
                  style={{
                    direction: 'row',
                    display: 'flex',
                    justifyContent: 'end',
                  }}
                >
                  <CloseBtn onClick={handleClose} />
                </div>
              </div>

              <div className="mt-6">
                <div>
                  {selectedPlan.subscriberCount > 0 ? (
                    <div style={{ fontWeight: '500', fontSize: 15 }}>
                      Cannot delete plan with active subscriptions. <br />
                      Please move subscribers to a new plan before deleting this
                      plan.
                      {/*Delete are you sure and this cannot be undone*/}
                    </div>
                  ) : (
                    <div style={{ fontWeight: '500', fontSize: 15 }}>
                      Are you sure you want to delete {selectedPlan.title}.
                      This cannot be undone.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!selectedPlan.subscriberCount > 0 && (
              <div className="mt-4 flex flex-row items-center gap-4 mt-6">
                <button
                  onClick={handleClose}
                  className="outline-none w-1/2 border"
                  style={{
                    height: '50px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '20',
                  }}
                >
                  Cancel
                </button>
                <div className="w-1/2">
                  {delLoading ? (
                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <button
                      className={`outline-none ${selectedPlan.subscriberCount > 0 ? 'bg-btngray' : 'bg-red'}`}
                      style={{
                        color:
                          selectedPlan.subscriberCount > 0 ? 'black' : 'white',
                        height: '50px',
                        borderRadius: '10px',
                        width: '100%',
                        fontWeight: 600,
                        fontSize: '20',
                      }}
                      onClick={handleDelete}
                      disabled={selectedPlan.subscriberCount > 0}
                    >
                      Yes! Delete Plan
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default DelConfirmationPopup

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
