import Image from 'next/image'
import React from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customToast as toast } from "@/lib/custom-toast";

function NoAgent({
  showBtn = true,
  title = "You have no active agents",
  selectedUser,
  from,
}) {

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
        toast.error("User has no plan subscribed");
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
      className='flex flex-col items-center w-full h-full overflow-x-hidden overflow-y-hidden'
      style={{ scrollbarWidth: 'none' }}
    >
      <Image className=''
        alt="No img"
        src={"/agencyIcons/noAgents.jpg"}
        height={from === "Admin" ? 200 : 600}
        width={from === "Admin" ? 400 : 600}
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
              Add New Agent
            </div>
          </button>
        )
      }
    </div>
  )
}

export default NoAgent