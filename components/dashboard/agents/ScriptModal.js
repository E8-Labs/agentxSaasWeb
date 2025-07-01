import React, { useState } from "react";
import { Box, Modal, CircularProgress } from "@mui/material";
import Image from "next/image";
import GreetingTagInput from "@/components/pipeline/tagInputs/GreetingTagInput";
import PromptTagInput from "@/components/pipeline/tagInputs/PromptTagInput";
import KYCs from "@/components/pipeline/KYCs";
import Objection from "@/components/pipeline/advancedsettings/Objection";
import GuarduanSetting from "@/components/pipeline/advancedsettings/GuardianSetting";
import VideoCard from "@/components/createagent/VideoCard";

const ScriptModal = ({
  showScriptModal,
  handleCloseScriptModal,
  kycsData,
  MainAgentId
}) => {
  const [showScript, setShowScript] = useState(false);
  const [SeledtedScriptKYC, setSeledtedScriptKYC] = useState(false);
  const [SeledtedScriptAdvanceSetting, setSeledtedScriptAdvanceSetting] = useState(false);
  const [showObjection, setShowObjection] = useState(false);
  const [showGuardrails, setShowGuardrails] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  const [objective, setObjective] = useState("");
  const [oldObjective, setOldObjective] = useState("");
  const [showObjectionsSaveBtn, setShowObjectionsSaveBtn] = useState(false);
  const [greetingTagInput, setGreetingTagInput] = useState("");
  const [oldGreetingTagInput, setOldGreetingTagInput] = useState("");
  const [scriptTagInput, setScriptTagInput] = useState("");
  const [OldScriptTagInput, setOldScriptTagInput] = useState("");
  const [showSaveChangesBtn, setShowSaveChangesBtn] = useState(false);
  const [UpdateAgentLoader, setUpdateAgentLoader] = useState(false);
  const [uniqueColumns, setUniqueColumns] = useState([]);
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false);

  const handleShowScript = () => {
    setShowScript(true);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(false);
  };

  const handleShowKycs = () => {
    setShowScript(false);
    setSeledtedScriptKYC(true);
    setSeledtedScriptAdvanceSetting(false);
  };

  const handleShowAdvanceSeting = () => {
    setShowScript(false);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(true);
  };

  const handleShowObjection = () => {
    setShowObjection(true);
    setShowGuardrails(false);
    setShowObjectives(false);
  };

  const handleShowGuardrails = () => {
    setShowObjection(false);
    setShowGuardrails(true);
    setShowObjectives(false);
  };

  const handleShowObjectives = () => {
    setShowObjectives(true);
    setShowObjection(false);
    setShowGuardrails(false);
  };

  return (
    <Modal
      open={showScriptModal}
      onClose={handleCloseScriptModal}
      BackdropProps={{
        sx: { backgroundColor: "#00000020" }
      }}
    >
      <Box className="w-10/12 h-[90%] sm:w-[760px] p-8 rounded-[15px] bg-white mx-auto my-[50vh] transform -translate-y-1/2">
        <div className="w-full h-[90vh]">
          <div className="flex justify-between items-center h-[8%]">
            <div className="text-2xl font-semibold">
              {showScriptModal?.name?.charAt(0).toUpperCase()}
              {showScriptModal?.name?.slice(1)}
            </div>
            <button onClick={handleCloseScriptModal}>
              <Image src="/assets/crossIcon.png" height={40} width={40} alt="close" />
            </button>
          </div>

          <div className="flex gap-6 mt-4 text-sm font-medium">
            <button
              className={`px-2 pb-1 ${showScript ? "border-b-2 border-purple" : ""}`}
              onClick={handleShowScript}
            >
              Script
            </button>
            <button
              className={`px-2 pb-1 ${SeledtedScriptKYC ? "border-b-2 border-purple" : ""}`}
              onClick={handleShowKycs}
            >
              KYC
            </button>
            <button
              className={`px-2 pb-1 ${SeledtedScriptAdvanceSetting ? "border-b-2 border-purple" : ""}`}
              onClick={handleShowAdvanceSeting}
            >
              Advanced Settings
            </button>
          </div>

          {showScript && (
            <div className="h-[73%]">
              <div className="bg-[#00000002] p-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Image src="/assets/lightBulb.png" alt="*" height={24} width={24} />
                  Editing Tips
                </div>
                <div className="flex flex-wrap gap-2 text-sm mt-2">
                  <div>You can use these variables:</div>
                  <div className="text-purple flex gap-2">
                    {`{Address}`},{`{Phone}`}, {`{Email}`},{`{Kyc}`}
                  </div>
                  {uniqueColumns?.length > 0 && showMoreUniqueColumns ? (
                    <div className="flex flex-wrap gap-2">
                      {uniqueColumns.map((item) => (
                        <div key={item} className="text-purple flex items-center gap-2">
                          {`{${item}}`},
                        </div>
                      ))}
                      <button
                        className="text-purple outline-none"
                        onClick={() => setShowMoreUniqueColumns(false)}
                      >
                        show less
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-purple font-bold outline-none flex items-center"
                      onClick={() => setShowMoreUniqueColumns(true)}
                    >
                      <Plus weight="bold" size={15} style={{ strokeWidth: 40 }} />
                      {uniqueColumns?.length}
                    </button>
                  )}
                </div>
              </div>

              <div className="w-5/12">
                <VideoCard
                  duration="13 min 56 sec"
                  width="60"
                  height="40"
                  horizontal={false}
                  title="Learn how to customize your script"
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-2xl font-bold">Script</div>
                <button
                  className="flex items-center gap-2 h-[43px] rounded-md bg-purple text-white px-4 text-sm font-medium"
                  onClick={() => window.open("https://chatgpt.com/g/g-0O0jItKdk-agentx-script-builder", "_blank")}
                >
                  Use Script Builder
                  <ArrowUpRight size={20} color="white" />
                </button>
              </div>

              <div className="mt-2 text-sm text-[#00000060]">Greeting</div>
              <div className="mt-2">
                <GreetingTagInput
                  greetTag={showScriptModal?.prompt?.greeting}
                  kycsList={kycsData}
                  uniqueColumns={uniqueColumns}
                  tagValue={(text) => {
                    setGreetingTagInput(text);
                    let agent = showScriptModal;
                    agent.prompt.greeting = text;
                    setShowScriptModal(agent);
                  }}
                />
              </div>

              <div className="mt-4 w-full">
                <PromptTagInput
                  promptTag={scriptTagInput}
                  kycsList={kycsData}
                  from="Prompt"
                  uniqueColumns={uniqueColumns}
                  tagValue={(text) => {
                    setScriptTagInput(text);
                  }}
                  showSaveChangesBtn={showSaveChangesBtn}
                  saveUpdates={async () => {
                    await updateAgent();
                    setShowSaveChangesBtn(false);
                    setOldScriptTagInput(scriptTagInput);
                  }}
                />
              </div>
            </div>
          )}

          {SeledtedScriptAdvanceSetting && (
            <div className="h-[80%]">
              <div className="flex gap-6 mt-4 text-sm font-medium">
                <button
                  className={`px-2 pb-1 ${showObjectives ? "border-b-2 border-purple" : ""}`}
                  onClick={handleShowObjectives}
                >
                  Objective
                </button>
                <button
                  className={`px-2 pb-1 ${showGuardrails ? "border-b-2 border-purple" : ""}`}
                  onClick={handleShowGuardrails}
                >
                  Guardrails
                </button>
                <button
                  className={`px-2 pb-1 ${showObjection ? "border-b-2 border-purple" : ""}`}
                  onClick={handleShowObjection}
                >
                  Objections
                </button>
              </div>

              {showObjection && (
                <div className="mt-10 h-[80%]">
                  <Objection showTitle={true} selectedAgentId={showScriptModal} />
                </div>
              )}

              {showGuardrails && (
                <div className="mt-10 h-[80%]">
                  <GuarduanSetting showTitle={true} selectedAgentId={showScriptModal} />
                </div>
              )}

              {showObjectives && (
                <div className="mt-10 h-[80%]">
                  <div className="h-full">
                    <PromptTagInput
                      promptTag={objective}
                      kycsList={kycsData}
                      uniqueColumns={uniqueColumns}
                      tagValue={setObjective}
                      from="Objective"
                      showSaveChangesBtn={showObjectionsSaveBtn}
                      saveUpdates={async () => {
                        await updateAgent();
                        setShowObjectionsSaveBtn(false);
                        setOldObjective(objective);
                      }}
                    />

                    {showObjectionsSaveBtn && (
                      <div className="mb-4">
                        {UpdateAgentLoader ? (
                          <div className="flex justify-center">
                            <CircularProgress size={35} />
                          </div>
                        ) : (
                          <button
                            className="w-full h-[50px] bg-purple text-white rounded-xl font-semibold"
                            onClick={async () => {
                              await updateAgent();
                              setShowObjectionsSaveBtn(false);
                              setOldObjective(objective);
                            }}
                          >
                            Save Changes
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {SeledtedScriptKYC && (
            <div className="h-[80%] overflow-auto">
              <KYCs
                kycsDetails={setKycsData}
                mainAgentId={MainAgentId}
                user={user && user}
              />
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default ScriptModal;