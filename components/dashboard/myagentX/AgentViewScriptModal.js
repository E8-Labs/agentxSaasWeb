import React from 'react'
import { Modal, Box, CircularProgress } from '@mui/material'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Info, Plus, ArrowUpRight } from '@phosphor-icons/react'
import VideoCard from '@/components/createagent/VideoCard'
import KYCs from '@/components/pipeline/KYCs'
import GuarduanSetting from '@/components/pipeline/advancedsettings/GuardianSetting'
import Objection from '@/components/pipeline/advancedsettings/Objection'
import { GreetingTagInput } from '@/components/pipeline/tagInputs/GreetingTagInput'
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput'
import { HowToVideoTypes, HowtoVideos, PersistanceKeys } from '@/constants/Constants'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

const AgentViewScriptModal = ({
  open,
  onClose,
  modalsStyle,
  showScriptModal,
  showScript,
  SeledtedScriptKYC,
  SeledtedScriptAdvanceSetting,
  onShowScript,
  onShowKycs,
  onShowAdvanceSeting,
  uniqueColumns,
  showMoreUniqueColumns,
  onShowUniqueCols,
  kycsData,
  setKycsData,
  scriptTagInput,
  setScriptTagInput,
  setGreetingTagInput,
  setShowScriptModal,
  showSaveChangesBtn,
  setShowSaveChangesBtn,
  setOldScriptTagInput,
  scrollOffset,
  updateAgent,
  UpdateAgentLoader,
  setIntroVideoModal,
  reduxUser,
  showObjectives,
  showGuardrails,
  showObjection,
  onShowObjectives,
  onShowGuardrails,
  onShowObjection,
  objective,
  setObjective,
  showObjectionsSaveBtn,
  setShowObjectionsSaveBtn,
  setOldObjective,
  MainAgentId,
  user,
  onSaveAndClose,
  /** When set (e.g. admin context), used for script builder URL and passed as userId to nested API calls */
  selectedUser = null,
  /** Override modal container class (e.g. "w-10/12 sm:w-[760px] p-8 rounded-[15px]") */
  modalClassName,
  /** Override backdrop sx (e.g. { backgroundColor: '#00000020' }) */
  backdropSx,
}) => {
  const userId = selectedUser?.id
  const scriptUser = selectedUser ?? reduxUser
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 100,
        sx: backdropSx ?? { backgroundColor: '#00000099' },
      }}
    >
      <Box
        className={modalClassName ?? 'w-8/12 h-[90%] sm:w-[608px] p-0 rounded-xl'}
        sx={{ ...modalsStyle, backgroundColor: 'white', padding: modalClassName ? undefined : 0 }}
      >
                <div style={{ width: '100%' }}>
                    <div className="h-[90vh] text-sm flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200 ease-out" style={{ scrollbarWidth: 'none', fontSize: 14 }}>
                        <div
                            className="w-full py-3 px-4 border-b flex flex-row items-center justify-between max-h-[54px]"
                            style={{ borderBottomColor: '#eaeaea' }}
                        >
                            {/* <div style={{ width: "20%" }} /> */}
                            <div style={{ fontWeight: '600', fontSize: 18 }}>
                                {showScriptModal?.name?.slice(0, 1).toUpperCase(0)}
                                {showScriptModal?.name?.slice(1)}
                            </div>
                            <div
                                style={{
                                    direction: 'row',
                                    display: 'flex',
                                    justifyContent: 'end',
                                }}
                            >
                                <CloseBtn
                                    onClick={onClose}
                                    className="h-9 w-9 shrink-0 rounded-lg hover:bg-black/[0.06]"
                                    iconSize={12}
                                    aria-label="Close modal"
                                />
                            </div>
                        </div>

                        <div
                            className="mt-2 flex flex-row items-center gap-6 w-full border-b border-border px-4 h-11 min-h-0"
                            style={{ borderBottomColor: 'hsl(var(--border))', fontSize: 14 }}
                            role="tablist"
                            aria-label="Script sections"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={showScript}
                                className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                style={{
                                    borderBottomColor: showScript ? 'hsl(var(--brand-primary))' : 'transparent',
                                    color: showScript ? 'hsl(var(--brand-primary))' : undefined,
                                }}
                                onClick={onShowScript}
                            >
                                Script
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={SeledtedScriptKYC}
                                className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                style={{
                                    borderBottomColor: SeledtedScriptKYC ? 'hsl(var(--brand-primary))' : 'transparent',
                                    color: SeledtedScriptKYC ? 'hsl(var(--brand-primary))' : undefined,
                                }}
                                onClick={onShowKycs}
                            >
                                KYC
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={SeledtedScriptAdvanceSetting}
                                className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                                style={{
                                    borderBottomColor: SeledtedScriptAdvanceSetting ? 'hsl(var(--brand-primary))' : 'transparent',
                                    color: SeledtedScriptAdvanceSetting ? 'hsl(var(--brand-primary))' : undefined,
                                }}
                                onClick={onShowAdvanceSeting}
                            >
                                Advanced Settings
                            </button>
                        </div>

                        {showScript && (
                            <div className="flex-1 min-h-0 h-full flex flex-col" style={{ borderWidth: 0 }}>
                                <div className="flex-1 min-h-0 h-full flex flex-col" style={{ borderWidth: 0 }}>
                                    <div className="flex-1 min-h-0 h-full overflow-auto flex flex-col gap-3 px-4 py-[2px] text-sm">
                                        <div className="rounded-[1px] border-l-4 border-brand-primary bg-primary/5 p-3 mt-2">
                                            <div className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
                                                <Info size={20} weight="fill" className="text-brand-primary flex-shrink-0" />
                                                Editing Tips
                                            </div>
                                            <div className="flex flex-row flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                                                <div>You can use these variables:</div>
                                                {/* <div className='flex flex-row items-center gap-2'> */}
                                                <div
                                                    style={{ width: 'fit-content' }}
                                                    className="text-brand-primary flex flex-row gap-2"
                                                >
                                                    {`{Address}`},{`{Phone}`}, {`{Email}`},{`{Kyc}`}
                                                    {/* {`{First Name}`}, {`{Email}`}, */}
                                                </div>

                                                {uniqueColumns?.length > 0 && showMoreUniqueColumns ? (
                                                    <div className="flex flex-row flex-wrap gap-2">
                                                        {uniqueColumns.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex flex-row items-center gap-2 text-brand-primary"
                                                            >
                                                                {`{${item}}`},
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="text-brand-primary outline-none"
                                                            onClick={onShowUniqueCols}
                                                        >
                                                            show less
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {uniqueColumns?.length > 0 && (
                                                            <button
                                                                className="text-brand-primary flex flex-row items-center font-bold outline-none"
                                                                onClick={() => {
                                                                    onShowUniqueCols()
                                                                }}
                                                            >
                                                                <Plus
                                                                    weight="bold"
                                                                    size={15}
                                                                    style={{
                                                                        strokeWidth: 40, // Adjust as needed
                                                                    }}
                                                                />
                                                                {uniqueColumns?.length}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* </div> */}
                                            </div>
                                        </div>

                                        <div className="w-full h-full flex flex-col gap-3 [&_input]:h-[40px] [&_input]:min-h-[40px] [&_input]:rounded-lg [&_input]:border [&_input]:border-[#e5e7eb] [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input]:transition-colors [&_input]:focus:border-brand-primary [&_input]:focus:ring-2 [&_input]:focus:ring-brand-primary/20 [&_input]:hover:border-gray-300 [&_input]:hover:bg-gray-50/30 [&_textarea]:min-h-[40px] [&_textarea]:w-full [&_textarea]:flex-1 [&_textarea]:min-h-0 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#e5e7eb] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:text-black/80 [&_textarea]:outline-none [&_textarea]:transition-colors [&_textarea]:focus:border-brand-primary [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-brand-primary/20 [&_textarea]:hover:border-gray-300">
                                            <div className="flex w-full">
                                                <VideoCard
                                                    duration={getTutorialByType(HowToVideoTypes.Script)?.description || '13:56'}
                                                    width="120"
                                                    height="120"
                                                    horizontal={false}
                                                    playVideo={() => setIntroVideoModal(true)}
                                                    title={getTutorialByType(HowToVideoTypes.Script)?.title || 'Learn how to customize your script'}
                                                    videoUrl={
                                                        getVideoUrlByType(HowToVideoTypes.Script) ||
                                                        HowtoVideos.script
                                                    }
                                                />
                                            </div>

                                            {/* <div
                        className="mt-4"
                        style={{ fontSize: 24, fontWeight: "700" }}
                      >
                        Script
                      </div> */}

                                            <div
                                                style={{ fontSize: 14, fontWeight: '700' }}
                                                className="flex flex-row items-center center w-full justify-between"
                                            >
                                                <div>Script</div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-row items-center justify-between">
                                                    <div
                                                        className="mt-2 pt-3"
                                                        style={{ fontSize: 18, color: '#000000', fontWeight: 400 }}
                                                    >
                                                        Greeting
                                                    </div>

                                                    <button
                                                        className="flex flex-row items-center gap-1 h-[28px] rounded-lg bg-white text-brand-primary px-3 font-medium text-sm hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 outline-none transition-all duration-150 [&_svg]:text-brand-primary"
                                                        onClick={() => {
                                                            const scriptBuilderUrl =
                                                                scriptUser?.agencySettings?.scriptWidgetUrl ||
                                                                scriptUser?.userSettings?.scriptWidgetUrl ||
                                                                PersistanceKeys.DefaultScriptBuilderUrl
                                                            window.open(scriptBuilderUrl, '_blank')
                                                        }}
                                                    >
                                                        Use {scriptUser?.agencySettings?.scriptWidgetTitle ?? scriptUser?.userSettings?.scriptWidgetTitle ?? 'Script Builder'}
                                                        <ArrowUpRight size={14} />
                                                    </button>
                                                </div>

                                                <div className="mt-0">
                                                    <GreetingTagInput
                                                        greetTag={showScriptModal?.prompt?.greeting}
                                                        kycsList={kycsData}
                                                        uniqueColumns={uniqueColumns}
                                                        tagValue={(text) => {
                                                            setGreetingTagInput(text)
                                                            const agent = { ...showScriptModal, prompt: { ...showScriptModal?.prompt, greeting: text } }
                                                            setShowScriptModal(agent)
                                                        }}
                                                        scrollOffset={scrollOffset}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4 w-full ">
                                                <PromptTagInput
                                                    promptTag={scriptTagInput}
                                                    kycsList={kycsData}
                                                    from={'Prompt'}
                                                    uniqueColumns={uniqueColumns}
                                                    tagValue={setScriptTagInput}
                                                    scrollOffset={scrollOffset}
                                                    showSaveChangesBtn={showSaveChangesBtn}
                                                    saveUpdates={async () => {
                                                        await updateAgent()
                                                        setShowSaveChangesBtn(false)
                                                        setOldScriptTagInput(scriptTagInput)
                                                    }}
                                                />

                                                {/* <DynamicDropdown /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-2 right-7 left-7" style={{}}>
                                    {showSaveChangesBtn && (
                                        <div className="w-full">
                                            {UpdateAgentLoader ? (
                                                <div className="w-full flex flex-row mt-6 justify-center">
                                                    <CircularProgress size={35} />
                                                </div>
                                            ) : (
                                                <button
                                                    className="bg-brand-primary w-full h-[50px] rounded-xl text-white"
                                                    style={{ fontWeight: '600', fontSize: 15 }}
                                                    onClick={onSaveAndClose}
                                                >
                                                    Save Changes
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {SeledtedScriptAdvanceSetting && (
                            <div className="px-4 flex flex-col gap-1 py-[2px] flex-1 min-h-0 overflow-hidden" style={{ height: '80%' }}>
                                <div
                                    className="flex flex-row items-center mt-2 rounded-xl p-1 gap-0 min-w-[400px] max-w-[400px] mx-auto h-10 flex-shrink-0"
                                    style={{
                                        backgroundColor: '#F2F2F2',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    }}
                                    role="tablist"
                                    aria-label="Objective, Guardrails, Objections"
                                >
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={showObjectives}
                                        className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                                        style={{
                                            backgroundColor: showObjectives ? '#FFFFFF' : 'transparent',
                                            color: showObjectives ? '#333333' : '#828282',
                                            boxShadow: showObjectives ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                        }}
                                        onClick={onShowObjectives}
                                    >
                                        Objective
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={showGuardrails}
                                        className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                                        style={{
                                            backgroundColor: showGuardrails ? '#FFFFFF' : 'transparent',
                                            color: showGuardrails ? '#333333' : '#828282',
                                            boxShadow: showGuardrails ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                        }}
                                        onClick={onShowGuardrails}
                                    >
                                        Guardrails
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={showObjection}
                                        className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                                        style={{
                                            backgroundColor: showObjection ? '#FFFFFF' : 'transparent',
                                            color: showObjection ? '#333333' : '#828282',
                                            boxShadow: showObjection ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                        }}
                                        onClick={onShowObjection}
                                    >
                                        Objections
                                    </button>
                                </div>

                                {showObjection && (
                                    <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                                        <div className="flex-1 min-h-0 mt-2 overflow-auto">
                                            <Objection
                                                showTitle={true}
                                                selectedAgentId={showScriptModal}
                                                kycsData={kycsData}
                                                uniqueColumns={uniqueColumns}
                                                userId={userId}
                                            />
                                        </div>
                                    </div>
                                )}

                                {showGuardrails && (
                                    <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                                        <div className="flex-1 min-h-0 mt-2 overflow-auto">
                                            <GuarduanSetting
                                                showTitle={true}
                                                selectedAgentId={showScriptModal}
                                                kycsData={kycsData}
                                                uniqueColumns={uniqueColumns}
                                                userId={userId}
                                            />
                                        </div>
                                    </div>
                                )}

                                {showObjectives && (
                                    <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                                        <div className="flex-1 min-h-0 mt-2 overflow-auto flex flex-col">
                                            {/* {showScriptModal?.prompt?.objective} */}

                                            {/* {
                          <textarea
                            className="outline-none rounded-xl focus:ring-0"
                            // ref={objective}
                            value={objective}
                            onChange={(e) => {
                              const value = e.target.value;
                              setObjective(value);
                            }}
                            placeholder="Add Objective"
                            style={{
                              fontSize: 14,
                              padding: "15px",
                              width: "100%",
                              fontWeight: 400,
                              height: "100%", // Initial height
                              maxHeight: "100%", // Maximum height before scrolling
                              overflowY: "auto", // Enable vertical scrolling when max-height is exceeded
                              resize: "none", // Disable manual resizing
                              border: "1px solid #00000020",
                            }}
                          />
                        } */}

                                            <div className="mt-2 flex-1 min-h-0 flex flex-col w-full">
                                                <PromptTagInput
                                                    promptTag={objective}
                                                    kycsList={kycsData}
                                                    uniqueColumns={uniqueColumns}
                                                    tagValue={setObjective}
                                                    scrollOffset={scrollOffset}
                                                    showSaveChangesBtn={showObjectionsSaveBtn}
                                                    from={'Objective'}
                                                    fillHeight
                                                    saveUpdates={async () => {
                                                        await updateAgent()
                                                        setShowObjectionsSaveBtn(false)
                                                        setOldObjective(objective)
                                                    }}
                                                />

                                                {/* <DynamicDropdown /> */}
                                            </div>

                                            <div>
                                                {showObjectionsSaveBtn && (
                                                    <div>
                                                        {UpdateAgentLoader ? (
                                                            <div className="w-full flex flex-row justify-center">
                                                                <CircularProgress size={35} />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="bg-brand-primary w-full h-[50px] rounded-xl mb-2 text-white"
                                                                style={{ fontWeight: '600', fontSize: 15 }}
                                                                onClick={async () => {
                                                                    await updateAgent()
                                                                    setShowObjectionsSaveBtn(false)
                                                                    setOldObjective(objective)
                                                                }}
                                                            >
                                                                Save Changes
                                                            </button>
                                                        )}
                                                    </div>
                                                )}


                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {SeledtedScriptKYC && (
                            <div
                                className="px-4 flex flex-col gap-2 py-[2px] flex-1 min-h-0"
                                style={{
                                    height: '80%',
                                    overflow: 'auto',
                                    scrollbarWidth: 'none',
                                    backgroundColor: '',
                                }}
                            >
                                <div className="h-full min-h-0 flex flex-col">
                                    <KYCs
                                        kycsDetails={setKycsData}
                                        mainAgentId={MainAgentId}
                                        user={selectedUser ?? user}
                                        selectedUser={selectedUser}
                                        userId={userId}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default AgentViewScriptModal