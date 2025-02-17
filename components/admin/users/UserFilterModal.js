import React, { useState } from "react";
import {
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextareaAutosize,
  Box,
} from "@mui/material";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarPicker } from "./CalendarPicker";

const styles = {
  heading: {
    fontWeight: "700",
    fontSize: 17,
  },
  paragraph: {
    fontWeight: "500",
    fontSize: 15,
  },
  modalsStyle: {
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
  subHeading: {
    fontWeight: "500",
    fontSize: 12,
    color: "#00000060",
  },
  heading2: {
    fontWeight: "500",
    fontSize: 15,
    color: "#00000080",
  },
};

export function UserFilterModal({
  showFilterModal,
  filters,
  updateFilters,
  onDismissCallback,
}) {
  //CreatedAt Date
  const [selectedCreatedToDate, setSelectedCreatedToDate] = useState(null);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [selectedCreatedFromDate, setSelectedCreatedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);

  const [sheetsLoader, setSheetLoader] = useState(false);

  const handleFromDateChange = (date) => {
    setSelectedCreatedFromDate(date); // Set the selected date
    setShowFromDatePicker(false);
    updateFilters({ ...filters, selectedCreatedFromDate: date });
  };

  const handleToDateChange = (date) => {
    setSelectedCreatedToDate(date); // Set the selected date
    setShowToDatePicker(false);
    updateFilters({ ...filters, selectedCreatedToDate: date });
  };

  return (
    <Modal
      open={showFilterModal}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "#00000020",
          maxHeight: "100%",
          justifyContent: "center",
          alignItems: "center",
          // //backdropFilter: "blur(5px)",
        },
      }}
    >
      <Box
        className="flex flex-row justify-center items-start lg:w-4/12 sm:w-7/12 w-8/12 py-2 px-6 bg-white max-h-[75svh]  overflow-auto md:overflow-auto"
        sx={{
          ...styles.modalsStyle,
          scrollbarWidth: "none",
          backgroundColor: "white",
        }}
      >
        <div className="w-full flex flex-col items-center justify-start ">
          <div className="flex flex-row items-center justify-between w-full">
            <div>Filter</div>
            <button
              onClick={() => {
                onDismissCallback();
              }}
            >
              <img src={"/assets/cross.png"} height={17} width={17} alt="*" />
            </button>
          </div>
          <div className="mt-2 w-full overflow-auto h-[85%]">
            <div className="flex flex-row items-start gap-4">
              <div className="w-1/2 h-full">
                <div
                  className="h-full"
                  style={{
                    fontWeight: "500",
                    fontSize: 12,
                    color: "#00000060",
                    marginTop: 10,
                  }}
                >
                  From
                </div>
                <div>
                  <CalendarPicker
                    onSelectDate={(date) => {
                      console.log("Date selected from ", date);
                      handleFromDateChange(date);
                      //   updateFilters({...filters, createdFromDate: })
                    }}
                  />
                </div>
              </div>

              <div className="w-1/2 h-full">
                <div
                  style={{
                    fontWeight: "500",
                    fontSize: 12,
                    color: "#00000060",
                    marginTop: 10,
                  }}
                >
                  To
                </div>
                <div>
                  <CalendarPicker
                    onSelectDate={(date) => {
                      handleToDateChange(date);
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className="mt-6"
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: "#00000060",
                marginTop: 10,
              }}
            >
              Filter 2
            </div>

            <div
              className="mt-6"
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: "#00000060",
                marginTop: 10,
              }}
            >
              Filter 3
            </div>
          </div>

          <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
            <button
              className="outline-none w-[105px]"
              style={{ fontSize: 16.8, fontWeight: "600" }}
              onClick={() => {
                updateFilters(filters);
              }}
            >
              Reset
            </button>
            {sheetsLoader ? (
              <CircularProgress size={25} sx={{ color: "#7902DF" }} />
            ) : (
              <button
                className="bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none"
                style={{
                  fontSize: 16.8,
                  fontWeight: "600",
                  // backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
                }}
                onClick={() => {
                  updateFilters(filters);
                }}
              >
                Apply Filter
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// export default UserFilterModal;
