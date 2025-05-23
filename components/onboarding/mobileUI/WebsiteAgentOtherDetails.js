import { isValidUrl } from '@/constants/Constants';
import React, { useState,useEffect } from 'react'

function WebsiteAgentOtherDetails({
    websiteUrl,
    setWebsiteUrl,
    urlErrorMessage,
    setUrlErrorMessage,
}) {



      useEffect(() => {
        let timer = setTimeout(() => {
          //console.log);
          if (websiteUrl) {
            if (isValidUrl(websiteUrl)) {
                setUrlErrorMessage("")
              //console.log;
            } else {
              setUrlErrorMessage("Invalid");
            }
          }
        }, 300);
    
        return () => clearTimeout(timer);
      }, [websiteUrl]);

    return (
        <div className='w-full'>
            <div style={styles.headingStyle} className="mt-6">
                Website (URL)
            </div>
            <div>
                {urlErrorMessage && (
                    <p
                        style={{
                            ...styles.errmsg,
                            color: "red",
                            textAlign: "right",
                        }}
                    >
                        {urlErrorMessage}
                    </p>
                )}
            </div>

            <input
                placeholder="URL"
                className="border w-full border-[#00000010] rounded p-3 outline-none mb-2 focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={websiteUrl}
                onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    setUrlErrorMessage("");
                }}
            />

        </div>
    )
}

export default WebsiteAgentOtherDetails


const styles = {
    headingStyle: {
        fontSize: 16,
        fontWeight: "600",
    },
    inputStyle: {
        fontSize: 15,
        fontWeight: "500",
        borderRadius: "7px",
    },
    errmsg: {
        fontSize: 12,
        fontWeight: "500",
        borderRadius: "7px",
    },
    verifyPopup: {
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