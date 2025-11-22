'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {
  const router = useRouter()
  const navigat = (page) => {
    router.push('/about', page)
  }
  const items = [
    { title: 'Call absentee owners ', image: '/assets/jpg.jpg' },
    { title: 'Ceicld prospecting', image: '/assets/jpg.jpg' },
    { title: 'Community uppdate', image: '/assets/jpg.jpg' },
    { title: 'Lead rectivation', image: '/assets/jpg.jpg' },
    { title: 'Agent R', image: '/assets/jpg.jpg' },
    { title: 'Website Agent', image: '/assets/jpg.jpg' },
    { title: 'Recruiter Agent' },
  ]
  //inline style
  const gridcontainerStyel = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)', //4 equal columns
    // spacing between grid itam
    padding: '1px',
    backgroundColor: 'white',
    justifyItems: 'center', // Center items horizontally
  }
  const gridItemStyle = {
    backgroundColor: '#white',
    borderRadius: '10px',
    fontSize: '15px',
    textAlign: 'center',
    border: '2px,solid white',
    width: '180px',
    height: '80px',
  }

  return (
    <div
      className=""
      style={{
        display: 'flex',
        height: '100svh',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000050',
        padding: 20,
        backgroundImage: "url('/assets/image.png')",
      }}
    >
      <div
        style={{
          width: '75%',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          borderRadius: '20px',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            padding: 2,
            gap: '300px',
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: '600',
              marginTop: '10px',
              alignSelf: 'start',
              gap: '400px',
            }}
          >
            AgentX
          </div>
          <div
            style={{
              marginTop: '10px',
              alignSelf: 'center',
              justifyContent: 'center,',
            }}
          >
            <Image src="/assets/boll.png" height={100} width={100} alt="boll" />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 38, fontWeight: '600' }}>
          Get Started With Your AI agent
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignSelf: 'center',
            marginTop: '20px',
            overflow: 'auto',
            backgroundColor: '',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              width: '100%',

              //   //marginLeft: 200,
            }}
          >
            <div
              style={{ marginTop: '10px', fontSize: 16.8, fontWeight: '600' }}
            >
              {`What's Your AI Agent's Name?`}
            </div>
            <button>
              <Image
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  alignContent: 'center',
                }}
                src="/assets/info.png"
                height={15}
                width={15}
                alt="info"
              />
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <input
              placeholder="Ex:Anas,Ai,Ana.ai,Anas Assistant"
              style={{
                outline: 'none',
                border: '2px solid #00000010',
                borderRadius: '5px',
                // width: "60%",
                // //marginLeft: 200,
                padding: 12,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              //marginLeft: 200,
            }}
          >
            <div
              style={{
                marginTop: '10px',
                fontSize: 16.8,
                fontWeight: '600',
                justifyContent: 'space-between',
              }}
            >
              {`What's this agents task?`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'row',
                border: '2px solid gray',
                borderRadius: '20px',
                // backgroundColor: "red",
                width: '40%',
                //marginLeft: 200,
              }}
            >
              <button
                style={{
                  outline: 'none',
                  width: '100%',
                  padding: 20,
                  fontSize: '10px',
                }}
              >
                {' '}
                Making Outbound Calls
              </button>
            </div>
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid gray',
                borderRadius: '20px',
                width: '40%',
                marginLeft: 2,
              }}
            >
              <button
                style={{
                  outline: 'none',
                  width: '100%',
                  padding: 20,
                  fontSize: '10px',
                }}
              >
                {' '}
                Taking inbound calls{' '}
              </button>
            </div>
          </div>
          <div
            style={{
              marginTop: '10px',
              //marginLeft: 200,
              fontSize: 16.8,
              fontWeight: '600',
            }}
          >
            {`What's This Agent's Role?`}
          </div>
          <input
            placeholder="EX:Senior Proty Acquistion Specialist"
            style={{
              outline: 'none',
              border: '2px solid #00000020',
              borderRadius: '5px',
              padding: 12,
              //   width: "60%",
              //marginLeft: 200,
            }}
          />
          <div
            style={{
              marginTop: '10px',
              //marginLeft: 200,
              fontSize: 16.8,
              fontWeight: '600',
            }}
          >
            {`What's this AI agent's primary objective during the call?`}
          </div>
          <div
            style={{
              marginTop: '10px',
              //marginLeft: 200,
              fontSize: 14,
              fontWeight: '600',
              color: '#00000090',
            }}
          >
            {' '}
            Select only one.You cane create agents to dedicete them to other
            obgectives.
          </div>
          <div style={gridcontainerStyel}>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignSelf: 'start',
                  border: '2px solid #00000020',
                  borderRadius: '20px',
                  padding: '1px',
                  marginTop: '10px',
                  width: '95%',
                  //   gap: "-400px",
                  //  marginLeft:100,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                    alignSelf: 'center',
                    marginLeft: 20,
                    marginTop: 20,
                  }}
                >
                  <Image src={item.image} width={30} height={30} alt="emoji" />
                  <div key={index} style={gridItemStyle}>
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Page
