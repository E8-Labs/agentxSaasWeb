import React, { useEffect, useState } from 'react'
import SampleMessageComponent from './SampleMessageComponent';
import Image from 'next/image';

const UserConset = ({
    handleBack,
    handleClose
}) => {

    const [recievedMsg, setRecievedMsg] = useState("");
    const [optMsg, setOptMsg] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    //disabled btn
    const [isDisabled, setIsDisabled] = useState(true);

    //check for is dsiabeld
    useEffect(() => {
        if (recievedMsg.length < 40 || optMsg.length < 40 || !agreeTerms) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [optMsg, recievedMsg, agreeTerms]);


    //styles
    const styles = {
        semiBold: {
            fontWeight: "600",
            fontSize: 22
        },
        normlFont: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <div className='h-[100%] flex flex-col items-center justify-between'>
            <div className='w-10/12 h-[85%] overflow-auto'>
                <div style={styles.semiBold}>
                    User Consent
                </div>
                <div className='mt-4'>
                    <SampleMessageComponent
                        title="How do lead/contacts consent to receive messages?"
                        subTitle=""
                        warning="Min length: 40 characters. Max length 2048 characters"
                        compulsory={true}
                        //stores values
                        value={recievedMsg}
                        setValue={setRecievedMsg}
                        minLengthRequired={40}
                        maxLengthRequired={2048}
                    />
                </div>
                <div className='mt-4'>
                    <SampleMessageComponent
                        title="Opt-in Message"
                        subTitle="Must contain business name and opt-out keyword"
                        warning="Min length: 40 characters. Max length 2048 characters"
                        compulsory={true}
                        //stores values
                        value={optMsg}
                        setValue={setOptMsg}
                        minLengthRequired={40}
                        maxLengthRequired={2048}
                    />
                </div>
                <div className='mt-4 flex flex-row items-start gap-4'>
                    <button
                        className="border-none outline-none"
                        onClick={() => { setAgreeTerms(!agreeTerms) }}
                    >
                        {agreeTerms ? (
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
                    <div className='text-start' style={styles.normlFont}>
                        {`I acknowledge: Brand and Campaign registration one time $23.95 will be charged [Additional $3 for Fast Track program is included which helps in getting campaign approved in 3 working days]`}
                    </div>
                </div>
            </div>
            <div className='w-full flex flex-row items-center justify-between'>
                <button
                    className='w-[165px] text-violet-blue h-[50px] rounded-lg'
                    onClick={() => { handleClose() }}
                    disabled={isDisabled}
                >
                    Save & Exit
                </button>
                <button
                    className={`w-[176px] ${isDisabled ? "bg-btngray text-black" : "bg-violet-blue text-white"} h-[50px] rounded-lg`}
                    disabled={isDisabled}
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

export default UserConset;
