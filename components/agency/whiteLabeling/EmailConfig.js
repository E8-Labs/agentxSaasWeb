import React, { useState } from 'react'
import { FormControl, Select, MenuItem } from '@mui/material'
import LabelingHeader from './LabelingHeader'

const EmailConfig = () => {
  // Sender Details state variables
  const [profileName, setProfileName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')

  // SMTP Connection state variables
  const [smtpHost, setSmtpHost] = useState('')
  const [port, setPort] = useState('')
  const [smtpFromEmail, setSmtpFromEmail] = useState('')
  const [encryption, setEncryption] = useState('')
  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/email.png"}
        title={"Configure email and SMTP Connection"}
        description={"Connect your domain and add DNS record."}
      />

      {/* Sender Details */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Profile Name */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>Sender Details</div>
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Profile Name</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="eg Emerald realestate"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
          </div>
          {/* From Name */}
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>From Email</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="Type here"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>
          {/* From Email */}
          <div className="w-full">
            <div className="w-full mb-2">
              <div className="text-start mb-2" style={styles.small}>From Name</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="e.g no-reply@yourdomain.com"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SMTP Connection */}
      <div className="w-full flex flex-row justify-center pt-8 pb-12">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* SMTP host */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>SMTP Connection</div>
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>SMTP host</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="smtp.example.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
              <div className='mt-2 text-[#00000060]' style={styles.small}>Hostname of your SMTP server.</div>
            </div>
          </div>
          {/* Port */}
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Port</div>
              <FormControl className="w-full">
                <Select
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select Port</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    "&:hover": {
                      border: "1px solid #E5E7EB",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSelect-select": {
                      py: 0,
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#000000",
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
                  <MenuItem value="587">587 (STARTTLS)</MenuItem>
                  <MenuItem value="465">465 (SSL/TLS)</MenuItem>
                  <MenuItem value="25">25 (plain/STARTTLS)</MenuItem>
                  <MenuItem value="2525">2525 (Alternative)</MenuItem>
                </Select>
              </FormControl>
              <div className='mt-2' style={styles.small}>{`Default: 587 (STARTTLS), 465 (SSL/TLS), 25 (plain/STARTTLS).`}</div>
            </div>
          </div>
          {/* From Email */}
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>From Email</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="e.g no-reply@yourdomain.com"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
              />
            </div>
          </div>
          {/* Encryption */}
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Encryption</div>
              <FormControl className="w-full">
                <Select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select Encryption</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    "&:hover": {
                      border: "1px solid #E5E7EB",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSelect-select": {
                      py: 0,
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#000000",
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
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="STARTTLS">STARTTLS</MenuItem>
                  <MenuItem value="SSL/TLS">SSL/TLS</MenuItem>
                  <MenuItem value="TLS">TLS</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default EmailConfig;

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  smallRegular: { fontSize: 13, fontWeight: "400" },
  regular: { fontSize: 16, fontWeight: "400" },
  small: { fontSize: 12, fontWeight: "400" },
  inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};