import Image from 'next/image'
import React from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function NoAgent({ 
  showBtn = true,
  title = "You have no active agents"
 }) {

  const router = useRouter();

  const handleAddNewAgent = () => {
    const data = {
      status: true,
    };
    localStorage.setItem("fromDashboard", JSON.stringify(data));
    router.push("/createagent");
  };

  return (
    <div
      className='flex flex-col items-center w-[60vw] h-full overflow-x-hidden'
    >
      <Image
        alt="No img"
        src={"/agencyIcons/noAgents.jpg"}
        height={500}
        width={550}
      />

      <div
        
        style={{
          fontSize: 18, fontWeight: '700', color: 'black', lineHeight: 1,marginTop:-100
        }}>
        {title}
        
      </div>
      {
        showBtn && (
          <Link className="flex h-[54px] items-center flex-row gap-2 bg-purple p-2 px-8 rounded-lg mt-6"
            onClick={() => { handleAddNewAgent() }}
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
        )
      }
    </div>
  )
}

export default NoAgent