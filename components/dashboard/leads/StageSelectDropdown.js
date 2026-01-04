'use client'

import React, { useMemo } from 'react'

import DropdownCn from './extras/DropdownCn'

const SelectStageDropdown = ({
  selectedStage,
  handleStageChange,
  stagesList,
  updateLeadStage,
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

  return (
    <DropdownCn
      label={label}
      options={options}
      onSelect={(opt) => handleStageChange?.(opt)}
      align="end"
    />
  )
}

export default SelectStageDropdown
