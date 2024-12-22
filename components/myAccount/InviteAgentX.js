import React from 'react'
import Image from 'next/image'

function InviteAgentX() {
    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

            <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                Invite Agent
            </div>

            <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                {"Account > Invite Agent"}
            </div>

            <div
                className="w-10/12 p-6 rounded-lg flex flex-row justify-between items-center"
                style={{
                    backgroundImage: 'url(/assets/cardBg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#fff',
                    alignSelf: 'center',
                    marginTop: "7vh"
                    // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', 
                }}
            >
                {/* Left Section */}
                <div className="flex flex-col pt-5">
                    <div style={{ fontSize: "2vh", fontWeight: '700', marginBottom: '10px', width: '25vw'}}>
                        Get 60 minutes when you invite an agent
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: '400', lineHeight: '1.5', width: '27vw' }}>
                        You and the agent you invite both get 60 minutes of talk time. The
                        more agents you invite, the more you get. Everybody wins. The agents
                        can use this code at checkout.
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-start">
                    <div
                        className="flex flex-row items-center gap-2"
                        style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}
                    >
                        <img
                            src="/otherAssets/tagIcon.png"
                            alt="Tag Icon"
                            style={{ height: '16px', width: '16px' }}
                        />
                        Code
                    </div>
                    <h2 style={{ fontSize: '3vh', fontWeight: '700' }}>AgentX12</h2>

                </div>
            </div>



            <Image src={"/otherAssets/inviteAgentXImage.png"}
                height={350} width={350} alt='image'
                style={{alignSelf:'center',marginTop:'3vh'}}
            />

        </div>)
}

export default InviteAgentX