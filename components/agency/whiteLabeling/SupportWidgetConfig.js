import React from 'react'
import LabelingHeader from './LabelingHeader';
import AgencySupportAndWidget from '../integrations/AgencySupportAndWidget';

const SupportWidgetConfig = () => {
  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/email.png"}
        title={"Support Widget"}
        description={"Customize your brand settings to shape how your Stripe offerings are presented to your clients."}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Domain Title */}
          <div className="w-full">
            <AgencySupportAndWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportWidgetConfig


const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: "600" },
  smallRegular: { fontSize: 13, fontWeight: "400" },
  regular: { fontSize: 16, fontWeight: "400" },
  inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};