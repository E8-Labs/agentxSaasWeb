import Image from 'next/image'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';

function NoAgent({
  showBtn = true,
  title = "You have no active agents",
  selectedUser
}) {

  //show snack
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Error,
    message: "",
    isVisible: false
  });

  const router = useRouter();

  const handleAddNewAgent = () => {

    if (selectedUser) {
      if (selectedUser?.plan) {
        const data = {
          status: true,
        };
        localStorage.setItem("fromDashboard", JSON.stringify(data));
        // router.push("/createagent");
        window.location.href = "/createagent";
      } else {
        console.log("Donot route");
        setShowSnack({
          type: SnackbarTypes.Error,
          message: "User has no plan subscribed",
          isVisible: true
        })
      }
    } else {
      const data = {
        status: true,
      };
      localStorage.setItem("fromDashboard", JSON.stringify(data));
      // router.push("/createagent");
      window.location.href = "/createagent";
    }
  };

  return (
    <div
      className='flex flex-col items-center w-[60vw] h-full overflow-x-hidden'
      style = {{scrollbarWidth:'none'}}
    >
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: "",
            isVisible: false,
            type: SnackbarTypes.Error,
          });
        }}
      />
      <Image className=''
        alt="No img"
        src={"/agencyIcons/noAgents.jpg"}
        height={200}
        width={450}
      />

      <div

        style={{
          fontSize: 18, fontWeight: '700', color: 'black', lineHeight: 1, marginTop: -80
        }}>
        {title}

      </div>
      {
        showBtn && (
          <button className="flex h-[54px] items-center flex-row gap-2 bg-purple p-2 px-8 rounded-lg mt-6"
            onClick={() => { handleAddNewAgent() }}
          // href="/createagent"
          >
            <Plus color="white"></Plus>
            <div
              className="flex items-center justify-center  text-black text-white font-medium"
            // Fixed typo
            >
              Add new agent
            </div>
          </button>
        )
      }
    </div>
  )
}

export default NoAgent