import React from "react";
import UserCalender from "@/components/dashboard/myagentX/UserCallender";

const CalendarTab = ({ calendarDetails, showDrawerSelectedAgent }) => {
  return (
    <div>
      <div className="lg:flex hidden xl:w-[350px] lg:w-[350px]"></div>
      <UserCalender
        calendarDetails={calendarDetails}
        selectedAgent={showDrawerSelectedAgent}
      />
    </div>
  );
};

export default CalendarTab;
