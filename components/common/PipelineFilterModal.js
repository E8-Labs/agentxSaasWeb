'use client'

import { Box, Modal } from '@mui/material'
import React from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

/**
 * Reusable pipeline team-member filter modal.
 * Used by dashboard Pipeline1 and admin AdminPipeline1.
 *
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Called when modal should close
 * @param {Array<{ id: number|string, name: string, email?: string }>} filterTeamMembers - List of team members to show
 * @param {Array<number|string>} selectedTeamMemberIds - Currently selected member IDs
 * @param {function(memberId: number|string)} onToggleMember - Toggle selection of a member
 * @param {function} onApply - Called when "Apply Filter" is clicked (parent should close and refetch)
 * @param {object} [selectedUser] - Optional; passed from admin pipeline for context (e.g. API calls)
 */
function PipelineFilterModal({
  open,
  onClose,
  filterTeamMembers = [],
  selectedTeamMemberIds = [],
  onToggleMember,
  onApply,
  selectedUser = null,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: {
          backgroundColor: '#00000020',
        },
      }}
    >
      <Box
        className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh] rounded-[13px]"
        sx={{
          height: 'auto',
          bgcolor: 'transparent',
          p: 0,
          mx: 'auto',
          my: '50vh',
          transform: 'translateY(-55%)',
          borderRadius: '13px',
          border: 'none',
          outline: 'none',
          scrollbarWidth: 'none',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col w-full">
          <div
            className="w-full rounded-[13px] overflow-hidden"
            style={{
              backgroundColor: '#ffffff',
              padding: 20,
              paddingInline: 30,
              borderRadius: '13px',
            }}
          >
            <div className="flex flex-row items-center justify-between mb-4">
              <div style={{ fontWeight: '700', fontSize: 22 }}>
                Filter
              </div>
              <CloseBtn onClick={onClose} />
            </div>

            <div
              className="mt-4"
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #00000020',
                borderRadius: '13px',
                padding: '10px',
              }}
            >
              {filterTeamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No team members available
                </div>
              ) : (
                filterTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-row items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => onToggleMember(member.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeamMemberIds.includes(member.id)}
                      onChange={() => onToggleMember(member.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-gray-900">
                        {member.name}
                      </span>
                      {member.email && (
                        <span className="text-sm text-gray-500">
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="w-full mt-4">
              <button
                onClick={onApply}
                className="h-[50px] rounded-xl text-white w-full bg-brand-primary"
                style={{
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default PipelineFilterModal
