import { getLocalLocation } from "@/components/onboarding/services/apisServices/ApiService";
import { CircularProgress, Modal, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import Image from "next/image";
import parsePhoneNumberFromString from "libphonenumber-js";

export const EditPhoneNumberModal = ({
  title = "Call Back Number",
  number = "",
  open,
  close,
  loading,
  update,
}) => {
  // //console.log;

  const [errorMessage, setErrorMessage] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumberLoader, setPhoneNumberLoader] = useState(false);
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [locationLoader, setLocationLoader] = useState(false);

  useEffect(() => {
    setUserPhoneNumber(number || "");
  }, [number]);

  //getlocation
  useEffect(() => {
    let loc = getLocalLocation();
    setCountryCode(loc);
  }, []);

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase()
    );
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    } else {
      setErrorMessage("");
    }
  };
  // Handle phone number change and validation
  const handlePhoneNumberChange = (phone) => {
    setUserPhoneNumber(phone);
    validatePhoneNumber(phone);

    if (!phone) {
      setErrorMessage("");
    }
  };
  return (
    <Modal
      open={open != null}
      onClose={close}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: "#00000020",
          // //backdropFilter: "blur(20px)",
        },
      }}
    >
      <Box
        className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-4/12 p-8 rounded-[15px]"
        sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
      >
        <div className="w-full flex flex-row items-center justify-between">
          <div className="w-10"></div>
          <button onClick={close}>
            <Image src={"/svgIcons/cross.svg"} height={24} width={24} alt="*" />
          </button>
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
            color: "#151515",
          }}
        >
          {title}
        </div>

        <div className="w-full flex flex-col items-start gap-3">
          <div style={{ fontSize: 16, fontWeight: "500", marginTop: 30 }}>
            Number
          </div>

          <div className="w-full">
            <PhoneInput
              className="outline-none bg-transparent focus:ring-0"
              country={countryCode} // Default country
              value={userPhoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder={
                locationLoader ? "Loading location ..." : "Enter Phone Number"
              }
              disabled={loading}
              style={{
                borderRadius: "7px",
                outline: "none", // Ensure no outline on wrapper
                boxShadow: "none", // Remove any shadow
                borderWidth: "1px",
              }}
              inputStyle={{
                width: "100%",
                borderWidth: "0px",
                backgroundColor: "transparent",
                paddingLeft: "60px",
                paddingTop: "12px",
                paddingBottom: "12px",
                height: "50px",
                outline: "none", // Remove outline on input
                boxShadow: "none", // Remove shadow as well
              }}
              buttonStyle={{
                border: "none",
                backgroundColor: "transparent",
                outline: "none", // Ensure no outline on button
              }}
              dropdownStyle={{
                maxHeight: "150px",
                overflowY: "auto",
              }}
              countryCodeEditable={true}
              defaultMask={locationLoader ? "Loading..." : undefined}
            />
          </div>

          {loading ? (
            <div className="flex w-full items-center flex col justify-center h-[52px]">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className="w-full outline-none bg-purple h-[52px] text-white rounded-lg"
              onClick={() => { update(userPhoneNumber) }}
            >
              Save
            </button>
          )}
        </div>
      </Box>
    </Modal>
  );
};
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
};
