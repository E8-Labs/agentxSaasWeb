import React, { useEffect, useState } from 'react'
import Header from '../onboarding/Header'
import Footer from '../onboarding/Footer'
import ProgressBar from '../onboarding/ProgressBar'
import { borderColor } from '@mui/system'
import Apis from '../apis/Apis'
import axios from 'axios'

const AddCalender = ({ handleContinue }) => {

  const [createPipelineLoader, setcreatePipelineLoader] = useState(false);
  const [shouldContinue, setshouldContinue] = useState(true);

  const [calenderTitle, setCalenderTitle] = useState("");
  const [calenderApiKey, setCalenderApiKey] = useState("");
  const [eventId, setEventId] = useState("")

  useEffect(() => {
    if (calenderTitle && calenderApiKey || eventId) {
      setshouldContinue(false);
    } else {
      setshouldContinue(true);
    }
  }, [calenderTitle, calenderApiKey, eventId]);

  //code for calender api
  const handleAddCalender = async () => {
    try {
      setcreatePipelineLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      let currentAgentDetails = null;

      const agentDetails = localStorage.getItem("agentDetails");
      if (agentDetails) {
        const agentData = JSON.parse(agentDetails);
        console.log("Recieved from are :--", agentData);
        currentAgentDetails = agentData;
      }


      console.log("Auth token is:", AuthToken);
      const ApiPath = Apis.addCalender;
      console.log("Api path is:", ApiPath);

      const ApiData = {
        apiKey: calenderApiKey,
        title: calenderTitle,
        eventId: eventId,
        mainAgentId: currentAgentDetails.id
      }

      const formData = new FormData();

      formData.append("apiKey", calenderApiKey)
      formData.append("title", calenderTitle)
      formData.append("mainAgentId", currentAgentDetails.id)

      if (eventId) {
        formData.append("eventId", eventId)
      }

      console.log("Api data is:", ApiData);
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
        }
      });

      if (response) {
        console.log("Response of add calender api is:", response.data.data);

        if (response.data.status === true) {
          handleContinue();
        }

      }

    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setcreatePipelineLoader(false);
    }
  }


  const styles = {
    inputStyles: {
      fontWeight: "500",
      fontSize: 15,
      borderColor: "#00000020"
    }
  }

  return (
    <div style={{ width: "100%" }} className="overflow-y-none flex flex-row justify-center items-center">
      <div className='bg-white rounded-2xl w-10/12 h-[90vh] py-4 flex flex-col'>

        <div className='h-[100%]'>
          <div className='h-[87%]'>
            <div>
              <Header showSkip={true} handleContinue={handleContinue} shouldContinue={shouldContinue} />
            </div>

            <div>
              <div style={{ fontWeight: "700", fontSize: 38, textAlign: "center" }}>
                Add a Calendar
              </div>
              <div style={{ textAlign: "center", marginTop: 4, color: "#151515", fontWeight: "500" }}>
                By adding a calendar, your agent will use this to book <br /> meetings based on your availability.
              </div>
            </div>

            <div className='w-full flex flex-col w-full items-center'>
              <div className='w-6/12'>
                <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                  Add calender title
                </div>
                <div>
                  <input
                    className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                    placeholder='Calnder name'
                    style={styles.inputStyles}
                    value={calenderTitle}
                    onChange={(e) => {
                      let value = e.target.value;
                      setCalenderTitle(value);
                    }}
                  />
                </div>
                <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                  Add api key
                </div>
                <div>
                  <input
                    className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                    placeholder='Calnder name'
                    style={styles.inputStyles}
                    value={calenderApiKey}
                    onChange={(e) => {
                      let value = e.target.value;
                      setCalenderApiKey(value);
                    }}
                  />
                </div>
                <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                  Add event id
                </div>
                <div>
                  <input
                    className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                    placeholder='Calnder name'
                    style={styles.inputStyles}
                    value={eventId}
                    onChange={(e) => {
                      let value = e.target.value;
                      setEventId(value);
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className='h-[13%]'>
            <ProgressBar value={33} />
            <Footer handleContinue={handleAddCalender} donotShowBack={true} registerLoader={createPipelineLoader} shouldContinue={shouldContinue} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default AddCalender