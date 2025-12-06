import Image from 'next/image'
import React, { useRef } from 'react'

const UploadImageButton = ({
  onFileSelect,
  icon = '/agencyIcons/plusIcon.png',
  preview,
}) => {
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  return (
    <div
      onClick={handleClick}
      //     className={`rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5
      // flex justify-center items-center cursor-pointer transition-all duration-200
      // ${preview ? "p-0 bg-transparent border-none" : "bg-neutral-900/10 hover:bg-neutral-900/20"}`}
      className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-neutral-900/10 flex flex-row items-center justify-center cursor-pointer"
    >
      {preview ? (
        <div
        // className="w-6 h-6 rounded-lg overflow-hidden border border-gray-200"
        >
          <Image src={preview} alt="uploaded" width={40} height={40} />
        </div>
      ) : (
        <div
        // className="w-4 h-4 relative overflow-hidden flex flex-row items-center justify-center"
        >
          <Image src={icon} alt="upload" width={13} height={13} />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default UploadImageButton
