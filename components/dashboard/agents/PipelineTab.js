import React from "react";
import PiepelineAdnStage from "@/components/dashboard/myagentX/PiepelineAdnStage";

const PipelineTab = ({ showDrawerSelectedAgent, UserPipeline, calendarDetails }) => {
  return (
    <div className="flex flex-col gap-4">
      <PiepelineAdnStage
        selectedAgent={showDrawerSelectedAgent}
        UserPipeline={UserPipeline}
        mainAgent={calendarDetails}
      />
    </div>
  );
};

export default PipelineTab;