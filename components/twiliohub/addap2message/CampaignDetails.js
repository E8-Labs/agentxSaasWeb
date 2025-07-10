import { Box, FormControl, MenuItem, Select } from '@mui/material';
import React, { useRef, useState } from 'react'
import { businessTypesArray } from '../twilioExtras/TwilioHubConstants';

const CampaignDetails = ({
  handleContinue
}) => {

  const selectRef = useRef(null);

  const [campaignUserCase, setCampaignUserCase] = useState("");
  const [openBusinessTypeDropwDown, setOpenBusinessTypeDropwDown] = useState(false);

  //styles
  const styles = {
    normalTxt: {
      fontWeight: "500",
      fontSize: 15
    },
    size13: {
      fontWeight: "500",
      fontSize: 13,
    }
  }

  return (
    <div className='h-[100%] flex flex-col items-center justify-between'>
      <div className='w-full overflow-auto'>
        <div>
          <div
            className='mt-4'
            style={styles.normalTxt}>
            Campaign Use case*
          </div>

          <div className="border rounded-lg">
            <Box className="w-full">
              <FormControl className="w-full">
                <Select
                  ref={selectRef}
                  open={openBusinessTypeDropwDown}
                  onClose={() => setOpenBusinessTypeDropwDown(false)}
                  onOpen={() => setOpenBusinessTypeDropwDown(true)}
                  className="border-none rounded-2xl outline-none"
                  displayEmpty
                  value={campaignUserCase}
                  // onChange={handleselectBusinessType}
                  onChange={(e) => {
                    let value = e.target.value;
                    console.log("Value for business type is", value);
                    setCampaignUserCase(value);
                    setOpenBusinessTypeDropwDown(false);
                  }}
                  renderValue={(selected) => {
                    if (selected === "") {
                      return <div>Business Type</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    ...styles.normalTxt,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
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
                  <MenuItem value="">None</MenuItem>
                  {
                    businessTypesArray.map((item) => {
                      return (
                        <MenuItem
                          key={item.id}
                          style={styles.normalTxt}
                          value={item.title}
                          className='w-full'
                        >
                          {item.title}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </FormControl>
            </Box>
          </div>
        </div>
      </div>
      <div className='w-full flex flex-row items-center gap-4'>
        <button className='w-1/2 bg-purple10 h-[50px] rounded-lg'>Exit</button>
        <button onClick={handleContinue} className='w-1/2 bg-purple text-white h-[50px] rounded-lg'>handleContinue</button>
      </div>
    </div>
  )
}

export default CampaignDetails
