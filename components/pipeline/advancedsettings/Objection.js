import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const Objection = () => {

  const [ObjectionsList, setObjectionsList] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  const [showAddObjForm, setShowAddObjForm] = useState(false);
  const [addObjTitle, setAddObjTitle] = useState("");
  const [addObjDescription, setAddObjDescription] = useState("");

  const [addObjectionLoader, setAddObjectionLoader] = useState(false);

  useEffect(() => {
    const objectionsList = localStorage.getItem("ObjectionsList");
    if (objectionsList) {
      console.log("Should not call api");
      const objectionsData = JSON.parse(objectionsList);
      console.log("Objection details recieved from locastorage are :", objectionsData);
      setObjectionsList(objectionsData);
    } else {
      console.log("calling api");
      getObjections();
    }
  }, [])
  //code for getting agent data
  const getObjections = async () => {
    try {
      // ?mainAgentId=14
      setInitialLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      let mainAgent = null;
      const localAgent = localStorage.getItem("agentDetails");
      if (localAgent) {
        const agentDetails = JSON.parse(localAgent);
        console.log("Agent details are:", agentDetails);
        mainAgent = agentDetails
      }

      console.log("Auth token is:", AuthToken);

      const ApiPath = `${Apis.getObjectionGuardrial}?mainAgentId=${mainAgent.id}`;
      console.log("Apipath is:", ApiPath);
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response is:", response);
        setObjectionsList(response.data.data.objections);
        localStorage.setItem("ObjectionsList", JSON.stringify(response.data.data.objections));
      }

    } catch (error) {
      console.error("Error occured in get agents api is:", error);
    } finally {
      setInitialLoader(false);
    }
  }

  //code for add objection guardrial api
  const addObjection = async () => {
    try {
      setAddObjectionLoader(true);

      let mainAgent = null
      const agentDetailsLocal = localStorage.getItem("agentDetails");
      if (agentDetailsLocal) {
        const localAgentData = JSON.parse(agentDetailsLocal);
        console.log("Locla agent details are :-", localAgentData);
        mainAgent = localAgentData;
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
        type: "objection",
        mainAgentId: mainAgent.id
      }

      console.log("Api data is :", ApiData);
      // return
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
          setObjectionsList(response.data.data.objections);
          localStorage.setItem("ObjectionsList", JSON.stringify(response.data.data.objections));
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
        ObjectionsList.length > 0 ?
          <div className='overflow-auto h-[40vh]' style={{ scrollbarWidth: "none" }}>
            {ObjectionsList.map((item, index) => {
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
                  No objection found
                </div>
            }
          </div>
      }

      <button className='text-purple mt-4 outline-none'
        style={{ fontWeight: "700", fontSize: 16 }}
        onClick={() => setShowAddObjForm(true)}>
        New Question
      </button>

      {/* Modal for Adding new item in array */}
      <Modal
        open={showAddObjForm}
        onClose={() => { setShowForm(false) }}
      >
        <Box sx={{ ...styles.modalsStyle, width: "50%", backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>
            <div className='w-full' style={{ direction: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "600", fontSize: 16.8 }}>
                Add New Objection
              </div>
              <button onClick={() => { setShowAddObjForm(false) }}>
                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
              </button>
            </div>
            <div style={styles.title}>
              Title
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
            <input
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
                  <button className='text-white bg-purple h-[50px] rounded-xl w-full mt-8' onClick={addObjection} style={styles.title}>
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

export default Objection
