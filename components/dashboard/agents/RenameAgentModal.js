import React, { useState } from "react";
import { Box, Modal, CircularProgress } from "@mui/material";
import Image from "next/image";
import { PersistanceKeys } from "@/constants/Constants";
import Apis from "@/components/apis/Apis";
import axios from "axios";

const RenameAgentModal = ({
  showRenameAgentPopup,
  setShowRenameAgentPopup,
  selectedRenameAgent,

  setShowSuccessSnack,
  fromatMessageName,
  setIsVisibleSnack,
  showDrawerSelectedAgent,
  setShowDrawerSelectedAgent,
  setMainAgentsList,
  renameAgent,
  setRenameAgent,

}) => {

  const [loading,setLoading] = useState(false)
  //code for update agent api
  const handleRenameAgent = async () => {
    console.log('button clicked')
    try {
      setLoading(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;

        const ApiPath = Apis.updateSubAgent;

        let apidata = {
          agentId: selectedRenameAgent.id,
          name: renameAgent, //selectedRenameAgent?.name,
        };

        const response = await axios.post(ApiPath, apidata, {
          headers: {
            Authorization: "Bearer " + AuthToken,
          },
        });

        if (response) {
          setShowRenameAgentPopup(false);
       
          setShowSuccessSnack(
            `${fromatMessageName(selectedRenameAgent.name)} updated`
          );
          if (response.data.status === true) {
            setIsVisibleSnack(true);

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain
            );

            if (showDrawerSelectedAgent) {
              const updateAgentData = response.data.data;

              const matchedAgent = updateAgentData.agents.find(
                (localItem) => localItem.id === showDrawerSelectedAgent.id
              );

              if (matchedAgent) {
                setShowDrawerSelectedAgent(matchedAgent);
                console.log("Matched Agent Stored:"); //, matchedAgent
              } else {
                console.log("No matching agent found.");
              }
            }

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList);

              const updateAgentData = response.data.data;

              const updatedArray = agentsList.map((localItem) => {
                const apiItem =
                  updateAgentData.id === localItem.id ? updateAgentData : null;

                return apiItem ? { ...localItem, ...apiItem } : localItem;
              });

              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray)
              );
              setMainAgentsList(updatedArray);
            }
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.log('error in rename', error)
    } finally {
      ////console.log;
      setLoading(false);
    }
  };

  return (
    <Modal
      open={showRenameAgentPopup}
      onClose={() => setShowRenameAgentPopup(false)}
      BackdropProps={{
        sx: { backgroundColor: "#00000020" }
      }}
    >
      <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px] bg-white mx-auto my-[50vh] transform -translate-y-1/2">
        <div className="w-full">
          <div className="max-h-[60vh] overflow-auto">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">Rename Agent</div>
              <button onClick={() => setShowRenameAgentPopup(false)}>
                <Image src="/assets/crossIcon.png" height={40} width={40} alt="close" />
              </button>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold mb-1">Agent Name</div>
              <input
                value={renameAgent || ""}
                onChange={(e) => setRenameAgent(e.target.value)}
                placeholder="Enter agent title"
                className="w-full h-[50px] rounded-lg border border-[#00000020] outline-none px-4"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center mt-4">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className="mt-4 w-full h-[50px] bg-purple text-white rounded-lg font-semibold"
              onClick={()=>handleRenameAgent()}
            >
              Update
            </button>
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default RenameAgentModal;