import { FormControl, MenuItem, Select } from '@mui/material';
import React from 'react'

const AddTeamUtility = () => {
  return (
    <div>
      <div className="mt-2">
        <FormControl fullWidth>
          <Select
            id="demo-simple-select"
            value={assignToMember || ""} // Default to empty string when no value is selected
            onChange={handleAssignTeamMember}
            displayEmpty // Enables placeholder
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <div style={{ color: "#aaa" }}>
                    Select team member
                  </div>
                ); // Placeholder style
              }
              return selected;
            }}
            sx={{
              border: "1px solid #00000020", // Default border
              "&:hover": {
                border: "1px solid #00000020", // Same border on hover
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // Remove the default outline
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                border: "none", // Remove outline on focus
              },
              "&.MuiSelect-select": {
                py: 0, // Optional padding adjustments
              },
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: "30vh", // Limit dropdown height
                  overflow: "auto", // Enable scrolling in dropdown
                  scrollbarWidth: "none",
                },
              },
            }}
          >
            {/* <MenuItem value={myTeamAdmin.name}>
                                <div className="w-full flex flex-row items-center gap-2">
                                  <div>{myTeamAdmin.name}</div>
                                  <div className="bg-purple text-white text-sm px-2 rounded-full">
                                    Admin
                                  </div>
                                </div>
                              </MenuItem> */}
            {myTeamList.map((item, index) => {
              return (
                <MenuItem
                  className="flex flex-row items-center gap-2"
                  key={index}
                  value={item?.invitedUser?.name}
                >
                  {/* <Image
                                      src={item.invitedUser.full_profile_image || "/agentXOrb.gif"}
                                      width={35}
                                      height={35}
                                      alt="*"
                                    /> */}
                  {getAgentsListImage(item?.invitedUser)}
                  {item.invitedUser?.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </div>
    </div>
  )
}

export default AddTeamUtility;


export const getTeamMembers = async () => {

}
