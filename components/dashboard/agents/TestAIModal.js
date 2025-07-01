import React, { useState } from "react";
import { Box, Modal, CircularProgress } from "@mui/material";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { PersistanceKeys } from "@/constants/Constants";
import parsePhoneNumberFromString from "libphonenumber-js";

const TestAIModal = ({
  openTestAiModal,
  setOpenTestAiModal,
  selectedAgent,
  setShowSuccessSnack,
  setIsVisibleSnack,

}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [testAIloader, setTestAIloader] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [scriptKeys, setScriptKeys] = useState([]);
  const [loading, setLoading] = useState(false)

  const handlePhoneNumberChange = (phone) => {
    setPhone(phone);
    validatePhoneNumber(phone);
    if (!phone) setErrorMessage("");
  };

  const validatePhoneNumber = (phoneNumber) => {
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    } else {
      setErrorMessage("");
    }
  };

  //function to call testAi Api
  const handleTestAiClick = async () => {
    try {
      setLoading(true);
      let AuthToken = null;
      const userData = localStorage.getItem("User");

      if (userData) {
        const localData = JSON.parse(userData);
        ////console.log;
        AuthToken = localData.token;
      }

      const newArray = scriptKeys.map((key, index) => ({
        [key]: inputValues[index] || "", // Use the input value or empty string if not set
      }));
      ////console.log;
      ////console.log);

      const ApiData = {
        agentId: selectedAgent.id,
        name: name,
        phone: phone,
        extraColumns: newArray,
      };

      localStorage.setItem(PersistanceKeys.TestAiCredentials, JSON.stringify(ApiData));

      const ApiPath = Apis.testAI;

      ////console.log);
      ////console.log);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        ////console.log;
        setOpenTestAiModal(false);
        setShowSuccessSnack(response.data.message);
        setIsVisibleSnack(true);
        // if (response.data.status === true) {
        //   // setName("");
        //   // setPhone("");
        // }
      }
    } catch (error) {
      console.error("Error occured in test api is", error);
      setOpenTestAiModal(false);
    } finally {
      ////console.log;
      setLoading(false);
    }
  };

  return (
    <Modal
      open={openTestAiModal}
      onClose={() => {
        setOpenTestAiModal(false);
        setName("");
        setPhone("");
        setErrorMessage("");
      }}
      BackdropProps={{
        sx: { backgroundColor: "#00000020" }
      }}
    >
      <Box className="lg:w-4/12 sm:w-10/12 w-full" sx={styles.modalsStyle}>
        <div className="flex flex-row justify-center w-full max-h-[80vh]">
          <div
            className="sm:w-full w-full px-10 py-8 h-full"
            style={{
              backgroundColor: "#ffffff",
              scrollbarWidth: "none",
              borderRadius: "13px",
            }}
          >
            <div className="h-[85%] overflow-auto">
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-3">
                  <Image
                    src={"/otherAssets/testAiIcon.png"}
                    height={19}
                    width={19}
                    alt="icon"
                  />
                  <div
                    style={{ fontSize: 16, fontWeight: "500", color: "#000" }}
                  >
                    Test
                  </div>

                  {!selectedAgent?.phoneNumber && (
                    <div className="flex flex-row items-center gap-2 -mt-1">
                      <Image
                        src={"/assets/warningFill.png"}
                        height={20}
                        width={20}
                        alt="*"
                      />
                      <p>
                        <i
                          className="text-red"
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          No phone number assigned
                        </i>
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setOpenTestAiModal(false);
                    setName("");
                    setPhone("");
                    setErrorMessage("");
                  }}
                >
                  <Image
                    src={"/otherAssets/crossIcon.png"}
                    height={24}
                    width={24}
                    alt="*"
                  />
                </button>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: 20,
                }}
              >
                Tryout ({selectedAgent?.name.slice(0, 1).toUpperCase()}
                {selectedAgent?.name.slice(1)})
              </div>

              <div className="pt-5" style={styles.headingStyle}>
                Who are you calling
              </div>
              <input
                placeholder="Name"
                className="w-full rounded p-2 outline-none focus:outline-none focus:ring-0"
                style={{
                  ...styles.inputStyle,
                  border: "1px solid #00000010",
                }}
                value={name || ""}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />

              <div className="pt-5" style={styles.headingStyle}>
                Phone Number
              </div>

              <div style={{ marginTop: "8px" }}>
                <PhoneInput
                  className="border outline-none bg-white"
                  country={"us"}
                  onlyCountries={["us", "sv", "pk"]}
                  disableDropdown={false}
                  countryCodeEditable={false}
                  value={phone}
                  onChange={handlePhoneNumberChange}
                  placeholder={
                    "Enter Number"
                  }
                  style={{ borderRadius: "7px" }}
                  inputStyle={{
                    width: "100%",
                    borderWidth: "0px",
                    backgroundColor: "transparent",
                    paddingLeft: "60px",
                    paddingTop: "20px",
                    paddingBottom: "20px",
                  }}
                  buttonStyle={{
                    border: "none",
                    backgroundColor: "transparent",
                   
                  }}
                  dropdownStyle={{
                    maxHeight: "150px",
                    overflowY: "auto",
                  }}
                />
              </div>

              {errorMessage ? (
                <p
                  style={{
                    ...styles.errmsg,
                    color: errorMessage && "red",
                    height: "20px",
                  }}
                >
                  {errorMessage}
                </p>
              ) : (
                ""
              )}

              <div
                className="max-h-[37vh] overflow-none"
                style={{ scrollbarWidth: "none" }}
              >
                {scriptKeys?.map((key, index) => (
                  <div key={index}>
                    <div className="pt-5" style={styles.headingStyle}>
                      {key[0]?.toUpperCase()}
                      {key?.slice(1)}
                    </div>
                    <input
                      placeholder="Type here"
                      // className="w-full border rounded p-2 outline-none focus:outline-none focus:ring-0 mb-12"
                      className={`w-full rounded p-2 outline-none focus:outline-none focus:ring-0 ${index === scriptKeys?.length - 1 ? "mb-16" : ""
                        }`}
                      style={{
                        ...styles.inputStyle,
                        border: "1px solid #00000010",
                      }}
                      value={inputValues[index] || ""} // Default to empty string if no value
                      onChange={(e) =>
                        handleInputChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full mt-6 h-[15%]" style={{}}>
              {loading ? (
                <div className="flex flex-row items-center justify-center w-full p-3 mt-2">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <div>
                  {name && phone && (
                    <button
                      // style={{ marginTop: 10 }}
                      className="w-full flex bg-purple p-3 rounded-lg items-center justify-center"
                      onClick={handleTestAiClick}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "#fff",
                        }}
                      >
                        Test AI
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default TestAIModal;


const styles = {
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
     headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
      marginTop: 10,
      borderColor: "#00000020",
    },
    paragraph: {
      fontSize: 15,
      fontWeight: "500",
    },
}