import React from 'react'
import Image from 'next/image';

function CallActivities() {
    const callDetails = [
        {
            id: 1, name: "Ann's AI", lead: 30, objective: 'Comunity update', date: 'jul 19,2024',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 2, name: "Ann's AI", lead: 30, objective: 'Comunity update', date: 'jul 19,2024',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 3, name: "Ann's AI", lead: 30, objective: 'Comunity update', date: 'jul 19,2024',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 4, name: "Ann's AI", lead: 30, objective: 'Comunity update', date: 'jul 19,2024',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 5, name: "Ann's AI", lead: 30, objective: 'Comunity update', date: 'jul 19,2024',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
    ];
    return (
        <div className='w-full items-start'>
            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-3/12'>
                    <div style={styles.text}>Agent</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Objective</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Num of leads</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date created</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Call status</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Action</div>
                </div>
            </div>
            {
                callDetails.map((item, index) => (
                    <div className='w-full flex flex-row justify-between mt-10 items-center px-10' key={index}>
                        <div className='w-3/12 flex flex-row gap-2 items-center'>
                            <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                {item.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div style={styles.text2}>{item.name}</div>
                        </div>
                        <div className='w-2/12 '>
                            <div style={styles.text2}>{item.objective}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.lead}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.date}</div>
                        </div>
                        <div className='w-2/12'>
                            <div style={styles.text2}>{item.status}</div>
                        </div>
                        <div className='w-1/12'>
                            <button>
                                <Image src={'/otherAssets/threeDotsIcon.png'}
                                    height={24}
                                    width={24}
                                    alt='icon'
                                />
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default CallActivities
const styles = {
    text: {
        fontSize: 15,
        color: '#00000090',
        fontWeight: "500"
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: "500",
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
    }
}