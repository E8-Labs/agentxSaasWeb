import { next30Days } from '@/constants/Constants'
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

function CancelConfirmation({
    handleContinue
}) {

    const [confirmChecked,setConfirmChecked] = useState(false)

    let features = [
        { id: 1, title: 'Mins of AI Credits' },
        { id: 2, title: 'Unlimited Agents' },
        { id: 3, title: 'Unlimited Team' },
        { id: 4, title: 'LLMs' },
        { id: 5, title: 'AI Powered CRM' },
        { id: 6, title: 'Lead Enrichment' },
        { id: 7, title: '10,000+ Integrations' },
        { id: 8, title: 'Custom Voicemails' },
        { id: 9, title: 'Geo-Based Phone Access' },
        { id: 10, title: 'DNC Check' },
        { id: 11, title: 'Lead Source' },
        { id: 12, title: 'AI Powered Message' },
        { id: 13, title: 'AI Powered Email' },
        { id: 14, title: 'Zoom Support' },
        { id: 15, title: 'Priority Support' },
        { id: 16, title: 'Tech Support' }
    ];

    const [nxtCharge,setNxtChage] = useState(null)


    useEffect(()=>{
        getUserData()
    },[])


    const getUserData = () =>{
        let data = localStorage.getItem("User")

        if(data){
            let u = JSON.parse(data)
            let date = u.user.nextChargeDate

            date = moment(date).format("MM/DD/YYYY")
            setNxtChage(date)
        }
    }


    return (
        <div className='flex flex-col items-center gap-2 h-full py-4'>

            <Image className='-mt-5'
                src={"/otherAssets/IconAccount.png"}
                height={48} width={48} alt='*'
            />
            <div
                className="text-center mt-2 text-xl font-semibold"

            >
                Confirm Your Cancellation
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-4">
                <div
                    className="text-center text-base font-normal"
                >
                    {`Canceling means you’ll lose access to the features below starting [${nxtCharge||""}]. Still want to move forward?`}
                </div>

                <div
                    className="text-center text-base font-normal mt-3"
                >
                    {`You’ll loose access to`}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-4 h-[33vh] overflow-y-auto">
                    {features.map((item, idx) => (
                        <div key={item.id} className="flex flex-row items-center gap-2">
                            <Image src={'/otherAssets/grayCross.png'}
                                height={24} width={24} alt="cross"
                            />
                            <div className="text-base font-normal">
                                {item.title}
                            </div>
                        </div>
                    ))}
                </div>


            </div>

            <div className='flex flex-row items-center w-full justify-start mt-3 gap-2'>
                <button onClick={()=>{
                    setConfirmChecked(!confirmChecked)
                }}>
                    {confirmChecked ? (
                        <div
                            className="bg-purple flex flex-row items-center justify-center rounded"
                            style={{ height: "24px", width: "24px" }}
                        >
                            <Image
                                src={"/assets/whiteTick.png"}
                                height={8}
                                width={10}
                                alt="*"
                            />
                        </div>
                    ) : (
                        <div
                            className="bg-none border-2 flex flex-row items-center justify-center rounded"
                            style={{ height: "24px", width: "24px" }}
                        ></div>
                    )}
                </button>

                <div className='text-xs font-normal'>
                    I confirm that my account will be cancelled and lose access.
                </div>
            </div>


            <button
                className={`w-full flex items-center rounded-lg justify-center mt-5 border h-[50px] ${!confirmChecked ? "bg-gray-300 text-black" : "bg-purple text-white"}`}
                style={{
                    fontWeight: "400",
                    fontSize: 15.8,
                    outline: "none",
                }}

                disabled = {!confirmChecked}

                onClick={() => {
                    let nextAction = "finalStep"
                    handleContinue(nextAction)
                }}
            >
                Confirm Cancellation
            </button>


        </div >
    )
}

export default CancelConfirmation