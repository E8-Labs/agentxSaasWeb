import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { loadStripe } from "@stripe/stripe-js";
import { getUserLocalData } from "@/components/constants/constants";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { Elements } from "@stripe/react-stripe-js";
import Image from "next/image";

export default function DncConfirmationPopup({
  open,
  onClose,
  onCancel,
  onConfirm,
  leadsCount,
}) {
  //console.log;
  const totalCost = leadsCount < 34 ? 1 : leadsCount * 0.03;

  let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
      ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(stripePublickKey);

  const [userData, setUserData] = useState(null)
  const [showAddCard, setShowAddCard] = useState(false)

  useEffect(() => {
    let data = getUserLocalData()
    if (data) {
      setUserData(data)
    }
  }, [])

  const handleClose = (data) => {
    console.log("data of add card", data)
    if (data) {
        setShowAddCard(false);
        onConfirm()
        // setCards([newCard, ...cards]);
    }
}
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "24px",
            width: "500px",
            maxWidth: "90%",
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "#000",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Modal Title */}
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", mt: 1 }}>
          Confirm DNC Charges
        </DialogTitle>

        {/* Info Box */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            // gap: 1.5,
            backgroundColor: "#F6F0FF",
            padding: "8px 12px",
            borderRadius: "8px",
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
              // backgroundColor: "#F6F0FF",
              // padding: "12px 16px",
              borderRadius: "8px",
              mb: 0,
            }}
          >
            <InfoOutlinedIcon sx={{ color: "#7902DF", fontSize: 20 }} />
            <Typography sx={{ fontSize: "14px", color: "#000" }}>
              {`DNC Checklist is $0.03/number.`}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
              // backgroundColor: "#F6F0FF",
              // padding: "12px 16px",
              borderRadius: "8px",
              mb: 0,
            }}
          >
            <InfoOutlinedIcon sx={{ color: "transparent", fontSize: 20 }} />
            <Typography sx={{ fontSize: "14px", color: "#000" }}>
              {`If less than 34 leads, it's $1.`}
            </Typography>
          </Box>
        </Box>

        {/* Modal Content */}
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography sx={{ color: "#000", fontSize: "16px" }}>
              Total Leads
            </Typography>
            <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
              {leadsCount}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{ color: "#000", fontSize: "16px" }}>
              Cost Per Lead
            </Typography>
            <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
              $0.03
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              pt: 1,
              borderTop: "1px solid #ddd",
            }}
          >
            <Typography sx={{ color: "#000", fontSize: "16px" }}>
              Total Cost
            </Typography>
            <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
              ${totalCost.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>

        {/* Buttons */}
        <DialogActions sx={{ justifyContent: "space-between", mt: 3 }}>
          <div
            onClick={onClose}
            className=" flex w-[45%] text-black font-bold text-[16px]  hover:text-[#7902DF] py-3 rounded-lg
                     items-center justify-center"
            style={{ textTransform: "none", cursor: 'pointer' }}
          >
            Cancel
          </div>

          {/* <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            backgroundColor: "#7902DF",
            color: "white",
            borderRadius: "8px",
            padding: "10px 20px",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Confirm & Pay
        </Button> */}
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-purple font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              if (userData?.user?.cards?.length === 0) {
                setShowAddCard(true)
              } else {
                onConfirm()
              }
            }}
            style={{
              borderColor: "#ddd",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              padding: "0.8rem",
              borderRadius: "10px",
              width: "45%",
            }}
          >
            Confirm & Pay
          </div>
        </DialogActions>
      </Dialog>


      {/* Add Payment Modal */}
      <Modal
        open={showAddCard} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                  }}
                >
                  Payment Details
                </div>
                <button onClick={() => setShowAddCard(false)}>
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  //selectedPlan={selectedPlan}
                  // stop={stop}
                  // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={""}
                // fromAdmin={true}
                // selectedUser={selectedUSer}
                // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}


     const styles = {
    paymentModal: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    claimPopup: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };