import Image from 'next/image'
import React from 'react'

const Userleads = () => {

    const styles = {
        heading: {
            fontWeight: "700",
            fontSize: 17
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <div className='w-11/12 ms-3'>
            <div className='flex flex-row items-center justify-between mt-[120px]'>
                <div style={{ fontWeight: "700", fontSize: 25 }}>
                    Leads
                </div>
                <div className='flex flex-row items-center gap-6'>
                    <div className='flex flex-row items-center gap-2'>
                        <Image src={"/assets/buyLeadIcon.png"} height={24} width={24} alt='*' />
                        <span className='text-purple' style={styles.paragraph}>
                            Buy Lead
                        </span>
                    </div>
                    <button className='flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center'>
                        <Image src={"/assets/callOut.png"} height={17} width={17} alt='*' />
                        <span className='text-[#00000060]' style={styles.heading}>
                            Start Calling
                        </span>
                    </button>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between w-full mt-10'>
                <div className='flex flex-row items-center gap-4'>
                    <div className='flex flex-row items-center gap-1 w-[19vw] border rounded p-2'>
                        <input
                            style={styles.paragraph}
                            className='outline-none border-none w-full bg-transparent'
                            placeholder='Search by name, email or phone'
                        />
                        <button className='outline-none border-none'>
                            <Image src={"/assets/searchIcon.png"} height={24} width={24} alt='*' />
                        </button>
                    </div>
                    <Image src={"/assets/filterIcon.png"} height={16} width={16} alt='*' />
                    <div style={styles.paragraph}>
                        Date
                    </div>
                </div>

                <button className='flex flex-row items-center justify-center gap-2 bg-none outline-none border h-[43px] w-[101px] rounded'>
                    <span>
                        Import
                    </span>
                    <Image src={"/assets/downloadIcon.png"} height={15} width={15} alt='*' />
                </button>
            </div>

            <div></div>

        </div>
    )
}

export default Userleads