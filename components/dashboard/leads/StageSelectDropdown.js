import React from "react";
import { FormControl, Select, MenuItem } from "@mui/material";

const SelectStageDropdown = ({
  selectedStage,
  handleStageChange,
  stagesList,
  updateLeadStage,
}) => {
 // //console.log;
  return (
    <FormControl size="fit-content">
      <Select
        value={selectedStage}
        onChange={handleStageChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <div style={{ color: "#aaa" }}>
                {stagesList?.length > 0 ? "Select" : "No Stage"}
              </div>
            );
          }
          return selected;
        }}
        sx={{
          border: "none",
          "&:hover": { border: "none" },
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiSelect-select": {
            padding: "0 24px 0 8px",
            lineHeight: 1,
            minHeight: "unset",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiSelect-icon": {
            right: "4px",
            top: "50%",
            transform: "translateY(-50%)",
          },
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: "30vh",
              overflow: "auto",
              scrollbarWidth: "none",
            },
          },
        }}
      >
        {/* Render stages */}
        {stagesList?.length > 0 &&
          stagesList.map((item, index) => (
            <MenuItem
              value={item.stageTitle}
              key={index}
              className="hover:bg-lightBlue hover:text-[#000000]"
            >
              <button
                className="outline-none border-none"
                onClick={() => updateLeadStage(item)}
              >
                {item.stageTitle}
              </button>
            </MenuItem>
          ))}

        {/* Render fallback when no stages are available */}
        {!stagesList?.length > 0 && (
          <MenuItem className="text-sm text-[#15151560] font-bold">
            No Stage
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default SelectStageDropdown;
