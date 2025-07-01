import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import voicesList from "@/components/createagent/Voices";
import { AgentLanguagesList } from "@/utilities/AgentLanguages";
import PhoneNumberSelector from "./PhoneNumberSelector";
import { findLLMModel } from "@/utilities/agentUtilities";

const AgentInfoTab = ({
  showDrawerSelectedAgent,
  setShowDrawerSelectedAgent,
  updateAgent,
  updateSubAgent,

}) => {
  const [showVoiceLoader, setShowVoiceLoader] = useState(false);
  const [SelectedVoice, setSelectedVoice] = useState("");
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [languageValue, setLanguageValue] = useState("");
  const [showLanguageLoader, setShowLanguageLoader] = useState(false);
  const [showVoiceExpressivenessLoader, setShowVoiceExpressivenessLoader] = useState(false);
  const [showStartingPaceLoader, setShowStartingPaceLoader] = useState(false);
  const [showPatienceLoader, setShowPatienceLoader] = useState(false);
  const [showCallRecordingLoader, setShowCallRecordingLoader] = useState(false)
  const [patienceValue, setPatienceValue] = useState(null)
  const [startingPace, setStartingPace] = useState(null)
  const [voiceExpressiveness, setVoiceExpressiveness] = useState(null)
  const [preview, setPreview] = useState(null);
  const [audio, setAudio] = useState(null);

  const voiceExpressivenessList = [
    { id: 1, title: "🎭 Expressive", value: "Expressive" },
    { id: 2, title: "⚖️ Balanced", value: "Balanced" },
    { id: 3, title: "😌 Calm", value: "Calm" },
  ];

  const TalkingPaceList = [
    { id: 1, title: "💨 Fast", value: "Fast" },
    { id: 2, title: "⚖️ Balanced", value: "Balanced" },
    { id: 3, title: "🐢 Slow", value: "Slow" },
  ];

  const ResponseSpeedList = [
    { id: 1, title: "⚡️ Instant", value: "Instant" },
    { id: 2, title: "⏳ Short Pause", value: "Short Pause" },
    { id: 3, title: "🧘 Delayed", value: "Natural Conversation Flow" },
  ];

  const playVoice = (url) => {
    if (audio) {
      audio.pause();
    }
    const ad = new Audio(url); // Create a new Audio object with the preview URL
    ad.play();
    setAudio(ad); // Play the audio
  };


  useEffect(() => {

    const getDefaultData = () => {
      let item = showDrawerSelectedAgent
      if (item) {
        setStartingPace(item.talkingPace);
        //console.log;
        setPatienceValue(item.responseSpeed);
        setLanguageValue(item?.agentLanguage ? item.agentLanguage : "");
        const matchedVoice = voicesList.find(
          (voice) => voice.voice_id === item?.voiceId
        );
        setSelectedVoice(matchedVoice?.name || item?.voiceId);
        setVoiceExpressiveness(item.voiceStability);

        let v = item.agentLanguage === "English" || item.agentLanguage === "Multilingual" ? "en" : "es"
        console.log('v', v)
        let voices = []

        voices = voicesList.filter((voice) => voice.langualge === v)

        console.log('filtered voices are', voices)
        setFilteredVoices(voices);
      }
    }

    getDefaultData()

  }, [showDrawerSelectedAgent])

  const handleLanguageChange = async (event) => {
    setShowLanguageLoader(true);
    let value = event.target.value;
    console.log("selected language is", value)
    // console.log("selected voice is",SelectedVoice)
    let voice = voicesList.find((voice) => voice.name === SelectedVoice)

    let selectedLanguage = value === "English" || value === "Multilingual" ? "en" : "es"

    console.log('selected langualge', selectedLanguage)
    let voiceData = {}
    voiceData = {
      agentLanguage: value,
    };

    await updateSubAgent(voiceData);

    // if selected language is different from friltered voices list 
    if (selectedLanguage != voice.langualge) {

      // update voice list as well 
      setFilteredVoices(voicesList.filter((voice) => voice.langualge === selectedLanguage))

      const newVoiceName = selectedLanguage === "en" ? "Ava" : "Maria";
      await updateAgent(newVoiceName);

      setSelectedVoice(newVoiceName);
    }
    setShowLanguageLoader(false);
    // setSelectedVoice(event.target.value);
    setLanguageValue(value);
  }

  const handleChangeVoice = async (event) => {
    setShowVoiceLoader(true);
    const selectedVoice = filteredVoices.find(
      (voice) => voice.name === event.target.value
    );

    if (!selectedVoice) {
      setShowVoiceLoader(false);
      return;
    }

    await updateAgent(selectedVoice.name); // ✅ send name
    setSelectedVoice(selectedVoice.name); // ✅ store name now
    setShowVoiceLoader(false);


    if (showDrawerSelectedAgent.thumb_profile_image) {
      return;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <div className="text-base font-semibold">Voice Options</div>
        </div>

        {/* Language Selector */}
        <div className="flex w-full justify-between items-center">
          <div className="text-sm text-[#666]">Language</div>
          {showLanguageLoader ? (
            <div
              style={{
                width: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={15} />
            </div>
          ) : (
            <FormControl>
              <Select
                value={languageValue}
                onChange={handleLanguageChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return <div className="text-[#aaa]">Select</div>;
                  const selectedVoice = AgentLanguagesList.find(lang => lang.title === selected);
                  return (
                    <div className="flex items-center gap-2">
                      <Image src={selectedVoice?.flag} height={22} width={22} alt="Selected Language" />
                      <div>{selectedVoice?.title}</div>
                    </div>
                  );
                }}
                sx={{
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {AgentLanguagesList.map((item) => (
                  <MenuItem key={item.title} value={item.title} className="flex items-center gap-2 bg-purple10">
                    <Image src={item.flag} alt="*" height={22} width={22} />
                    <div>{item.title}</div>
                    <div className="text-[#00000060] text-xs">{item.subLang}</div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Voice Selector */}
        <div className="flex w-full justify-between items-center -mt-4">
          <div className="text-sm text-[#666]">Voice</div>
          {showVoiceLoader ? (
            <div
              style={{
                width: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={15} />
            </div>
          ) : (
            <FormControl>
              <Select
                value={SelectedVoice}
                onChange={handleChangeVoice}
                displayEmpty // Enables placeholder
                renderValue={(selected) => {
                  console.log('selected', selected)
                  if (!selected) return <div style={{ color: "#aaa" }}>Select</div>;

                  const selectedVoice = filteredVoices.find(
                    (voice) => voice.name === selected
                  );

                  return selectedVoice ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {selectedVoice.img && (
                        <Image
                          src={selectedVoice.img}
                          height={30}
                          width={30}
                          alt="Selected Voice"
                        />
                      )}
                      <div>{selectedVoice.name}</div>
                    </div>
                  ) : null;
                }}

                sx={{
                  border: "none", // Default border
                  "&:hover": { border: "none" }, // Same border on hover
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  }, // Remove the default outline
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                    { border: "none" },
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "30vh", // Limit dropdown height
                      overflow: "auto", // Enable scrolling in dropdown
                      scrollbarWidth: "none",
                    },
                  },
                }}
              >
                {filteredVoices.map((item, index) => {
                  const selectedVoiceName = (id) => {
                    const voiceName = filteredVoices.find(
                      (voice) => voice.voice_id === id
                    );
                    return voiceName?.name || "Unknown";
                  };

                  return (
                    <MenuItem
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      value={item.name}
                      key={index}
                      disabled={SelectedVoice === item.name}
                    >
                      <Image
                        src={item.img}
                        height={40}
                        width={35}
                        alt="*"
                      />
                      <div>{item.name}</div>

                      {/* Play/Pause Button (Prevents dropdown close) */}
                      {item.preview ? (
                        <div //style={{marginLeft:15}}
                          onClick={(e) => {
                            console.log('audio preview ', item.preview)
                            e.stopPropagation(); // Prevent dropdown from closing
                            e.preventDefault(); // Prevent selection event

                            if (preview === item.preview) {
                              if (audio) {
                                audio.pause();
                              }
                              setPreview(null);
                            } else {
                              setPreview(item.preview);
                              playVoice(item.preview);
                            }
                          }}
                        >
                          {preview === item.preview ? (
                            <PauseCircle
                              size={38}
                              weight="regular"
                            />
                          ) : (
                            <Image
                              src={"/assets/play.png"}
                              height={25}
                              width={25}
                              alt="*"
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowNoAudioModal(item);
                          }}
                        >
                          <Image
                            src={"/assets/play.png"}
                            height={25}
                            width={25}
                            alt="*"
                          />
                        </div>
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Personality Selector */}
        <div className="flex w-full justify-between items-center -mt-4">
          <div className="text-sm text-[#666]">Personality</div>
          {showVoiceExpressivenessLoader ? (
            <div
              style={{
                width: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={15} />
            </div>
          ) : (
            <FormControl>
              <Select
                value={voiceExpressiveness}
                onChange={async (event) => {
                  setShowVoiceExpressivenessLoader(true);
                  const value = event.target.value;
                  let voiceData = {
                    voiceExpressiveness: value,
                  };
                  await updateSubAgent(voiceData);
                  setShowVoiceExpressivenessLoader(false);
                  setVoiceExpressiveness(value);
                }}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return <div className="text-[#aaa]">Select</div>;
                  return voiceExpressivenessList.find(item => item.value === selected)?.title;
                }}
                sx={{
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {voiceExpressivenessList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Talking Pace Selector */}
        <div className="flex w-full justify-between items-center -mt-4">
          <div className="text-sm text-[#666]">Talking Pace</div>
          {showStartingPaceLoader ? (
            <div
              style={{
                width: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={15} />
            </div>
          ) : (
            <FormControl>
              <Select
                value={startingPace}
                onChange={async (event) => {
                  setShowStartingPaceLoader(true);
                  const value = event.target.value;
                  let voiceData = {
                    talkingPace: value,
                  };
                  await updateSubAgent(voiceData);
                  setShowStartingPaceLoader(false);
                  setStartingPace(value);
                }}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return <div className="text-[#aaa]">Select</div>;
                  return TalkingPaceList.find(item => item.value === selected)?.title;
                }}
                sx={{
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {TalkingPaceList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Response Speed Selector */}
        <div className="flex w-full justify-between items-center -mt-4">
          <div className="text-sm text-[#666]">Response Speed</div>
          {showPatienceLoader ? (
            <div
              style={{
                width: "115px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={15} />
            </div>
          ) : (
            <FormControl>
              <Select
                value={patienceValue}
                onChange={async (event) => {
                  setShowPatienceLoader(true);
                  let value = event.target.value;
                  //console.log;
                  let voiceData = {
                    responseSpeed: value,
                  };
                  await updateSubAgent(voiceData);
                  setShowPatienceLoader(false);
                  setPatienceValue(value);
                }}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <div style={{ color: "#aaa" }}>Select</div>
                    ); // Placeholder style
                  }
                  const selectedVoice = ResponseSpeedList.find(
                    (voice) => voice.value === selected
                  );
                  console
                    .log
                    // `Selected Patience Level for ${selected} is ${selectedVoice?.title}`
                    ();
                  return selectedVoice ? selectedVoice?.title : null;
                }}
                sx={{
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {ResponseSpeedList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col gap-1 mt-4">
        <div className="text-base font-semibold">Contact</div>

        {/* Phone Number */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="text-sm text-[#666]">Number used for calls</div>
          <PhoneNumberSelector
            showDrawerSelectedAgent={showDrawerSelectedAgent}
            setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
          />
        </div>

        {/* Callback Number */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="text-sm text-[#666]">Call back number</div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-normal">
              {showDrawerSelectedAgent?.callbackNumber || "-"}
            </div>
            <button onClick={() => setShowEditNumberPopup(showDrawerSelectedAgent?.callbackNumber)}>
              <Image src="/svgIcons/editIcon2.svg" height={24} width={24} alt="edit" />
            </button>
          </div>
        </div>

        {/* Call Transfer Number */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-[#666]">Call transfer number</div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-normal">
              {showDrawerSelectedAgent?.liveTransferNumber || "-"}
            </div>
            <button onClick={() => setShowEditNumberPopup(showDrawerSelectedAgent?.liveTransferNumber)}>
              <Image src="/svgIcons/editIcon2.svg" height={24} width={24} alt="edit" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentInfoTab;