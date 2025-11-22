import { Box, TextField, Typography } from '@mui/material'
import React, { useRef, useState } from 'react'

const DynamicDropdown = () => {
  const [scriptTagInput, setScriptTagInput] = useState('')
  const [promptDropDownVisible, setPromptDropDownVisible] = useState(false)
  const [kYCSDropDown, setKYCSDropDown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const textFieldRef = useRef(null)

  const tags = ['name', 'Agent Name', 'Brokerage Name', 'Client Name']
  const kycsData = [
    { id: 1, question: 'What is your name?' },
    { id: 2, question: 'What is your address?' },
  ]

  const handlePromptChange = (e) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    setScriptTagInput(value)

    // Calculate caret position
    const inputElement =
      textFieldRef.current.querySelector('textarea') || textFieldRef.current
    const caretCoords = getCaretCoordinates(inputElement, cursorPos)

    // //console.log;

    setDropdownPosition({
      top: caretCoords.top + 24, // Adjust for dropdown below caret
      left: caretCoords.left,
    })

    // Logic for dropdown visibility
    const typedText = value.slice(0, cursorPos).toLowerCase()
    if (typedText.endsWith('{kyc')) {
      setKYCSDropDown(true)
      setPromptDropDownVisible(false)
    } else if (typedText.endsWith('{')) {
      setPromptDropDownVisible(true)
      setKYCSDropDown(false)
    } else {
      setPromptDropDownVisible(false)
      setKYCSDropDown(false)
    }
  }

  const handlePromptTagSelection = (tag) => {
    const beforeCursor = scriptTagInput.slice(
      0,
      textFieldRef.current.selectionStart,
    )
    const afterCursor = scriptTagInput.slice(
      textFieldRef.current.selectionStart,
    )

    // Insert selected tag
    const updatedInput = `${beforeCursor}{${tag}} ${afterCursor}`

    setScriptTagInput(updatedInput)
    setPromptDropDownVisible(false)
    setKYCSDropDown(false)

    setTimeout(() => {
      const newCursorPosition = beforeCursor.length + tag.length + 2
      textFieldRef.current.focus()
      textFieldRef.current.setSelectionRange(
        newCursorPosition,
        newCursorPosition,
      )
    }, 0)
  }

  const getCaretCoordinates = (input, selectionStart) => {
    let div = null
    if (typeof document !== 'undefined') {
      div = document.createElement('div')
    }
    const style = window.getComputedStyle(input)

    // Copy styles for accurate measurement
    for (const prop of style) {
      div.style[prop] = style[prop]
    }

    div.style.position = 'absolute'
    div.style.visibility = 'hidden'
    div.style.whiteSpace = 'pre-wrap'
    div.style.wordWrap = 'break-word'

    div.textContent = input.value.substring(0, selectionStart)
    if (input.tagName === 'TEXTAREA') div.style.height = style.height

    if (typeof document !== 'undefined') {
      document.body.appendChild(div)
      document.body.removeChild(div)
    }

    const caretCoords = div.getBoundingClientRect()

    return caretCoords
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        inputRef={textFieldRef}
        placeholder="Call script here"
        variant="outlined"
        fullWidth
        multiline
        minRows={4}
        maxRows={5}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { border: '1px solid #00000060' },
            '&:hover fieldset': { border: '1px solid #00000060' },
            '&.Mui-focused fieldset': { border: '1px solid #00000060' },
          },
        }}
        value={scriptTagInput}
        onChange={handlePromptChange}
      />

      {(promptDropDownVisible || kYCSDropDown) && (
        <Box
          sx={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
            width: 'fit-content',
          }}
        >
          {(promptDropDownVisible ? tags : kycsData).map((item) => (
            <Typography
              key={item.id || item}
              onClick={() =>
                handlePromptTagSelection(
                  promptDropDownVisible ? item : item.question,
                )
              }
              sx={{
                padding: '8px 12px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              {promptDropDownVisible ? item : item.question}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default DynamicDropdown
