"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const handleSkip = () => {
    const data = localStorage.getItem("User");
    console.log("Working");
    if (data) {
      const D = JSON.parse(data);
      if (D.user.plan) {
        // router.push("/dashboard");
        router.push("/subaccountInvite/subscribeSubAccountPlan");

      } else {
        router.push("/subaccountInvite/subscribeSubAccountPlan");
      }
    }
  };

  const styles = {
    btnText: {
      fontSize: "15px",
      fontWeight: "500",
      outline: "none",
      border: "none",
    },
  };

  return (
    <div className="h-screen w-full flex flex-row items-center justify-center">
      <div className="h-[60vh] flex flex-col items-center">
        <div style={{ fontWeight: "600", fontSize: "38px", marginBottom: 20 }}>
          {`Congrats! You’re in!`}
        </div>
        <Image
          className=""
          src="/agentXOrb.gif"
          style={{ height: "142px", width: "152px", resize: "contain" }}
          height={142}
          width={142}
          alt="*"
        />
        <div
          style={{ fontWeight: "600", fontSize: "16px", color: "#00000070" }}
        >
          Your account is created!
        </div>
        <div
          className="mt-4"
          style={{ fontWeight: "600", fontSize: "17px", color: "#000000" }}
        >
          Send Invite to team members to join you on AssignX
        </div>
        <button
          className="bg-purple text-white p-2 rounded-md w-20vw mt-8"
          style={styles.btnText}
        >
          Invite Teams
        </button>
        <button
          className="underline mt-4"
          style={styles.btnText}
          onClick={() => {
            handleSkip();
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default Page;
