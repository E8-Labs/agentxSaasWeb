import React, { useState } from "react";
import { Box, Modal, CircularProgress } from "@mui/material";
import Image from "next/image";

const ClaimNumberModal = ({
  showClaimPopup,
  handleCloseClaimPopup,
  setOpenCalimNumDropDown,
  setAssignNumber,
  setPreviousNumber,
  previousNumber,
  AssignNumber
}) => {
  const [findeNumberLoader, setFindeNumberLoader] = useState(false);
  const [foundeNumbers, setFoundeNumbers] = useState([]);
  const [findNumber, setFindNumber] = useState("");
  const [purchaseLoader, setPurchaseLoader] = useState(false);
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);

  const handleFindeNumbers = async (number) => {
    try {
      setFindeNumberLoader(true);
      const Auth = AuthToken();
      const response = await axios.get(`${Apis.findPhoneNumber}?areaCode=${number}`, {
        headers: { Authorization: "Bearer " + Auth }
      });

      if (response?.data?.status === true) {
        setFoundeNumbers(response.data.data);
      }
    } catch (error) {
      console.error("Error finding numbers:", error);
    } finally {
      setFindeNumberLoader(false);
    }
  };

  const handlePurchaseNumber = async () => {
    try {
      setPurchaseLoader(true);
      const Auth = AuthToken();
      const formData = new FormData();
      formData.append("phoneNumber", selectedPurchasedNumber.phoneNumber);
      formData.append("mainAgentId", MyAgentData.id);

      const response = await axios.post(Apis.purchaseNumber, formData, {
        headers: { Authorization: "Bearer " + Auth }
      });

      if (response?.data?.status === true) {
        localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
        setAssignNumber(selectedPurchasedNumber.phoneNumber);
        setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
        handleCloseClaimPopup();
        setOpenCalimNumDropDown(false);
      }
    } catch (error) {
      console.error("Error purchasing number:", error);
    } finally {
      setPurchaseLoader(false);
    }
  };

  return (
    <Modal
      open={showClaimPopup}
      onClose={handleCloseClaimPopup}
      BackdropProps={{
        sx: { backgroundColor: "#00000020" }
      }}
    >
      <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px] bg-white mx-auto my-[50vh] transform -translate-y-1/2">
        <div className="w-full">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">Claim Number</div>
            <button onClick={handleCloseClaimPopup}>
              <Image src="/assets/blackBgCross.png" height={20} width={20} alt="close" />
            </button>
          </div>

          <div className="mt-8 text-xl font-semibold">Find a Number</div>
          <p className="mt-4 text-sm">
            Search for available numbers by area code (e.g. 415, 650)
          </p>

          <div className="mt-4 flex gap-2">
            <input
              placeholder="Area code"
              className="w-full p-2 rounded border border-[#00000010] outline-none"
              value={findNumber}
              onChange={(e) => setFindNumber(e.target.value)}
            />
            <button
              className="bg-purple text-white px-4 rounded font-semibold"
              onClick={() => handleFindeNumbers(findNumber)}
            >
              {findeNumberLoader ? <CircularProgress size={20} color="inherit" /> : "Search"}
            </button>
          </div>

          {foundeNumbers.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Available Numbers</div>
              <div className="max-h-[200px] overflow-auto">
                {foundeNumbers.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 mb-2 rounded cursor-pointer ${selectedPurchasedIndex === index ? "bg-purple-100" : "bg-gray-100"}`}
                    onClick={() => {
                      setSelectedPurchasedNumber(item);
                      setSelectedPurchasedIndex(index);
                    }}
                  >
                    {item.phoneNumber}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              className="w-1/2 h-[50px] rounded-lg font-semibold"
              onClick={handleCloseClaimPopup}
            >
              Cancel
            </button>
            <button
              className={`w-1/2 h-[50px] rounded-lg font-semibold ${selectedPurchasedNumber ? "bg-purple text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              onClick={handlePurchaseNumber}
              disabled={!selectedPurchasedNumber}
            >
              {purchaseLoader ? <CircularProgress size={25} color="inherit" /> : "Purchase"}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default ClaimNumberModal;