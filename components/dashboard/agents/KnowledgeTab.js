import React from "react";
import Knowledgebase from "@/components/dashboard/myagentX/Knowledgebase";

const KnowledgeTab = ({ user, agent }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Knowledgebase user={user} agent={agent} />
    </div>
  );
};

export default KnowledgeTab;