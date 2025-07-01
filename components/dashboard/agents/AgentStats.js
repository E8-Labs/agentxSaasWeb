import React from "react";
import Image from "next/image";
import moment from "moment";

const AgentStats = ({ showDrawerSelectedAgent }) => {
  return (
    <div className="grid grid-cols-5 gap-6 border p-6 rounded-lg mb-6 mt-2">
      <StatCard
        name="Calls"
        value={showDrawerSelectedAgent?.calls || "-"}
        icon="/svgIcons/selectedCallIcon.svg"
        bgColor="bg-blue-100"
      />
      <StatCard
        name="Convos"
        value={showDrawerSelectedAgent?.callsGt10 || "-"}
        icon="/svgIcons/convosIcon2.svg"
        bgColor="bg-purple-100"
      />
      <StatCard
        name="Hot Leads"
        value={showDrawerSelectedAgent?.hotleads || "-"}
        icon="/otherAssets/hotLeadsIcon2.png"
        bgColor="bg-orange-100"
      />
      <StatCard
        name="Booked"
        value={showDrawerSelectedAgent?.booked || "-"}
        icon="/otherAssets/greenCalenderIcon.png"
        bgColor="bg-green-100"
      />
      <StatCard
        name="Mins Talked"
        value={
          showDrawerSelectedAgent?.totalDuration
            ? moment.utc(showDrawerSelectedAgent?.totalDuration * 1000).format("HH:mm:ss")
            : "-"
        }
        icon="/otherAssets/minsCounter.png"
        bgColor="bg-green-100"
      />
    </div>
  );
};

const StatCard = ({ name, value, icon, bgColor }) => (
  <div className="flex flex-col items-start gap-2">
    {/* Icon */}
    <Image src={icon} height={24} color={bgColor} width={24} alt="icon" />

    <div style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
      {name}
    </div>
    <div style={{ fontSize: 20, fontWeight: "600", color: "#000" }}>
      {value}
    </div>
  </div>
);

export default AgentStats;