import React from 'react'
import Image from 'next/image';
function AllCalls() {
    const callDetails = [
        {
            id: 1, name: "Rayna Passaquindici Arcand", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 2, name: "Gretchen Workman", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 3, name: "Zain Baptista", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 4, name: "Jordyn Korsgaard", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
        {
            id: 5, name: "Lincoln Stanton", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
            stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
        },
    ];
    return (
        <div className='w-full items-start'>
            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-2/12'>
                    <div style={styles.text}>Name</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Email Address</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Contact Number</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Stage</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Status</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Time stamp</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>More</div>
                </div>
            </div>
            {
                callDetails.map((item) => (
                    <div key={item.id} className='w-full flex flex-row justify-between mt-10 px-10'>
                         <div className='w-2/12 flex flex-row gap-2'>
                            <Image src={'/assets/colorCircle.png'}
                                height={32}
                                width={32}
                                alt='ai'
                            />
                            <div style={styles.text2}>{item.name}</div>
                        </div>
                        <div className='w-2/12 '>
                            <div style={styles.text2}>{item.email}</div>
                        </div>
                        <div className='w-2/12'>
                            <div style={styles.text2}>{item.phone}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.stage}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.status}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.date}</div>
                        </div>
                        <div className='w-1/12'>
                            <div style={styles.text2}>{item.time}</div>
                        </div>
                        <div className='w-1/12'>
                            <button>
                                <div style={{ fontSize: 12, color: '#7902DF', textDecorationLine: 'underline' }}>
                                    Details
                                </div>
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default AllCalls
const styles = {
    text: {
        fontSize: 12,
        color: '#00000090'
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: 500,
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
    }
}