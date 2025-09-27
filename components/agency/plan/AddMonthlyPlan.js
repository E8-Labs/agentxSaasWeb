import { Modal, Box, Switch, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import { AuthToken } from "./AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { useEffect } from "react";
import Image from "next/image";
import { formatDecimalValue, handlePricePerMinInputValue } from "../agencyServices/CheckAgencyData";
import SubDuration from "./SubDuration";
import SideUI from "./SideUI";

// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function AddMonthlyPlan({
  open,
  handleClose,
  onPlanCreated,
  canAddPlan,
  agencyPlanCost,
  isEditPlan,
  selectedPlan,
  selectedAgency,
  handleContinue,
  basicsData
}) {

  //auto scroll to bottom
  const scrollContainerRef = useRef(null);

  const [allowTrial, setAllowTrial] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [showTrailWarning, setShowTrailWarning] = useState(false);

  //for Hamza update the inout fields value storing
  //strike through is original price
  //price/min is discoounted orice

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planDuration, setPlanDuration] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [minutes, setMinutes] = useState("");
  const [trialValidForDays, setTrialValidForDays] = useState("");
  // const [trialMinutes, setTrialMinutes] = useState("");

  const [createPlanLoader, setCreatePlanLoader] = useState(false);
  const [snackMsg, setSnackMsg] = useState(null);
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);
  const [snackBannerMsg, setSnackBannerMsg] = useState(null);
  const [snackBannerMsgType, setSnackBannerMsgType] = useState(SnackbarTypes.Error);
  const [minCostErr, setMinCostErr] = useState(false);

  //plan passed is
  const [planPassed, setPlanPassed] = useState(null);

  //check if is edit plan is true then store the predefault values
  useEffect(() => {
    console.log("Test log monthlyplan ")
    if (selectedPlan) {
      setPlanPassed(selectedPlan);
      console.log("Value of selected plan passed is", selectedPlan);
      setTitle(selectedPlan?.title);
      setIsDefault(selectedPlan?.isDefault);
      setTag(selectedPlan?.tag ?? "");
      setPlanDescription(selectedPlan?.planDescription);
      const OriginalPrice = selectedPlan?.originalPrice;
      if (OriginalPrice > 0) {
        setOriginalPrice(
          selectedPlan?.originalPrice !== undefined ? selectedPlan.originalPrice : 0
        );
      }
      const DiscountedPrice = selectedPlan?.discountedPrice / selectedPlan?.minutes
      setDiscountedPrice(formatFractional2(DiscountedPrice));
      setMinutes(selectedPlan?.minutes);
      setPlanDuration(selectedPlan?.duration);
    }
  }, [selectedPlan])

  //data restoring
  useEffect(() => {
    console.log("Test log monthlyplan ")
    if (basicsData) {
      console.log("Value passed is", basicsData);
      setTitle(basicsData?.title);
      setIsDefault(basicsData?.isDefault);
      setTag(basicsData?.tag ?? "");
      setPlanDescription(basicsData?.planDescription);
      const OriginalPrice = basicsData?.originalPrice;
      setOriginalPrice(
        selectedPlan?.originalPrice !== undefined ? selectedPlan.originalPrice : 0
      );
      // if (OriginalPrice > 0) {
      // }
      const DiscountedPrice = basicsData?.discountedPrice
      if (DiscountedPrice) {
        setDiscountedPrice(formatFractional2(basicsData?.discountedPrice));
      }
      setMinutes(basicsData?.minutes);
      setPlanDuration(basicsData?.planDuration);
    }
  }, [basicsData])

  //auto remove show trial warning
  useEffect(() => {
    if (showTrailWarning) {
      const timer = setTimeout(() => {
        setShowTrailWarning(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showTrailWarning]);

  //auto check minCostError
  useEffect(() => {
    if (discountedPrice && minutes) {
      const P = (discountedPrice * 100) / minutes;
      console.log("Calculated price is", P);
    }
  }, [minutes, discountedPrice]);

  //check percentage calculation
  const checkCalulations = () => {
    if (originalPrice > 0) {
      console.log("OP ===", originalPrice)//updated
      console.log("DP ===", (discountedPrice * minutes))
      const percentage = (originalPrice - (discountedPrice * minutes)) / originalPrice * 100 //replace the op * min done
      console.log("Percenage of addmonthly plan is", percentage)
    }
  }

  //profit text color
  const getClr = () => {
    const percentage =
      ((discountedPrice - agencyPlanCost) / agencyPlanCost) * 100;

    if (percentage >= 0 && percentage <= 50) {
      return "#FF4E4E";
    } else if (percentage > 50 && percentage <= 75) {
      return "orange";
    } else if (percentage > 75 && percentage < 100) {
      return "yellow";
    } else if (percentage >= 100) {
      return "#01CB76";
    }
  };

  //reset values after plan added
  const handleResetValues = () => {
    setTitle("")
    setTag("")
    setPlanDescription("")
    setOriginalPrice("")
    setDiscountedPrice("")
    setMinutes("")
    setMinCostErr(false)
    setSnackMsg(null)
    setSnackMsgType(null)
    setAllowTrial(false)
    setIsDefault(false)
    setTrialValidForDays("")
    setCreatePlanLoader(false);
  }


  //handle allow trial change
  const handleAllowTrialChange = (e) => {
    // if (canAddPlan) {
    setAllowTrial(e.target.checked);
    setShowTrailWarning(false);

    if (e.target.checked) {
      // Wait for the DOM to render trial inputs, then scroll
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
    // } else {
    //   setShowTrailWarning(true);
    // }
  };

  // Keep only up to 2 fractional digits; always render as "0.xx"
  const formatFractional2 = (raw) => {
    if (raw == null) return "";
    const s = raw.toString();
    const afterDot = s.includes(".") ? s.split(".")[1] : s;
    const digits = afterDot.replace(/\D/g, "").slice(0, 2);
    return digits ? `0.${digits}` : "";
  };


  //handle next
  const handleNext = () => {
    console.log(`value of original price is${originalPrice} && is default value is ${Boolean(isDefault)}`)
    const planData = {
      title: title,
      tag: tag,
      planDescription: planDescription,
      planDuration: planDuration,
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      minutes: minutes,
      isDefault: isDefault
    }
    handleContinue(planData);
  }

  const styles = {
    labels: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#00000050",
    },
    inputs: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#000000",
    },
    text: {
      fontSize: "15px",
      fontWeight: "500",
    },
    text2: {
      textAlignLast: "left",
      fontSize: 15,
      color: "#000000",
      fontWeight: 500,
      whiteSpace: "nowrap", // Prevent text from wrapping
      overflow: "hidden", // Hide overflow text
      textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    gitTextStyle: {
      fontSize: 15,
      fontWeight: "700",
    },

    //style for plans
    cardStyles: {
      fontSize: "14",
      fontWeight: "500",
      border: "1px solid #00000020",
    },
    pricingBox: {
      position: "relative",
      // padding: '10px',
      borderBottomLeftRadius: "15px",
      borderBottomRightRadius: "15px",
      borderTopLeftRadius: allowTrial && trialValidForDays ? "0px" : "15px",
      borderTopRightRadius: allowTrial && trialValidForDays ? "0px" : "15px",
      // backgroundColor: '#f9f9ff',
      display: "inline-block",
      width: "100%",
    },
    triangleLabel: {
      position: "absolute",
      top: "0",
      right: "0",
      width: "0",
      height: "0",
      borderTop: "50px solid #7902DF", // Increased height again for more padding
      borderLeft: "50px solid transparent",
    },
    labelText: {
      position: "absolute",
      top: "10px", // Adjusted to keep the text centered within the larger triangle
      right: "5px",
      color: "white",
      fontSize: "10px",
      fontWeight: "bold",
      transform: "rotate(45deg)",
    },
    content: {
      textAlign: "left",
      paddingTop: "10px",
    },
    originalPrice: {
      // textDecoration: "line-through",
      color: "#7902DF",
      fontSize: 18,
      fontWeight: "600",
    },
    discountedPrice: {
      color: "#000000",
      fontWeight: "700",
      fontSize: 22,
      // marginLeft: "10px",
    },
  };

  const isFormValid = () => {
    const requiredFieldsFilled =
      title?.trim() &&
      planDescription?.trim() &&
      discountedPrice && //no need to replace here
      minutes;

    const trialValid = allowTrial ? trialValidForDays : true;

    return requiredFieldsFilled && trialValid && !minCostErr;
  };


  return (
    <Modal
      open={open}
    // onClose={() => {
    //   handleResetValues();
    //   handleClose("");
    // }}
    >
      {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
      <Box className="bg-none rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none outline-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AgentSelectSnackMessage
          isVisible={snackMsg !== null}
          message={snackMsg}
          hide={() => {
            setSnackMsg(null);
          }}
          type={snackMsgType}
        />
        <AgentSelectSnackMessage
          isVisible={snackBannerMsg !== null}
          message={snackBannerMsg}
          hide={() => {
            // setSnackMsg(null);
          }}
          type={snackBannerMsgType}
        />
        <div className="w-full flex flex-row h-[100%] items-start justify-center bg-none">
          {showTrailWarning && (
            <div className="absolute left-1/2 -translate-x-1/2 top-10">
              <Image
                className="rounded-md"
                src={"/agencyIcons/trialPlans.jpg"}
                height={40}
                width={356}
                alt="*"
              />
            </div>
          )}
          <div className="w-6/12 h-[100%] p-6 bg-white rounded-tl-xl rounded-bl-xl shadow-lg">
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto w-full h-[90%] scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="mb-4" style={{ fontWeight: "600", fontSize: 18 }}>
                {isEditPlan ? "Edit Plan" : "New Plan"}
              </div>

              <div className="w-full flex flex-row items-center justify-center gap-2">
                {/* Plan Name */}
                <div className="w-1/2">
                  <label style={styles.labels}>Plan Name</label>
                  <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                    placeholder="Type here"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                  />
                </div>

                {/* Tag Option */}
                <div className="w-1/2">
                  <label style={styles.labels}>Tag</label>
                  <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                    placeholder="Popular, best deals"
                    value={tag}
                    onChange={(e) => {
                      setTag(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <label style={styles.labels}>Description</label>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                placeholder="Type here"
                value={planDescription}
                onChange={(e) => {
                  setPlanDescription(e.target.value);
                }}
              />

              {/* Plan duration */}
              <SubDuration
                planDuration={planDuration}
                setPlanDuration={setPlanDuration}
                isEditPlan={isEditPlan}
              />

              <div className="w-full flex flex-row items-center gap-2">
                <div className="w-6/12">
                  {/* Price */}
                  <label style={styles.labels}>
                    {agencyPlanCost && (`Price per credit $${(agencyPlanCost).toFixed(2)}`)}
                  </label>
                  <div className={`border ${minCostErr || (discountedPrice && discountedPrice < agencyPlanCost) ? "border-red" : "border-gray-200"} rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full`}>
                    <div className="" style={styles.inputs}>
                      $
                    </div>
                    <input
                      style={styles.inputs}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                      placeholder="0.00"
                      value={discountedPrice}
                      onChange={(e) => {
                        // setDiscountedPrice(formatFractional2(e.target.value)); // no more repeated "0."
                        const value = e.target.value;
                        if (value && value < agencyPlanCost) {
                          setSnackBannerMsg(`Price per credit cannot be less than $ ${agencyPlanCost.toFixed(2)}`);
                          setSnackBannerMsgType(SnackbarTypes.Warning);
                        } else {
                          setSnackBannerMsg(null);
                        }
                        // setDiscountedPrice(UpdatedValue);
                        // const value = e.target.value;
                        // Allow only digits and one optional period
                        const sanitized = value.replace(/[^0-9.]/g, '');

                        // Prevent multiple periods
                        const valid = sanitized.split('.')?.length > 2
                          ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                          : sanitized;
                        const UpdatedValue = handlePricePerMinInputValue(valid);
                        setDiscountedPrice(UpdatedValue);
                      }}
                    />
                  </div>

                  {/*minCostErr && (
                    <div className="flex flex-row items-center gap-2 mb-4">
                      <Image
                        src={"/agencyIcons/InfoIcon.jpg"}
                        alt="info"
                        height={20}
                        width={20}
                      />
                      <p
                        className="flex items-center gap-1"
                        style={{ fontSize: "15px", fontWeight: "500" }}
                      >
                        Min cost per min is ${agencyPlanCost}
                      </p>
                    </div>
                  )*/}

                  {/* Minutes */}
                  <label style={styles.labels}>Credits</label>
                  <div className="border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full">
                    <input
                      style={styles.inputs}
                      type="text"
                      className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                      placeholder="000"
                      value={minutes}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and one optional period
                        const sanitized = value.replace(/[^0-9.]/g, '');

                        // Prevent multiple periods
                        const valid = sanitized.split('.').length > 2
                          ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                          : sanitized;
                        setMinutes(valid);
                      }}
                    />
                  </div>
                </div>
                <div className="bg-[#F9F9F9] rounded-lg p-2 w-6/12 h-full">
                  <div
                    style={{
                      fontWeight: "500",
                      fontSize: 15,
                      color: "#00000050",
                    }}
                  >
                    Margin Calculation
                  </div>
                  <div
                    className="flex flex-row items-center justify-between"
                    style={styles.inputs}
                  >
                    <div>Your Credit</div>
                    <div>${formatFractional2(discountedPrice)}/Credit</div>
                    {
                      discountedPrice && minutes && (
                        <div>${formatDecimalValue(discountedPrice * minutes)}</div>
                      )
                    }
                  </div>
                  <div
                    className="flex flex-row items-center justify-between mt-4"
                    style={styles.inputs}
                  >
                    <div>Your Cost</div>
                    <div>{agencyPlanCost && `$${formatFractional2(agencyPlanCost)}`}/Credit</div>
                    {
                      discountedPrice && minutes && (
                        <div>${formatDecimalValue(agencyPlanCost * minutes)}</div>
                      )
                    }
                  </div>
                  {discountedPrice && minutes && ( // 
                    <div className="w-full">
                      <div
                        className="flex flex-row items-center justify-between mt-4"
                        style={{ ...styles.inputs, color: getClr() }}
                      >
                        <div>Your Profit</div>
                        <div>
                          ${formatFractional2(discountedPrice - agencyPlanCost)}/ min
                        </div>
                        <div>
                          ${formatDecimalValue((discountedPrice - agencyPlanCost) * minutes)}
                        </div>
                      </div>
                      <div
                        className="text-end w-full mt-2"
                        style={{ color: getClr() }}
                      >
                        {formatDecimalValue(((discountedPrice - agencyPlanCost) / agencyPlanCost) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Strikethrough Price */}
              <label style={styles.labels}>
                Strikethrough Price (Optional)
              </label>
              <div className="border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full">
                <div className="" style={styles.inputs}>
                  $
                </div>
                <input
                  style={styles.inputs}
                  type="text"
                  className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none ${originalPrice > 0 && "line-through" //replced
                    }`}
                  placeholder="00"
                  value={originalPrice} //replaced
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits and one optional period
                    const sanitized = value.replace(/[^0-9.]/g, '');

                    // Prevent multiple periods
                    const valid = sanitized.split('.').length > 2
                      ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                      : sanitized;
                    // setOriginalPrice(valid);
                    setOriginalPrice(valid);
                  }}
                />
              </div>

              {/* Default plan */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Default Plan</label>
                <Switch
                  checked={isDefault}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#7902DF',
                    },
                  }}
                  onChange={(e) => {
                    setIsDefault(e.target.checked)
                  }}
                />
              </div>

            </div>
            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button
                disabled={createPlanLoader}
                onClick={() => {
                  handleClose("");
                  handleResetValues();
                }}
                className="text-purple-600 font-semibold border rounded-lg w-[12vw]"
              >
                Cancel
              </button>
              {createPlanLoader ? (
                <CircularProgress size={30} />
              ) : (
                <button
                  className={` ${isFormValid() ? "bg-purple" : "bg-[#00000020]"} w-[12vw] ${isFormValid() ? "text-white" : "text-black"} font-semibold py-2 px-4 rounded-lg`}
                  onClick={() => {
                    handleNext();
                    // if (isEditPlan) {
                    //   handleUpdatePlan();
                    // } else {
                    //   handleCreatePlan();
                    // }
                  }}
                  disabled={!isFormValid()}
                >
                  {/*isEditPlan ? "Update" : "Create Plan"*/}
                  Continue
                </button>
              )}
            </div>
          </div>
          <div
            className="w-5/12 h-full rounded-tr-xl rounded-br-xl shadow-lg"
          >
            <SideUI
              tag={tag}
              discountedPrice={discountedPrice}
              title={title}
              planDescription={planDescription}
              trialValidForDays={trialValidForDays}
              allowTrial={allowTrial}
              handleClose={handleClose}
              minutes={minutes}
              handleResetValues={handleResetValues}
              originalPrice={originalPrice}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
}




// <div
//             className="w-6/12 h-full rounded-tr-xl rounded-br-xl"
//             style={{
//               backgroundImage: "url('/agencyIcons/addPlanBg4.png')", //"url('/agencyIcons/addPlanBg.jpg')",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           >
//             <div className="p-6 flex flex-col items-center h-[100%]">
//               <div className="flex justify-end w-full items-center h-[5%]">
//                 <button
//                   // disabled={createPlanLoader}
//                   onClick={() => {
//                     handleClose("");
//                     handleResetValues();
//                   }}
//                 >
//                   <Image
//                     src={"/assets/cross.png"}
//                     alt="*"
//                     height={14}
//                     width={14}
//                   />
//                 </button>
//               </div>
//               <div className="w-11/12 h-[80%] flex flex-col items-center justify-center">
//                 {allowTrial && trialValidForDays && (
//                   <div className="w-full rounded-t-xl bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2">
//                     <div className="flex flex-row items-center gap-2">
//                       <Image
//                         src={"/otherAssets/batchIcon.png"}
//                         alt="*"
//                         height={24}
//                         width={24}
//                       />
//                       <div
//                         style={{
//                           fontWeight: "600",
//                           fontSize: 18,
//                           color: "white",
//                         }}
//                       >
//                         First {trialValidForDays} Days Free
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 <div
//                   className="px-4 py-1 pb-4"
//                   style={{
//                     ...styles.pricingBox,
//                     border: "none",
//                     backgroundColor: "white",
//                   }}
//                 >
//                   <div
//                     style={{
//                       ...styles.triangleLabel,
//                       borderTopRightRadius: allowTrial && trialValidForDays ? "0px" : "15px",
//                     }}
//                   ></div>
//                   {/* Triangle price here */}
//                   {
//                     originalPrice > 0 && minutes && ( //replaced
//                       <span style={styles.labelText}>
//                         {checkCalulations()}
//                         {formatDecimalValue(
//                           // (originalPrice / originalPrice) * //replaced
//                           (originalPrice - (discountedPrice * minutes)) / originalPrice * //replaced
//                           100
//                         ) || "-"}
//                         %
//                       </span>
//                     )
//                   }
//                   <div
//                     className="flex flex-row items-start gap-3"
//                     style={styles.content}
//                   >
//                     <div className="w-full">
//                       <div className="flex flex-row items-center gap-3">
//                         <div
//                           style={{
//                             color: "#151515",
//                             fontSize: 22,
//                             fontWeight: "600",
//                           }}
//                         >
//                           {title || "My Plan"}
//                         </div>
//                         {tag ? (
//                           <div
//                             className="rounded-full bg-purple text-white p-3 py-2"
//                             style={{ fontSize: 14, fontWeight: "500" }}
//                           >
//                             {tag}
//                           </div>
//                         ) : (
//                           <div className="rounded-md bg-gray-200 text-white w-[127px] h-[28px]" />
//                         )}
//                       </div>
//                       <div className="flex flex-row items-center justify-between mt-2">
//                         <div className="flex flex-col justify-start">
//                           {planDescription ? (
//                             <div
//                               className=""
//                               style={{
//                                 color: "#00000060",
//                                 fontSize: 15,
//                                 //   width: "60%",
//                                 fontWeight: "500",
//                               }}
//                             >
//                               {planDescription}
//                             </div>
//                           ) : (
//                             <div className="rounded-md bg-gray-200 text-white w-[150px] h-[32px]" />
//                           )}
//                         </div>
//                         <div className="flex flex-row items-center gap-2">
//                           {originalPrice > 0 && (
//                             <div style={styles.originalPrice} className="line-through">
//                               ${originalPrice}
//                             </div>
//                           )}
//                           {discountedPrice && minutes && (
//                             <div className="flex flex-row justify-start items-start ">
//                               <div style={styles.discountedPrice}>
//                                 ${formatDecimalValue(discountedPrice * minutes)}
//                               </div>
//                               <p style={{ color: "#15151580" }}></p>
//                             </div>
//                           )}

//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>