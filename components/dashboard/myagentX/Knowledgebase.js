import { AddCircleRounded } from "@mui/icons-material";
import React, { useState } from "react";
import Image from "next/image"; // Ensure Image is imported correctly
import AddKnowledgeBaseModal from "./AddKnowledgebaseModal";

function Knowledgebase({ user }) {
  const [kb, setKb] = useState([]);
  const [showKbPopup, setShowKbPopup] = useState(false);
  const [showAddNewCalendar, setShowAddNewCalendar] = useState(false); // Fixed missing state

  //all actions UI Related
  function addKnowledgebase() {
    setShowKbPopup(true);
  }

  function GetNoKbView() {
    return (
      <div className="flex flex-col items-center justify-center mt-5   p-8 ">
        <div className="flex flex-col w-[60%] items-center justify-center mt-5 gap-4 bg-gray-100 p-8 rounded-lg">
          <Image
            src={"/assets/nokb.svg"}
            height={30}
            width={30}
            alt="No Knowledgebase"
          />

          <div style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
            No Knowledge base added
          </div>

          <div className="flex flex-row gap-2 ">
            <Image
              className="cursor-pointer"
              src="/assets/calendaradd.svg"
              height={25}
              width={25}
              alt=""
            />
            <button
              className="flex items-center justify-center  text-black text-purple font-medium"
              onClick={() => addKnowledgebase()} // Fixed typo
            >
              Add New
            </button>
          </div>
        </div>
      </div>
    );
  }

  function GetKbView() {
    return <div>show the kb here</div>;
  }

  function GetViewToRender() {
    if (kb.length === 0) {
      // Use strict equality (===)
      return GetNoKbView();
    }
    return GetKbView();
  }

  return (
    <div>
      <AddKnowledgeBaseModal
        open={showKbPopup}
        onClose={() => setShowKbPopup(false)}
      />
      {GetViewToRender()}
    </div>
  );
}

export default Knowledgebase;
