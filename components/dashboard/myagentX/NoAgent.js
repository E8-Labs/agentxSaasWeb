import Image from "next/image";
import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

function NoAgent() {
  const handleAddNewAgent = (event) => {
    // event.preventDefault();
    // const data = {
    //   status: true,
    // };
    localStorage.setItem("fromDashboard", JSON.stringify(data));
    router.push("/createagent");
  };
  return (
    <div className="flex flex-col items-center w-full h-full">
      <Image
        alt="No img"
        src={"/agencyIcons/noAgents.jpg"}
        height={556}
        width={550}
      />

      {/* <div
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "black",
        }}
      >
        You have no active agents
      </div>*/}

      <Link
        className="flex h-[54px] items-center flex-row gap-2 bg-purple p-2 px-8 rounded-lg mt-4"
        onClick={() => handleAddNewAgent()}
        href="/createagent"
      >
        <Plus color="white"></Plus>
        <div
          className="flex items-center justify-center  text-black text-white font-medium"
        // Fixed typo
        >
          Add new agent
        </div>
      </Link>
    </div>
  );
}

export default NoAgent;
