import React, { useEffect, useRef, useState } from 'react'

const VerificationCodeInput = ({ length = 6, onComplete }) => {
  const [VerifyCode, setVerifyCode] = useState(Array(length).fill(''))
  const verifyInputRef = useRef([])

  useEffect(() => {
    verifyInputRef.current[0].focus()
  }, [])

  const handleVerifyInputChange = (e, index) => {
    const { value } = e.target
    if (!/[0-9]/.test(value) && value !== '') return // Allow only numeric input

    const newValues = [...VerifyCode]
    newValues[index] = value
    setVerifyCode(newValues)

    // Move focus to the next field if a number is entered
    if (value && index < length - 1) {
      verifyInputRef.current[index + 1].focus()
    }

    // Trigger onComplete callback if all fields are filled
    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      if (VerifyCode[index] === '' && index > 0) {
        verifyInputRef.current[index - 1].focus()
      }
      const newValues = [...VerifyCode]
      newValues[index] = ''
      setVerifyCode(newValues)
    }
  }

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text').slice(0, length)
    const newValues = pastedText
      .split('')
      .map((char) => (/[0-9]/.test(char) ? char : ''))
    setVerifyCode(newValues)

    // Set each input's value and move focus to the last filled input
    newValues.forEach((char, index) => {
      verifyInputRef.current[index].value = char
      if (index === newValues.length - 1) {
        verifyInputRef.current[index].focus()
      }
    })

    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (verifyInputRef.current[index] = el)}
          type="text"
          maxLength="1"
          value={VerifyCode[index]}
          onChange={(e) => handleVerifyInputChange(e, index)}
          onKeyDown={(e) => handleBackspace(e, index)}
          onPaste={handlePaste}
          placeholder="-"
          style={{
            width: '40px',
            height: '40px',
            textAlign: 'center',
            fontSize: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      ))}
    </div>
  )
}

export default VerificationCodeInput
