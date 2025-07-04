import { AddCircleRounded } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import Image from "next/image"; // Ensure Image is imported correctly
import AddKnowledgeBaseModal from "./AddKnowledgebaseModal";
import KnowledgeBaseList from "@/components/admin/dashboard/KnowledgebaseList";
import Apis from "@/components/apis/Apis";
import { Plus } from "lucide-react";
import axios from "axios";

function Knowledgebase({ user, agent }) {
  const [kb, setKb] = useState([]);
  const [showKbPopup, setShowKbPopup] = useState(false);
  const [kbDelLoader, setKbDelLoader] = useState(null);
  const [showAddNewCalendar, setShowAddNewCalendar] = useState(false); // Fixed missing state

  useEffect(() => {
    GetKnowledgebase();
  }, [showKbPopup]);

  //Api calls

  async function GetKnowledgebase() {
    try {
      const token = user.token; // Extract JWT token

      // let link = `/api/kb/getkb?agentId=${agent.id}`;
      let link = `${Apis.GetKnowledgebase}?agentId=${agent.id}`;
      // //console.log

      const response = await fetch(link, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("kb list is ", data.data);
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
        <div className="flex flex-col w-[100%] items-center justify-center mt-2 gap-4 p-2 rounded-lg">
          <img
            src={"/assets/nokb.png"}
            className=" object-fill "
            style={{ height: 97, width: 130 }}
            alt="No Knowledgebase"
          />

          <div
            className="text-lg font-semibold text-gray-900 italic"
            style={{}}
          >
            No knowledge base added
          </div>

          <button
            className="flex flex-row h-[54px] items-center gap-2 bg-purple p-2 px-8 rounded-lg"
            onClick={() => addKnowledgebase()}
          >
            <Plus color="white"></Plus>
            <div
              className="flex items-center justify-center  text-black text-white font-medium"
              // Fixed typo
            >
              Add New
            </div>
          </button>
        </div>
      </div>
    );
  }

  async function handleDeleteKb(item) {
    //console.log
    try {
      setKbDelLoader(item.id);
      const token = user.token; // Extract JWT token
      setKb((prevKb) => prevKb.filter((kbItem) => kbItem.id !== item.id));

      let link = `${Apis.deleteKnowledgebase}`;
      //console.log

      let apidata = {
        kbId: item.id,
        agentId: agent.id,
      };
      //console.log

      const response = await axios.post(link, apidata, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        //console.log;
      } else {
        console.error("Failed to delete kb:", data.error);
      }
    } catch (error) {
      console.error("Error fetching kb:", error);
    } finally {
      setKbDelLoader(null);
    }
  }
  function GetKbView() {
    return (
      <KnowledgeBaseList
        // agent={agent}
        kbList={kb}
        onDelete={(item) => {
          handleDeleteKb(item);
        }}
        onAddKnowledge={() => {
          setShowKbPopup(true);
        }}
        isLoading={kbDelLoader}
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
