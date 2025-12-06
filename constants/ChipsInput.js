import Image from 'next/image'
import { useState } from 'react'

export default function ChipInput({ ccEmails, setccEmails, placeholder = "" }) {
  const [inputValue, setInputValue] = useState('')

  const isValidEmail = (email) => {
    // Basic email regex (simple but effective for most use cases)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const addEmail = (value) => {
    const trimmed = value.trim().replace(/,$/, '') // remove trailing comma if exists
    if (trimmed && isValidEmail(trimmed)) {
      setccEmails([...ccEmails, trimmed])
      setInputValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (
      ((e.key === 'Enter' || e.key === ',') && inputValue.trim() !== '') ||
      e.key === ' '
    ) {
      e.preventDefault()
      addEmail(inputValue)
    }
  }

  const handleBlur = () => {
    // Add email if user clicks away after typing
    if (inputValue.trim() !== '') {
      addEmail(inputValue)
    }
  }

  const removeChip = (index) => {
    setccEmails(ccEmails.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-row items-center overflow-x-auto overflow-y-hidden gap-2 rounded-md w-full h-full">
      {ccEmails?.map((chip, index) => (
        <div
          key={index}
          className="px-3 py-1 bg-[#F9F9F9] rounded-full flex flex-row items-center gap-2 flex-shrink-0 h-[28px]"
        >

          <div className="text-black text-[12px] whitespace-nowrap flex-shrink-0">{chip}</div>
          <button onClick={() => removeChip(index)} className="ml-1 flex-shrink-0">
            <Image
              src="/assets/blackBgCross.png"
              alt="remove"
              height={13}
              width={13}
            />
          </button>
        </div>
      ))}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={ccEmails.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] outline-none border-none focus:outline-none focus:ring-0 text-[13px] bg-transparent h-full placeholder:text-gray-400"
      />
    </div>
  )
}
