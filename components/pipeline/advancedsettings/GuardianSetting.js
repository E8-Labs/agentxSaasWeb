import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal, TextareaAutosize } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const GuardianSetting = ({ showTitle, selectedAgentId }) => {

  const [guardrailsList, setGuardrailsList] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  const [showAddObjForm, setShowAddObjForm] = useState(false);
  const [addObjTitle, setAddObjTitle] = useState("");
  const [addObjDescription, setAddObjDescription] = useState("");

  const [addObjectionLoader, setAddObjectionLoader] = useState(false);

  useEffect(() => {
    const guadrailsList = localStorage.getItem("GuadrailsList");
    if (guadrailsList) {
      console.log("Should not call api");
      const guardrailsData = JSON.parse(guadrailsList);
      console.log("guardrails details recieved from locastorage are :", guardrailsData);
      setGuardrailsList(guardrailsData);
    } else {
      console.log("calling api");
      getGuadrails();
    }
  }, [])
  //code for getting agent data
  const getGuadrails = async () => {
    try {
      setInitialLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // let mainAgent = null
      // const agentDetailsLocal = localStorage.getItem("agentDetails");
      // if (agentDetailsLocal) {
      //   const localAgentData = JSON.parse(agentDetailsLocal);
      //   console.log("Locla agent details are :-", localAgentData);
      //   mainAgent = localAgentData;
      // }

      let mainAgentId = null;

      if (selectedAgentId) {
        mainAgentId = selectedAgentId.id
      } else {
        const localAgent = localStorage.getItem("agentDetails");
        if (localAgent) {
          const agentDetails = JSON.parse(localAgent);
          console.log("Agent details are:", agentDetails);
          mainAgentId = agentDetails.id
        }
      }

      console.log("Auth token is:", AuthToken);

      const ApiPath = `${Apis.getObjectionGuardrial}?mainAgentId=${mainAgentId}`;
      console.log("Apipath is:", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response is:", response);
        setGuardrailsList(response.data.data.guardrails);
        localStorage.setItem("GuadrailsList", JSON.stringify(response.data.data.guardrails));
      }

    } catch (error) {
      console.error("Error occured in get agents api is:", error);
    } finally {
      setInitialLoader(false);
    }
  }

  //code for add objection guardrial api
  const addGuadrial = async () => {
    try {
      setAddObjectionLoader(true);

      // let mainAgent = null
      // const agentDetailsLocal = localStorage.getItem("agentDetails");
      // if (agentDetailsLocal) {
      //   const localAgentData = JSON.parse(agentDetailsLocal);
      //   console.log("Locla agent details are :-", localAgentData);
      //   mainAgent = localAgentData;
      // }

      let mainAgentId = null;

      if (selectedAgentId) {
        mainAgentId = selectedAgentId.id
      } else {
        const localAgent = localStorage.getItem("agentDetails");
        if (localAgent) {
          const agentDetails = JSON.parse(localAgent);
          console.log("Agent details are:", agentDetails);
          mainAgentId = agentDetails.id
        }
      }

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      console.log("Auth token is:", AuthToken);

      const ApiData = {
        title: addObjTitle,
        description: addObjDescription,
        type: "guardrail",
        mainAgentId: mainAgentId
      }

      console.log("Api data is :", ApiData);

      const ApiPath = Apis.addObjectionGuardrial;
      console.log("Apipath is", ApiPath);

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of add objection api is:", response);
        if (response.data.status === true) {
          setGuardrailsList(response.data.data.guardrails);
          localStorage.setItem("GuadrailsList", JSON.stringify(response.data.data.guardrails));
          setShowAddObjForm(false);
          setAddObjTitle("");
          setAddObjDescription("");
        }
      }

    } catch (error) {
      console.error("Error occured in add objection:", error);
    } finally {
      setAddObjectionLoader(false);
    }
  }



  const styles = {
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    title: {
      fontSize: 15,
      fontWeight: "600"
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: 500,
      border: "1px solid #00000020",
      outline: "none",
      borderRadius: "7px",
      width: "100%",
      marginTop: 10,
      padding: 5,
      height: "50px"
    }
  }

  return (
    <div>

      {
        showTitle && (
          <div className='flex flex-row items-center justify-between mt-4 pb-3'>
            <div style={{ fontWeight: "600", fontSize: 16.8 }}>
            </div>
            <button className='text-purple underline outline-none'
              style={{ fontWeight: "500", fontSize: 15 }}
              onClick={() => setShowAddObjForm(true)}
            >
              New Guardrail
            </button>
          </div>
        )
      }

      {
        guardrailsList.length > 0 ?
          <div style={{ scrollbarWidth: "none", overflow: !showTitle && "auto", maxHeight: showTitle ? "100%" : "40vh" }}>
            {guardrailsList.map((item, index) => {
              return (
                <div className='p-3 rounded-xl mt-4' key={index} style={{ border: "1px solid #00000020" }}>
                  <div style={{ fontWeight: "600", fontSize: 15 }}>
                    {item.title}
                  </div>
                  <div className='mt-2 bg-gray-100 p-2' style={{ fontWeight: "500", fontSize: 15 }}>
                    {item.description}
                  </div>
                </div>
              )
            })}
          </div> :
          <div>
            {
              initialLoader ?
                <div className='w-full flex flex-row items-center justify-center mt-8'>
                  <CircularProgress size={25} />
                </div> :
                <div className='text-center text-2xl mt-6'>
                  <div className='flex flex-col items-center justify-center h-[20vh] w-full' style={{ fontWeight: "500", fontsize: 15 }}>
                    <div className='h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center'>
                      <Image src={"/assets/activityClock.png"} height={24} width={24} alt='*' />
                    </div>
                    <div className='mt-4'>
                      <i style={{ fontWeight: "500", fontsize: 15 }}>
                        All guardrails will be shown here
                      </i>
                    </div>
                  </div>
                </div>
            }
          </div>
      }

      {
        !showTitle && (
          <button className='text-purple mt-4 outline-none'
            style={{ fontWeight: "700", fontSize: 16 }}
            onClick={() => setShowAddObjForm(true)}>
            Add New
          </button>
        )
      }

      {/* Modal for Adding new item in array */}
      <Modal
        open={showAddObjForm}
        onClose={() => { setShowAddObjForm(false) }}
      >
        <Box sx={{ ...styles.modalsStyle, width: "50%", backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>
            <div className='w-full' style={{ direction: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "600", fontSize: 16.8 }}>
                Add New Guardrail
              </div>
              <button onClick={() => { setShowAddObjForm(false) }}>
                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
              </button>
            </div>
            <div style={styles.title}>
              {`What's the guardrail`}
            </div>
            <input
              className='outline-none focus:outline-none focus:ring-0'
              style={styles.inputStyle} placeholder='Add title'
              value={addObjTitle}
              onChange={(event) => { setAddObjTitle(event.target.value) }}
            />
            <div style={{ ...styles.title, marginTop: 10 }}>
              Description
            </div>
            <TextareaAutosize
              maxRows={5}
              className='outline-none focus:outline-none focus:ring-0'
              style={styles.inputStyle} placeholder='Add description'
              value={addObjDescription}
              onChange={(event) => { setAddObjDescription(event.target.value) }} />
            <div className='w-full'>
              {
                addObjectionLoader ?
                  <div className='w-full flex flex-row items-center justify-center mt-8 h-[50px]'>
                    <CircularProgress size={25} />
                  </div> :
                  <button className='text-white bg-purple h-[50px] rounded-xl w-full mt-8' onClick={addGuadrial} style={styles.title}>
                    Save & Close
                  </button>
              }
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default GuardianSetting
