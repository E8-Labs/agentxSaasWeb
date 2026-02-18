'use client'

import React, { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

import DropdownCn from './extras/DropdownCn'

const SelectStageDropdown = ({
  selectedStage,
  handleStageChange,
  stagesList,
  updateLeadStage,
  chevronIcon = ChevronDown,
  pipelineTitle = null,
  textSize = null,
}) => {
  const options = useMemo(
    () =>
      (stagesList || []).map((stage) => ({
        label: stage.stageTitle,
        value: stage.stageTitle,
        id: stage.id,
        ...stage,
        onSelect: () => updateLeadStage(stage),
      })),
    [stagesList, updateLeadStage],
  )

  const label =
    typeof selectedStage === 'object'
      ? selectedStage?.stageTitle || 'Select'
      : selectedStage || (stagesList?.length ? 'Select' : 'No Stage')

  // Find current stage index and get next stage
  const handleNextStage = () => {
    // #region agent log
    //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:32',message:'handleNextStage called',data:{hasStagesList:!!stagesList,stagesListLength:stagesList?.length||0,hasSelectedStage:!!selectedStage,selectedStage:selectedStage,selectedStageType:typeof selectedStage},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (!stagesList || stagesList.length === 0 || !selectedStage) {
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:36',message:'handleNextStage early return - missing data',data:{hasStagesList:!!stagesList,stagesListLength:stagesList?.length||0,hasSelectedStage:!!selectedStage},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return
    }

    // Handle both object and string selectedStage
    let currentStage = null
    if (typeof selectedStage === 'object') {
      currentStage = selectedStage
    } else {
      // If selectedStage is a string (stageTitle), find the stage object
      currentStage = stagesList.find((stage) => stage.stageTitle === selectedStage)
    }

    if (!currentStage || !currentStage.id) {
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:48',message:'handleNextStage early return - no currentStage found',data:{selectedStage:selectedStage,currentStage:currentStage},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return
    }

    const currentIndex = stagesList.findIndex((stage) => stage.id === currentStage.id)
    // #region agent log
    //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:52',message:'handleNextStage - found current index',data:{currentStageId:currentStage.id,currentIndex:currentIndex,stagesListLength:stagesList.length,isLastStage:currentIndex===stagesList.length-1},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (currentIndex === -1 || currentIndex === stagesList.length - 1) {
      // Already at last stage or stage not found
      // #region agent log
      //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:55',message:'handleNextStage early return - at last stage or not found',data:{currentIndex:currentIndex,stagesListLength:stagesList.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return
    }

    const nextStage = stagesList[currentIndex + 1]
    // #region agent log
    //fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StageSelectDropdown.js:61',message:'handleNextStage - calling updateLeadStage',data:{nextStage:nextStage,hasUpdateLeadStage:!!updateLeadStage},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    if (nextStage && updateLeadStage) {
      updateLeadStage(nextStage)
    }
  }

  return (
    <DropdownCn
      label={label}
      options={options}
      onSelect={(opt) => handleStageChange?.(opt)}
      align="end"
      chevronIcon={chevronIcon}
      onChevronClick={(opt) => handleStageChange?.(opt)}
      title={pipelineTitle}
      textSize={textSize}
    />
  )
}

export default SelectStageDropdown
