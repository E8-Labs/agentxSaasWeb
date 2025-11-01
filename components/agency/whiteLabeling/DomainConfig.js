import React, { useState } from 'react'
import LabelingHeader from './LabelingHeader'

const DomainConfig = () => {

  const [customDomain, setCustomDomain] = useState("");

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/globe.png"}
        title={"Setup your custom domain"}
        description={"Set your default brand elements to determine how Stripe products appear to your customers."}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Domain Title */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>Custom Domain</div>
            <div className="w-full flex flex-row items-center gap-2">
              <input
                style={styles.inputs}
                className="w-[90%] border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                placeholder="example.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <button className="bg-purple text-white rounded-md px-4 py-2 text-center">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DomainConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  smallRegular: { fontSize: 13, fontWeight: "400" },
  regular: { fontSize: 16, fontWeight: "400" },
  inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};