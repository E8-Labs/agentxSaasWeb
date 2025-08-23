import { useState } from "react";
import Image from "next/image";

export default function ChipInput({
  ccEmails,
  setccEmails
}) {
  // const [chips, setChips] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      setccEmails([...ccEmails, inputValue.trim()]);
      setInputValue(""); // clear input
    }
  };

  const removeChip = (index) => {
    setccEmails(ccEmails.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-row items-center overflow-x-auto flex gap-2 px-2 py-2">
      {ccEmails?.map((chip, index) => (
        <div
          key={index}
          className="px-3 py-2 bg-[#F9F9F9] rounded-full border border-[#00000010] flex flex-row items-center gap-2 flex-shrink-0"
        >
          <div className="h-[20px] w-[20px] rounded-full bg-black flex flex-row items-center justify-center text-white text-[12px] font-medium">
            {chip.charAt(0).toUpperCase()}
          </div>
          <div className="text-black text-[13px] font-normal">{chip}</div>
          <button onClick={() => removeChip(index)} className="ml-1">
            <Image
              src={"/assets/blackBgCross.png"}
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
        placeholder=""
        className="flex-1 outline-none border-none focus:outline-none focus:border-none focus:ring-0 text-[13px]"
      />
    </div>
  );
}
