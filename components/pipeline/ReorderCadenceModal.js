import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Box, Modal, Tooltip } from '@mui/material'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import React, { useCallback, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'

import { GripVertical } from 'lucide-react'
import Image from 'next/image'

// Avoid transform on the content Box so position:fixed drag preview is relative to viewport and follows cursor
const MODAL_STYLES = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}

/**
 * Modal to reorder cadence steps for a stage. Supports drag-and-drop and up/down buttons.
 * @param {boolean} open - Whether the modal is open
 * @param {() => void} onClose - Called when the modal is closed
 * @param {string} stageTitle - Title of the stage (e.g. "CSV2")
 * @param {Array<{ id: number, waitTimeDays: number, waitTimeHours: number, waitTimeMinutes: number, ... }>} rows - List of cadence steps
 * @param {(stageIndex: number, fromIndex: number, toIndex: number) => void} onReorderRows - Called when order changes (stageIndex, fromIndex, toIndex)
 * @param {number} stageIndex - Index of the stage being edited
 * @param {(row: object) => string} stepActionDisplayText - Returns display text for a step (e.g. "Make Call", "Send Email")
 */
const ReorderCadenceModal = ({
  open,
  onClose,
  stageTitle,
  rows,
  onReorderRows,
  stageIndex,
  stepActionDisplayText,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }, [])

  const handleDragEnd = useCallback(
    (result) => {
      setIsDragging(false)
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      const { source, destination } = result
      if (!destination || source.index === destination.index) return
      onReorderRows?.(stageIndex, source.index, destination.index)
    },
    [stageIndex, onReorderRows],
  )

  const list = rows ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 300,
        sx: { backgroundColor: 'rgba(0,0,0,0.1)' },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 24,
          outline: 'none',
        }}
        aria-hidden
      >
        <Box
          className="w-8/12 sm:w-5/12 md:w-4/12 lg:w-3/12"
          sx={{
            ...MODAL_STYLES.modalsStyle,
            backgroundColor: 'white',
            maxHeight: '80vh',
            overflow: isDragging ? 'visible' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ width: '100%', flexShrink: 0 }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {stageTitle != null && stageTitle !== '' && (
                <div style={{ fontWeight: '700', fontSize: 22}}>
                  {stageTitle}
                </div>
              )}
              <CloseBtn onClick={onClose} />
            </div>
            <div  style={{ fontWeight: '500', fontSize: 16, color: '#00000080', marginTop: 2 }}>
              Reorder steps
            </div>
          </div>
          <div
            className="mt-4 flex-1"
            style={{
              overflow: isDragging ? 'visible' : 'auto',
              scrollbarWidth: 'thin',
              minHeight: 120,
            }}
          >
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <Droppable droppableId="reorder-cadence-list">
                {(droppableProvided) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                  >
                    {list.map((row, rowIndex) => (
                      <Draggable
                        key={row.id}
                        draggableId={`reorder-row-${stageIndex}-${row.id}`}
                        index={rowIndex}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex flex-row items-center justify-between gap-3 py-2 px-3 rounded-lg border border-[#00000015] mb-2 select-none"
                            style={{
                              ...provided.draggableProps.style,
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              backgroundColor: snapshot.isDragging
                                ? '#fff'
                                : rowIndex === 0
                                  ? 'hsl(var(--brand-primary) / 0.06)'
                                  : '#fafafa',
                              ...(snapshot.isDragging
                                ? {
                                  zIndex: 99999,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                  opacity: 1,
                                }
                                : {}),
                            }}
                          >
                            <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                              <div
                                className="p-1 rounded hover:bg-black/10 cursor-grab active:cursor-grabbing touch-none"
                                aria-label="Drag to reorder"
                              >
                                <Image
                                  src={'/assets/list.png'}
                                  height={6}
                                  width={16}
                                  alt="Drag handle"
                                />
                              </div>
                              <div style={{ fontSize: 14, fontWeight: '500', flex: 1 }}>
                                Wait {row.waitTimeDays}d {row.waitTimeHours}h {row.waitTimeMinutes}m, then{' '}
                                {stepActionDisplayText?.(row) ?? '—'}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Box>
      </div>
    </Modal>
  )
}

export default ReorderCadenceModal
