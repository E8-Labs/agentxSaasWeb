import { AddCircleRounded } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import Image from "next/image"; // Ensure Image is imported correctly
import AddKnowledgeBaseModal from "./AddKnowledgebaseModal";
import KnowledgeBaseList from "@/components/admin/dashboard/KnowledgebaseList";
import Apis from "@/components/apis/Apis";
import { Plus } from "lucide-react";

function Knowledgebase({ user, agent }) {
  const [kb, setKb] = useState([]);
  const [showKbPopup, setShowKbPopup] = useState(false);
  const [showAddNewCalendar, setShowAddNewCalendar] = useState(false); // Fixed missing state

  useEffect(() => {
    GetKnowledgebase();
  }, [showKbPopup]);

  //Api calls

  async function GetKnowledgebase() {
    try {
      const token = user.token; // Extract JWT token

      let link = "/api/kb/getkb?agentId=";
      // let link = `${Apis.GetKnowledgebase}?agentId=`

      const response = await fetch(link + agent.id, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("KB Data:", data.data);
        setKb(data.data);
      } else {
        console.error("Failed to fetch kb:", data.error);
      }
    } catch (error) {
      console.error("Error fetching kb:", error);
    }
  }

  //all actions UI Related
  function addKnowledgebase() {
    setShowKbPopup(true);
  }

  function GetNoKbView() {
    return (
      <div className="flex flex-col items-center justify-center mt-5   p-8 ">
        <div className="flex flex-col w-[100%] items-center justify-center mt-5 gap-4 p-8 rounded-lg">
          <img
            src={"/assets/nokb.png"}
            className=" object-fill "
            style={{ height: 250, width: 596 }}
            alt="No Knowledgebase"
          />

          <div style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
            No knowledge base added
          </div>

          <div className="flex flex-row gap-2 bg-purple p-2 px-8 rounded-lg">
            <Plus color="white"></Plus>
            <button
              className="flex items-center justify-center  text-black text-white font-medium"
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
    return (
      <KnowledgeBaseList
        // agent={agent}
        kbList={kb}
        onDelete={(item) => {
          console.log("Delete kb here");
        }}
        onAddKnowledge={() => {
          setShowKbPopup(true);
        }}
      />
    );
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
        user={user}
        agent={agent}
        open={showKbPopup}
        onClose={() => setShowKbPopup(false)}
      />
      {GetViewToRender()}
    </div>
  );
}

export default Knowledgebase;
